import fs from "fs";
import csvParser from "csv-parser";
import axios from "axios";
import { fileQueue } from "./queue";

fileQueue.process(async (job) => {
  const results = [];

  fs.createReadStream(job.data.filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      if (row.name && row.email) {
        results.push(row);
      }
    })
    .on("end", async () => {
      for (const user of results) {
        try {
          await axios.post("https://external-api.com/users", user);
          console.log(`User added: ${user.email}`);
        } catch (error) {
          console.error(`Error adding user ${user.email}:`, error.message);
        }
      }
    });
});
