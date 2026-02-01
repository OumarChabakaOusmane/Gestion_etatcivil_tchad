const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
// const { auth, adminAuth } = require("../middlewares/auth.middleware"); // Potential future use

// Public route to submit contact form
router.post("/", contactController.submitContact);

// Protected routes (Admin only) - potentially add auth later
router.get("/", contactController.getAllContacts);
router.post("/reply", contactController.replyToContact);

module.exports = router;
