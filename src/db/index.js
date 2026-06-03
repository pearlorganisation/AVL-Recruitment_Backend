import mongoose from "mongoose";
const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("We are successfully Connected to Database 🚀")
    }
    catch (error){
        console.log("We are getting error in connecting to database",error);
    }
}

export default connectDb;