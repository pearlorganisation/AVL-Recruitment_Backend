import { ApiError } from "../../utils/ApiError.js";

const JOB_TYPES = ["full-time", "part-time", "contract", "internship", "freelance"];
const WORK_MODES = ["onsite", "remote", "hybrid"];
const EXPERIENCE_LEVELS = ["fresher", "junior", "mid", "senior", "lead", "manager"];
const STATUSES = ["draft", "active"];

export const validateCreateJob = (req, res, next) => {
    try {
        const {
            title,
            description,
            jobType,
            workMode,
            experienceLevel,
            openings,
            applicationDeadline,
            status,
            salary,
        } = req.body;

        const errors = [];

        if (!title || title.trim().length < 3) {
            errors.push("Job title must be at least 3 characters");
        }

        if (!description || description.trim().length < 20) {
            errors.push("Job description must be at least 20 characters");
        }

        if (!jobType || !JOB_TYPES.includes(jobType)) {
            errors.push(`jobType must be one of: ${JOB_TYPES.join(", ")}`);
        }

        if (workMode && !WORK_MODES.includes(workMode)) {
            errors.push(`workMode must be one of: ${WORK_MODES.join(", ")}`);
        }

        if (!experienceLevel || !EXPERIENCE_LEVELS.includes(experienceLevel)) {
            errors.push(`experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(", ")}`);
        }

        if (!openings || isNaN(openings) || Number(openings) < 1) {
            errors.push("openings must be a positive integer");
        }

        if (status && !STATUSES.includes(status)) {
            errors.push(`status on creation must be 'draft' or 'active'`);
        }

        if (applicationDeadline) {
            const deadline = new Date(applicationDeadline);
            if (isNaN(deadline.getTime())) {
                errors.push("applicationDeadline must be a valid date");
            } else if (deadline <= new Date()) {
                errors.push("applicationDeadline must be a future date");
            }
        }

        if (salary) {
            if (salary.min !== undefined && salary.max !== undefined) {
                if (Number(salary.min) > Number(salary.max)) {
                    errors.push("salary.min cannot be greater than salary.max");
                }
            }
        }

        if (errors.length > 0) {
            throw new ApiError(400, errors.join(". "));
        }

        next();
    } catch (error) {
        next(error);
    }
};

export const validateUpdateJob = (req, res, next) => {
    try {
        const { jobType, workMode, experienceLevel, openings, applicationDeadline, salary } =
            req.body;

        const errors = [];

        if (jobType && !JOB_TYPES.includes(jobType)) {
            errors.push(`jobType must be one of: ${JOB_TYPES.join(", ")}`);
        }

        if (workMode && !WORK_MODES.includes(workMode)) {
            errors.push(`workMode must be one of: ${WORK_MODES.join(", ")}`);
        }

        if (experienceLevel && !EXPERIENCE_LEVELS.includes(experienceLevel)) {
            errors.push(`experienceLevel must be one of: ${EXPERIENCE_LEVELS.join(", ")}`);
        }

        if (openings !== undefined && (isNaN(openings) || Number(openings) < 1)) {
            errors.push("openings must be a positive integer");
        }

        if (applicationDeadline) {
            const deadline = new Date(applicationDeadline);
            if (isNaN(deadline.getTime())) {
                errors.push("applicationDeadline must be a valid date");
            } else if (deadline <= new Date()) {
                errors.push("applicationDeadline must be a future date");
            }
        }

        if (salary) {
            if (salary.min !== undefined && salary.max !== undefined) {
                if (Number(salary.min) > Number(salary.max)) {
                    errors.push("salary.min cannot be greater than salary.max");
                }
            }
        }

        if (errors.length > 0) {
            throw new ApiError(400, errors.join(". "));
        }

        next();
    } catch (error) {
        next(error);
    }
};