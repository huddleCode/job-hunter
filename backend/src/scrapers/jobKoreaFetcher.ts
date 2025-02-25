import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { jobKoreaScrape } from "./jobKoreaScraper";

const DATA_DIR = path.join(__dirname, "../../data");
let currentJobFolder = ""; // ✅ 현재 실행된 목록 JSON이 속한 폴더 (morning or afternoon)

interface JobPosting {
    company: string;
    title: string;
    description: string;
}


const getJobKoreaFilePath = (): { folderPath: string; filePath: string } => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timeSlot = now.getHours() >= 9 && now.getHours() < 15 ? "morning" : "afternoon";

    const folderPath = path.join(DATA_DIR, formattedDate, timeSlot);
    const filePath = path.join(folderPath, "listings.json");

    currentJobFolder = folderPath; // ✅ 현재 목록 폴더를 글로벌 변수에 저장
    return { folderPath, filePath };
};

const saveToWeaviate = async (jobData: JobPosting[]) => {
    const WEAVIATE_URL = "http://localhost:8080/v1/objects";

    for (const job of jobData) {
        try {
            const data = {
                class: "JobPostings",
                properties: {
                    company: job.company,
                    title: job.title,
                    description: job.description
                }
            };

            await axios.post(WEAVIATE_URL, data, {
                headers: { "Content-Type": "application/json" }
            });

            console.log(`✅ [Weaviate] 데이터 저장 완료: ${job.title} @ ${job.company}`);
        } catch (error) {
            console.error(`❌ [Weaviate] 저장 실패: ${job.title} @ ${job.company}`, error);
        }
    }
};

const jobKoreaFetch = async () => {
    const { folderPath, filePath } = getJobKoreaFilePath();

    try {
        await fs.access(filePath);
        console.log(`📂 [JobKorea Fetcher] 기존 데이터 존재: ${filePath}`);
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch {
        console.log(`⚠️ [JobKorea Fetcher] 기존 데이터 없음 → 크롤링 실행!`);

        const jobData: JobPosting[] = await jobKoreaScrape();

        if (jobData.length > 0) {
            await fs.mkdir(folderPath, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
            console.log(`✅ [JobKorea Fetcher] 새 데이터 저장 완료: ${filePath}`);

            // Weaviate에 저장
            await saveToWeaviate(jobData);

            return jobData;
        } else {
            console.log("⚠️ [JobKorea Fetcher] 스크래핑 실패 또는 새로운 데이터 없음.");
            return [];
        }
    }
};

export { jobKoreaFetch, currentJobFolder };
