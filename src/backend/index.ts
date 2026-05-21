import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.config";
import rootRouter from "./routers";

const app = express();
const port = 4000;

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

//Allow json
app.use(express.json());

//Set up route
app.use("/api", rootRouter);

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
