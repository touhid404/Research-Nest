import express from "express";
import { forgotPassword, googleLogin, login, logout, resetPassword, signUp } from "./auth.controller.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export const authRoutes = router;