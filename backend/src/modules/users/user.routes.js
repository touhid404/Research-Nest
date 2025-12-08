import express from "express";
import { getAllUsers, updateUser } from "./user.controller.js";

const router = express.Router();


router.get("/", getAllUsers);
router.put("/:uid", updateUser);

export const userRoutes = router;