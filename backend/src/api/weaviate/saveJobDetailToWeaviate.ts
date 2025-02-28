import axios from "axios";
import { apiLogger } from "../../utils/logger";
import { JobDetail } from "../../types/job"; // ✅ JobDetail 타입 가져오기


// ✅ Weaviate API 응답 타입 정의
interface WeaviateResponse {
    data?: {
        Get?: {
            JobDetails?: { properties: { id: string } }[];
        };
    };
}

const checkExistingJobDetail = async (jobId: string): Promise<boolean> => {
    try {
        const query = {
            query: `{
                Get {
                    JobDetails(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        jobId
                    }
                }
            }`
        };

        apiLogger.info(`🔍 [Weaviate] 기존 상세 데이터 조회 요청: ${jobId}`);

        const response = await axios.post<WeaviateResponse>(
            "http://localhost:8080/v1/graphql",
            query,
            { headers: { "Content-Type": "application/json" } }
        );

        if (
            !response.data ||
            !response.data.data ||
            !response.data.data.Get ||
            !response.data.data.Get.JobDetails
        ) {
            apiLogger.warn(`⚠️ [Weaviate] 상세 응답 데이터 구조가 예상과 다름: ${JSON.stringify(response.data, null, 2)}`);
            return false;
        }

        const exists = response.data.data.Get.JobDetails.length > 0;
        apiLogger.info(`✅ [Weaviate] 상세 데이터 존재 여부 (${jobId}): ${exists}`);

        return exists;
    } catch (error) {
        apiLogger.error(`❌ [Weaviate] 상세 데이터 조회 실패: ${jobId}`, error instanceof Error ? error.message : JSON.stringify(error));
        return false;
    }
};



// ✅ Weaviate에 채용 상세 정보를 저장하는 함수
const saveJobDetailToWeaviate = async (jobId: string, jobDetail: JobDetail) => {
    try {
        const exists = await checkExistingJobDetail(jobId);
        if (exists) {
            apiLogger.info(`⚠️ [Weaviate] 이미 존재하는 상세 데이터 (저장 X): ${jobDetail.title} @ ${jobDetail.company}`);
            return;
        }

        const WEAVIATE_URL = "http://localhost:8080/v1/objects";

        const data = {
            class: "JobDetails", // ✅ 상세 데이터 전용 클래스
            properties: {
                jobId, // ✅ 목록과 연결할 ID
                title: jobDetail.title || "제목 없음",
                company: jobDetail.company || "회사명 없음",
                experience: jobDetail.experience || "-",
                education: jobDetail.education || "-",
                employmentType: jobDetail.employmentType || "-",
                salary: jobDetail.salary || "-",
                location: jobDetail.location || "-",
                workingHours: jobDetail.workingHours || "-",
                skills: jobDetail.skills || "-",
                industry: jobDetail.industry || "-",
                employees: jobDetail.employees || "-",
                established: jobDetail.established || "-",
                companyType: jobDetail.companyType || "-",
                website: jobDetail.website || "-",
                coreCompetencies: jobDetail.coreCompetencies || "-",
                preferredQualifications: jobDetail.preferredQualifications || "-",
                position: jobDetail.position || "-",
                certification: jobDetail.certification || "-",
                revenue: jobDetail.revenue || "-"
            }
        };

        await axios.post(WEAVIATE_URL, data, {
            headers: { "Content-Type": "application/json" }
        });

        apiLogger.info(`✅ [Weaviate] 상세 데이터 저장 완료: ${jobDetail.title} @ ${jobDetail.company}`);
    } catch (error) {
        apiLogger.error(`❌ [Weaviate] 상세 데이터 저장 실패: ${jobDetail.title} @ ${jobDetail.company}`, error instanceof Error ? error.message : JSON.stringify(error));
    }
};


export { saveJobDetailToWeaviate };
