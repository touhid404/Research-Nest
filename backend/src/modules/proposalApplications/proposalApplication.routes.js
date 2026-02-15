import express from "express";
import {
    sendRequest,
    getMyReceivedRequests,
    getMySentRequests,
    updateRequestStatus,
    formGroup,
    cancelRequest
} from "./proposalApplication.controller.js";
import authCheck from "../../middleware/authCheck.js";


const router = express.Router();

router.post("/", authCheck(), sendRequest);
router.get("/received", authCheck(), getMyReceivedRequests);
router.get("/sent", authCheck(), getMySentRequests);
router.patch("/:id/status", authCheck(), updateRequestStatus);
router.post("/form-group", authCheck(), formGroup);
router.delete("/:id", authCheck(), cancelRequest);


export default router;



