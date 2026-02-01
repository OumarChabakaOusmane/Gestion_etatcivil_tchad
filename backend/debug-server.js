const express = require("express");
const cors = require("cors");
require("dotenv").config();

console.log("Starting Debug Server...");

try {
    console.log("Loading routes...");
    const authRoutes = require("./routes/auth.routes");
    console.log("✅ authRoutes loaded");
    const userRoutes = require("./routes/user.routes");
    console.log("✅ userRoutes loaded");
    const naissanceRoutes = require("./routes/naissance.routes");
    console.log("✅ naissanceRoutes loaded");
    const mariageRoutes = require("./routes/mariage.routes");
    console.log("✅ mariageRoutes loaded");
    const decesRoutes = require("./routes/deces.routes");
    console.log("✅ decesRoutes loaded");
    const demandeRoutes = require("./routes/demande.routes");
    console.log("✅ demandeRoutes loaded");
    const notificationRoutes = require("./routes/notification.routes");
    console.log("✅ notificationRoutes loaded");
    const contactRoutes = require("./routes/contact.routes");
    console.log("✅ contactRoutes loaded");
    const searchRoutes = require('./routes/search.routes');
    console.log("✅ searchRoutes loaded");

    const { db } = require("./config/firebase");
    console.log("✅ Firebase config loaded");

    const app = express();
    app.use(cors());
    app.use(express.json());

    console.log("Registering routes...");
    app.use("/api/auth", authRoutes);
    console.log("✅ /api/auth registered");
    app.use("/api/users", userRoutes);
    console.log("✅ /api/users registered");
    app.use("/api/naissances", naissanceRoutes);
    console.log("✅ /api/naissances registered");
    app.use("/api/mariages", mariageRoutes);
    console.log("✅ /api/mariages registered");
    app.use("/api/deces", decesRoutes);
    console.log("✅ /api/deces registered");
    app.use("/api/demandes", demandeRoutes);
    console.log("✅ /api/demandes registered");
    app.use('/api/contact', contactRoutes);
    console.log("✅ /api/contact registered");
    app.use('/api/search', searchRoutes);
    console.log("✅ /api/search registered");
    app.use("/api/notifications", notificationRoutes);
    console.log("✅ /api/notifications registered");

    const PORT = 5001; // Use different port for debug
    app.listen(PORT, () => {
        console.log(`🚀 Debug Server launched on http://localhost:${PORT}`);
        process.exit(0); // Exit successfully if it launched
    });

} catch (error) {
    console.error("❌ CRASH DETECTED:");
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
}
