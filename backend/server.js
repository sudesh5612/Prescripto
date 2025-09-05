import express from "express";
import cors from "cors";
import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// Required for ES Modules (__dirname not available by default)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App config
const app = express();
const port = process.env.PORT || 4000;

// DB + Cloudinary connections
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

// Test API
app.get("/api", (req, res) => {
  res.send("API WORKING Great");
});

// ---- Serve Admin Frontend ---- //

// Serve static files for admin with fallthrough: false to send 404 on missing files instead of serving index.html
app.use(
  "/admin",
  express.static(path.join(__dirname, "public/admin"), { fallthrough: false })
);

// Catch-all for admin routes (excluding assets)
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin", "index.html"));
});

// ---- Serve User Frontend ---- //

// Serve static files for frontend with fallthrough: false
app.use(
  "/",
  express.static(path.join(__dirname, "public/frontend"), { fallthrough: false })
);

// Catch-all for frontend routes (excluding assets)
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/frontend", "index.html"));
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
