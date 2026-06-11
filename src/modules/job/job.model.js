import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
    {
        employer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "EmployerProfile",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        requirements: {
            type: [String],
            default: [],
        },

        responsibilities: {
            type: [String],
            default: [],
        },

        skills: {
            type: [String],
            default: [],
        },

        jobType: {
            type: String,
            enum: ["full-time", "part-time", "contract", "internship", "freelance"],
            required: true,
        },

        workMode: {
            type: String,
            enum: ["onsite", "remote", "hybrid"],
            default: "onsite",
        },

        location: {
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true, default: "India" },
        },

        salary: {
            min: { type: Number, default: null },
            max: { type: Number, default: null },
            currency: { type: String, default: "INR" },
            isNegotiable: { type: Boolean, default: false },
            isVisible: { type: Boolean, default: true },
        },

        experienceLevel: {
            type: String,
            enum: ["fresher", "junior", "mid", "senior", "lead", "manager"],
            required: true,
        },

        experienceYears: {
            min: { type: Number, default: 0 },
            max: { type: Number, default: null },
        },

        openings: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },

        applicationDeadline: {
            type: Date,
            default: null,
        },

        status: {
            type: String,
            enum: ["draft", "active", "paused", "closed", "expired"],
            default: "draft",
        },

        visibility: {
            type: String,
            enum: ["public", "private", "recruiter-only"],
            default: "public",
        },

        // Recruiters allowed to submit candidates (if recruiter-only or selective)
        allowedRecruiters: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        totalApplications: {
            type: Number,
            default: 0,
        },

        views: {
            type: Number,
            default: 0,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Indexes for fast queries
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ status: 1, visibility: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isDeleted: 1 });

// Auto-expire jobs past deadline
jobSchema.pre("save", function () {
    if (
        this.applicationDeadline &&
        this.applicationDeadline < new Date() &&
        this.status === "active"
    ) {
        this.status = "expired";
    }
});

export default mongoose.model("Job", jobSchema);