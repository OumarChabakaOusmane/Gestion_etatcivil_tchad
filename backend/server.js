const express = require("express");
const cors = require("cors");
const dns = require('dns');
// Force l'utilisation de IPv4 pour éviter les erreurs ENETUNREACH avec Firebase sur certains réseaux
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
require("dotenv").config();

// Import des routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const naissanceRoutes = require("./routes/naissance.routes");
const mariageRoutes = require("./routes/mariage.routes");
const decesRoutes = require("./routes/deces.routes");
const demandeRoutes = require("./routes/demande.routes");
const notificationRoutes = require("./routes/notification.routes");
const contactRoutes = require("./routes/contact.routes");
const searchRoutes = require('./routes/search.routes');
const auditRoutes = require('./routes/audit.routes');
const articleRoutes = require('./routes/article.routes');
const { db } = require("./config/firebase");

const app = express();

// Configuration CORS
app.use(cors({
  origin: true, // Accepte toutes les origines (utile pour le dev réseau)
  credentials: true
}));

// Middleware pour parser le JSON (Limite augmentée pour les photos de profil Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "API SIGEC-TCHAD opérationnelle 🚀" });
});

// Routes d'authentification
app.use("/api/auth", authRoutes);

// Routes utilisateurs (protégées)
app.use("/api/users", userRoutes);

// Routes des actes de naissance (protégées)
app.use("/api/naissances", naissanceRoutes);

// Routes des actes de mariage (protégées)
app.use("/api/mariages", mariageRoutes);

// Routes des actes de décès (protégées)
app.use("/api/deces", decesRoutes);

// Routes des demandes (protégées)
app.use("/api/demandes", demandeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/logs', auditRoutes);
app.use('/api/articles', articleRoutes);

// Routes des notifications (protégées)
app.use("/api/notifications", notificationRoutes);

// Route de test de la base de données
app.get("/api/test-db", async (req, res) => {
  try {
    const snapshot = await db.collection("test").get();
    res.json({
      success: true,
      message: "Firebase connecté avec succès ✅",
      data: {
        documentsCount: snapshot.size
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
}

module.exports = app;
