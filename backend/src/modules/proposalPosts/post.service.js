import ProposalPost from "../../models/proposalPost.model.js";

export const createProposalPostInDB = async (postData) => {
  const newPost = new ProposalPost({
    user: postData.user,
    title: postData.title,
    description: postData.description,
    researchTopic: postData.researchTopic,
    interests: postData.interests || [],
    attachments: postData.attachments || [],
  });

  return await newPost.save();
};


export const getAllProposalPostsInDB = async () => {
  // Fetch all posts (user details are already embedded)
  const posts = await ProposalPost.find()
    .sort({ createdAt: -1 }); // newest first

  return posts;
};

export const getAllProposalPostsByUserInDB = async (uid) => {
  const posts = await ProposalPost.find({ "user.uid": uid })
    .sort({ createdAt: -1 });
  return posts;
};



