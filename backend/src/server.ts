import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { scrapeJobs } from "./scrapers/jobScraper";


// ✅ 환경 변수 로드
dotenv.config();

const app = express();

// ✅ 환경 변수에서 PORT 가져오기 (기본값: 3001)
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("🚀 JobHunter 백엔드 서버 실행 중!");
});

// ✅ 서버 시작 시 자동으로 스크래핑 실행
(async () => {
    try {
        console.log("🔍 서버 시작과 함께 스크래핑 실행...");
        await scrapeJobs();
        console.log("✅ 스크래핑 완료!");
    } catch (error) {
        console.error("❌ 스크래핑 실행 중 오류 발생:", error);
    }
})();

app.get("/jobs", async (req, res) => {
    const jobs = await scrapeJobs();
    res.json(jobs);
});


app.listen(PORT, () => {
    console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중!`);
});


/**
 * "/" : 전체 스크래핑 정보 노출
 * "/scrapingA" : A스크래핑 정보
 * "/scrapingB" : B스크래핑 정보
 * "/scrapingC" : C스크래핑 정보
 */