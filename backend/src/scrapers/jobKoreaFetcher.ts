import fs from "fs/promises";
import path from "path";
import { jobKoreaScrape } from "./jobKoreaScraper";
import axios from "axios";
import { apiLogger } from "../utils/logger";

interface WeaviateResponse {
    data?: {
        Get?: {
            JobPostings?: { id: string }[];
        };
    };
}

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

const DATA_DIR = path.join(__dirname, "../../data");

const getJobKoreaFilePath = (): { folderPath: string; filePath: string } => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const timeSlot = now.getHours() >= 9 && now.getHours() < 15 ? "morning" : "afternoon";

    const folderPath = path.join(DATA_DIR, formattedDate, timeSlot);
    const filePath = path.join(folderPath, "listings.json");

    return { folderPath, filePath };
};

const checkExistingJob = async (jobId: string): Promise<boolean> => {
    try {
        const query = {
            query: `{
                Get {
                    JobPostings(where: { path: ["properties.id"], operator: Equal, valueString: "${jobId}" }) {
                        properties {
                            id
                        }
                    }
                }
            }`
        };

        apiLogger.info(`🔍 [Weaviate] 기존 데이터 조회 요청: ${jobId}`);

        const response = await axios.post<WeaviateResponse>(
            "http://localhost:8080/v1/graphql",
            query,
            { headers: { "Content-Type": "application/json" } }
        );

        if (
            !response.data ||
            !response.data.data ||
            !response.data.data.Get ||
            !response.data.data.Get.JobPostings
        ) {
            apiLogger.warn(`⚠️ [Weaviate] 응답 데이터 구조가 예상과 다름: ${JSON.stringify(response.data, null, 2)}`);
            return false;
        }

        const exists = response.data.data.Get.JobPostings.length > 0;
        apiLogger.info(`✅ [Weaviate] 기존 데이터 존재 여부 (${jobId}): ${exists}`);

        return exists;
    } catch (error) {
        apiLogger.error(`❌ [Weaviate] 기존 데이터 조회 실패: ${jobId}`, error);
        return false;
    }
};


const saveToWeaviate = async (jobData: JobPosting[]) => {
    for (const job of jobData) {
        try {
            const exists = await checkExistingJob(job.id);
            if (exists) {
                apiLogger.info(`⚠️ [Weaviate] 이미 존재하는 목록 데이터 (저장 X): ${job.title} @ ${job.company}`);
                continue;
            }

            const data = {
                class: "JobPostings",
                properties: {
                    id: job.id,
                    listno: job.listno || "N/A",
                    title: job.title || "제목 없음",
                    company: job.company || "회사명 없음",
                    workExperience: job.workExperience || "경력 정보 없음",
                    education: job.education || "학력 정보 없음",
                    workType: job.workType || "근무 형태 없음",
                    location: job.location || "근무 지역 없음",
                    deadline: job.deadline || "마감일 없음",
                    link: job.link || "링크 없음",
                    description: job.description || "채용 상세 정보를 불러오는 중입니다."
                }
            };

            await axios.post("http://localhost:8080/v1/objects", data, {
                headers: { "Content-Type": "application/json" }
            });

            apiLogger.info(`✅ [Weaviate] 목록 데이터 저장 완료: ${job.title} @ ${job.company}`);
        } catch (error) {
            apiLogger.error(`❌ [Weaviate] 목록 데이터 저장 실패: ${job.title} @ ${job.company}`, error instanceof Error ? error.message : JSON.stringify(error));
        }
    }
};


const jobKoreaFetch = async () => {
    const { folderPath, filePath } = getJobKoreaFilePath();

    try {
        await fs.access(filePath);
        apiLogger.info(`📂 [JobKorea Fetcher] 기존 데이터 존재: ${filePath}`);
        const data = await fs.readFile(filePath, "utf-8");
        return JSON.parse(data);
    } catch {
        apiLogger.warn(`⚠️ [JobKorea Fetcher] 기존 데이터 없음 → 크롤링 실행!`);

        const jobData: JobPosting[] = await jobKoreaScrape();

        if (jobData.length > 0) {
            await fs.mkdir(folderPath, { recursive: true });
            await fs.writeFile(filePath, JSON.stringify(jobData, null, 2));
            apiLogger.info(`✅ [JobKorea Fetcher] 새 데이터 저장 완료: ${filePath}`);

            await saveToWeaviate(jobData);

            return jobData;
        } else {
            apiLogger.warn("⚠️ [JobKorea Fetcher] 스크래핑 실패 또는 새로운 데이터 없음.");
            return [];
        }
    }
};

export { jobKoreaFetch };
