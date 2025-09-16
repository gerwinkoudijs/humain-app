// import { ProcessMessages } from "@/server/lib/jobs/process-messages";
// import { SyncMessages } from "@/server/lib/jobs/sync-messages";

const run = async () => {
  try {
    // console.log("Running cron job...");

    // console.log("Sync messages");
    // await SyncMessages();

    // console.log("Process messages");
    // await ProcessMessages();
    // await ProcessMessages();

    console.log("Cron job finished successfully");
  } catch (error) {
    console.log("Cron job failed with error:", error);
  }
};

run();
