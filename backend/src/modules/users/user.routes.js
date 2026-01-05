import express from "express";
import { getAllUsers, getUserByUid, updateUser } from "./user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:uid", getUserByUid);
router.put("/:uid", updateUser);

export const userRoutes = router;