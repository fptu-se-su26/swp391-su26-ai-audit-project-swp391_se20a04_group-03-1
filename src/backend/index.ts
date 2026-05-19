import express from "express";
import dotenv from 'dotenv'
import cors from "cors";
import cookieParser from 'cookie-parser';
const app = express();
const port = 4000;

//Config dotenv
dotenv.config();

//Config Cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

//Config cookies
app.use(cookieParser());

//Connect Database


//Allow json
app.use(express.json());

//Set up route


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
