import { Router, Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { jobKoreaFetch } from "../scrapers/jobKoreaFetcher";
import { jobKoreaDetailScrape } from "../scrapers/jobKoreaDetailScraper";

const router = Router();
const DATA_DIR = path.join(__dirname, "../../data");

// ✅ "/" 요청 시 기존 데이터를 반환 (없으면 크롤링 후 반환)
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await jobKoreaFetch();
        res.json(jobs);
    } catch (error: unknown) {
        const err = error as NodeJS.ErrnoException;
        console.error("❌ [JobKorea Fetch] 오류 발생:", err.message);
        res.status(500).json({ message: "데이터를 불러오는 중 오류 발생", error: err.message });
    }
});

// ✅ 상세페이지 크롤링 후 JSON 파일 저장
router.get("/job-detail/:listno", async (req: Request, res: Response): Promise<void> => {
    const listno = req.params.listno;
    const jobId = req.query.id as string; // ✅ jobId 가져오기

    if (!jobId) {
        res.status(400).json({ message: "❌ 해당 listno의 jobId가 필요합니다." });
        return;
    }

    // ✅ 저장 경로 설정
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const scheduledHour = now.getHours() >= 9 && now.getHours() < 15 ? "morning" : "afternoon";
    const detailsPath = path.join(DATA_DIR, formattedDate, scheduledHour, "details");
    const filePath = path.join(detailsPath, `${listno}.json`);

    try {
        console.log(`🛠️ [DEBUG] 생성된 filePath: ${filePath}`);
        await fs.access(filePath);
        console.log(`📂 [JobKorea Detail] 기존 데이터 존재: ${filePath}`);

        const existingData = await fs.readFile(filePath, "utf-8");
        res.json(JSON.parse(existingData));
        return;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: unknown) {
        console.log(`⚠️ [JobKorea Detail] 기존 데이터 없음 → 크롤링 실행! (${filePath})`);
    }

    // ✅ 기존 데이터가 없을 경우 크롤링 실행
    const jobUrl = `https://www.jobkorea.co.kr/Recruit/GI_Read/${jobId}`;
    const jobDetail = await jobKoreaDetailScrape(jobUrl);

    if (!jobDetail) {
        res.status(404).json({ message: "❌ 채용 상세 정보를 찾을 수 없습니다." });
        return;
    }

    await fs.mkdir(detailsPath, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(jobDetail, null, 2));
    console.log(`✅ [JobKorea Detail] 저장 완료: ${filePath}`);

    res.json(jobDetail);
});


export default router;
