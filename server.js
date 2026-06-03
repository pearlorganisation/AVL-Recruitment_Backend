import express from "express";
import app from "./src/app.js";
import dotenv from "dotenv";
import connectDb from "./src/db/index.js";
dotenv.config();

//Data base connect here 
connectDb();


app.listen((process.env.PORT || 5000),()=>{
    console.log(`Server is Running on port ${process.env.PORT || 5000}`);
});