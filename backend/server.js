const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import des routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const naissanceRoutes = require("./routes/naissance.routes");
const mariageRoutes = require("./routes/mariage.routes");
const decesRoutes = require("./routes/deces.routes");
const demandeRoutes = require("./routes/demande.routes");
const { db } = require("./config/firebase");

const app = express();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:5173', // URL du frontend Vite
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

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
