import { logger } from '../lib/logger';
import { Request, Response, NextFunction } from "express";
import { adminAuth, adminDb } from "../lib/firebaseAdmin.js";

// Ensure auth is correctly typed
export interface AuthRequest extends Request {
  user?: any;
}

export const isAuthenticated = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Attempt to enrich with Firestore user data using adminDb
    try {
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists) {
        decodedToken.role = userDoc.data()?.role || "student";
      } else {
        decodedToken.role = "student";
      }
    } catch (e) {
      logger.error("Failed to load user document for role enrichment via adminDb:", e);
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error("Auth middleware error:", error);
    res.status(403).json({ error: "Unauthorized access: " + error.message });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || "student"; // Default role
    // Check if user is an admin bypassing roles, or has specific role
    if (userRole !== "admin" && !allowedRoles.includes(userRole)) {
      console.warn(`Access denied. User role '${userRole}' not in allowed roles: ${allowedRoles.join(", ")}`);
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

// Middleware to ensure user is requesting their own data, or is an admin
export const requireOwnershipOrAdmin = (userIdField: string = "userId") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    const targetUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];
    const isOwner = req.user.uid === targetUserId;
    const isAdmin = req.user.role === "admin";
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden: you can only modify your own data" });
    }
    
    next();
  };
};
