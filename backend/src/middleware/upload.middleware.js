import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadDir = "public/uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

// File filter (optional: restrict to PDFs if desired, but general needed)
const fileFilter = (req, file, cb) => {
    // Accept all files for now, or restrict:
    // if (file.mimetype === 'application/pdf') ...
    cb(null, true);
};

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});
