import { createProposalPostInDB, getAllProposalPostsByUserInDB, getAllProposalPostsInDB, getProposalPostByIdInDB, updateProposalPostInDB, deleteProposalPostInDB } from "./post.service.js";
import User from "../../models/user.model.js";
// OK Checked
export const createProposalPost = async (req, res) => {
  try {
    const { uid, title, description, researchTopic, interests } = req.body;

    // Handle files
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        name: file.originalname,
        url: `${req.protocol}://${req.get("host")}/public/uploads/${file.filename}`
      }));
    } else if (req.body.attachments) {
      // If attachments is sent as JSON string (fallback or if no files)
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
      user: {
        uid: findUser.uid,
        name: findUser.name,
        email: findUser.email,
        photoURL: findUser.photoURL,
      },
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
    const { excludeUid } = req.query;
    const posts = await getAllProposalPostsInDB({ excludeUid });

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
export const getAllProposalPostsByUser = async (req, res) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: "uid is required",
      });
    }
    const posts = await getAllProposalPostsByUserInDB(uid);

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
    const post = await getProposalPostByIdInDB(id);

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
    const { id } = req.params;
    const updateData = req.body;

    const updatedPost = await updateProposalPostInDB(id, updateData);

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Proposal post not found or could not be updated",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Proposal post updated successfully",
      data: updatedPost,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteProposalPost = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPost = await deleteProposalPostInDB(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Proposal post not found or could not be deleted",
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

