import { Router, Request, Response } from "express";
import { jobKoreaFetch } from "../scrapers/jobKoreaFetcher";
import { jobKoreaScrape } from "../scrapers/jobKoreaScraper";

const router = Router();

// ✅ 최신 데이터 반환
router.get("/jobs", async (req: Request, res: Response) => {
    try {
        const jobs = await jobKoreaFetch();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "데이터를 불러오는 중 오류 발생", error });
    }
});

// ✅ 강제 크롤링 실행 후 최신 데이터 반환
router.post("/scrape", async (req: Request, res: Response) => {
    try {
        console.log("🔄 [JobKorea Scraper] 강제 크롤링 실행...");
        const jobs = await jobKoreaScrape();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "크롤링 실행 중 오류 발생", error });
    }
});

export default router;
