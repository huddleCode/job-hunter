import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobKoreaRoutes from "./routes/jobKoreaRoutes";
import weaviateQueryRoutes from "./api/weaviate/query";  // ✅ query.ts import 추가
import { apiLogger } from "./utils/logger";
import weaviateRoutes from "./routes/weaviateRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ "/" 요청을 jobKoreaRoutes.ts에서 처리
app.use("/", jobKoreaRoutes);
app.use("/api/weaviate", weaviateRoutes); // ✅ Weaviate API 추가


// ✅ "/api/weaviate/query" 요청을 query.ts에서 처리
app.use("/api/weaviate/query", weaviateQueryRoutes);

app.listen(PORT, () => {
    apiLogger.info(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
});
