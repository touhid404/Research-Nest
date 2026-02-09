import express from "express";
import { globalSearch } from "./search.controller.js";

const searchRoutes = express.Router();

searchRoutes.get("/", globalSearch);

export default searchRoutes;
