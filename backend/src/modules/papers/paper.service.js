import express from "express";
import { createPaper, getAllPapers, getAllPapersByUser, getPaperById, deletePaper } from "./paper.controller.js";
import { paperUpload } from "../../middleware/paperUpload.middleware.js";


const router = express.Router();


// Route: /api/papers


router.post("/", paperUpload.single("paperFile"), createPaper);
router.get("/", getAllPapers);
router.get("/user/:uid", getAllPapersByUser);
router.get("/:id", getPaperById);
router.delete("/:id", deletePaper);


export const paperRoutes = router;



