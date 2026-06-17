import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

dotenv.config(); // Load .env
dotenv.config({ path: '.env.example' }); // Fallback to .env.example if missing in .env

import uploadRoutes from "./src/routes/uploadRoutes.js";
import { isAuthenticated, requireRole, requireOwnershipOrAdmin } from "./src/middlewares/authMiddleware.js";
import { requireTurnstile } from "./src/middlewares/turnstileMiddleware.js";

async function startServer() {
  const app = express();
  
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
      const { roomId, userId } = data;
      // Broadcast to everyone else in the room
      socket.to(roomId).emit("typing", { userId });
    });

    socket.on("send-message", (data) => {
      // Re-broadcast to the room
      const { roomId, message } = data;
      io.to(roomId).emit("new-message", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // 4. STABILISATION BACKEND: Payload Size Limit Mapping
  // Preventing memory exhaustion (e.g. from large JSON uploads)
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true, limit: "5mb" }));

  // Import new upload routes
  console.log("uploadRoutes type:", typeof uploadRoutes, uploadRoutes);
  app.use("/api/storage", uploadRoutes);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Ndara Afrique" });
  });

  // Wallet Security API
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
  app.post("/api/chat", isAuthenticated, async (req: any, res: any) => {
    try {
      const { message, history } = req.body;
      const { GoogleGenAI } = await import("@google/genai");
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
         return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

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
      const { studentId, price, courseId, courseTitle, sellerId } = req.body;
      if (!studentId || !price || !courseId || !courseTitle || !sellerId) {
        return res.status(400).json({ error: "Données de commande invalides." });
      }
      
      const { purchaseCourseWithEscrow } = await import("./src/lib/walletProcessor.js");
      const result = await purchaseCourseWithEscrow(
        studentId, 
        Number(price), 
        courseId, 
        courseTitle, 
        sellerId
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

  app.get("/api/admin/video/health", isAuthenticated, requireRole(['admin']), async (req: any, res: any) => {
    try {
        const { adminDb } = await import("./src/lib/firebaseAdmin.js");
        
        let totalVideos = 0;
        let bunnyCount = 0;
        let cloudflareCount = 0;

        const coursesSnap = await adminDb.collection('courses').get();
        coursesSnap.docs.forEach(doc => {
            const data = doc.data();
            if (data.content && Array.isArray(data.content)) {
                data.content.forEach((module: any) => {
                    if (module.lessons && Array.isArray(module.lessons)) {
                        module.lessons.forEach((lesson: any) => {
                            if (lesson.videoUrl || lesson.videoId) {
                                totalVideos++;
                                if (lesson.provider === 'cloudflare') {
                                    cloudflareCount++;
                                } else {
                                    bunnyCount++; // Bunny is the implicit default
                                }
                            }
                        });
                    }
                });
            }
        });

        const confDoc = await adminDb.collection('settings').doc('global_config').get();
        const config = confDoc.exists ? confDoc.data() : null;
        
        let bunnyPing = -1;
        let cfPing = -1;

        if (config?.bunny_stream_api_key && config?.bunny_stream_library_id) {
            const start = Date.now();
            try {
                const bRes = await fetch(`https://video.bunnycdn.com/library/${config.bunny_stream_library_id}/videos?page=1&itemsPerPage=1`, {
                    headers: { 'AccessKey': config.bunny_stream_api_key, 'accept': 'application/json' }
                });
                if (bRes.ok) bunnyPing = Date.now() - start;
            } catch (e) {}
        }

        if (config?.cloudflare_account_id && config?.cloudflare_api_token) {
             const start = Date.now();
             try {
                const cRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${config.cloudflare_account_id}/stream`, {
                    headers: { 'Authorization': `Bearer ${config.cloudflare_api_token}`, 'Content-Type': 'application/json' }
                });
                if (cRes.ok) cfPing = Date.now() - start;
             } catch (e) {}
        }

        const activeProvider = config?.active_video_provider || 'bunny';

        res.json({
            success: true,
            stats: { totalVideos, bunnyCount, cloudflareCount },
            ping: { bunny: bunnyPing, cloudflare: cfPing },
            activeProvider
        });

    } catch (err: any) {
        console.error("Health endpoint error:", err);
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
      } catch(e) { console.error("Error reading db config", e); }

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
      let apiKey = process.env.BUNNY_STREAM_API_KEY || "1a935f43-a130-4313-8d3f602e638d-57d5-4e69";
      let libraryId = process.env.BUNNY_STREAM_LIBRARY_ID || "684366";

      try {
        const { adminDb } = await import("./src/lib/firebaseAdmin.js");
        const confDoc = await adminDb.collection('settings').doc('global_config').get();
        if (confDoc.exists) {
            const data = confDoc.data() as any;
            if (data?.bunny_stream_api_key) apiKey = data.bunny_stream_api_key;
            if (data?.bunny_stream_library_id) libraryId = data.bunny_stream_library_id;
        }
      } catch(e) { console.error("Error reading db config", e); }

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
        throw new Error("Failed to create video in Bunny Stream");
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
  app.get("/api/video/token", isAuthenticated, async (req: any, res: any) => {
    try {
      const { videoId } = req.query;
      if (!videoId) {
        return res.status(400).json({ error: "videoId est requis." });
      }

      const securityKey = process.env.BUNNY_STREAM_SECURITY_KEY;
      const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
      const cdnHostname = process.env.BUNNY_STREAM_CDN_HOSTNAME || "iframe.mediadelivery.net";

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
