import { ApiResponse } from "@/lib/api";
import { ProcessMessages } from "@/server/lib/jobs/process-messages";
import { SyncMessages } from "@/server/lib/jobs/sync-messages";

export const maxDuration = 60;

export async function GET() {
  try {
    // await SyncMessages();
    // await ProcessMessages();

    return ApiResponse({
      status: "DISABLED",
    });
  } catch (error) {
    return ApiResponse({
      status: "ERROR",
      error: (error as Error).message,
    });
  }
}
