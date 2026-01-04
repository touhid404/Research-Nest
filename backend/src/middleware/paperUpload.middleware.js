import multer from "multer";
import path from "path";
import fs from "fs";


// Ensure papers-hub directory exists
const uploadDir = "public/papers-hub";
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


// File filter
const fileFilter = (req, file, cb) => {
    // Only accept PDFs for papers if strict, but generic for now as per previous logic
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        // Evaluate if we should return an error or accept.
        // Proposal post accepted all. Let's accept all but prefer PDF.
        // Actually user requirement earlier was "info and necessary things".
        // Frontend restricts to .pdf. Backend should ideally too or accept.
        // Letting it encompass all for flexibility unless strict restricted.
        cb(null, true);
    }
};


export const paperUpload = multer({
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit for papers (usually larger)
});



