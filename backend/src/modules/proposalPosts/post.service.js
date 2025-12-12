import ProposalPost from "../../models/proposalPost.model.js";
import fs from "fs";
import path from "path";


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


export const getAllProposalPostsInDB = async (options = {}) => {
  const query = {};
  if (options.excludeUid) {
    query["user.uid"] = { $ne: options.excludeUid };
  }
  const posts = await ProposalPost.find(query)
    .sort({ createdAt: -1 });
  return posts;
};

export const getAllProposalPostsByUserInDB = async (uid) => {
  const posts = await ProposalPost.find({ "user.uid": uid })
    .sort({ createdAt: -1 });
  return posts;
};

export const getProposalPostByIdInDB = async (id) => {
  const post = await ProposalPost.findById(id);
  return post;
};

export const updateProposalPostInDB = async (id, updateData) => {
  const updatedPost = await ProposalPost.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );
  return updatedPost;
};


// Helper to extract filename
const getFilePathFromUrl = (url) => {
  // URL: http://host/public/uploads/filename.pdf
  // We want: public/uploads/filename.pdf
  const parts = url.split("/public/uploads/");
  if (parts.length > 1) {
    return path.join("public", "uploads", parts[1]);
  }
  return null;
}

export const deleteProposalPostInDB = async (id) => {
  const post = await ProposalPost.findById(id);
  if (!post) return null;

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



