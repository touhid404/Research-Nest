import express from "express";
import { createPaper, getAllPapers, getAllPapersByUser, getPaperById, deletePaper, updatePaper, getResearchDomains } from "./paper.controller.js";
import { paperUpload } from "../../middleware/paperUpload.middleware.js";
import authCheck from "../../middleware/authCheck.js";


const router = express.Router();

router.post("/", authCheck(), paperUpload.single("paperFile"), createPaper);
router.get("/", authCheck(), getAllPapers);
router.get("/user/:uid", authCheck(), getAllPapersByUser);
router.get("/domains", authCheck(), getResearchDomains);
router.get("/:id", authCheck(), getPaperById);
router.patch("/:id", authCheck(), paperUpload.single("paperFile"), updatePaper);
router.delete("/:id", authCheck(), deletePaper);

// Paper Request Routes
import { checkPaperRequestStatus, recordPaperRequest } from "./paper.controller.js";
router.get("/request/status", authCheck(), checkPaperRequestStatus);
router.post("/request/record", authCheck(), recordPaperRequest);


export const paperRoutes = router;



