import { createPaperInDB, getAllPapersByUserInDB, getAllPapersInDB, getPaperByIdInDB, deletePaperInDB, updatePaperInDB, getUniqueResearchDomainsFromDB, checkPaperRequestStatusInDB, recordPaperRequestInDB } from "./paper.service.js";
import User from "../../models/user.model.js";


export const getResearchDomains = async (req, res) => {
    try {
        const domains = await getUniqueResearchDomainsFromDB();
        return res.status(200).json({
            success: true,
            data: domains,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};




export const createPaper = async (req, res) => {
    try {

        const { uid, title, abstract, researchDomain, tags, paperLink, coAuthors, publicationDate, publicationName, doi, workspaceFile } = req.body;
        // Handle file upload (paperFile)
        let paperFile = null;
        if (req.file) {
            paperFile = {
                name: req.file.originalname,
                url: `${req.protocol}://${req.get("host")}/public/papers-hub/${req.file.filename}`
            };
        } else if (workspaceFile) {
            // Handle workspace file
            if (typeof workspaceFile === 'string') {
                try {
                    paperFile = JSON.parse(workspaceFile);
                } catch (e) {
                    paperFile = null;
                }
            } else {
                paperFile = workspaceFile;
            }
        }
        // Validate required fields
        if (!uid || !title || !abstract || !researchDomain) {
            return res.status(400).json({
                success: false,
                message: "uid, title, abstract, and researchDomain are required",
            });
        }
        // Fetch user details
        const findUser = await User.findOne({ uid });
        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "Provided uid does not exist",
            });
        }
        // Parse tags if sent as string
        let parsedTags = [];
        if (tags) {
            if (Array.isArray(tags)) parsedTags = tags;
            else if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
            }
        }

        // Parse coAuthors if sent as string (comma separated) or array
        let parsedCoAuthors = [];
        if (coAuthors) {
            if (Array.isArray(coAuthors)) parsedCoAuthors = coAuthors;
            else if (typeof coAuthors === 'string') {
                parsedCoAuthors = coAuthors.split(',').map(name => name.trim()).filter(Boolean);
            }
        }

        const paper = await createPaperInDB({
            user: {
                uid: findUser.uid,
                name: findUser.name,
                email: findUser.email,
                photoURL: findUser.photoURL,
            },
            title,
            abstract,
            researchDomain,
            tags: parsedTags,
            paperLink,
            paperFile,
            // New fields
            coAuthors: parsedCoAuthors,
            publicationDate: publicationDate || new Date(), // Default to now if not provided
            publicationName,
            doi,
        });

        return res.status(201).json({
            success: true,
            message: "Paper published successfully",
            data: paper,
        });
    } catch (error) {
        console.error("Error inside createPaper controller:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllPapers = async (req, res) => {
    try {
        const { excludeUid, page, limit, q, domains, yearFrom, yearTo, hasPdf, hasLink, sort } = req.query;
        
        let domainsArray = [];
        if (domains) {
            domainsArray = domains.split(",").filter(Boolean);
        }

        const result = await getAllPapersInDB({ 
            excludeUid, 
            page, 
            limit, 
            q, 
            domains: domainsArray, 
            yearFrom, 
            yearTo, 
            hasPdf, 
            hasLink, 
            sort 
        });

        return res.status(200).json({
            success: true,
            data: result.papers,
            meta: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                perPage: parseInt(limit) || 10,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllPapersByUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const { page, limit } = req.query;
        
        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "uid is required",
            });
        }
        
        const result = await getAllPapersByUserInDB(uid, { page, limit });
        
        return res.status(200).json({
            success: true,
            data: result.papers,
            meta: {
                currentPage: result.currentPage,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
                perPage: parseInt(limit) || 10,
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getPaperById = async (req, res) => {
    try {
        const { id } = req.params;
        const paper = await getPaperByIdInDB(id);
        if (!paper) {
            return res.status(404).json({
                success: false,
                message: "Paper not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: paper,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deletePaper = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPaper = await deletePaperInDB(id);

        if (!deletedPaper) {
            return res.status(404).json({
                success: false,
                message: "Paper not found or could not be deleted",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Paper deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updatePaper = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If there's a file, update paperFile
        if (req.file) {
            updateData.paperFile = {
                name: req.file.originalname,
                url: `${req.protocol}://${req.get("host")}/public/papers-hub/${req.file.filename}`
            };
        }

        // Parse tags if sent as string
        if (updateData.tags && typeof updateData.tags === 'string') {
            updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean);
        }

        // Parse coAuthors if sent as string
        if (updateData.coAuthors && typeof updateData.coAuthors === 'string') {
            updateData.coAuthors = updateData.coAuthors.split(',').map(name => name.trim()).filter(Boolean);
        }

        const updatedPaper = await updatePaperInDB(id, updateData);

        if (!updatedPaper) {
            return res.status(404).json({
                success: false,
                message: "Paper not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Paper updated successfully",
            data: updatedPaper,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const checkPaperRequestStatus = async (req, res) => {
    try {
        const { paperId, requesterUid } = req.query;
        if (!paperId || !requesterUid) {
            return res.status(400).json({
                success: false,
                message: "paperId and requesterUid are required",
            });
        }
        const isRequested = await checkPaperRequestStatusInDB(paperId, requesterUid);
        return res.status(200).json({
            success: true,
            data: { isRequested },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const recordPaperRequest = async (req, res) => {
    try {
        const { paperId, requesterUid, authorUid } = req.body;
        if (!paperId || !requesterUid || !authorUid) {
            return res.status(400).json({
                success: false,
                message: "paperId, requesterUid, and authorUid are required",
            });
        }
        const result = await recordPaperRequestInDB({ paperId, requesterUid, authorUid });
        return res.status(201).json({
            success: true,
            message: "Paper request recorded successfully",
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


