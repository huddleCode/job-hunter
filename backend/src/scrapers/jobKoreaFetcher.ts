import fs from "fs/promises";
import path from "path";
import { jobKoreaScrape } from "./jobKoreaScraper";
import axios from "axios";
import { apiLogger } from "../utils/logger";
import { v4 as uuidv4 } from "uuid"; // ✅ UUID 생성기 추가

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
                    JobPostings(where: { path: ["listno"], operator: Equal, valueString: "${jobId}" }) {
                        listno
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
                id: uuidv4(), // ✅ UUID 자동 생성
                properties: {
                    listno: String(job.id || "N/A"), // 기존 ID를 listno에 저장
                    title: String(job.title || "제목 없음"),
                    company: String(job.company || "회사명 없음"),
                    workExperience: String(job.workExperience || "경력 정보 없음"),
                    education: String(job.education || "학력 정보 없음"),
                    workType: String(job.workType || "근무 형태 없음"),
                    location: String(job.location || "근무 지역 없음"),
                    deadline: String(job.deadline || "마감일 없음"),
                    link: String(job.link || "링크 없음"),
                    // description: String(job.description || "채용 상세 정보를 불러오는 중입니다.")
                }
            };

            apiLogger.info(`🔍 [Weaviate] 저장 시도: ${JSON.stringify(data)}`);

            await axios.post("http://localhost:8080/v1/objects", data, {
                headers: { "Content-Type": "application/json" }
            });

            apiLogger.info(`✅ [Weaviate] 목록 데이터 저장 완료: ${job.title} @ ${job.company}`);
        } catch (error: unknown) {
            let errorMessage = "알 수 없는 오류";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            apiLogger.error(`❌ [Weaviate] 목록 데이터 저장 실패: ${job.title} @ ${job.company}`);
            apiLogger.error(`❗️ 상세 에러 메시지: ${errorMessage}`);
            
            const err = error as { response?: { data?: Record<string, unknown> } };
            if (err.response?.data) {
                apiLogger.error(`🛠 Weaviate 응답: ${JSON.stringify(err.response.data)}`);
            }
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
