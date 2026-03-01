import Paper from "../../models/paper.model.js";


export const createPaperInDB = async (paperData) => {
    const result = await Paper.create(paperData);
    return result;
};


export const getAllPapersInDB = async (options = {}) => {
    const { 
        excludeUid, 
        page = 1, 
        limit = 10, 
        q, 
        domains, 
        yearFrom, 
        yearTo, 
        hasPdf, 
        hasLink, 
        sort = "newest" 
    } = options;

    let filter = { status: "published" };
    let andFilters = [];

    if (excludeUid) {
        andFilters.push({ "user.uid": { $ne: excludeUid } });
    }

    // Text search
    if (q) {
        const searchRegex = new RegExp(q, "i");
        andFilters.push({
            $or: [
                { title: searchRegex },
                { abstract: searchRegex },
                { "user.name": searchRegex },
                { publicationName: searchRegex },
                { researchDomain: searchRegex },
                { doi: searchRegex },
                { tags: { $in: [searchRegex] } },
                { coAuthors: { $in: [searchRegex] } }
            ]
        });
    }

    // Domain filter
    if (domains && domains.length > 0) {
        andFilters.push({ researchDomain: { $in: domains } });
    }

    // Year range filter
    if (yearFrom || yearTo) {
        const yearFilter = {};
        if (yearFrom) yearFilter.$gte = new Date(yearFrom, 0, 1);
        if (yearTo) yearFilter.$lte = new Date(yearTo, 11, 31);
        
        andFilters.push({
            $or: [
                { publicationDate: yearFilter },
                { $and: [{ publicationDate: { $exists: false } }, { createdAt: yearFilter }] }
            ]
        });
    }

    // Access type filters
    if (hasPdf === "true") {
        andFilters.push({ "paperFile.url": { $exists: true, $ne: null } });
    }
    if (hasLink === "true") {
        andFilters.push({ paperLink: { $exists: true, $ne: "" } });
    }

    if (andFilters.length > 0) {
        filter.$and = andFilters;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const totalCount = await Paper.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Sorting
    let sortOrder = { createdAt: -1 };
    if (sort === "oldest") {
        sortOrder = { publicationDate: 1, createdAt: 1 };
    } else if (sort === "newest") {
        sortOrder = { publicationDate: -1, createdAt: -1 };
    }

    const papers = await Paper.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        .lean();

    return {
        papers,
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
    };
};


export const getAllPapersByUserInDB = async (uid, options = {}) => {
    const { 
        page = 1, 
        limit = 10,
        q,
        domains,
        yearFrom,
        yearTo,
        hasPdf,
        hasLink,
        sort = "newest"
    } = options;
    
    let filter = { "user.uid": uid };
    let andFiltersArr = [];

    if (q) {
        const searchRegex = new RegExp(q, "i");
        andFiltersArr.push({
            $or: [
                { title: searchRegex },
                { abstract: searchRegex },
                { researchDomain: searchRegex },
                { tags: { $in: [searchRegex] } }
            ]
        });
    }

    if (domains && domains.length > 0) {
        andFiltersArr.push({ researchDomain: { $in: domains } });
    }

    if (yearFrom || yearTo) {
        const yearFilter = {};
        if (yearFrom) yearFilter.$gte = new Date(yearFrom, 0, 1);
        if (yearTo) yearFilter.$lte = new Date(yearTo, 11, 31);
        andFiltersArr.push({
            $or: [
                { publicationDate: yearFilter },
                { $and: [{ publicationDate: { $exists: false } }, { createdAt: yearFilter }] }
            ]
        });
    }

    if (hasPdf === "true") andFiltersArr.push({ "paperFile.url": { $exists: true, $ne: null } });
    if (hasLink === "true") andFiltersArr.push({ paperLink: { $exists: true, $ne: "" } });

    if (andFiltersArr.length > 0) {
        filter.$and = andFiltersArr;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const totalCount = await Paper.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / limitNum);

    let sortOrder = { createdAt: -1 };
    if (sort === "oldest") sortOrder = { publicationDate: 1, createdAt: 1 };
    else if (sort === "newest") sortOrder = { publicationDate: -1, createdAt: -1 };

    const papers = await Paper.find(filter)
        .sort(sortOrder)
        .skip(skip)
        .limit(limitNum)
        .lean();

    return {
        papers,
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
    };
};




export const getPaperByIdInDB = async (id) => {
    const result = await Paper.findById(id);
    return result;
};


export const deletePaperInDB = async (id) => {
    const result = await Paper.findByIdAndDelete(id);
    return result;
};


export const updatePaperInDB = async (id, updateData) => {
    const result = await Paper.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return result;
};


export const getUniqueResearchDomainsFromDB = async () => {
    const domains = await Paper.distinct("researchDomain");
    return domains.filter(Boolean).sort();
};

// Paper Request Services
import PaperRequest from "../../models/paperRequest.model.js";

export const checkPaperRequestStatusInDB = async (paperId, requesterUid) => {
    const request = await PaperRequest.findOne({ paperId, requesterUid });
    return !!request;
};

export const recordPaperRequestInDB = async (requestData) => {
    const result = await PaperRequest.create(requestData);
    return result;
};





