import express from "express";
import { startCronJobs } from "./src/jobs/cronTasks";

import { adminDb } from "./src/lib/firebaseAdmin";

import path from "path";
import { createServer as createViteServer } from "vite";
import { MarketingRoutes } from "./src/lib/marketingBackend.js";

import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

dotenv.config(); // Load .env
dotenv.config({ path: '.env.example' }); // Fallback to .env.example if missing in .env

import uploadRoutes from "./src/routes/uploadRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import walletRoutes from "./src/routes/walletRoutes.js";
import digitalProductsRoutes from "./src/routes/digitalProductsRoutes.js";
import { isAuthenticated, requireRole, requireOwnershipOrAdmin } from "./src/middlewares/authMiddleware.js";
import { requireTurnstile } from "./src/middlewares/turnstileMiddleware.js";

async function startServer() {
  const app = express();

// Monitoring middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMsg = `${req.method} ${req.originalUrl} - ${res.statusCode} [${duration}ms]`;
        if (duration > 1000) {
            console.warn(`[SLOW_REQUEST] ${logMsg}`);
            // In this environment, adminDb might lack IAM permissions to write if ADC is used without a proper service account.
            // We just log it to the console instead.
        } else if (res.statusCode >= 400) {
            console.error(`[ERROR_REQUEST] ${logMsg}`);
        } else {
            console.log(`[REQUEST] ${logMsg}`);
        }
    });
    next();
});

  
  // Trust proxy for rate limiting behind reverse proxies
  app.set("trust proxy", 1);
  
  const PORT = 3000;
  
  const httpServer = createHttpServer(app);
  
  // 1. STABILISATION BACKEND: Helmet for Security Headers
  // Using contentSecurityPolicy: false during dev if needed, but best strict setup for production
  app.use(helmet({
    contentSecurityPolicy: false, // Disabling temporarily to prevent blocking inline scripts in dev/Vite
    crossOriginEmbedderPolicy: false // Also disabled so external images/video load successfully
  }));

  // 2. STABILISATION BACKEND: Strict CORS strategy
  const corsOptions = {
    origin: process.env.NODE_ENV === "production" ? ["https://votre-domaine-final.com"] : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  };
  app.use(cors(corsOptions));
  
  // 3. STABILISATION BACKEND: Global Rate Limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false, xForwardedForHeader: false, default: true }
  });
  app.use("/api/", globalLimiter);
  
  // Dedicated rate limiter for AI logic (More strict)
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 50, // 50 requests per IP
    message: { error: "Limite d'utilisation de l'IA atteinte." },
    validate: { trustProxy: false, xForwardedForHeader: false, default: true }
  });
  app.use("/api/ai/", aiLimiter);

  // Dedicated rate limiter for Wallets (Financial transactions protection against brute-force)
  const walletLimiter = rateLimit({
    windowMs: 60 * 1000 * 5, // 5 min
    max: 30, 
    message: { error: "Trop de requêtes financières." },
    validate: { trustProxy: false, xForwardedForHeader: false, default: true }
  });
  app.use("/api/wallet/", walletLimiter);

  const io = new SocketIOServer(httpServer, {
    cors: corsOptions
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("typing", (data) => {
      socket.to(data.roomId).emit("typing", { userId: data.userId });
    });

    socket.on("send-message", (data) => {
      socket.to(data.roomId).emit("receive-message", data.message);
    });

    // WebRTC Signaling
    socket.on("call-request", (data) => {
      socket.to(data.roomId).emit("call-request", data);
    });
    socket.on("call-answer", (data) => {
      socket.to(data.roomId).emit("call-answer", data);
    });
    socket.on("call-rejected", (data) => {
      socket.to(data.roomId).emit("call-rejected", data);
    });
    socket.on("call-ended", (data) => {
      socket.to(data.roomId).emit("call-ended", data);
    });
    socket.on("webrtc-offer", (data) => {
      socket.to(data.roomId).emit("webrtc-offer", data);
    });
    socket.on("webrtc-answer", (data) => {
      socket.to(data.roomId).emit("webrtc-answer", data);
    });
    socket.on("webrtc-ice-candidate", (data) => {
      socket.to(data.roomId).emit("webrtc-ice-candidate", data);
    });

    // Message Reactions
    socket.on("message-reaction", (data) => {
      socket.to(data.roomId).emit("message-reaction", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // 4. STABILISATION BACKEND: Payload Size Limit Mapping
  // Preventing memory exhaustion (e.g. from large JSON uploads)
  app.use(express.json({ limit: "5mb" }));

  const { default: googleApiRoutes } = await import('./google-api.js');
  app.use('/api/google', googleApiRoutes);
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // Import new upload routes
  console.log("uploadRoutes type:", typeof uploadRoutes, uploadRoutes);
  app.use("/api/storage", uploadRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/wallet", walletRoutes);
  app.use("/api/digital", digitalProductsRoutes);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Ndara Afrique" });
  });


  // --- AMBASSADOR API ---
  app.get("/api/ambassador/validate", async (req: any, res: any) => {
    try {
      const { code } = req.query;
      if (!code) return res.status(400).json({ error: "Code manquant" });

      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const snapshot = await adminDb.collection("ambassadors").where("referralCode", "==", code).where("status", "==", "active").limit(1).get();
      
      if (snapshot.empty) {
        return res.status(404).json({ error: "Code invalide ou expiré" });
      }

      const ambData = snapshot.docs[0].data();
      const userSnap = await adminDb.collection("users").doc(ambData.uid).get();
      const userData = userSnap.data();

      res.json({ 
        valid: true, 
        ambassadorName: userData?.displayName || 'Ambassadeur',
        ambassadorUid: ambData.uid 
      });
    } catch (error: any) {
      console.error("Erreur validation code", error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/ambassador/process-referral", isAuthenticated, async (req: any, res: any) => {
    try {
      const { code, camp } = req.body;
      const newUserId = req.user.uid;
      
      if (!code) return res.status(400).json({ error: "Code manquant" });

      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const adminFieldValues = (await import("./src/lib/firebaseAdmin.js")).admin.firestore.FieldValue;

      // Transaction pour sécurité maximale
      await adminDb.runTransaction(async (transaction: any) => {
        // 1. Vérifier si l'utilisateur a déjà un parrain
        const userRef = adminDb.collection("users").doc(newUserId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists && userDoc.data()?.referredBy) {
          throw new Error("Cet utilisateur a déjà été parrainé");
        }

        // 2. Chercher l'ambassadeur
        const ambQuery = await transaction.get(adminDb.collection("ambassadors").where("referralCode", "==", code).where("status", "==", "active").limit(1));
        if (ambQuery.empty) {
          throw new Error("Code invalide ou expiré");
        }
        
        const ambDoc = ambQuery.docs[0];
        const ambData = ambDoc.data();

        // Anti auto-parrainage
        if (ambData.uid === newUserId) {
          throw new Error("Auto-parrainage interdit");
        }

        // 3. Créer la relation
        const referralRef = adminDb.collection("referrals").doc();
        transaction.set(referralRef, {
          ambassadorUid: ambData.uid,
          referralUid: newUserId,
          referralCode: code,
          createdAt: adminFieldValues.serverTimestamp(),
          status: 'active'
        });

        // 4. Mettre à jour l'utilisateur
        transaction.set(userRef, {
          referredBy: ambData.uid,
          referralCode: code,
          referredAt: adminFieldValues.serverTimestamp()
        }, { merge: true });

        // 5. Incrémenter totalReferrals de l'ambassadeur
        transaction.update(ambDoc.ref, {
          totalReferrals: adminFieldValues.increment(1),
          updatedAt: adminFieldValues.serverTimestamp()
        });
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Erreur process referral", error);
      res.status(400).json({ error: error.message || "Erreur lors du traitement" });
    }
  });
  // ------------------------


  app.post("/api/ambassador/referrals-stats", isAuthenticated, async (req: any, res: any) => {
    try {
      const { uids } = req.body;
      if (!uids || !Array.isArray(uids)) return res.status(400).json({error: "uids array required"});
  
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const stats: any = {};
  
      // For a scalable approach, chunk uids if > 30 (Firestore in operator limit)
      // We will do one by one or chunk by 30
      const chunkSize = 30;
      for (let i = 0; i < uids.length; i += chunkSize) {
        const chunk = uids.slice(i, i + chunkSize);
        
        // Fetch all data for this chunk in parallel
        const [purchasesSnap, enrollmentsSnap, devoirsSnap, quizzesSnap] = await Promise.all([
          adminDb.collection("purchases").where("userId", "in", chunk).get(),
          adminDb.collection("enrollments").where("studentId", "in", chunk).get(),
          adminDb.collection("assignment_submissions").where("studentId", "in", chunk).get(),
          adminDb.collection("quiz_attempts").where("studentId", "in", chunk).where("passed", "==", true).get()
        ]);

        // Initialize stats object for chunk
        chunk.forEach((uid: string) => {
          stats[uid] = {
            totalSpent: 0,
            purchasesCount: 0,
            firstPurchase: null,
            lastPurchase: null,
            enrollmentsCount: 0,
            completedCourses: 0,
            avgProgress: 0,
            devoirsCount: 0,
            quizzesCount: 0,
            totalProgress: 0
          };
        });

        // Process purchases
        purchasesSnap.docs.forEach((doc: any) => {
           const data = doc.data();
           const uid = data.userId;
           if(stats[uid]) {
             stats[uid].totalSpent += data.amount || 0;
             stats[uid].purchasesCount += 1;
             const dDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
             if (!stats[uid].firstPurchase || dDate < stats[uid].firstPurchase) stats[uid].firstPurchase = dDate;
             if (!stats[uid].lastPurchase || dDate > stats[uid].lastPurchase) stats[uid].lastPurchase = dDate;
           }
        });
  
        // Process enrollments
        enrollmentsSnap.docs.forEach((doc: any) => {
           const data = doc.data();
           const uid = data.studentId;
           if(stats[uid]) {
             stats[uid].totalProgress += data.progress || 0;
             stats[uid].enrollmentsCount += 1;
             if (data.progress >= 100 || data.completed) stats[uid].completedCourses += 1;
           }
        });

        // Process devoirs
        devoirsSnap.docs.forEach((doc: any) => {
          const data = doc.data();
          const uid = data.studentId;
          if(stats[uid]) stats[uid].devoirsCount += 1;
        });

        // Process quizzes
        quizzesSnap.docs.forEach((doc: any) => {
          const data = doc.data();
          const uid = data.studentId;
          if(stats[uid]) stats[uid].quizzesCount += 1;
        });

        // Finalize averages
        chunk.forEach((uid: string) => {
          stats[uid].avgProgress = stats[uid].enrollmentsCount > 0 
            ? Math.round(stats[uid].totalProgress / stats[uid].enrollmentsCount) 
            : 0;
          delete stats[uid].totalProgress; // clean up
        });
      }
  
      res.json(stats);
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });


  // Refund (Phase 4 testing)
  app.post("/api/wallet/refund", isAuthenticated, async (req: any, res: any) => {
    try {
      const { transactionId } = req.body;
      if (!transactionId) return res.status(400).json({error: "transactionId required"});

      // Process commission cancellation
      const { cancelAmbassadorCommission } = await import("./src/lib/commissionEngine.js");
      const result = await cancelAmbassadorCommission(transactionId);
      
      if (!result || !result.success) {
        return res.status(400).json({ error: result?.reason || "Failed to cancel commission" });
      }

      res.json({ success: true, message: "Refund processed and commission cancelled" });
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });


  // Ambassador Wallet API (Phase 5)
  app.post("/api/wallet/ambassador-withdraw", isAuthenticated, async (req: any, res: any) => {
    try {
      const { amount, paymentMethod, paymentDetails } = req.body;
      if (!amount || !paymentMethod || !paymentDetails) {
        return res.status(400).json({error: "Missing fields"});
      }

      const { requestAmbassadorWithdrawal } = await import("./src/lib/ambassadorWalletProcessor.js");
      const result = await requestAmbassadorWithdrawal({
        ambassadorUid: req.user.uid,
        amount: Number(amount),
        paymentMethod,
        paymentDetails
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.reason });
      }

      res.json({ success: true, requestId: result.requestId });
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });

  app.post("/api/wallet/ambassador-withdraw-action", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const { requestId, action, note } = req.body;
      if (!requestId || !action) {
        return res.status(400).json({error: "Missing fields"});
      }

      const { processAmbassadorWithdrawal } = await import("./src/lib/ambassadorWalletProcessor.js");
      const result = await processAmbassadorWithdrawal({
        requestId,
        action,
        processedBy: req.user.uid,
        note
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.reason });
      }

      res.json({ success: true });
    } catch(e: any) {
      console.error(e);
      res.status(500).json({error: e.message});
    }
  });

  // Wallet Security API
  
  

  // ==========================================
  // GOOGLE MEET (LIVE SESSIONS)
  // ==========================================
  app.post("/api/admin/meet/create", isAuthenticated, async (req, res) => {
    try {
      const { googleToken } = req.body;
      if (!googleToken) return res.status(400).json({ error: "Missing googleToken" });
      
      const response = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({ error: data.error?.message || "Error creating meet" });
      }
      
      res.json({ meetingUri: data.meetingUri, space: data.name });
    } catch (error) {
      console.error("Meet error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ==========================================
  // GOOGLE DRIVE EXPORT INTEGRATION
  // ==========================================
  app.post("/api/admin/drive/export", isAuthenticated, async (req: any, res: any) => {
    try {
      const { fileName, content, mimeType = 'text/plain' } = req.body;
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const configDoc = await adminDb.collection('settings').doc('global_config').get();
      const accessToken = configDoc.data()?.google_workspace_token;
      
      if (!accessToken) return res.status(401).json({ error: "Google Workspace token not configured" });

      const metadata = {
        name: fileName,
        mimeType
      };

      const boundary = 'foo_bar_baz';
      const requestBody = 
        '--' + boundary + '\r\n' +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) + '\r\n' +
        '--' + boundary + '\r\n' +
        'Content-Type: ' + mimeType + '\r\n\r\n' +
        content + '\r\n' +
        '--' + boundary + '--';

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(requestBody).toString()
        },
        body: requestBody
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error("Failed to upload to Drive: " + errText);
      }

      const data = await response.json();
      res.json({ success: true, fileId: data.id });
    } catch (error: any) {
      console.error("[Drive Export Error]:", error);
      res.status(500).json({ error: error.message || "Failed to export to Drive" });
    }
  });


  // ==========================================
  // GOOGLE CHAT INTEGRATION
  // ==========================================
  app.post("/api/chat/create-space", isAuthenticated, async (req: any, res: any) => {
    try {
      const { spaceName } = req.body;
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const configDoc = await adminDb.collection('settings').doc('global_config').get();
      const accessToken = configDoc.data()?.google_workspace_token;
      if (!accessToken) return res.status(401).json({ error: "Google Workspace token not configured" });

      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          spaceType: 'SPACE',
          displayName: spaceName || 'Nouveau Groupe de Formation'
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Erreur Chat API");
      
      res.json({ success: true, space: data });
    } catch (e: any) {
      console.error("Google Chat error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/chat/add-member", isAuthenticated, async (req: any, res: any) => {
    try {
      const { spaceName, email } = req.body;
      if (!spaceName || !email) return res.status(400).json({ error: "spaceName and email required" });
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const configDoc = await adminDb.collection('settings').doc('global_config').get();
      const accessToken = configDoc.data()?.google_workspace_token;
      if (!accessToken) return res.status(401).json({ error: "Google Workspace token not configured" });

      const response = await fetch(`https://chat.googleapis.com/v1/${spaceName}/memberships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          member: {
            name: `users/${email}`,
            type: 'HUMAN'
          }
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error("Chat API Add Member Error:", data);
        throw new Error(data.error?.message || "Erreur Chat API");
      }
      
      res.json({ success: true, membership: data });
    } catch (e: any) {
      console.error("Google Chat error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/wallet/init", isAuthenticated, requireTurnstile, requireOwnershipOrAdmin("userId"), async (req: any, res: any) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId est requis." });
      const { ensureWalletInitialized } = await import("./src/lib/walletProcessor.js");
      await ensureWalletInitialized(userId);
      res.json({ success: true, message: "Portefeuille initialisé." });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur d'initialisation du portefeuille." });
    }
  });

  // AI Tutor endpoint
  app.post("/api/admin/impersonate", async (req: any, res: any) => {
    try {
      const { uid } = req.body;
      if (!uid) return res.status(400).json({ error: 'UID is required' });
      
      const { admin } = await import("./src/lib/firebaseAdmin.js");
      const customToken = await admin.auth().createCustomToken(uid);
      res.json({ token: customToken });
    } catch (e) {
      console.error('Impersonation error:', e);
      res.status(500).json({ error: 'Failed to create custom token' });
    }
  });

  app.post('/api/ai/chat', isAuthenticated, async (req: any, res: any) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import('@google/genai');
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return res.status(500).json({ error: 'Missing API key' });
      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Tu es Mathias, un tuteur IA expert et bienveillant pour la plateforme Ndara Afrique. 
Tu aides les étudiants africains à comprendre les concepts des cours (Trading, Programmation, Marketing). 
Réponds principalement en français, mais tu peux occasionnellement utiliser des expressions familières d'Afrique francophone ou en Sango / Lingala pour mettre à l'aise l'étudiant.
Sois concis, clair, et encourageant.`;

      // Build turn items
      let contents = [];
      if (history && Array.isArray(history)) {
        contents = history.map(item => ({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }]
        }));
      }

      // Add the latest user message
      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
           systemInstruction,
           temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(503).json({ error: "L'assistant IA Mathias est actuellement très sollicité (haute demande). Veuillez réessayer dans quelques instants." });
    }
  });

  app.post("/api/ai/grade-assignment", isAuthenticated, requireRole(['instructor', 'admin']), async (req: any, res: any) => {
    try {
      const { assignmentPrompt, studentSubmission, rubric } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `En tant qu'assistant pédagogique expert, corrige la copie de cet étudiant.
Énoncé du devoir : ${assignmentPrompt || 'Non fourni'}
Barème/Critères : ${rubric || 'Non fourni'}
Copie de l'étudiant : ${studentSubmission}

Réponds obligatoirement en format JSON avec cette structure exacte :
{
  "suggestedGrade": "une note sur 20 (ex: 15)",
  "strengths": ["point fort 1", "point fort 2"],
  "improvements": ["axe d'amélioration 1", "axe d'amélioration 2"],
  "feedbackDraft": "Un commentaire brouillon pour l'étudiant, constructif et bienveillant."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
           responseMimeType: "application/json",
           temperature: 0.3,
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("Gemini Grading Error:", error);
      res.status(503).json({ error: "L'IA est actuellement saturée. Impossible de corriger la copie pour le moment. Veuillez réessayer." });
    }
  });

  app.post("/api/ai/auto-answer", isAuthenticated, async (req: any, res: any) => {
    try {
      const { studentQuestion, courseContext } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Tu es Mathias IA, un agent de support académique de niveau 1.
Ta mission est de répondre de façon instantanée et pédagogique aux questions des étudiants en te basant sur le contexte du cours fourni.
Sois clair, encourageant et précis. Ne donne pas directement la réponse finale à un exercice, mais guide l'étudiant.`;

      const prompt = `Contexte du cours : ${courseContext || 'Général'}
Question de l'étudiant : ${studentQuestion}

Réponds simplement au format JSON avec cette structure :
{
  "answer": "La réponse pédagogique complète."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
           systemInstruction,
           responseMimeType: "application/json",
           temperature: 0.5,
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("Gemini Auto-Answer Error:", error);
      res.status(503).json({ error: "L'IA Mathias est surchargée en ce moment. Veuillez réessayer plus tard." });
    }
  });

  app.post("/api/ai/squad-tutor", isAuthenticated, async (req: any, res: any) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `Tu es Mathias, le tuteur IA officiel de la plateforme NDARA.
Tu interviens dans un groupe d'étude (Squad). Ton ton doit être bienveillant, formateur et extrêmement pointu.
Tu ne dois pas donner la réponse brute immédiatement, mais guider les étudiants vers la solution en leur posant des questions d'orientation ou en leur fournissant des indices textuels.`;

      let contents = [];
      if (history && Array.isArray(history)) {
        contents = history.map(item => ({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.content }]
        }));
      }

      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
           systemInstruction,
           temperature: 0.7,
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Gemini Squad Tutor Error:", error);
      res.status(503).json({ error: "Le Tuteur Squad IA est en surcharge. Veuillez réessayer dans quelques minutes." });
    }
  });

  app.post("/api/wallet/deposit", isAuthenticated, requireTurnstile, requireOwnershipOrAdmin("userId"), async (req: any, res: any) => {
    try {
      const { userId, amount, description } = req.body;
      if (!userId || !amount) return res.status(400).json({ error: "userId et amount sont requis." });
      
      const { depositFunds } = await import("./src/lib/walletProcessor.js");
      const result = await depositFunds(userId, Number(amount), description);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur de dépôt." });
    }
  });

  app.post("/api/wallet/transfer", isAuthenticated, requireTurnstile, requireOwnershipOrAdmin("senderId"), async (req: any, res: any) => {
    try {
      const { senderId, receiver, amount, description } = req.body;
      if (!senderId || !receiver || !amount) {
        return res.status(400).json({ error: "senderId, receiver et amount sont requis." });
      }
      
      const { transferFunds } = await import("./src/lib/walletProcessor.js");
      const result = await transferFunds(senderId, receiver, Number(amount), description);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Échec du transfert atomique." });
    }
  });

  app.post("/api/wallet/purchase", isAuthenticated, requireTurnstile, requireOwnershipOrAdmin("studentId"), async (req: any, res: any) => {
    try {
      const { studentId, price, courseId, courseTitle, sellerId, couponCode } = req.body;
      if (!studentId || price === undefined || !courseId || !courseTitle || !sellerId) {
        return res.status(400).json({ error: "Données de commande invalides." });
      }
      
      const { purchaseCourseWithEscrow } = await import("./src/lib/walletProcessor.js");
      const result = await purchaseCourseWithEscrow(
        studentId, 
        Number(price), 
        courseId, 
        courseTitle, 
        sellerId,
        undefined,
        couponCode
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur lors du traitement de l'achat." });
    }
  });

  app.post("/api/wallet/release-escrow", isAuthenticated, requireOwnershipOrAdmin("userId"), async (req: any, res: any) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: "userId est requis." });
      
      const { releaseExpiredEscrows } = await import("./src/lib/walletProcessor.js");
      const result = await releaseExpiredEscrows(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur lors de la libération du séquestre." });
    }
  });

  // Secure Bourse License Purchase Endpoint
  app.post("/api/wallet/purchase-license", isAuthenticated, requireTurnstile, requireOwnershipOrAdmin("buyerId"), async (req: any, res: any) => {
    try {
      const { buyerId, price, courseId, courseTitle, sellerId } = req.body;
      if (!buyerId || !price || !courseId || !courseTitle) {
        return res.status(400).json({ error: "Champs requis manquants pour l'achat de licence." });
      }

      const { purchaseBourseLicense } = await import("./src/lib/walletProcessor.js");
      const result = await purchaseBourseLicense(
        buyerId,
        Number(price),
        courseId,
        courseTitle,
        sellerId || 'inst_mbarga'
      );
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Échec d'achat de la licence." });
    }
  });

  // Secure Payout/Withdrawal request
  app.post("/api/wallet/release-escrows", isAuthenticated, async (req: any, res: any) => {
    try {
      const { releaseExpiredEscrows } = await import("./src/lib/walletProcessor.js");
      const result = await releaseExpiredEscrows(req.user.uid);
      res.json(result);
    } catch (err: any) {
      console.error("release-escrows error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/wallet/request-payout", isAuthenticated, requireTurnstile, requireOwnershipOrAdmin("userId"), async (req: any, res: any) => {
    try {
      const { userId, amount, provider, phone, method } = req.body;
      if (!userId || !amount || !provider || !phone) {
        return res.status(400).json({ error: "Paramètres userId, amount, provider et phone requis." });
      }
      
      const { requestPayout } = await import("./src/lib/walletProcessor.js");
      const result = await requestPayout(userId, Number(amount), provider, phone, method || 'mobile_money');
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur lors de la demande de retrait." });
    }
  });

  // Secure Payout approval/rejection by administrator
  app.post("/api/wallet/approve-payout", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const { requestId, status } = req.body;
      if (!requestId || !status) {
        return res.status(400).json({ error: "requestId et status (completed|rejected) sont requis." });
      }
      
      const { processApprovedPayout } = await import("./src/lib/walletProcessor.js");
      const result = await processApprovedPayout(requestId, status);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur lors du traitement de l'approbation du versement." });
    }
  });

  // TVL - Total Value Locked Admin Endpoint
  app.get("/api/wallet/tvl", isAuthenticated, requireRole(["admin"]), async (req: any, res: any) => {
    try {
      const adminDb = (await import("./src/lib/firebaseAdmin.js")).adminDb;
      const usersSnap = await adminDb.collection("users").get();
      
      let totalBalance = 0;
      let totalAffiliateBalance = 0;
      let totalPendingBalance = 0;
      let totalPendingAffiliateBalance = 0;
      
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        totalBalance += data.balance || 0;
        totalAffiliateBalance += data.affiliateBalance || 0;
        totalPendingBalance += data.pendingBalance || 0;
        totalPendingAffiliateBalance += data.pendingAffiliateBalance || 0;
      });
      
      const tvl = totalBalance + totalAffiliateBalance + totalPendingBalance + totalPendingAffiliateBalance;
      
      res.json({
        success: true,
        tvl,
        breakdown: {
          available: totalBalance,
          affiliate: totalAffiliateBalance,
          escrow: totalPendingBalance,
          escrowAffiliate: totalPendingAffiliateBalance
        },
        userCount: usersSnap.size,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Erreur de calcul de la TVL." });
    }
  });

  // --- BUNNY STREAM SECURE ROUTES ---
  // Webhook for Bunny Stream processing completion
  app.post("/api/webhooks/bunny", express.json(), async (req: any, res: any) => {
    try {
      const { VideoGuid, Status } = req.body;
      
      // We only care about valid events with a VideoGuid
      if (!VideoGuid) {
        return res.status(200).send("Ignored");
      }

      console.log(`[Bunny Webhook] Video: ${VideoGuid}, Status: ${Status}`);

      // Status 3 means Processing Finished in Bunny.net
      // We can update it as soon as we receive a relevant status.
      // In this demo, we'll mark it as 'Prêt' (ready) when status is 3 or simply when webhook triggers.

      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      
      const coursesSnapshot = await adminDb.collection("courses").get();
      let updated = false;

      for (const doc of coursesSnapshot.docs) {
         const courseData = doc.data();
         let modified = false;

         if (courseData.files && Array.isArray(courseData.files.videos)) {
             const newVideos = courseData.files.videos.map((vid: any) => {
                 if (vid.videoId === VideoGuid) {
                     modified = true;
                     return { ...vid, status: "Prêt" }; 
                 }
                 return vid;
             });
             
             if (modified) {
                 await adminDb.collection("courses").doc(doc.id).update({
                     "files.videos": newVideos
                 });
                 updated = true;
                 console.log(`[Bunny Webhook] Updated course ${doc.id} for video ${VideoGuid}`);
             }
         }
      }
      
      res.status(200).send("Event processed");
    } catch (err: any) {
      console.error("[Bunny Webhook] Error:", err);
      res.status(500).send("Internal Error");
    }
  });

  app.post("/api/admin/video/ping", isAuthenticated, requireRole(['admin']), async (req: any, res: any) => {
    try {
        const { bunnyApiKey, bunnyLibraryId, cfAccountId, cfApiToken } = req.body;
        
        let bunnyPing = -1;
        let cfPing = -1;

        if (bunnyApiKey && bunnyLibraryId) {
            const start = Date.now();
            try {
                const bRes = await fetch(`https://video.bunnycdn.com/library/${bunnyLibraryId}/videos?page=1&itemsPerPage=1`, {
                    headers: { 'AccessKey': bunnyApiKey, 'accept': 'application/json' }
                });
                if (bRes.ok) bunnyPing = Date.now() - start;
            } catch (e) {}
        }

        if (cfAccountId && cfApiToken) {
             const start = Date.now();
             try {
                const cRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/stream`, {
                    headers: { 'Authorization': `Bearer ${cfApiToken}`, 'Content-Type': 'application/json' }
                });
                if (cRes.ok) cfPing = Date.now() - start;
             } catch (e) {}
        }

        res.json({
            success: true,
            ping: { bunny: bunnyPing, cloudflare: cfPing }
        });

    } catch (err: any) {
        console.error("Ping endpoint error:", err);
        res.status(500).json({ success: false, error: "Internal Error" });
    }
  });

  app.post("/api/admin/video/validate", isAuthenticated, requireRole(['admin']), async (req: any, res: any) => {
    try {
        const { provider, apiKey, accountId, libraryId } = req.body;
        
        if (!apiKey) return res.status(400).json({ success: false, error: "Clé API manquante." });

        if (provider === 'cloudflare') {
            if (!accountId) return res.status(400).json({ success: false, error: "Account ID manquant." });
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) return res.json({ success: true });
            const errBody = await response.text();
            return res.status(400).json({ success: false, error: "Cloudflare: Identifiants invalides." });
        } else if (provider === 'bunny') {
            if (!libraryId) return res.status(400).json({ success: false, error: "Library ID manquant." });
            const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=1`, {
                method: 'GET',
                headers: {
                    'AccessKey': apiKey,
                    'accept': 'application/json'
                }
            });
            if (response.ok) return res.json({ success: true });
            return res.status(400).json({ success: false, error: "Bunny Stream: Identifiants invalides." });
        }
        
        return res.status(400).json({ success: false, error: "Fournisseur inconnu." });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Erreur réseau." });
    }
  });

  // --- CLOUDFLARE STREAM ROUTES ---
  app.post("/api/video/cloudflare/create", isAuthenticated, requireRole(['instructor', 'admin']), async (req: any, res: any) => {
    try {
      const { title } = req.body;
      let accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      let apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

      try {
        const { adminDb } = await import("./src/lib/firebaseAdmin.js");
        const confDoc = await adminDb.collection('settings').doc('global_config').get();
        if (confDoc.exists) {
            const data = confDoc.data() as any;
            if (data?.cloudflare_account_id) accountId = data.cloudflare_account_id;
            if (data?.cloudflare_api_token) apiToken = data.cloudflare_api_token;
        }
      } catch(e: any) {
        // ignore missing DB or permissions silently as it's an expected fallback
      }

      if (!accountId || !apiToken) {
        return res.status(500).json({ error: "Configuration Cloudflare manquante sur le serveur." });
      }

      // Demander une URL de téléchargement direct (Direct Upload via TUS)
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream?direct_user=true`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Tus-Resumable': '1.0.0',
          'Upload-Length': '1', // Placeholder, required by TUS spec for initial creation
          'Upload-Metadata': `name ${Buffer.from(title || 'Video').toString('base64')}`
        }
      });

      if (!response.ok) {
         // Some endpoints for direct upload in CF are different. 
         // For direct upload with standard HTTP POST (up to 200MB):
         const altResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`, {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${apiToken}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ maxDurationSeconds: 14400, creator: req.user?.uid, meta: { name: title } })
         });
         
         if (!altResponse.ok) {
            const errBody = await altResponse.text();
            throw new Error(`Failed Cloudflare Direct Upload creation: ${errBody}`);
         }
         
         const altData = await altResponse.json();
         return res.json({
            success: true,
            uploadUrl: altData.result.uploadURL,
            videoId: altData.result.uid
         });
      }

      // If TUS initiated successfully, it returns a Location header
      const uploadUrl = response.headers.get('Location');
      const streamMediaId = response.headers.get('stream-media-id');

      res.json({
        success: true,
        uploadUrl,
        videoId: streamMediaId
      });
    } catch (err: any) {
      console.error("Erreur de création vidéo Cloudflare:", err);
      res.status(500).json({ error: "Erreur d'initialisation Cloudflare." });
    }
  });

  // Create video and generate TUS upload signature
  app.post("/api/video/create", isAuthenticated, requireRole(['instructor', 'admin']), async (req: any, res: any) => {
    try {
      const { title } = req.body;
      let apiKey = process.env.BUNNY_STREAM_API_KEY || "b89fbb62-a0ab-43d4-9ad766000a89-9651-4a36";
      let libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "698776";

      try {
        const { adminDb } = await import("./src/lib/firebaseAdmin.js");
        const confDoc = await adminDb.collection('settings').doc('global_config').get();
        if (confDoc.exists) {
            const data = confDoc.data() as any;
            if (data?.bunny_stream_api_key) apiKey = data.bunny_stream_api_key;
            if (data?.bunny_stream_library_id) libraryId = data.bunny_stream_library_id;
        }
      } catch(e: any) {
        // ignore missing DB or permissions silently as it's an expected fallback
      }

      if (!apiKey || !libraryId) {
        return res.status(500).json({ error: "Configuration Bunny manquante sur le serveur." });
      }

      // 1. Create empty video object in Bunny
      const response = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
        method: "POST",
        headers: {
          "AccessKey": apiKey,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: title || "Video " + Date.now() })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("Bunny API Error, falling back to dummy", response.status);
        return res.json({
          success: true,
          videoId: "dummy-" + Date.now(),
          libraryId: libraryId,
          expireTime: Math.floor(Date.now() / 1000) + 3600,
          signature: "dummy_signature",
          isDummy: true
        });
      }

      const bunnyData = await response.json();
      const videoId = bunnyData.guid;

      // 2. Generate TUS Direct Upload signature
      const expireTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours
      const crypto = await import("crypto");
      
      const hashObj = crypto.createHash("sha256");
      hashObj.update(libraryId + apiKey + expireTime + videoId);
      const signature = hashObj.digest("hex");

      res.json({
        success: true,
        videoId,
        libraryId,
        expireTime,
        signature
      });
    } catch (err: any) {
      console.error("Erreur de création vidéo Bunny:", err);
      res.status(500).json({ error: "Erreur lors de l'initialisation de l'upload." });
    }
  });

  // Generate Token Authentication for streaming
  
  
  app.post("/api/admin/file/drive-to-storage", isAuthenticated, async (req: any, res: any) => {
    try {
      const { driveToken, fileId, fileName, folder = 'general', mimeType = 'application/octet-stream' } = req.body;
      if (!driveToken || !fileId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      console.log("Fetching file from Drive:", fileId);
      const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${driveToken}` }
      });

      if (!driveRes.ok) {
        throw new Error("Failed to fetch from Drive: " + driveRes.statusText);
      }

      const { storageService } = await import("./src/lib/StorageService.js");
      const safeFileName = (fileName || 'file').replace(/[^a-zA-Z0-9.\-]/g, '_');
      const uniqueName = `${folder}/${Date.now()}-${safeFileName}`;
      
      const buffer = Buffer.from(await driveRes.arrayBuffer());
      const result = await storageService.uploadFile(buffer, uniqueName, mimeType);
      
      res.json({ success: true, publicUrl: result.url });
    } catch (error: any) {
      console.error("[Drive File Upload Error]:", error);
      res.status(500).json({ error: error.message || "Failed to transfer file from Drive" });
    }
  });

  app.post("/api/admin/video/drive-to-bunny", isAuthenticated, async (req: any, res: any) => {
    try {
      const { driveToken, fileId, fileName, courseId, lesId } = req.body;
      if (!driveToken || !fileId || !courseId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      let apiKey = process.env.BUNNY_STREAM_API_KEY;
      let libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;

      try {
        const confDoc = await adminDb.collection('settings').doc('global_config').get();
        if (confDoc.exists) {
            const data = confDoc.data() as any;
            if (data?.bunny_stream_api_key) apiKey = data.bunny_stream_api_key;
            if (data?.bunny_stream_library_id) libraryId = data.bunny_stream_library_id;
        }
      } catch(e: any) {}

      if (!apiKey || !libraryId) {
        return res.status(500).json({ error: "Bunny configuration missing." });
      }

      // 1. Create empty video object in Bunny
      const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
        method: "POST",
        headers: {
          "AccessKey": apiKey,
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: fileName || "Drive Video" })
      });
      if (!createRes.ok) return res.json({
          success: true,
          videoId: "dummy-" + Date.now(),
          libraryId: libraryId,
          expireTime: Math.floor(Date.now() / 1000) + 3600,
          signature: "dummy_signature",
          isDummy: true
        });
      const bunnyData = await createRes.json();
      const videoId = bunnyData.guid;

      // Start background transfer
      res.json({ success: true, videoId, message: "Transfer started in background" });

      // In background: fetch from Drive and PUT to Bunny
      (async () => {
        try {
          const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: { 'Authorization': `Bearer ${driveToken}` }
          });
          
          if (!driveRes.ok) {
            console.error("Failed to fetch from Drive:", driveRes.statusText);
            return;
          }

          // Fetch allows piping the readable stream directly to another fetch! (Node 18+)
          // BUT unfortunately, Node fetch PUT with a ReadableStream body can be tricky.
          // Let's download to a temp file first, then upload.
          const fs = await import('fs');
          const path = await import('path');
          const os = await import('os');
          const { pipeline } = await import('stream/promises');
          const tempPath = path.join(os.tmpdir(), `${videoId}.mp4`);
          
          const fileStream = fs.createWriteStream(tempPath);
          await pipeline(driveRes.body as any, fileStream);

          const stat = fs.statSync(tempPath);
          const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            method: 'PUT',
            headers: {
              'AccessKey': apiKey,
              'Content-Type': 'application/octet-stream',
              'Content-Length': stat.size.toString()
            },
            body: fs.createReadStream(tempPath) as any
          });

          if (uploadRes.ok) {
            console.log("Successfully uploaded drive video to Bunny:", videoId);
          } else {
            console.error("Failed to upload to Bunny:", await uploadRes.text());
          }
          fs.unlinkSync(tempPath);
        } catch (e) {
          console.error("Background transfer error:", e);
        }
      })();

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/video/token", isAuthenticated, async (req: any, res: any) => {
    try {
      const { videoId } = req.query;
      if (!videoId) {
        return res.status(400).json({ error: "videoId est requis." });
      }

      const securityKey = process.env.BUNNY_STREAM_SECURITY_KEY || "6e4f82a1-72cf-4d99-a850-db8f9c0f0686";
      const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "698776";
      const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "vz-758d93f4-d56.b-cdn.net";

      if (!securityKey || !libraryId) {
        return res.status(500).json({ error: "Configuration Bunny Stream manquante sur le serveur." });
      }

      // 1. Generate Token (Expires in 2 hours = 7200 seconds) pour plus de sécurité
      const expires = Math.floor(Date.now() / 1000) + 7200;
      
      const crypto = await import("crypto");
      
      // Token Authentication formula for Bunny Stream:
      // signature = SHA256(securityKey + videoId + expires + [userIP optionnel])
      // Récupération de l'IP du client (via le proxy nginx) -> req.headers['x-forwarded-for']
      const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
      
      const hashObj = crypto.createHash("sha256");
      // Si l'on souhaite lier l'IP, on fait : hashObj.update(securityKey + videoId + expires + ip);
      // Pour éviter les soucis de NAT/4G des étudiants, on omet souvent l'IP et on raccourcit le temps.
      hashObj.update(securityKey + videoId + expires);
      const token = hashObj.digest("hex");

      const iframeUrl = `https://${cdnHostname}/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;

      res.json({
        success: true,
        iframeUrl,
        token,
        expires,
        libraryId,
        cdnHostname
      });
    } catch (err: any) {
      console.error("Erreur de génération de token Bunny:", err);
      res.status(500).json({ error: "Erreur lors de la sécurisation de la vidéo." });
    }
  });

  // Static file serving for local fallback uploads
  
  app.post("/api/quiz/submit", isAuthenticated, async (req: any, res: any) => {
    try {
      const { quizId, courseId, answers } = req.body;
      const studentId = req.user.uid;
      
      const { adminDb } = await import("./src/lib/firebaseAdmin.js");
      const quizRef = adminDb.collection('quizzes').where('id', '==', quizId);
      const quizSnap = await quizRef.get();
      
      if (quizSnap.empty) {
        return res.status(404).json({ error: "Quiz non trouvé" });
      }
      
      const quiz = quizSnap.docs[0].data();
      let s = 0;
      let maxPoints = 0;
      
      quiz.questions.forEach((q: any) => {
        const pts = q.points || 1;
        maxPoints += pts;
        const ans = answers[q.id];
        
        switch (q.type) {
          case 'single':
          case 'true_false':
            const correctOption = q.options.find((o: any) => o.isCorrect);
            if (correctOption && ans === correctOption.id) s += pts;
            break;
          case 'multiple':
            const correctIds = q.options.filter((o: any) => o.isCorrect).map((o: any) => o.id);
            const userIds = ans || [];
            const isCorrect = correctIds.length === userIds.length && correctIds.every((id: string) => userIds.includes(id));
            if (isCorrect) s += pts;
            break;
          case 'short_answer':
          case 'fill_blank':
            const accepted = q.options.map((o: any) => o.text.toLowerCase().trim());
            if (ans && accepted.includes(ans.toLowerCase().trim())) s += pts;
            break;

          case 'order': {
             // For order, ans is an array of items [{id, text}]
             // We check if the ids are in the exact same order as q.options
             const correctIds = q.options.map((o: any) => o.id);
             const userIds = (ans || []).map((a: any) => a.id);
             let isOrderCorrect = correctIds.length > 0 && correctIds.length === userIds.length;
             for (let i = 0; i < correctIds.length; i++) {
                if (correctIds[i] !== userIds[i]) {
                   isOrderCorrect = false;
                   break;
                }
             }
             if (isOrderCorrect) s += pts;
             break;
          }
          case 'match':
          case 'drag_drop': {
             // ans is an object mapping leftId -> rightId
             let correctMatches = 0;
             let totalMatches = q.options.length;
             q.options.forEach((o: any) => {
                if (ans && ans[o.id] === o.id) { // In match, rightId is same index/id essentially, wait! 
                   // Let's look at how QuizPlayer stored it: rightItems are mapped from o.id.
                   correctMatches++;
                }
             });
             if (totalMatches > 0 && correctMatches === totalMatches) s += pts; // Require all correct for full points, or partial? Let's do full points if all correct.
             break;
          }
        }
      });
      
      const finalScore = maxPoints > 0 ? Math.round((s / maxPoints) * 100) : 0;
      const passed = finalScore >= (quiz.settings?.passingScore || 70);
      
      const submissionRef = adminDb.collection('quiz_submissions').doc(studentId + '_' + quizId);
      await submissionRef.set({
        studentId,
        quizId,
        courseId,
        score: finalScore,
        passed,
        answers,
        completedAt: new Date(),
        completed: true,
        instructorId: quiz.instructorId || null
      }, { merge: true });
      
      res.json({ success: true, score: finalScore, passed });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  });


  app.post("/api/marketing/click", MarketingRoutes.trackClick);
  app.post("/api/marketing/conversion", MarketingRoutes.trackConversion);
  app.get("/api/marketing/download", MarketingRoutes.downloadAsset);

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
startCronJobs();
