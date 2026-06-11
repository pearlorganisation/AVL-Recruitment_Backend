// ─── queryHelpers.js ──────────────────────────────────────────────────────────
// Reusable pagination & filter builders.

export const buildPagination = (page, limit) => {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    return { skip, limitNum, pageNum };
};

export const buildJobFilter = (query) => {
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.jobType) filter.jobType = query.jobType;
    if (query.workMode) filter.workMode = query.workMode;
    if (query.experienceLevel) filter.experienceLevel = query.experienceLevel;

    if (query.search) {
        filter.$or = [
            { title: { $regex: query.search, $options: "i" } },
            { description: { $regex: query.search, $options: "i" } },
            { skills: { $elemMatch: { $regex: query.search, $options: "i" } } },
        ];
    }

    return filter;
};