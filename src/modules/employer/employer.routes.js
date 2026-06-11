import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import {
    // Profile
    createProfile,
    getMyProfile,
    updateProfile,

    // Jobs
    createJob,
    getMyJobs,
    getJobById,
    updateJob,
    changeJobStatus,
    deleteJob,

    // Applications
    getApplicationsByJob,
    updateApplicationStage,

    // Dashboard
    getDashboardStats,
} from "./employer.controller.js";
import { validateCreateJob, validateUpdateJob } from "./employer.validator.js";

const router = express.Router();

// All routes are protected + employer only
router.use(protect, authorizeRoles("employer"));

// ── Dashboard ─────────────────────────────────
router.get("/dashboard", getDashboardStats);

// ── Employer Profile ──────────────────────────
router.post("/profile", createProfile);
router.get("/profile", getMyProfile);
router.put("/profile", updateProfile);

// ── Job Management ────────────────────────────
router.post("/jobs", validateCreateJob, createJob);
router.get("/jobs", getMyJobs);
router.get("/jobs/:jobId", getJobById);
router.put("/jobs/:jobId", validateUpdateJob, updateJob);
router.patch("/jobs/:jobId/status", changeJobStatus);
router.delete("/jobs/:jobId", deleteJob);

// ── Applications ──────────────────────────────
router.get("/jobs/:jobId/applications", getApplicationsByJob);
router.patch("/applications/:applicationId/stage", updateApplicationStage);

export default router;