import Queue from "bull";

const fileQueue = new Queue("file-processing", {
  redis: { host: "localhost", port: 6379 },
});

fileQueue.process(async (job) => {
  console.log("Processing file:", job.data.filePath);
  // CSV parsing and API request logic will go here
});

export { fileQueue };
