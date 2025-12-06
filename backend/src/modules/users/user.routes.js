import express from "express";
import { getAllUsers, updateUser } from "./user.controller.js";

const router = express.Router();


router.get("/", getAllUsers);
router.put("/:userId", updateUser);

export const userRoutes = router;