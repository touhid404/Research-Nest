import express from "express";
import {  googleLogin, signUp } from "./auth.controller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/google-login", googleLogin);

export const authRoutes = router;