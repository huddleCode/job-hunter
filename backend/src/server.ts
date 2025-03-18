import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobKoreaRoutes from "./routes/jobKoreaRoutes";
import weaviateQueryRoutes from "./api/weaviate/query";  // ✅ query.ts import 추가
import { apiLogger } from "./utils/logger";
import weaviateRoutes from "./routes/weaviateRoutes";
import { getJobAdvice } from "./api/gpt/getJobAdvice";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ "/" 요청을 jobKoreaRoutes.ts에서 처리
app.use("/", jobKoreaRoutes);
app.use("/api/weaviate", weaviateRoutes); // ✅ Weaviate API 추가
app.use("/api/weaviate/query", weaviateQueryRoutes); // ✅ "/api/weaviate/query" 요청을 query.ts에서 처리

// ✅ GPT API를 호출하는 엔드포인트 추가
app.get("/api/job-advice/:jobId", async (req, res) => {
    const { jobId } = req.params;
    try {
        const advice = await getJobAdvice(jobId);
        res.json({ jobId, advice });
    } catch (error) {
        apiLogger.error(`❌ [API] jobId(${jobId}) 요청 실패:`, error);
        res.status(500).json({ error: "Failed to fetch job advice." });
    }
});

app.listen(PORT, () => {
    apiLogger.info(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
});
