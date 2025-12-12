import express from "express";
import { getAllUsers, updateUser } from "./user.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();
// router.use(authMiddleware);

router.get("/", getAllUsers);
router.put("/:uid", updateUser);

export const userRoutes = router;