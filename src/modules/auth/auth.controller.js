import bcrypt from "bcrypt";
import User from "./auth.model.js";
import {generateToken} from "../../utils/generateToken.js";



//Register User
export const registerUser = async (req, res) => {
    try {
        const {name, email,password,role}= req.body;

        //Check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                sucess: false,
                message:"User alreadt exist",
            })
        }

        //hash the password 
        const hashedPassword = await bcrypt.hash(password,10);

        //Create the new User
        const user=  await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        })
        //Generate Token
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message:"User Register Successfully",
            token,
            user,
        })

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}