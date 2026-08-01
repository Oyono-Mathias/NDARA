import express from 'express';

import { google } from 'googleapis';

const router = express.Router();

const CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = 'postmessage';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Temporary in-memory store for tokens (in production, use Firestore)
const userTokens: Record<string, any> = {};

// 1. Exchange auth code for tokens
router.post('/auth/google', async (req: any, res: any) => {
  try {
    const { code } = req.body;
    const { tokens } = await oauth2Client.getToken(code);
    
    // In a real app, associate this with req.user.uid
    userTokens['demo-user'] = tokens;
    
    res.json({ success: true, message: "Successfully connected to Google Workspace" });
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Fetch Emails (Gmail)
router.get('/gmail/messages', async (req: any, res: any) => {
  try {
    const tokens = userTokens['demo-user'];
    if (!tokens) return res.status(401).json({ error: "Not authenticated with Google" });

    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 5,
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Create Google Meet
router.post('/meet/create', async (req: any, res: any) => {
  try {
    const tokens = userTokens['demo-user'];
    if (!tokens) return res.status(401).json({ error: "Not authenticated with Google" });

    oauth2Client.setCredentials(tokens);
    // Google Meet API is part of spaces
    const meet = google.meet({ version: 'v2', auth: oauth2Client });
    
    const response = await meet.spaces.create({
      requestBody: {}
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// 4. Fetch Google Classroom courses
router.get('/classroom/courses', async (req: any, res: any) => {
  try {
    const tokens = userTokens['demo-user'];
    if (!tokens) return res.status(401).json({ error: "Not authenticated with Google" });

    oauth2Client.setCredentials(tokens);
    const classroom = google.classroom({ version: 'v1', auth: oauth2Client });
    
    const response = await classroom.courses.list({
      studentId: 'me',
      courseStates: ['ACTIVE'],
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Fetch Google Forms
router.get('/forms/list', async (req: any, res: any) => {
  try {
    const tokens = userTokens['demo-user'];
    if (!tokens) return res.status(401).json({ error: "Not authenticated with Google" });

    oauth2Client.setCredentials(tokens);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Use Drive API to search for forms since Forms API is mainly for accessing a specific form by ID
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.form'",
      spaces: 'drive',
      pageSize: 5,
      fields: 'files(id, name, webViewLink)',
    });
    
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
