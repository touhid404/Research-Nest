import { createProposalPostInDB, getAllProposalPostsByUserInDB, getAllProposalPostsInDB, getProposalPostByIdInDB, updateProposalPostInDB, deleteProposalPostInDB, getTrendingTopicsInDB } from "./post.service.js";
import User from "../../models/user.model.js";
import fs from "fs";
import path from "path";
import ProposalPost from "../../models/proposalPost.model.js";

// Helper to extract relative file path from URL
const getFilePathFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split("/public/proposal-papers/");
    if (parts.length > 1) {
        return path.join("public", "proposal-papers", parts[1]);
    }
    return null;
};

// Helper to delete physical file
const deleteFileByUrl = (url) => {
    try {
        const filePath = getFilePathFromUrl(url);
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Failed to delete file: ${url}`, error);
    }
};

export const createProposalPost = async (req, res) => {
    try {
        const { uid, title, description, researchTopic, interests } = req.body;

        // Handle files
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                name: file.originalname,
                url: `${req.protocol}://${req.get("host")}/public/proposal-papers/${file.filename}`
            }));
        } else if (req.body.attachments) {
            try {
                const parsed = JSON.parse(req.body.attachments);
                if (Array.isArray(parsed)) attachments = parsed;
            } catch (e) {
                // ignore
            }
        }

        // Validate required fields
        if (!uid || !title || !description || !researchTopic) {
            return res.status(400).json({
                success: false,
                message: "uid, title, description, and researchTopic are required",
            });
        }

        // Fetch user details to embed in the post
        const findUser = await User.findOne({ uid });
        if (!findUser) {
            return res.status(404).json({
                success: false,
                message: "Provided uid does not exist",
            });
        }

        const post = await createProposalPostInDB({
            ownerUid: findUser.uid,
            title,
            description,
            researchTopic,
            interests,
            attachments,
        });

        return res.status(201).json({
            success: true,
            message: "Proposal post created successfully",
            data: post,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllProposalPosts = async (req, res) => {
    try {
        const { excludeUid, page, limit, topic } = req.query;
        const viewerUid = req.user.uid;
        const result = await getAllProposalPostsInDB({ excludeUid, viewerUid, page, limit, topic });

        return res.status(200).json({
            success: true,
            data: result.posts,
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

export const getTrendingTopics = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const topics = await getTrendingTopicsInDB(limit);

        return res.status(200).json({
            success: true,
            data: topics,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getAllProposalPostsByUser = async (req, res) => {
    try {
        const { uid } = req.params;
        const viewerUid = req.user.uid;
        if (!uid) {
            return res.status(400).json({
                success: false,
                message: "uid is required",
            });
        }
        const posts = await getAllProposalPostsByUserInDB(uid, viewerUid);

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProposalPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const viewerUid = req.user.uid;
        const post = await getProposalPostByIdInDB(id, viewerUid);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Proposal post not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: post,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProposalPost = async (req, res) => {
    try {
        const uid = req.user.uid;
        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID is required in headers" });
        }
        const { id } = req.params;

        // Get current post to check ownership
        const post = await ProposalPost.findById(id);
        if (!post) {
            return res.status(404).json({ success: false, message: "Proposal post not found" });
        }

        if (post.ownerUid !== uid) {
            return res.status(403).json({ success: false, message: "Unauthorized to update this post" });
        }

        // Explicitly pick allowed fields to avoid issues with extra Data in req.body
        const updateData = {};
        const allowedFields = ["title", "description", "researchTopic", "interests", "status"];

        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        // Handle interests JSON parsing if needed
        if (updateData.interests && typeof updateData.interests === "string") {
            try {
                const parsed = JSON.parse(updateData.interests);
                if (Array.isArray(parsed)) updateData.interests = parsed;
            } catch (e) {
                // Fallback to comma separation if not valid JSON
                updateData.interests = updateData.interests.split(",").map(i => i.trim()).filter(Boolean);
            }
        }

        // Handle attachments merging and physical deletion
        if (req.body.existingAttachments !== undefined || (req.files && req.files.length > 0)) {
            let existingAttachments = [];

            // Parse existing attachments that should be kept
            if (req.body.existingAttachments) {
                try {
                    const parsed = JSON.parse(req.body.existingAttachments);
                    if (Array.isArray(parsed)) existingAttachments = parsed;
                } catch (e) {
                    // ignore
                }
            }

            // Identify files to physically delete (those in DB but NOT in the keep list)
            const currentUrls = (post.attachments || []).map(a => a.url).filter(Boolean);
            const keepUrls = existingAttachments.map(a => a.url).filter(Boolean);
            const toDelete = currentUrls.filter(url => !keepUrls.includes(url));

            toDelete.forEach(url => deleteFileByUrl(url));

            // Add newly uploaded files
            let newAttachmentsList = [];
            if (req.files && req.files.length > 0) {
                newAttachmentsList = req.files.map(file => ({
                    name: file.originalname,
                    url: `${req.protocol}://${req.get("host")}/public/proposal-papers/${file.filename}`
                }));
            }

            updateData.attachments = [...existingAttachments, ...newAttachmentsList];
        }

        const updatedPost = await updateProposalPostInDB(id, uid, updateData);

        return res.status(200).json({
            success: true,
            message: "Proposal post updated successfully",
            data: updatedPost,
        });
    } catch (error) {
        console.error("Update error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteProposalPost = async (req, res) => {
    try {
        const uid = req.user.uid;
        if (!uid) {
            return res.status(400).json({ success: false, message: "User ID is required in headers" });
        }
        const { id } = req.params;

        // Service function already handles file deletion and ownership check
        const deletedPost = await deleteProposalPostInDB(id, uid);

        if (!deletedPost) {
            return res.status(404).json({
                success: false,
                message: "Proposal post not found or unauthorized",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Proposal post deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
