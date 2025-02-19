import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jobKoreaRoutes from "./routes/jobKoreaRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ✅ "/" 요청을 jobKoreaRoutes.ts에서 처리
app.use("/", jobKoreaRoutes);

app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
});
