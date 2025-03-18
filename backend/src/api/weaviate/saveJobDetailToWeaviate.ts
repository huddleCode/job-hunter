import axios from "axios";
import { apiLogger } from "../../utils/logger";
import { JobDetail } from "../../types/job"; // ✅ JobDetail 타입 가져오기

// ✅ Weaviate API 응답 타입 정의
interface WeaviateResponse {
    data: {
        Get: {
            JobDetails: {
                _additional: { id: string };
                jobId: string;
                detailedText: string | null;
            }[];
        };
    };
}

// ✅ Weaviate에서 jobId로 JobAdvice 조회할 때의 응답 타입
interface WeaviateJobAdviceResponse {
    data?: {
        Get?: {
            JobAdvice?: {
                jobId: string;
                advice: string;
            }[];
        };
    };
}


// ✅ 기존 상세 데이터 존재 여부 확인
const checkExistingJobDetail = async (jobId: string): Promise<boolean> => {
    try {
        const query = {
            query: `{
                Get {
                    JobDetails(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        jobId
                        detailedText
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

        const jobDetails = response.data?.data?.Get?.JobDetails;

        if (!jobDetails || jobDetails.length === 0) {  // ✅ 빈 배열 처리 추가
            apiLogger.warn(`⚠️ [Weaviate] 상세 응답 데이터 없음: ${jobId}`);
            return false;
        }

        apiLogger.info(`✅ [Weaviate] 상세 데이터 존재 (${jobId}): ${true}`);
        return true;

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
            class: "JobDetails",
            properties: {
                jobId,
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
                revenue: jobDetail.revenue || "-",
                detailedText: jobDetail.detailedText || "EMPTY_TEXT" // ✅ detailedText 필드 추가
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

const updateJobDetailInWeaviate = async (jobId: string, detailedText: string) => {
    try {
        if (!jobId || !detailedText) {
            apiLogger.error(`❌ [Weaviate] 업데이트할 jobId 또는 detailedText가 올바르지 않음: jobId=${jobId}, detailedText=${detailedText}`);
            return;
        }

        // ✅ 1. `_additional.id` 조회
        const query = {
            query: `{
                Get {
                    JobDetails(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        _additional { id }
                        detailedText
                    }
                }
            }`
        };

        const response = await axios.post<WeaviateResponse>(
            "http://localhost:8080/v1/graphql",
            query,
            { headers: { "Content-Type": "application/json" } }
        );

        const jobDetails = response.data?.data?.Get?.JobDetails?.[0];
        const weaviateId = jobDetails?._additional?.id;
        const existingText = jobDetails?.detailedText || "";

        // ✅ detailedText가 "EMPTY_HTML"이거나 null/빈 문자열이면 업데이트 진행
        if (!weaviateId) {
            apiLogger.error(`❌ [Weaviate] 업데이트할 데이터의 ID를 찾을 수 없음: jobId=${jobId}`);
            return;
        }

        if (existingText !== "EMPTY_HTML" && existingText.trim() !== "") {
            apiLogger.info(`🔄 [Weaviate] 기존 detailedText가 존재하여 업데이트 생략: ${jobId}`);
            return;
        }

        // ✅ 2. `PATCH` 요청으로 상세 데이터 업데이트
        const WEAVIATE_URL = `http://localhost:8080/v1/objects/${weaviateId}`;

        const data = {
            class: "JobDetails",  // ✅ 필수 추가 (오류 해결)
            properties: {
                detailedText: detailedText.trim() !== "" ? detailedText : "EMPTY_TEXT"
            }
        };

        await axios.patch(WEAVIATE_URL, data, {
            headers: { "Content-Type": "application/json" }
        });

        apiLogger.info(`✅ [Weaviate] 상세 데이터 업데이트 완료: jobId=${jobId}`);
    } catch (error) {
        apiLogger.error(`❌ [Weaviate] 상세 데이터 업데이트 실패: jobId=${jobId}`, error instanceof Error ? error.message : JSON.stringify(error));
    }
};

/**
 * 📌 Weaviate에서 특정 jobId의 채용 조언 데이터를 조회하는 함수
 * @param jobId - 조회할 채용 공고 ID
 * @returns 저장된 조언 데이터 (없으면 null 반환)
 */
const getJobAdviceFromWeaviate = async (jobId: string): Promise<string | null> => {
    try {
        const query = {
            query: `{
                Get {
                    JobAdvice(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        jobId
                        advice
                    }
                }
            }`
        };

        // ✅ `axios.post<>`에 응답 타입 지정
        const response = await axios.post<WeaviateJobAdviceResponse>(
            "http://localhost:8080/v1/graphql",
            query,
            { headers: { "Content-Type": "application/json" } }
        );

        // ✅ 안전한 데이터 접근
        const jobAdvice = response.data?.data?.Get?.JobAdvice?.[0];
        if (jobAdvice) {
            apiLogger.info(`✅ [Weaviate] jobId(${jobId}) 조언 데이터 반환`);
            return jobAdvice.advice;
        }

        return null;
    } catch (error) {
        apiLogger.error(`❌ [Weaviate] jobId(${jobId}) 조언 데이터 조회 실패: ${error}`);
        return null;
    }
};

const saveJobAdviceToWeaviate = async (jobId: string, title: string, company: string, advice: string) => {
    try {
        const payload = {
            class: "JobAdvice",
            properties: {
                jobId,
                title,
                company,
                advice,
                createdAt: new Date().toISOString()
            }
        };

        const response = await axios.post(
            "http://localhost:8080/v1/objects",  // ✅ REST API 사용
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        apiLogger.info(`✅ [Weaviate] jobId(${jobId}) 조언 데이터 저장 완료:\n${JSON.stringify(response.data, null, 2)}`);

    } catch (error) {
        apiLogger.error(`❌ [Weaviate] jobId(${jobId}) 조언 데이터 저장 실패: ${error}`);
    }
};



export { saveJobDetailToWeaviate, updateJobDetailInWeaviate, getJobAdviceFromWeaviate, saveJobAdviceToWeaviate };
