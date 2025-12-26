const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import des routes
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const naissanceRoutes = require("./routes/naissance.routes");
const mariageRoutes = require("./routes/mariage.routes");
const { db } = require("./config/firebase");

const app = express();

// Configuration CORS
app.use(cors({
  origin: 'http://localhost:3000', // Remplacez par l'URL de votre frontend
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json());

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
