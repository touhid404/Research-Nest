import express from "express";
import { createProposalPost, getAllProposalPosts, getAllProposalPostsByUser } from "./post.controller.js";

const router = express.Router();


router.post("/", createProposalPost);
router.get("/", getAllProposalPosts);
router.get("/:uid", getAllProposalPostsByUser);


export const proposalPostRoutes = router;