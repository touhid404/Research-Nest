import express from "express";
import { createProposalPost, getAllProposalPosts, getAllProposalPostsByUser } from "./post.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

// router.use(authMiddleware);


router.post("/", createProposalPost);
router.get("/", getAllProposalPosts);
router.get("/:uid", getAllProposalPostsByUser);


export const proposalPostRoutes = router;