const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 mint
  max: 100,
  message:  { success: false, message: "Too many requests, please try again later." },
});

app.use("/api/", limiter);

// Stricter limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many login attempts, please try again later." },
});

app.use("/api/auth/", authLimiter);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  })

// Routes
// app.use("/api/auth",       require("./routes/auth"));
// app.use("/api/users",      require("./routes/users"));
// app.use("/api/products",   require("./routes/products"));
// app.use("/api/categories", require("./routes/categories"));
// app.use("/api/cart",       require("./routes/cart"));
// app.use("/api/orders",     require("./routes/orders"));
// app.use("/api/reviews",     require("./routes/reviews"));
// app.use("/api/admin",       require("./routes/admin"));
// app.use("/api/upload",      require("./routes/upload"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "APIs are working fine",
    env: process.env.NODE_ENV,
    time:    new Date().toISOString(),
  })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:  `Route ${req.method} ${req.url} not found`,
  })
})

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("❌ Error:", err.stack);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
})

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 Environment: ${process.env.NODE_ENV}`);
});