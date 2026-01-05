import ProposalPost from "../../models/proposalPost.model.js";
import User from "../../models/user.model.js";
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
  const query = { status: { $ne: "group_formed" } };
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
    .select("uid name email photoURL");

  // Create a map of uid -> user
  const userMap = users.reduce((acc, user) => {
    acc[user.uid] = user;
    return acc;
  }, {});

  // Attach user to each post
  return posts.map(post => ({
    ...post,
    user: userMap[post.ownerUid] || null
  }));
};


export const getAllProposalPostsByUserInDB = async (uid) => {
  const posts = await ProposalPost.find({ "ownerUid": uid })
    .sort({ createdAt: -1 })
    .lean();

  const user = await User.findOne({ uid }).select("uid name email photoURL");

  return posts.map(post => ({
    ...post,
    user: user || null
  }));
};


export const getProposalPostByIdInDB = async (id) => {
  const post = await ProposalPost.findById(id).lean();
  if (!post) return null;

  const user = await User.findOne({ uid: post.ownerUid }).select("uid name email photoURL");

  return {
    ...post,
    user: user || null
  };
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
