import { createProposalPostInDB, getAllProposalPostsByUserInDB, getAllProposalPostsInDB } from "./post.service.js";
import User from "../../models/user.model.js";
// OK Checked
export const createProposalPost = async (req, res) => {
  try {
    const { uid, title, description, researchTopic, interests, attachments } = req.body;

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
    const posts = await getAllProposalPostsInDB();

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

