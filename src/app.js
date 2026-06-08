import express from "express";
import authRoutes from "./modules/auth/auth.route.js"
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
const app = express();

app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.use(cors({
  origin: [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://avl-recruitment.vercel.app",
],
  credentials: true,
}));

app.use("/api/v1/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is Working Perfectly 💯")
})


export default app;