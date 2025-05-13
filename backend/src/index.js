import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("__filename:", __filename);
console.log("__dirname:", __dirname);

const PORT = process.env.PORT;

app.use((req, res, next) => {
  console.log('Received request for:', req.originalUrl);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const distPath = path.join(__dirname, "..", "..", "frontend", "dist");
console.log("Dist path:", distPath); 

app.use(express.static(distPath));

app.use("/", (req, res) => {
  console.log("Sending index.html from:", distPath);
  res.sendFile(path.join(distPath, "index.html"));
});

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
  });
});
