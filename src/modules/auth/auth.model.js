import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: [

                "admin",
                "employer",
                "recruiter",
                "candidate",
            ],
            default: "candidate",
        },
        refreshToken: {
            type: String,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },

        verificationToken: {
            type: String,
            default: null,
        },

        verificationTokenExpire: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("User", userSchema);