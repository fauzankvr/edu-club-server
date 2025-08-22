import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./infrastructure/config/db";
import studentRoutes from "./interfaces/routes/student.routes";
import InstructorRoutes from "./interfaces/routes/instructou.routes";
import LanguageRoutes from "./interfaces/routes/admin.language.routes";
import CategoryRoutes from "./interfaces/routes/admin.category.routes";
import AdminRoutes from "./interfaces/routes/admin.routes";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
// import { setupSocket } from "./infrastructure/services/websoket";
import rateLimit from "express-rate-limit";
import path from "path";
import { setupChatSocket } from "./infrastructure/services/chatSocket";
import { setupVideoSocket } from "./infrastructure/services/videoSocket";
import morgan from "morgan";

dotenv.config();
const app: Application = express();

app.set("trust proxy", false);

//  Proper CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:5173", "https://educlub0.netlify.app","https://educlub.food"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//  Middlewares
app.use(express.static("uploads"));
// app.set("trust proxy", true);

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, 
  max: 120,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(express.json());
app.use(cookieParser());

//  Create HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://educlub0.netlify.app",
      "https://educlub.food",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});
app.use(morgan("dev"));

//  Initialize socket
setupChatSocket(io);
setupVideoSocket(io);

//  Routes
app.use("/instructor", InstructorRoutes);
app.use("/admin/language", LanguageRoutes);
app.use("/admin/category", CategoryRoutes);
app.use("/admin", AdminRoutes);
app.use("/", studentRoutes);


const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });
