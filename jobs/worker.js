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

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      if (row.name && row.email) {
        results.push(row);
      }
    })
    .on("end", async () => {
      for (const user of results) {
        try {
          await axios.post("http://external-api:5000/users", user);
          console.log(`✅ User added: ${user.email}`);
        } catch (error) {
          console.error(`❌ Error adding user ${user.email}:`, error.message);
        }
      }
    });
});
