import multer from "multer";
import path from "path";
import fs from "fs";
import { fileQueue } from "../../jobs/queue"; // ✅ Import Bull queue

// Ensure the "uploads" directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const upload = multer({ dest: uploadDir });

// Disable Next.js's default body parser
export const config = {
  api: { bodyParser: false },
};

// File upload handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  return new Promise((resolve, reject) => {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        res.status(500).json({ message: "File upload failed", error: err.message });
        return reject(err);
      }

      const filePath = req.file.path;

      try {
        // ✅ Add job to the queue for background processing
        await fileQueue.add({ filePath });

        res.status(200).json({ message: "File uploaded and added to processing queue" });
        resolve();
      } catch (error) {
        res.status(500).json({ message: "Queue job failed", error: error.message });
        reject(error);
      }
    });
  });
}
