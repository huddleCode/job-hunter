import { Router, Request, Response } from "express";
import { jobKoreaFetch } from "../scrapers/jobKoreaFetcher";
import { jobKoreaDetailScrape } from "../scrapers/jobKoreaDetailScraper";  

const router = Router();

// ✅ "/" 요청 시 기존 데이터를 반환 (없으면 크롤링 후 반환)
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await jobKoreaFetch();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: "데이터를 불러오는 중 오류 발생", error });
    }
});

// ✅ 개별 상세페이지 크롤링 후 요약 반환
router.get("/job-detail", async (req: Request, res: Response): Promise<void> => {
    const jobUrl = req.query.url as string;  // ✅ 프론트에서 상세페이지 URL 요청
    if (!jobUrl) res.status(400).json({ message: "채용 공고 URL이 필요합니다." });

    try {
        const jobDetail = await jobKoreaDetailScrape(jobUrl);
        res.json(jobDetail);
    } catch (error) {
        res.status(500).json({ message: "상세 정보 크롤링 중 오류 발생", error });
    }
});

export default router;
