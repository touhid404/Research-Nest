import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "public/workspace-documents";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

import Document from "../models/document.model.js";
import { getFolderPath } from "../modules/workspace/services/documents.service.js";

// Storage configuration
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        let dest = uploadDir;
        if (req.body.parentId) {
            try {
                // Get nested path based on parent structure
                const relativePath = await getFolderPath(req.body.parentId);
                const fullPath = path.join(uploadDir, relativePath);

                if (!fs.existsSync(fullPath)) {
                    fs.mkdirSync(fullPath, { recursive: true });
                }
                dest = fullPath;
            } catch (err) {
                console.error("Error resolving folder path:", err);
            }
        }
        cb(null, dest);
    },
    filename: function (req, file, cb) {
        // Keep original extension, add timestamp for uniqueness
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter - Allow all types for now as per "drag and file" flexibility
const fileFilter = (req, file, cb) => {
    cb(null, true);
};

export const documentUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
