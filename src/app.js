import express from "express";
import authRoutes from "./modules/auth/auth.route.js"
import cors from "cors";
const app= express();

app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000", // or your frontend URL
  credentials: true,
}));

app.use("/api/v1/auth", authRoutes);

app.get("/",(req,res)=>{
    res.send("API is Working Perfectly 💯")
})


export default app;