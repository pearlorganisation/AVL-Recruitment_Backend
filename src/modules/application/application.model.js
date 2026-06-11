import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema(
    {
        stage: { type: String, required: true },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
        remarks: { type: String, default: "" },
    },
    { _id: false }
);

const applicationSchema = new mongoose.Schema(
    {
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            required: true,
        },

        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // If submitted by recruiter on behalf of candidate
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        resumeUrl: {
            type: String,
            required: true,
        },

        coverLetter: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "applied",
                "under-review",
                "shortlisted",
                "interview-round-1",
                "interview-round-2",
                "interview-round-3",
                "offer-released",
                "offer-accepted",
                "offer-rejected",
                "hired",
                "rejected",
            ],
            default: "applied",
        },

        statusHistory: {
            type: [statusHistorySchema],
            default: [],
        },

        // Recruiter commission (set after hire)
        commission: {
            amount: { type: Number, default: null },
            currency: { type: String, default: "INR" },
            isPaid: { type: Boolean, default: false },
            paidAt: { type: Date, default: null },
        },

        isWithdrawn: {
            type: Boolean,
            default: false,
        },

        withdrawnAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Prevent duplicate application from same candidate to same job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ candidate: 1 });
applicationSchema.index({ submittedBy: 1 });

export default mongoose.model("Application", applicationSchema);