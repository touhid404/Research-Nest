import ProposalPost from "../../models/proposalPost.model.js";

export const createProposalPostInDB = async (postData) => {
  const newPost = new ProposalPost({
    userId: postData.userId,
    title: postData.title,
    description: postData.description,
    researchTopic: postData.researchTopic,
    interests: postData.interests || [],
    attachments: postData.attachments || [],
  });

  return await newPost.save();
};


export const getAllProposalPostsInDB = async () => {
  // Fetch all posts and populate user details
  const posts = await ProposalPost.find()
    .populate("userId", "name email profileImage role")
    .sort({ createdAt: -1 }); // newest first

  return posts;
};

