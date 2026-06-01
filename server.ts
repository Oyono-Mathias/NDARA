import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  const httpServer = createHttpServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: { origin: "*" }
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

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Ndara Afrique" });
  });

  // Wallet Security API
  app.post("/api/wallet/init", async (req, res) => {
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
  app.post("/api/chat", async (req, res) => {
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
      res.status(500).json({ error: "Erreur IA." });
    }
  });

  app.post("/api/wallet/deposit", async (req, res) => {
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

  app.post("/api/wallet/transfer", async (req, res) => {
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

  app.post("/api/wallet/purchase", async (req, res) => {
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

  app.post("/api/wallet/release-escrow", async (req, res) => {
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
  app.post("/api/wallet/purchase-license", async (req, res) => {
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
  app.post("/api/wallet/request-payout", async (req, res) => {
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
  app.post("/api/wallet/approve-payout", async (req, res) => {
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
