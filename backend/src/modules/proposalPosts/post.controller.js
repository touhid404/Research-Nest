import { createProposalPostInDB, getAllProposalPostsInDB } from "./post.service.js";

export const createProposalPost = async (req, res) => {
  try {
    const { userId, title, description, researchTopic, interests, attachments } = req.body;

    // Validate required fields
    if (!userId || !title || !description || !researchTopic) {
      return res.status(400).json({
        success: false,
        message: "userId, title, description, and researchTopic are required",
      });
    }

    const post = await createProposalPostInDB({
      userId,
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

