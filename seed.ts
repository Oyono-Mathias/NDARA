import { adminDb } from "./src/lib/firebaseAdmin.js";
import { FieldValue } from "firebase-admin/firestore";

async function seed() {
  const batch = adminDb.batch();

  // 1. market_ebooks
  const ebooks = [
    {
      id: "ebook_1",
      title: "Guide de la Fiscalité des PMEs en zone CEMAC",
      author: "Expertise Comptable Afrik",
      description: "Le livre de référence pour maîtriser la fiscalité des petites et moyennes entreprises dans la zone CEMAC. Inclus: régime simplifié, patente, et TVA.",
      price: 5000,
      currency: "XAF",
      status: "active",
      coverUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80",
      publicUrl: "https://example.com/ebook-cemac.pdf",
      createdAt: FieldValue.serverTimestamp()
    },
    {
       id: "ebook_2",
       title: "Optimiser ses rendements de Maïs en climat sahélien",
       author: "Agro Vision Sahel",
       description: "Techniques agronomiques avancées pour la rétention d'eau, le choix des semences hybrides et l'utilisation optimale des engrais organiques en zone aride.",
       price: 3500,
       currency: "XAF",
       status: "active",
       coverUrl: "https://images.unsplash.com/photo-1595015949547-5d275211b702?auto=format&fit=crop&w=400&q=80",
       publicUrl: "https://example.com/ebook-mais.pdf",
       createdAt: FieldValue.serverTimestamp()
    },
    {
       id: "ebook_3",
       title: "Le Copywriting adapté au marché Ouest-Africain",
       author: "Digital Growth Afrique",
       description: "Apprenez à rédiger des messages publicitaires percutants qui convertissent sur Facebook et WhatsApp pour vos audiences africaines.",
       price: 4000,
       currency: "XAF",
       status: "active",
       coverUrl: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=400&q=80",
       publicUrl: "https://example.com/ebook-copywriting.pdf",
       createdAt: FieldValue.serverTimestamp()
    }
  ];

  ebooks.forEach(data => {
    const ref = adminDb.collection('market_ebooks').doc(data.id);
    batch.set(ref, data);
  });

  // 2. market_templates
  const templates = [
    {
      id: "tpl_1",
      title: "Modèle de Business Plan & Plan Financier Excel",
      authorId: "admin",
      authorName: "NDARA Business",
      description: "Un classeur Excel complet avec des formules prêtes à l'emploi pour calculer le BFR, le point mort et le bilan prévisionnel sur 3 ans.",
      price: 10000,
      currency: "XAF",
      status: "active",
      tags: ["Finance", "Entrepreneuriat", "Excel"],
      coverUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80",
      fileUrl: "https://example.com/business-plan-template.xlsx",
      salesCount: 15,
      rating: 4.8,
      createdAt: FieldValue.serverTimestamp()
    },
    {
      id: "tpl_2",
      title: "Template Dashboard de Suivi de Campagne Facebook Ads",
      authorId: "admin",
      authorName: "Marketing Digital Ndara",
      description: "Dashboard Looker Studio / Google Data Studio connecté à vos sources pour suivre le ROAS, CPA et CPC en temps réel.",
      price: 15000,
      currency: "XAF",
      status: "active",
      tags: ["Marketing", "Dashboard", "Facebook Ads"],
      coverUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80",
      fileUrl: "https://example.com/dashboard-ads.json",
      salesCount: 8,
      rating: 4.5,
      createdAt: FieldValue.serverTimestamp()
    },
    {
      id: "tpl_3",
      title: "Kit Légal Start-up CIMA/OHADA",
      authorId: "admin",
      authorName: "Juridique Pro",
      description: "Modèles de status SAS, pacte d'associés, et contrats de travail conformes au droit OHADA.",
      price: 25000,
      currency: "XAF",
      status: "active",
      tags: ["Droit", "Entrepreneuriat", "OHADA"],
      coverUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80",
      fileUrl: "https://example.com/kit-legal.zip",
      salesCount: 42,
      rating: 4.9,
      createdAt: FieldValue.serverTimestamp()
    }
  ];

  templates.forEach(data => {
    const ref = adminDb.collection('market_templates').doc(data.id);
    batch.set(ref, data);
  });

  // 3. sandbox_templates
  const sandboxes = [
    {
       id: "sandbox_coding_1",
       title: "Bases de l'algorithmique JS",
       instructions: "Ecrivez une fonction `calculerTVA(prixHT)` qui retourne le prix TTC (avec une TVA à 19.25%). Vous devez utiliser `console.log` pour afficher le résultat de `calculerTVA(100)`.",
       filiereId: "coding",
       initialCode: "function calculerTVA(prixHT) {\n  // Votre code ici\n}\n\nconsole.log(calculerTVA(100));",
       expectedOutput: "119.25",
       createdAt: FieldValue.serverTimestamp()
    },
    {
       id: "sandbox_accounting_1",
       title: "Équilibre du bilan simplifié",
       instructions: "Vous venez d'acheter du matériel informatique pour 500 000 XAF, payé par virement bancaire. Saisissez l'écriture comptable correspondante pour équilibrer le journal.",
       filiereId: "accounting",
       initialCode: JSON.stringify({ label: "Achat matériel", debit: 0, credit: 0 }),
       expectedOutput: "500000",
       createdAt: FieldValue.serverTimestamp()
    },
    {
       id: "sandbox_marketing_1",
       title: "Lancement Produit Cosmétique",
       instructions: "Vous devez lancer un nouveau beurre de karité bio sur le marché de Dakar. Définissez votre budget, ciblez correctement et rédigez une annonce publicitaire attractive de 2 phrases.",
       filiereId: "marketing",
       initialCode: JSON.stringify({ budget: 500, audience: "Grand public", text: "Découvrez notre beurre de karité." }),
       expectedOutput: "Créativité, argumentaire naturel, appel à l'action",
       createdAt: FieldValue.serverTimestamp()
    },
    {
       id: "sandbox_agronomy_1",
       title: "Optimisation du champ de Sorgho",
       instructions: "La saison sèche approche. Ajustez les ressources de votre exploitation (Intrants, Eau, Semences) afin de garantir au moins 75% de rendement. Attention à ne pas gaspiller l'eau.",
       filiereId: "agronomy",
       initialCode: JSON.stringify({ intrants: 30, eau: 40, semences: 50 }),
       expectedOutput: "75",
       createdAt: FieldValue.serverTimestamp()
    }
  ];

  sandboxes.forEach(data => {
    const ref = adminDb.collection('sandbox_templates').doc(data.id);
    batch.set(ref, data);
  });

  await batch.commit();

  console.log("🟢 Collection market_ebooks injectée avec succès (" + ebooks.length + " documents)");
  console.log("🟢 Collection market_templates injectée avec succès (" + templates.length + " documents)");
  console.log("🟢 Collection sandbox_templates injectée avec succès (" + sandboxes.length + " documents)");
  console.log("✅ Seeding terminé.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Erreur lors du seeding:", err);
  process.exit(1);
});
