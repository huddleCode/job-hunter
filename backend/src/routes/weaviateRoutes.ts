import express from "express";
import axios from "axios";

const router = express.Router();

// ✅ Weaviate API 응답 타입 정의
interface WeaviateJobPostingsResponse {
    data: {
        Get: {
            JobPostings: {
                listno: string;
                title: string;
                company: string;
                location: string;
                deadline: string;
            }[];
        };
    };
}

interface WeaviateJobDetailsResponse {
    data: {
        Get: {
            JobDetails: {
                jobId: string;
                title: string;
                company: string;
                location: string;
                employmentType: string;
                salary: string;
                skills: string;
            }[];
        };
    };
}

// 🔍 목록 조회 API (JobPostings)
router.get("/weaviate/jobs", async (req, res) => {
    try {
        const query = {
            query: `{
                Get {
                    JobPostings {
                        listno
                        title
                        company
                        location
                        deadline
                    }
                }
            }`
        };

        const response = await axios.post<WeaviateJobPostingsResponse>("http://localhost:8080/v1/graphql", query, {
            headers: { "Content-Type": "application/json" }
        });

        res.json(response.data.data.Get.JobPostings);
    } catch (error) {
        console.error("❌ 목록 데이터 조회 실패:", error);
        res.status(500).json({ error: "목록 데이터를 가져오는 중 오류 발생" });
    }
});

// 🔍 특정 상세 조회 API (JobDetails)
router.get("/weaviate/job/:id", async (req, res) => {
    const jobId = req.params.id;

    try {
        const query = {
            query: `{
                Get {
                    JobDetails(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        jobId
                        title
                        company
                        location
                        employmentType
                        salary
                        skills
                    }
                }
            }`
        };

        const response = await axios.post<WeaviateJobDetailsResponse>("http://localhost:8080/v1/graphql", query, {
            headers: { "Content-Type": "application/json" }
        });

        res.json(response.data.data.Get.JobDetails[0] || {});
    } catch (error) {
        console.error(`❌ 상세 데이터 조회 실패 (jobId: ${jobId}):`, error);
        res.status(500).json({ error: "상세 데이터를 가져오는 중 오류 발생" });
    }
});

export default router;
