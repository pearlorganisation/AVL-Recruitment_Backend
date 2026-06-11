import EmployerProfile from "./employer.model.js";
import Job from "../job/job.model.js";
import Application from "../application/application.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { buildJobFilter, buildPagination } from "../../utils/queryHelpers.js";

// ─────────────────────────────────────────────
//  EMPLOYER PROFILE
// ─────────────────────────────────────────────

/**
 * @desc    Create employer profile (one per user)
 * @route   POST /api/employer/profile
 * @access  Private (employer)
 */
export const createProfile = asyncHandler(async (req, res) => {
    const existing = await EmployerProfile.findOne({ user: req.user.id });
    if (existing) throw new ApiError(409, "Employer profile already exists");

    const {
        companyName,
        companyDescription,
        industry,
        companySize,
        website,
        location,
    } = req.body;

    if (!companyName) throw new ApiError(400, "Company name is required");

    const profile = await EmployerProfile.create({
        user: req.user.id,
        companyName,
        companyDescription,
        industry,
        companySize,
        website,
        location,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, profile, "Employer profile created successfully"));
});

/**
 * @desc    Get own employer profile
 * @route   GET /api/employer/profile
 * @access  Private (employer)
 */
export const getMyProfile = asyncHandler(async (req, res) => {
    const profile = await EmployerProfile.findOne({ user: req.user.id }).populate(
        "user",
        "name email"
    );

    if (!profile) throw new ApiError(404, "Employer profile not found");

    return res
        .status(200)
        .json(new ApiResponse(200, profile, "Profile fetched successfully"));
});

/**
 * @desc    Update employer profile
 * @route   PUT /api/employer/profile
 * @access  Private (employer)
 */
export const updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = [
        "companyName",
        "companyDescription",
        "industry",
        "companySize",
        "website",
        "location",
        "logo",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No valid fields to update");
    }

    const profile = await EmployerProfile.findOneAndUpdate(
        { user: req.user.id },
        { $set: updates },
        { new: true, runValidators: true }
    ).populate("user", "name email");

    if (!profile) throw new ApiError(404, "Employer profile not found");

    return res
        .status(200)
        .json(new ApiResponse(200, profile, "Profile updated successfully"));
});

// ─────────────────────────────────────────────
//  JOB MANAGEMENT
// ─────────────────────────────────────────────

/**
 * @desc    Create a new job posting
 * @route   POST /api/employer/jobs
 * @access  Private (employer)
 */
export const createJob = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({
        user: req.user.id,
        isActive: true,
    });

    if (!employerProfile) {
        throw new ApiError(403, "Complete your employer profile before posting jobs");
    }

    const {
        title,
        description,
        requirements,
        responsibilities,
        skills,
        jobType,
        workMode,
        location,
        salary,
        experienceLevel,
        experienceYears,
        openings,
        applicationDeadline,
        status,
        visibility,
        allowedRecruiters,
    } = req.body;

    // Required fields validation
    if (!title || !description || !jobType || !experienceLevel || !openings) {
        throw new ApiError(
            400,
            "title, description, jobType, experienceLevel and openings are required"
        );
    }

    // Deadline must be future
    if (applicationDeadline && new Date(applicationDeadline) <= new Date()) {
        throw new ApiError(400, "Application deadline must be a future date");
    }

    const job = await Job.create({
        employer: employerProfile._id,
        createdBy: req.user.id,
        title,
        description,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        skills: skills || [],
        jobType,
        workMode: workMode || "onsite",
        location,
        salary,
        experienceLevel,
        experienceYears: experienceYears || { min: 0, max: null },
        openings,
        applicationDeadline: applicationDeadline || null,
        status: status || "draft",
        visibility: visibility || "public",
        allowedRecruiters: allowedRecruiters || [],
    });

    return res
        .status(201)
        .json(new ApiResponse(201, job, "Job created successfully"));
});

/**
 * @desc    Get all jobs for current employer (with filters & pagination)
 * @route   GET /api/employer/jobs
 * @access  Private (employer)
 */
export const getMyJobs = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    const {
        status,
        jobType,
        workMode,
        search,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = req.query;

    const filter = {
        employer: employerProfile._id,
        isDeleted: false,
    };

    if (status) filter.status = status;
    if (jobType) filter.jobType = jobType;
    if (workMode) filter.workMode = workMode;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { skills: { $elemMatch: { $regex: search, $options: "i" } } },
        ];
    }

    const { skip, limitNum, pageNum } = buildPagination(page, limit);

    const sortObj = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [jobs, total] = await Promise.all([
        Job.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
        Job.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            jobs,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Jobs fetched successfully")
    );
});

/**
 * @desc    Get single job by ID
 * @route   GET /api/employer/jobs/:jobId
 * @access  Private (employer)
 */
export const getJobById = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    const job = await Job.findOne({
        _id: req.params.jobId,
        employer: employerProfile._id,
        isDeleted: false,
    });

    if (!job) throw new ApiError(404, "Job not found");

    return res
        .status(200)
        .json(new ApiResponse(200, job, "Job fetched successfully"));
});


/**
 * @desc    Update a job posting
 * @route   PUT /api/employer/jobs/:jobId
 * @access  Private (employer)
 */
export const updateJob = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    const job = await Job.findOne({
        _id: req.params.jobId,
        employer: employerProfile._id,
        isDeleted: false,
    });

    if (!job) throw new ApiError(404, "Job not found");

    if (job.status === "closed") {
        throw new ApiError(400, "Cannot update a closed job. Reopen it first.");
    }

    const allowedUpdates = [
        "title", "description", "requirements", "responsibilities",
        "skills", "jobType", "workMode", "location", "salary",
        "experienceLevel", "experienceYears", "openings",
        "applicationDeadline", "visibility", "allowedRecruiters",
    ];

    allowedUpdates.forEach((field) => {
        if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    if (
        job.applicationDeadline &&
        new Date(job.applicationDeadline) <= new Date() &&
        job.status === "active"
    ) {
        job.status = "expired";
    }

    await job.save();

    return res
        .status(200)
        .json(new ApiResponse(200, job, "Job updated successfully"));
});

/**
 * @desc    Change job status (activate / pause / close)
 * @route   PATCH /api/employer/jobs/:jobId/status
 * @access  Private (employer)
 */
export const changeJobStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ["active", "paused", "closed", "draft"];

    if (!status || !validStatuses.includes(status)) {
        throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
    }

    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    const job = await Job.findOneAndUpdate(
        { _id: req.params.jobId, employer: employerProfile._id, isDeleted: false },
        { $set: { status } },
        { new: true }
    );

    if (!job) throw new ApiError(404, "Job not found");

    return res
        .status(200)
        .json(new ApiResponse(200, job, `Job status updated to '${status}'`));
});

/**
 * @desc    Soft delete a job
 * @route   DELETE /api/employer/jobs/:jobId
 * @access  Private (employer)
 */
export const deleteJob = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    const job = await Job.findOneAndUpdate(
        { _id: req.params.jobId, employer: employerProfile._id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date(), status: "closed" } },
        { new: true }
    );

    if (!job) throw new ApiError(404, "Job not found");

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Job deleted successfully"));
});

// ─────────────────────────────────────────────
//  APPLICATIONS OVERVIEW
// ─────────────────────────────────────────────

/**
 * @desc    Get all applications for a specific job
 * @route   GET /api/employer/jobs/:jobId/applications
 * @access  Private (employer)
 */
export const getApplicationsByJob = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    // Confirm job belongs to employer
    const job = await Job.findOne({
        _id: req.params.jobId,
        employer: employerProfile._id,
        isDeleted: false,
    });
    if (!job) throw new ApiError(404, "Job not found");

    const {
        status,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = req.query;

    const filter = { job: req.params.jobId };
    if (status) filter.status = status;

    const { skip, limitNum, pageNum } = buildPagination(page, limit);

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate("candidate", "name email")
            .populate("submittedBy", "name email")
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Application.countDocuments(filter),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            jobTitle: job.title,
            applications,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        }, "Applications fetched successfully")
    );
});

/**
 * @desc    Update application stage (employer review)
 * @route   PATCH /api/employer/applications/:applicationId/stage
 * @access  Private (employer)
 */
export const updateApplicationStage = asyncHandler(async (req, res) => {
    const { stage, remarks } = req.body;

    const validStages = [
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
    ];

    if (!stage || !validStages.includes(stage)) {
        throw new ApiError(400, `Stage must be one of: ${validStages.join(", ")}`);
    }

    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    // Verify application belongs to employer's job
    const application = await Application.findById(req.params.applicationId).populate(
        "job"
    );

    if (!application) throw new ApiError(404, "Application not found");

    if (
        application.job.employer.toString() !== employerProfile._id.toString()
    ) {
        throw new ApiError(403, "Not authorized to update this application");
    }

    application.status = stage;
    application.statusHistory.push({
        stage,
        changedBy: req.user.id,
        changedAt: new Date(),
        remarks: remarks || "",
    });

    await application.save();

    return res
        .status(200)
        .json(new ApiResponse(200, application, "Application stage updated"));
});

/**
 * @desc    Employer dashboard stats
 * @route   GET /api/employer/dashboard
 * @access  Private (employer)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const employerProfile = await EmployerProfile.findOne({ user: req.user.id });
    if (!employerProfile) throw new ApiError(404, "Employer profile not found");

    const employerId = employerProfile._id;

    const [
        totalJobs,
        activeJobs,
        draftJobs,
        closedJobs,
        totalApplications,
        recentJobs,
    ] = await Promise.all([
        Job.countDocuments({ employer: employerId, isDeleted: false }),
        Job.countDocuments({ employer: employerId, status: "active", isDeleted: false }),
        Job.countDocuments({ employer: employerId, status: "draft", isDeleted: false }),
        Job.countDocuments({ employer: employerId, status: "closed", isDeleted: false }),
        Application.countDocuments({
            job: {
                $in: await Job.find({ employer: employerId }).distinct("_id"),
            },
        }),
        Job.find({ employer: employerId, isDeleted: false })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("title status openings totalApplications createdAt")
            .lean(),
    ]);

    return res.status(200).json(
        new ApiResponse(200, {
            stats: {
                totalJobs,
                activeJobs,
                draftJobs,
                closedJobs,
                totalApplications,
            },
            recentJobs,
        }, "Dashboard stats fetched")
    );
});