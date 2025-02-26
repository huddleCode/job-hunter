import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { jobKoreaScrape } from "./jobKoreaScraper";

const DATA_DIR = path.join(__dirname, "../../data");

interface JobPosting {
    id: string;
    listno: string;
    title: string;
    company: string;
    workExperience: string;
    education: string;
    workType: string;
    location: string;
    deadline: string;
    link: string;
    description: string;
}

const getJobKoreaFilePath = (): { folderPath: string; filePath: string } => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timeSlot = now.getHours() >= 9 && now.getHours() < 15 ? "morning" : "afternoon";

    const folderPath = path.join(DATA_DIR, formattedDate, timeSlot);
    const filePath = path.join(folderPath, "listings.json");

    return { folderPath, filePath };
};

const saveToWeaviate = async (jobData: JobPosting[]) => {
    const WEAVIATE_URL = "http://localhost:8080/v1/objects";

    for (const job of jobData) {
        try {
            const data = {
                class: "JobPostings",
                properties: {
                    id: job.id,
                    listno: job.listno,
                    title: job.title,
                    company: job.company,
                    workExperience: job.workExperience,
                    education: job.education,
                    workType: job.workType,
                    location: job.location,
                    deadline: job.deadline,
                    link: job.link,
                    description: job.description, // 기본값으로 "채용 상세 정보를 불러오는 중입니다." 사용
                }
            };

            await axios.post(WEAVIATE_URL, data, {
                headers: { "Content-Type": "application/json" }
            });

            console.log(`✅ [Weaviate] 목록 저장 완료: ${job.title} @ ${job.company}`);
        } catch (error) {
            console.error(`❌ [Weaviate] 목록 저장 실패: ${job.title} @ ${job.company}`, error);
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

        const jobData: JobPosting[] = await jobKoreaScrape();  // ✅ `JobPosting` 타입 사용

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

export { jobKoreaFetch };
