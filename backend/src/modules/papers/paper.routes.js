import express from "express";
import { createPaper, getAllPapers, getAllPapersByUser, getPaperById, deletePaper } from "./paper.controller.js";
import { paperUpload } from "../../middleware/paperUpload.middleware.js";
import authCheck from "../../middleware/authCheck.js";


const router = express.Router();


// Route: /api/papers


router.post("/", authCheck(), paperUpload.single("paperFile"), createPaper);
router.get("/", authCheck(), getAllPapers);
router.get("/user/:uid", authCheck(), getAllPapersByUser);
router.get("/:id", authCheck(), getPaperById);
router.delete("/:id", authCheck(), deletePaper);


export const paperRoutes = router;



