import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { crawlerLogger } from "../utils/logger";
import { saveJobDetailToWeaviate } from "../api/weaviate/saveJobDetailToWeaviate";

const DATA_DIR = path.join(__dirname, "../../data");

// ✅ 채용 상세 정보 스크래핑 함수
const jobKoreaDetailScrape = async (jobId: string, jobUrl: string) => {
    crawlerLogger.info(`✅ [JobKorea Detail Scraper] 실행: ${jobUrl}`);

    // ✅ 저장할 JSON 파일 경로 설정
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const scheduledHour = now.getHours() >= 9 && now.getHours() < 15 ? "morning" : "afternoon";
    const detailsPath = path.join(DATA_DIR, formattedDate, scheduledHour, "details");
    const filePath = path.join(detailsPath, `${jobId}.json`);

    try {
        // ✅ JSON 파일이 존재하는 경우 그대로 반환
        await fs.access(filePath);
        crawlerLogger.info(`📂 [JobKorea Detail] 기존 데이터 존재: ${filePath}`);
        const existingData = await fs.readFile(filePath, "utf-8");
        return JSON.parse(existingData);
    } catch {
        crawlerLogger.info(`⚠️ [JobKorea Detail] 기존 데이터 없음 → 크롤링 실행! (${filePath})`);
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(jobUrl, { waitUntil: "networkidle2" });

        const jobDetail = await page.evaluate(() => {
            // ✅ 특정 요소의 텍스트 가져오는 함수
            const getText = (selector: string): string => {
                const element = document.querySelector(selector);
                return element?.textContent?.trim().replace(/\s+/g, " ") ?? "";
            };

            // ✅ "dt" 태그를 찾아서 라벨이 특정 값인 경우 해당 "dd" 태그 값 가져오기
            const getTextByLabel = (label: string, excludeLabel?: string): string => {
                const dtElements = Array.from(document.querySelectorAll("dt"));
                for (const dt of dtElements) {
                    const text = dt.textContent?.trim();
                    if (text?.includes(label) && (!excludeLabel || !text.includes(excludeLabel))) {
                        const dd = dt.nextElementSibling;
                        return dd?.textContent?.trim().replace(/\s+/g, " ") ?? "-";
                    }
                }
                return "-";
            };

            const getJobTitle = (): string => {
                const element = document.querySelector(".sumTit h3.hd_3");
                if (!element) return "";

                return Array.from(element.childNodes)
                    .filter(node => node.nodeType === Node.TEXT_NODE) // 텍스트 노드만 추출
                    .map(node => node.textContent?.trim())
                    .join(" ");
            };

            return {
                title: getJobTitle(), // ✅ 직무명
                company: getText(".coName"), // ✅ 회사명
                experience: getTextByLabel("경력"), // ✅ 경력
                education: getTextByLabel("학력"), // ✅ 학력
                employmentType: getTextByLabel("고용형태"), // ✅ 고용형태
                salary: getTextByLabel("급여"), // ✅ 급여
                location: getTextByLabel("지역"), // ✅ 근무 지역
                workingHours: getTextByLabel("근무시간", "남은시간"), // ✅ 근무 시간 (남은시간 제외)
                skills: getTextByLabel("스킬"), // ✅ 기술 스택
                industry: getTextByLabel("산업(업종)"), // ✅ 산업
                employees: getTextByLabel("사원수"), // ✅ 사원 수
                established: getTextByLabel("설립년도"), // ✅ 설립년도
                companyType: getTextByLabel("기업형태"), // ✅ 기업 형태
                website: getTextByLabel("홈페이지"), // ✅ 홈페이지
                coreCompetencies: getTextByLabel("핵심역량"), // ✅ 핵심역량 (영어 변환)
                preferredQualifications: getTextByLabel("우대"), // ✅ 우대사항 (영어 변환)
                position: getTextByLabel("직책"), // ✅ 직책 (영어 변환)
                certification: getTextByLabel("인증"), // ✅ 인증 (영어 변환)
                revenue: getTextByLabel("매출액") // ✅ 매출액 (영어 변환)
            };
        });

        await browser.close();

        if (jobDetail) {
            // ✅ Weaviate에 상세 데이터 저장
            await saveJobDetailToWeaviate(jobId, jobDetail);
        } else {
            crawlerLogger.warn(`⚠️ [JobKorea Detail Scraper] 스크래핑된 데이터가 없음: ${jobUrl}`);
        }

        return jobDetail;
    } catch (error) {
        crawlerLogger.error("❌ [JobKorea Detail Scraper] 오류 발생:", error);
        return null;
    }
};

export { jobKoreaDetailScrape };
