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

  // Filter by topic/interest if provided
  if (options.topic) {
    query["interests"] = { $regex: new RegExp(options.topic, "i") };
  }

  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const totalCount = await ProposalPost.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  // Determine sort order based on sortBy option
  let sortOrder = { createdAt: -1 }; // Default: latest first
  if (options.sortBy === 'oldest') {
    sortOrder = { createdAt: 1 };
  } else if (options.sortBy === 'popular') {
    sortOrder = { applicationCount: -1, createdAt: -1 };
  }

  const posts = await ProposalPost.find(query)
    .sort(sortOrder)
    .skip(skip)
    .limit(limit)
    .lean();

  // Get all owner UIDs
  const ownerUids = [...new Set(posts.map((post) => post.ownerUid))];

  // Fetch users
  const users = await User.find({ uid: { $in: ownerUids } }).select(
    "uid name email photoURL isVerified username occupation researchInterests bio",
  );

  // Create a map of uid -> user
  const userMap = users.reduce((acc, user) => {
    acc[user.uid] = user;
    return acc;
  }, {});

  let viewerApplications = new Set();
  if (options.viewerUid) {
    const apps = await ProposalApplication.find({
      senderId: options.viewerUid,
      proposalPostId: { $in: posts.map((p) => p._id) },
    }).select("proposalPostId");
    viewerApplications = new Set(apps.map((a) => a.proposalPostId.toString()));
  }

  const postsWithUser = posts.map((post) => ({
    ...post,
    user: userMap[post.ownerUid] || null,
    hasApplied: viewerApplications.has(post._id.toString()),
  }));

  return {
    posts: postsWithUser,
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

// Get trending topics from all posts
export const getTrendingTopicsInDB = async (limit = 5) => {
  const result = await ProposalPost.aggregate([
    { $match: { status: "published" } },
    { $unwind: "$interests" },
    {
      $group: {
        _id: { $toLower: { $trim: { input: "$interests" } } },
        count: { $sum: 1 },
      },
    },
    { $match: { _id: { $ne: "" } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, name: "$_id", count: 1 } },
  ]);

  return result;
};

// Get matching/relevant posts for a user based on their profile
export const getMatchingPostsInDB = async (options = {}) => {
  const { userUid, page = 1, limit = 10 } = options;

  // Get user profile
  const user = await User.findOne({ uid: userUid }).lean();
  if (!user) {
    throw new Error("User not found");
  }

  const hasInterests =
    user.researchInterests && user.researchInterests.length > 0;
  const hasEducation = user.education && user.education.length > 0;
  const hasOccupation = user.occupation && user.occupation !== "Other";

  if (!hasInterests && !hasEducation) {
    return {
      posts: [],
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
      profileIncomplete: true,
      missingFields: {
        interests: !hasInterests,
        education: !hasEducation,
      },
    };
  }

  // Build match conditions
  const orConditions = [];

  if (hasInterests) {
    const interestConditions = user.researchInterests.map((interest) => ({
      interests: { $regex: interest.trim(), $options: "i" },
    }));
    orConditions.push(...interestConditions);
  }

  if (hasEducation) {
    const schools = user.education.map((e) => e.school).filter(Boolean);
    if (schools.length > 0) {
      const commonWords = [
        "university",
        "college",
        "institute",
        "of",
        "the",
        "and",
        "school",
        "academy",
        "center",
        "centre",
      ];

      const schoolKeywords = [];
      schools.forEach((school) => {
        // Get all words from school name
        const words = school
          .toLowerCase()
          .split(/[\s,.-]+/)
          .filter((w) => w.length > 2);

        words.forEach((word) => {
          if (!commonWords.includes(word) && word.length > 2) {
            schoolKeywords.push(word);
          }
        });

        schoolKeywords.push(school.trim());
      });

      // Remove duplicates
      const uniqueKeywords = [...new Set(schoolKeywords)];

      const schoolOrConditions = uniqueKeywords.map((keyword) => ({
        "education.school": { $regex: keyword, $options: "i" },
      }));

      const sameSchoolUsers = await User.find({
        uid: { $ne: userUid },
        $or: schoolOrConditions,
      }).select("uid");

      const sameSchoolUids = sameSchoolUsers.map((u) => u.uid);

      if (sameSchoolUids.length > 0) {
        orConditions.push({ ownerUid: { $in: sameSchoolUids } });
      }
    }
  }

  // If no matching conditions, return empty
  if (orConditions.length === 0) {
    return {
      posts: [],
      currentPage: 1,
      totalPages: 0,
      totalCount: 0,
      hasNextPage: false,
      hasPrevPage: false,
      profileIncomplete: false,
    };
  }

  const query = {
    status: "published",
    ownerUid: { $ne: userUid }, // Exclude own posts
    $or: orConditions,
  };

  const skip = (page - 1) * limit;
  const totalCount = await ProposalPost.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const posts = await ProposalPost.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Get all owner UIDs
  const ownerUids = [...new Set(posts.map((post) => post.ownerUid))];

  // Fetch users
  const users = await User.find({ uid: { $in: ownerUids } }).select(
    "uid name email photoURL isVerified username occupation researchInterests bio education",
  );

  const userMap = users.reduce((acc, u) => {
    acc[u.uid] = u;
    return acc;
  }, {});

  // Get application status
  const apps = await ProposalApplication.find({
    senderId: userUid,
    proposalPostId: { $in: posts.map((p) => p._id) },
  }).select("proposalPostId");
  const appliedSet = new Set(apps.map((a) => a.proposalPostId.toString()));

  // Calculate match reasons for each post
  const postsWithUser = posts.map((post) => {
    const matchReasons = [];
    const postUser = userMap[post.ownerUid];

    // Check interest match
    if (hasInterests && post.interests) {
      const matchedInterests = post.interests.filter((pi) =>
        user.researchInterests.some(
          (ui) =>
            ui.toLowerCase().includes(pi.toLowerCase()) ||
            pi.toLowerCase().includes(ui.toLowerCase()),
        ),
      );
      if (matchedInterests.length > 0) {
        matchReasons.push({ type: "interests", values: matchedInterests });
      }
    }

    // Check same institution
    if (hasEducation && postUser?.education) {
      const userSchools = user.education
        .map((e) => e.school?.toLowerCase())
        .filter(Boolean);
      const postUserSchools =
        postUser.education
          ?.map((e) => e.school?.toLowerCase())
          .filter(Boolean) || [];
      const commonSchools = userSchools.filter((s) =>
        postUserSchools.includes(s),
      );
      if (commonSchools.length > 0) {
        matchReasons.push({ type: "institution", values: commonSchools });
      }
    }

    return {
      ...post,
      user: postUser || null,
      hasApplied: appliedSet.has(post._id.toString()),
      matchReasons,
    };
  });

  return {
    posts: postsWithUser,
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    profileIncomplete: false,
  };
};

export const getAllProposalPostsByUserInDB = async (uid, viewerUid = null, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { ownerUid: uid };
  const totalCount = await ProposalPost.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const posts = await ProposalPost.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const user = await User.findOne({ uid }).select(
    "uid name email photoURL isVerified username occupation researchInterests bio",
  );

  // Get application status if viewerUid is provided
  let viewerApplications = new Set();
  if (viewerUid) {
    const apps = await ProposalApplication.find({
      senderId: viewerUid,
      proposalPostId: { $in: posts.map((p) => p._id) },
    }).select("proposalPostId");
    viewerApplications = new Set(apps.map((a) => a.proposalPostId.toString()));
  }

  const postsWithUser = posts.map((post) => ({
    ...post,
    user: user || null,
    hasApplied: viewerApplications.has(post._id.toString()),
  }));

  return {
    posts: postsWithUser,
    currentPage: page,
    totalPages,
    totalCount,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

export const getProposalPostByIdInDB = async (id, viewerUid = null) => {
  const post = await ProposalPost.findById(id).lean();
  if (!post) return null;

  const user = await User.findOne({ uid: post.ownerUid }).select(
    "uid name email photoURL isVerified username occupation researchInterests bio",
  );

  let hasApplied = false;
  if (viewerUid) {
    const app = await ProposalApplication.findOne({
      senderId: viewerUid,
      proposalPostId: id,
    });
    hasApplied = !!app;
  }

  return {
    ...post,
    user: user || null,
    hasApplied,
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
    { new: true, runValidators: true },
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
};

export const deleteProposalPostInDB = async (id, uid) => {
  const post = await ProposalPost.findById(id);
  if (!post) return null;
  // Check if the post belongs to the user
  if (post.ownerUid !== uid) {
    return null;
  }

  // Delete attachments
  if (post.attachments && post.attachments.length > 0) {
    post.attachments.forEach((file) => {
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
