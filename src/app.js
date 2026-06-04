import express from "express";
import authRoutes from "./modules/auth/auth.route.js"
const app= express();

app.use(express.json());



app.use("/api/v1/auth", authRoutes);

app.get("/",(req,res)=>{
    res.send("API is Working Perfectly 💯")
})


export default app;