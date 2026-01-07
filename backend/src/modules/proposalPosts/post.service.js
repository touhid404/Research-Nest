import ProposalPost from "../../models/proposalPost.model.js";
import User from "../../models/user.model.js";
import ProposalApplication from "../../models/proposalApplication.model.js";
import fs from "fs";
import path from "path";

export const createProposalPostInDB = async (postData) => {
    const newPost = new ProposalPost({
        ownerUid: postData.ownerUid,
        title: postData.title,
        description: postData.description,
        researchTopic: postData.researchTopic,
        interests: postData.interests || [],
        attachments: postData.attachments || [],
    });


    return await newPost.save();
};




export const getAllProposalPostsInDB = async (options = {}) => {
    // only return published posts
    const query = { status: "published" };
    if (options.excludeUid) {
        query["ownerUid"] = { $ne: options.excludeUid };
    }

    const posts = await ProposalPost.find(query)
        .sort({ createdAt: -1 })
        .lean();

    // Get all owner UIDs
    const ownerUids = [...new Set(posts.map(post => post.ownerUid))];

    // Fetch users
    const users = await User.find({ uid: { $in: ownerUids } })
        .select("uid name email photoURL isVerified");

    // Create a map of uid -> user
    const userMap = users.reduce((acc, user) => {
        acc[user.uid] = user;
        return acc;
    }, {});

    // Get application status if viewerUid is provided
    let viewerApplications = new Set();
    if (options.viewerUid) {
        const apps = await ProposalApplication.find({
            senderId: options.viewerUid,
            proposalPostId: { $in: posts.map(p => p._id) }
        }).select("proposalPostId");
        viewerApplications = new Set(apps.map(a => a.proposalPostId.toString()));
    }

    // Attach user and application status to each post
    return posts.map(post => ({
        ...post,
        user: userMap[post.ownerUid] || null,
        hasApplied: viewerApplications.has(post._id.toString())
    }));
};


export const getAllProposalPostsByUserInDB = async (uid, viewerUid = null) => {
    const posts = await ProposalPost.find({ "ownerUid": uid })
        .sort({ createdAt: -1 })
        .lean();

    const user = await User.findOne({ uid }).select("uid name email photoURL isVerified");

    // Get application status if viewerUid is provided
    let viewerApplications = new Set();
    if (viewerUid) {
        const apps = await ProposalApplication.find({
            senderId: viewerUid,
            proposalPostId: { $in: posts.map(p => p._id) }
        }).select("proposalPostId");
        viewerApplications = new Set(apps.map(a => a.proposalPostId.toString()));
    }

    return posts.map(post => ({
        ...post,
        user: user || null,
        hasApplied: viewerApplications.has(post._id.toString())
    }));
};


export const getProposalPostByIdInDB = async (id, viewerUid = null) => {
    const post = await ProposalPost.findById(id).lean();
    if (!post) return null;

    const user = await User.findOne({ uid: post.ownerUid }).select("uid name email photoURL isVerified");

    let hasApplied = false;
    if (viewerUid) {
        const app = await ProposalApplication.findOne({
            senderId: viewerUid,
            proposalPostId: id
        });
        hasApplied = !!app;
    }

    return {
        ...post,
        user: user || null,
        hasApplied
    };
};


export const updateProposalPostInDB = async (id, uid, updateData) => {
    const post = await ProposalPost.findById(id);
    if (!post) return null;

    // Check ownership
    if (post.ownerUid !== uid) {
        throw new Error("You are not authorized to update this post");
    }

    const updatedPost = await ProposalPost.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );
    return updatedPost;
};




// Helper to extract filename
const getFilePathFromUrl = (url) => {
    // URL: http://host/public/proposal-papers/filename.pdf
    // We want: public/proposal-papers/filename.pdf
    const parts = url.split("/public/proposal-papers/");
    if (parts.length > 1) {
        return path.join("public", "proposal-papers", parts[1]);
    }
    return null;
}


export const deleteProposalPostInDB = async (id, uid) => {
    const post = await ProposalPost.findById(id);
    if (!post) return null;
    // Check if the post belongs to the user
    if (post.ownerUid !== uid) {
        return null;
    }


    // Delete attachments
    if (post.attachments && post.attachments.length > 0) {
        post.attachments.forEach(file => {
            if (file.url) {
                const filePath = getFilePathFromUrl(file.url);
                if (filePath && fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (err) {
                        console.error(`Failed to delete file: ${filePath}`, err);
                    }
                }
            }
        });
    }


    const deletedPost = await ProposalPost.findByIdAndDelete(id);
    return deletedPost;
};
