const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ---------------- Security Middleware ----------------
app.use(helmet());

// ---------------- CORS Middleware ----------------
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// ---------------- Body Parser ----------------
app.use(express.json());

// ---------------- Rate Limiters ----------------
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    message: "Too many login attempts. Please try again after sometime.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many API requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------- Routes ----------------
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));

app.use(
  "/api/interview",
  apiLimiter,
  require("./routes/interviewRoutes")
);

// ---------------- Health Check ----------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------------- Root Route ----------------
app.get("/", (req, res) => {
  res.json({
    message: "InterviewAI API running",
  });
});

module.exports = app;