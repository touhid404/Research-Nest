import express from "express";
import { createProposalPost, getAllProposalPosts } from "./post.controller.js";

const router = express.Router();


router.post("/", createProposalPost);
router.get("/", getAllProposalPosts);


export const proposalPostRoutes = router;