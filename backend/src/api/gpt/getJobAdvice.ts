import axios from "axios";
import { apiLogger } from "../../utils/logger";
import dotenv from "dotenv";
import { getJobAdviceFromWeaviate, saveJobAdviceToWeaviate } from "../weaviate/saveJobDetailToWeaviate";
dotenv.config(); 

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY";

// ✅ Weaviate API 응답 타입 정의
interface WeaviateResponse {
    data?: {
        Get?: {
            JobDetails?: {
                jobId: string;
                title: string;
                company: string;
                detailedText: string;
                employmentType?: string;
                location?: string;
                salary?: string;
                skills?: string;
            }[];
        };
    };
}

// ✅ OpenAI API 응답 타입 정의
interface OpenAIResponse {
    choices?: { message: { content: string } }[];
}

/**
 * 📌 Weaviate에서 jobId로 데이터를 가져와서 GPT에게 전달하여 취업 조언을 받는 함수
 * @param jobId - 조회할 채용 공고의 ID
 * @returns GPT가 생성한 취업 관련 조언 (한글 응답, 가독성 개선)
 */
const getJobAdvice = async (jobId: string): Promise<string> => {
    try {
        apiLogger.info(`🔍 [Weaviate] jobId(${jobId}) 기존 조언 데이터 조회 시도...`);

        // 🔹 1. Weaviate에서 기존 조언 데이터 조회
        const existingAdvice = await getJobAdviceFromWeaviate(jobId);
        if (existingAdvice) {
            apiLogger.info(`✅ [Weaviate] jobId(${jobId}) 기존 조언 반환`);
            return existingAdvice;
        }

        apiLogger.info(`⚠️ [Weaviate] jobId(${jobId}) 기존 조언 없음 → GPT API 호출`);

        // 🔹 2. Weaviate에서 해당 jobId의 상세 데이터 가져오기
        const query = {
            query: `{
                Get {
                    JobDetails(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        jobId
                        title
                        company
                        detailedText
                    }
                }
            }`
        };

        apiLogger.info(`🔍 [Weaviate] jobId(${jobId}) 상세 데이터 조회 중...`);

        const weaviateResponse = await axios.post<WeaviateResponse>(
            "http://localhost:8080/v1/graphql",
            query,
            { headers: { "Content-Type": "application/json" } }
        );

        const jobDetails = weaviateResponse.data?.data?.Get?.JobDetails?.[0];

        if (!jobDetails) {
            apiLogger.error(`❌ [Weaviate] jobId(${jobId}) 데이터를 찾을 수 없음.`);
            return "해당 채용 공고의 상세 정보를 찾을 수 없습니다.";
        }

        apiLogger.info(`✅ [Weaviate] jobId(${jobId}) 상세 데이터 조회 성공: ${JSON.stringify(jobDetails)}`);

        // 🔹 3. GPT API 호출하여 조언 생성
        apiLogger.info(`🛠️ [GPT API] jobId(${jobId}) 채용 조언 생성 요청 중...`);

        const gptResponse = await axios.post<OpenAIResponse>(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a job search assistant. Summarize the job listing first, then provide useful career advice based on it." },
                    { role: "user", content: `📌 채용 공고 정보\n\n**직무명:** ${jobDetails.title}\n**회사명:** ${jobDetails.company}\n**상세 설명:** ${jobDetails.detailedText}\n\n이 공고를 요약해주고, 이 공고를 고려하는 구직자를 위해 취업 조언을 제공해 주세요.` }
                ],
                temperature: 0.7,
                max_tokens: 800
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (!gptResponse.data?.choices || gptResponse.data.choices.length === 0) {
            throw new Error("OpenAI API did not return choices.");
        }

        const advice = gptResponse.data.choices[0].message.content || "취업 조언을 생성하지 못했습니다.";

        apiLogger.info(`✅ [GPT API] jobId(${jobId}) 조언 생성 성공`);

        // 🔹 4. GPT 응답을 Weaviate에 저장
        apiLogger.info(`🛠️ [Weaviate] jobId(${jobId}) 새 조언 저장 중...`);
        await saveJobAdviceToWeaviate(jobDetails.jobId, jobDetails.title, jobDetails.company, advice);
        apiLogger.info(`✅ [Weaviate] jobId(${jobId}) 조언 저장 완료!`);

        return advice;
    } catch (error: unknown) {
        const errMessage = error instanceof Error ? error.message : "Unknown error";
        apiLogger.error(`❌ [GPT API] jobId(${jobId}) 요청 실패: ${errMessage}`);

        if (typeof error === "object" && error !== null && "response" in error) {
            const axiosError = error as { response?: { data?: unknown } };
            apiLogger.error(`🛑 OpenAI API 응답 오류: ${JSON.stringify(axiosError.response?.data, null, 2)}`);
        }

        return "취업 조언을 생성하는 중 오류가 발생했습니다.";
    }
};

export { getJobAdvice };
