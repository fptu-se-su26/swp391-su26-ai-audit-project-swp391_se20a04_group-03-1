import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.config";
import rootRouter from "./routers/index.route";
import { connectRedis } from "./config/redis.config";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const port = 4000;

// Config Socket.io
const httpServer = createServer(app); // Tạo HTTP server từ Express app
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL, // Cho phép Frontend kết nối
    credentials: true,
  },
});

//Config dotenv
dotenv.config();

//Config Cors
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

//Config cookies
app.use(cookieParser());

//Connect Database
connectDB();
connectRedis();

//Allow json
app.use(express.json());

//Set up route
app.use("/api", rootRouter);

io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  // Lắng nghe sự kiện Frontend xin vào xem một bãi đỗ cụ thể
  socket.on("join_yard", (yard_id) => {
    socket.join(yard_id); // Đưa client này vào room tên là yard_id
    console.log(`[Socket] Client ${socket.id} joined yard: ${yard_id}`);
  });
  // Xử lý khi Frontend rời trang hoặc ngắt kết nối
  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
