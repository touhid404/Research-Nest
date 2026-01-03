import express from "express";
import {
    sendRequest,
    getMyReceivedRequests,
    getMySentRequests,
    updateRequestStatus,
    formGroup,
    cancelRequest
} from "./proposalApplication.controller.js";


const router = express.Router();

router.post("/", sendRequest);
router.get("/received", getMyReceivedRequests);
router.get("/sent", getMySentRequests);
router.patch("/:id/status", updateRequestStatus);
router.post("/form-group", formGroup);
router.delete("/:id", cancelRequest);


export default router;



