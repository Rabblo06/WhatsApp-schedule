import { Queue, Worker } from "bullmq";

const connection = { url: process.env.REDIS_URL ?? "redis://localhost:6379" };
export const reminderQueue = new Queue("tom-reminders", { connection });

export const reminderWorker = new Worker(
  "tom-reminders",
  async (job) => {
    console.log(
      JSON.stringify({
        event: "WORKER_HEARTBEAT",
        worker: "tom-reminders",
        jobId: job.id,
        reminderId: job.data?.reminderId,
      }),
    );
  },
  { connection },
);

reminderWorker.on("failed", (job, error) => {
  console.error(
    JSON.stringify({
      event: "REMINDER_FAILED",
      jobId: job?.id,
      error: error.message,
    }),
  );
});
