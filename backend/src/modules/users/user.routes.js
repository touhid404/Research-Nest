import express from "express";
import { getAllUsers, getUserByUid, updateUser, checkUsername } from "./user.controller.js";
import authCheck from "../../middleware/authCheck.js";

const router = express.Router();

router.get("/", authCheck(), getAllUsers);
router.get("/check-username/:username", authCheck(), checkUsername);
router.get("/:uid", authCheck(), getUserByUid);
router.put("/:uid", authCheck(), updateUser);

export const userRoutes = router;