import express from "express";
import { createProposalPost, getAllProposalPosts, getAllProposalPostsByUser, getProposalPostById, updateProposalPost, deleteProposalPost } from "./post.controller.js";
import { upload } from "../../middleware/upload.middleware.js";


const router = express.Router();



router.post("/", upload.array("attachments"), createProposalPost);
router.get("/", getAllProposalPosts);
router.get("/user/:uid", getAllProposalPostsByUser);
router.get("/:id", getProposalPostById);
router.put("/:id", upload.array("attachments"), updateProposalPost);
router.delete("/:id", deleteProposalPost);


export const proposalPostRoutes = router;