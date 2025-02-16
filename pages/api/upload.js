import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the "uploads" directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage with original filename
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Preserve original filename
  },
});

const upload = multer({ storage });

// Disable Next.js's default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

// File upload handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        res.status(500).json({ message: "File upload failed", error: err.message });
        return reject(err);
      }

      res.status(200).json({ 
        message: "File uploaded successfully", 
        file: {
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
        },
      });
      return resolve();
    });
  });
}
