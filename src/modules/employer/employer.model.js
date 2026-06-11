import mongoose from "mongoose";

const employerProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        companyName: {
            type: String,
            required: true,
            trim: true,
        },

        companyDescription: {
            type: String,
            trim: true,
        },

        industry: {
            type: String,
            trim: true,
        },

        companySize: {
            type: String,
            enum: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
        },

        website: {
            type: String,
            trim: true,
        },

        location: {
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true, default: "India" },
        },

        logo: {
            type: String,
            default: null,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("EmployerProfile", employerProfileSchema);