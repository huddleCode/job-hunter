import cron from "node-cron";
import { jobKoreaFetch } from "../scrapers/jobKoreaFetcher";

cron.schedule("0 9,15 * * *", async () => {
    console.log("⏳ [JobKorea Scheduler] 스케줄 실행됨...");
    await jobKoreaFetch();
}, {
    timezone: "Asia/Seoul"
});

console.log("🚀 [JobKorea Scheduler] 스케줄러가 시작되었습니다 (KST).");
