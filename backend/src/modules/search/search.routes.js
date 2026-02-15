import express from "express";
import { globalSearch } from "./search.controller.js";
import authCheck from "../../middleware/authCheck.js";

const searchRoutes = express.Router();

searchRoutes.get("/", authCheck(), globalSearch);

export default searchRoutes;
