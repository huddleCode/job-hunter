import fs from "fs/promises";
import path from "path";
import { jobKoreaScrape } from "./jobKoreaScraper";

const DATA_DIR = path.join(__dirname, "../../data");

const getJobKoreaFilename = (): string => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const scheduledHour = now.getHours() >= 9 && now.getHours() < 15 ? "09" : "15";
    return `${formattedDate}_JobKorea_${scheduledHour}.json`;
};

const jobKoreaFetch = async () => {
    const filename = getJobKoreaFilename();
    const filePath = path.join(DATA_DIR, filename);

    try {
        await fs.access(filePath);
        console.log(`📂 [JobKorea Fetcher] 기존 데이터 존재: ${filename}`);
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch {
        console.log(`⚠️ [JobKorea Fetcher] 기존 데이터 없음 → 크롤링 실행!`);

        const jobData = await jobKoreaScrape();

        if (jobData.length > 0) {
            await fs.mkdir(DATA_DIR, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
            console.log(`✅ [JobKorea Fetcher] 새 데이터 저장 완료: ${filename}`);
            return jobData;
        } else {
            console.log("⚠️ [JobKorea Fetcher] 스크래핑 실패 또는 새로운 데이터 없음.");
            return [];
        }
    }
};

export { jobKoreaFetch };
