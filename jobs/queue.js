import Queue from "bull";

const fileQueue = new Queue("file-processing", {
  redis: { host: process.env.REDIS_HOST || "redis", port: 6379 },
});

export { fileQueue };
