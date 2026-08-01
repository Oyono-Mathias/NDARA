import { adminDb } from "./firebaseAdmin.js";

// Backend route implementations for Phase 7
export const MarketingRoutes = {
  // /api/marketing/click
  async trackClick(req: any, res: any) {
    try {
      const { ref, camp, url } = req.body;
      if (!ref) return res.json({ success: true, message: "No ref" });

      const clickId = Date.now().toString() + Math.floor(Math.random()*1000);
      await adminDb.collection('campaign_clicks').doc(clickId).set({
        ambassadorId: ref.replace('AMB-', ''),
        campaignId: camp || null,
        url,
        timestamp: new Date()
      });

      if (camp) {
         // Increment click on campaign
         const cRef = adminDb.collection('ambassador_campaigns').doc(camp);
         const cSnap = await cRef.get();
         if (cSnap.exists) {
            await cRef.update({ clicks: (cSnap.data()?.clicks || 0) + 1 });
         }
      }
      res.json({ success: true });
    } catch(e) {
      console.error(e);
      res.status(500).json({ error: "Server error" });
    }
  },

  // /api/marketing/conversion
  async trackConversion(req: any, res: any) {
    try {
       const { ref, camp, type, amount, courseId } = req.body; // type: signup or sale
       if (!ref) return res.json({ success: true });
       
       const ambassadorUid = ref.replace('AMB-', '');
       const convId = Date.now().toString() + Math.floor(Math.random()*1000);
       
       await adminDb.collection('campaign_conversions').doc(convId).set({
         ambassadorId: ambassadorUid,
         campaignId: camp || null,
         type,
         amount: amount || 0,
         courseId: courseId || null,
         timestamp: new Date()
       });

       if (camp) {
          const cRef = adminDb.collection('ambassador_campaigns').doc(camp);
          const cSnap = await cRef.get();
          if (cSnap.exists) {
             const data = cSnap.data();
             const updates: any = {};
             if (type === 'signup') updates.signups = (data?.signups || 0) + 1;
             if (type === 'sale') {
                updates.sales = (data?.sales || 0) + 1;
                updates.revenue = (data?.revenue || 0) + amount;
                updates.commissions = (data?.commissions || 0) + (amount * 0.2); // approx 20%
             }
             await cRef.update(updates);
          }
       }
       res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Server error" });
    }
  },

  // /api/marketing/download
  async downloadAsset(req: any, res: any) {
    try {
      const { id } = req.query; // asset id
      if (!id) return res.status(400).send("Asset ID missing");
      const aRef = adminDb.collection('marketing_assets').doc(id);
      const snap = await aRef.get();
      if (!snap.exists) return res.status(404).send("Not found");
      const data = snap.data();
      
      await aRef.update({ downloads: (data?.downloads || 0) + 1 });
      
      res.json({ success: true, url: data?.url });
    } catch (e) {
      res.status(500).send("Server Error");
    }
  }
};
