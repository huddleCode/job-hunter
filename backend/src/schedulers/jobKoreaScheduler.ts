import cron from "node-cron";
import { jobKoreaFetch } from "../scrapers/jobKoreaFetcher";
import { apiLogger } from "../utils/logger";

cron.schedule("0 9,15 * * *", async () => {
    apiLogger.info("⏳ [JobKorea Scheduler] 스케줄 실행됨...");
    await jobKoreaFetch();
}, {
    timezone: "Asia/Seoul"
});

apiLogger.info("🚀 [JobKorea Scheduler] 스케줄러가 시작되었습니다 (KST).");
