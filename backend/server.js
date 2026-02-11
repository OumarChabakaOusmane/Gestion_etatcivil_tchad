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
const adminRoutes = require('./routes/admin.routes');
const testRoutes = require('./routes/test.routes'); // Route de diagnostic
const { db } = require("./config/firebase");

const app = express();
const fs = require('fs');
const path = require('path');

// Logger ultra-agressif pour le debug mobile
const logPath = 'C:\\Users\\Chaba\\Desktop\\Gestion_etatcivil_tchad\\backend\\access_log.txt';
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - [INCOMING] ${req.method} ${req.url} from ${req.ip}\n`;
  try {
    fs.appendFileSync(logPath, log);
  } catch (e) { console.error('Log error:', e); }

  res.on('finish', () => {
    const logFinish = `${new Date().toISOString()} - [FINISHED] ${req.method} ${req.url} - Status: ${res.statusCode} from ${req.ip}\n`;
    try {
      fs.appendFileSync(logPath, logFinish);
    } catch (e) { console.error('Log error (finish):', e); }
  });
  next();
});

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

app.get("/api/debug-conn", (req, res) => {
  const info = {
    time: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.url,
    headers: req.headers
  };
  console.log('DEBUG CONN:', info);
  res.json(info);
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
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes); // Route de diagnostic (À SUPPRIMER EN PRODUCTION)

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
  const server = app.listen(PORT, '0.0.0.0', () => {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    console.log(`🏠 Accès local : http://localhost:${PORT}`);

    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          console.log(`🌐 Accès réseau (${name}) : http://${net.address}:${PORT}`);
        }
      }
    }
  });
}

// Gestion globale des erreurs non capturées pour éviter les crashs (notamment gRPC)
process.on('unhandledRejection', (reason, promise) => {
  if (reason?.code === 14 || reason?.message?.includes('UNAVAILABLE')) {
    console.warn('⚠️ ALERTE RÉSEAU : Connexion Firestore interrompue temporairement. Tentative de reconnexion automatique...');
  } else {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
});

module.exports = app;
