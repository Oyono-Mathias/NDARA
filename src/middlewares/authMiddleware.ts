import { Request, Response, NextFunction } from "express";
import { admin } from "../lib/firebaseAdmin.js";

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
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Attempt to enrich with Firestore user data to ensure we have the role
    try {
      // Because `adminDb` lacks a service account in AI Studio, we use the user's idToken to fetch their own role from REST.
      const fs = await import("fs");
      const path = await import("path");
      let projectId = "";
      let databaseId = "";
      try {
        const configStr = fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf-8");
        const config = JSON.parse(configStr);
        projectId = config.projectId;
        databaseId = config.firestoreDatabaseId;
      } catch (e) {}

      if (projectId && databaseId) {
        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users/${decodedToken.uid}`;
        const response = await fetch(url, { headers: { Authorization: `Bearer ${idToken}` } });
        if (response.ok) {
          const data = await response.json();
          if (data.fields && data.fields.role && data.fields.role.stringValue) {
            decodedToken.role = data.fields.role.stringValue;
          } else {
            decodedToken.role = "student";
          }
        }
      }
    } catch (e) {
      console.error("Failed to load user document for role enrichment via REST:", e);
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(403).json({ error: "Unauthorized access" });
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
