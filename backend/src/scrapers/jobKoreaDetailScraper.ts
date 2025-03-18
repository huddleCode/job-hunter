import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { crawlerLogger } from "../utils/logger";
// import { saveJobDetailToWeaviate } from "../api/weaviate/saveJobDetailToWeaviate";
import { JobDetail } from "../types/job";
import {
  saveJobDetailToWeaviate,
  updateJobDetailInWeaviate,
} from "../api/weaviate/saveJobDetailToWeaviate";
import axios from "axios";

const DATA_DIR = path.join(__dirname, "../../data");

interface WeaviateResponse {
  data?: {
    Get?: {
      JobDetails?: { detailedText: string | null }[];
    };
  };
}

// ✅ 채용 상세 정보 스크래핑 함수
const jobKoreaDetailScrape = async (jobId: string, jobUrl: string) => {
  crawlerLogger.info(`✅ [JobKorea Detail Scraper] 실행: ${jobUrl}`);

  // ✅ 저장할 JSON 파일 경로 설정
  const now = new Date();
  const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
  const scheduledHour =
    now.getHours() >= 9 && now.getHours() < 15 ? "morning" : "afternoon";
  const detailsPath = path.join(
    DATA_DIR,
    formattedDate,
    scheduledHour,
    "details"
  );
  const filePath = path.join(detailsPath, `${jobId}.json`);

  try {
    // ✅ JSON 파일이 존재하는 경우 그대로 반환
    await fs.access(filePath);
    crawlerLogger.info(`📂 [JobKorea Detail] 기존 데이터 존재: ${filePath}`);
    const existingData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(existingData);
  } catch {
    crawlerLogger.info(
      `⚠️ [JobKorea Detail] 기존 데이터 없음 → 크롤링 실행! (${filePath})`
    );
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
          if (
            text?.includes(label) &&
            (!excludeLabel || !text.includes(excludeLabel))
          ) {
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
          .filter((node) => node.nodeType === Node.TEXT_NODE) // 텍스트 노드만 추출
          .map((node) => node.textContent?.trim())
          .join(" ");
      };

      const isImageType = !!document.querySelector("td.detailTable img");
      const detailedTextElement = document.querySelector(
        "td.detailTable .content_sec"
      ) as HTMLElement;
      const detailedText =
        detailedTextElement?.innerHTML?.trim() || "EMPTY_HTML";

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
        revenue: getTextByLabel("매출액"), // ✅ 매출액 (영어 변환)
        isImageType,
        detailedText,
      };
    });

    await saveJobDetailToWeaviate(jobId, jobDetail);

    if (!jobDetail.isImageType) {
      crawlerLogger.info(
        `🟢 [DEBUG] 이미지가 아니므로 추가 스크래핑 진행: ${jobId}`
      );
      const updatedJobDetail = await scrapeJobDetailedInfo(
        jobId,
        jobUrl,
        jobDetail
      );
      return updatedJobDetail;
    }

    await browser.close();
    return jobDetail;
  } catch (error) {
    crawlerLogger.error("❌ [JobKorea Detail Scraper] 오류 발생:", error);
    return null;
  }
};

// ✅ 추가 스크래핑 함수 (텍스트/테이블 형태만)
const scrapeJobDetailedInfo = async (
  jobId: string,
  jobUrl: string,
  existingJobDetail: JobDetail
): Promise<JobDetail> => {
  crawlerLogger.info(
    `🔍 [JobKorea Additional Scraper] 상세 요강 스크래핑: ${jobUrl}`
  );

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(jobUrl, { waitUntil: "networkidle2" });

  let detailedText = "";

  try {
    await page.waitForSelector('iframe[name="gib_frame"]', { timeout: 10000 });
    crawlerLogger.info(`🟢 [DEBUG] iFrame 요소 감지 완료: ${jobId}`);

    const iframeElement = await page.$('iframe[name="gib_frame"]');
    const iframe = await iframeElement?.contentFrame();

    if (iframe) {
      await iframe.waitForSelector(".detailTable", { timeout: 10000 });

      detailedText = await iframe.evaluate(() => {
        const container = document.querySelector(".detailTable") as HTMLElement;
        if (!container) return "EMPTY_TEXT";

        const elements = container.querySelectorAll(
          "p, li, h1, h2, h3, span, strong"
        );

        return (
          Array.from(
            new Set(
              Array.from(elements)
                .map((el) => el.textContent?.trim() ?? "")
                .filter(Boolean)
            )
          ).join("\n") || "EMPTY_TEXT"
        );
      });

      crawlerLogger.info(
        `✅ [JobKorea Additional Scraper] 상세 요강 추출 완료: ${jobId}`
      );
    } else {
      crawlerLogger.error(
        `❌ [JobKorea Additional Scraper] iFrame 콘텐츠 접근 실패: ${jobId}`
      );
    }
  } catch (error) {
    crawlerLogger.error(
      `❌ [JobKorea Additional Scraper] 스크래핑 오류 발생: ${error}`
    );
  } finally {
    await browser.close();
  }

  const updatedJobDetail: JobDetail = {
    ...existingJobDetail,
    detailedText,
  };

  // ✅ Weaviate에서 `detailedText` 조회
  let existingDetailedText: string | null = null;

  try {
    const response = await axios.post<WeaviateResponse>(
      "http://localhost:8080/v1/graphql",
      {
        query: `{
                Get {
                    JobDetails(where: { path: ["jobId"], operator: Equal, valueString: "${jobId}" }) {
                        detailedText
                    }
                }
            }`,
      }
    );

    existingDetailedText =
      response.data?.data?.Get?.JobDetails?.[0]?.detailedText ?? null;
  } catch (error) {
    crawlerLogger.error(`❌ [Weaviate] 기존 데이터 조회 실패: ${jobId}`, error);
  }

  if (
    !existingDetailedText ||
    existingDetailedText === "EMPTY_TEXT" ||
    existingDetailedText.trim() === ""
  ) {
    await updateJobDetailInWeaviate(
      jobId,
      updatedJobDetail.detailedText ?? "EMPTY_TEXT"
    );
  } else {
    crawlerLogger.info(
      `🔄 [Weaviate] 기존 detailedText가 존재하여 업데이트 생략: ${jobId}`
    );
  }

  // ✅ 기존 detailedText가 없거나 "EMPTY_HTML"이면 업데이트 진행
  if (
    !existingDetailedText ||
    existingDetailedText === "EMPTY_HTML" ||
    existingDetailedText.trim() === ""
  ) {
    await updateJobDetailInWeaviate(
      jobId,
      updatedJobDetail.detailedText ?? "EMPTY_TEXT"
    );
  } else {
    crawlerLogger.info(
      `🔄 [Weaviate] 기존 detailedText가 존재하여 업데이트 생략: ${jobId}`
    );
  }

  crawlerLogger.info(
    `✅ [JobKorea Additional Scraper] 상세 요강 최종 업데이트 완료: ${jobId}`
  );

  return updatedJobDetail;
};

export { jobKoreaDetailScrape, scrapeJobDetailedInfo };
