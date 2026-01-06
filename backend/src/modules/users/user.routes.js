import express from "express";
import { getAllUsers, getUserByUid, updateUser, checkUsername } from "./user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/check-username/:username", checkUsername);
router.get("/:uid", getUserByUid);
router.put("/:uid", updateUser);

export const userRoutes = router;