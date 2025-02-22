import fs from "fs";
import csvParser from "csv-parser";
import axios from "axios";
import { fileQueue } from "./queue.js";

fileQueue.process(async (job) => {
  const { filePath } = job.data;

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found - ${filePath}`);
    return;
  }

  const results = [];
  const requiredFields = ["name", "email"]; // Define required columns

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      // Validate that required fields exist and are not empty
      const missingFields = requiredFields.filter(field => !row[field] || row[field].trim() === "");
      
      if (missingFields.length > 0) {
        console.error(`❌ Skipping row due to missing fields: ${missingFields.join(", ")}`, row);
        return; // Skip this row
      }

      // Validate email format using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(row.email)) {
        console.error(`❌ Invalid email format: ${row.email}`, row);
        return;
      }

      results.push(row);
    })
    .on("end", async () => {
      if (results.length === 0) {
        console.log("⚠️ No valid records found.");
        return;
      }

      for (const record of results) {
        try {
          await axios.post("http://external-api:5000/users", record);
          console.log(`✅ Record sent:`, record);
        } catch (error) {
          console.error(`❌ Error sending record:`, error.message);
        }
      }
    });
});
