const express = require("express");
const rateLimit = require("express-rate-limit");

const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../controllers/authController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    message: "Too many auth attempts. Please try again later.",
  },
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.get("/me", requireAuth, getCurrentUser);

module.exports = router;
