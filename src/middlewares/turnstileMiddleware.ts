import { Request, Response, NextFunction } from "express";

export const requireTurnstile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  // Bypass if not configured in development
  if (!secretKey) {
    console.warn("Turnstile middleware bypassed: TURNSTILE_SECRET_KEY is missing in environment.");
    next();
    return;
  }

  // Get token from body or headers
  const token = req.body['cf-turnstile-response'] || req.headers['x-turnstile-token'];
  
  if (!token) {
    res.status(400).json({ error: "Le token anti-bot (Turnstile) est requis pour cette action." });
    return;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token as string)}`
    });

    const data: any = await response.json();
    
    if (data.success) {
      next();
    } else {
      console.warn("Turnstile verification failed:", data["error-codes"]);
      res.status(403).json({ error: "Échec de la validation anti-bot (Cloudflare Turnstile)." });
    }
  } catch (error) {
    console.error("[Turnstile Error]:", error);
    res.status(500).json({ error: "Erreur serveur lors de la validation anti-bot." });
  }
};
