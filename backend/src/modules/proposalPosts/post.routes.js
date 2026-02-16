import express from "express";
import { createProposalPost, getAllProposalPosts, getAllProposalPostsByUser, getProposalPostById, updateProposalPost, deleteProposalPost, getTrendingTopics } from "./post.controller.js";
import { upload } from "../../middleware/upload.middleware.js";
import authCheck from "../../middleware/authCheck.js";


const router = express.Router();



router.post("/", authCheck(), upload.array("attachments"), createProposalPost);
router.get("/", authCheck(), getAllProposalPosts);
router.get("/trending-topics", authCheck(), getTrendingTopics);
router.get("/user/:uid", authCheck(), getAllProposalPostsByUser);
router.get("/:id", authCheck(), getProposalPostById);
router.put("/:id", authCheck(), upload.array("attachments"), updateProposalPost);
router.delete("/:id", authCheck(), deleteProposalPost);


export const proposalPostRoutes = router;