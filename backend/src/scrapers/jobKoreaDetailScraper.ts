import puppeteer from "puppeteer";

// ✅ 채용 상세 정보 스크래핑 함수
const jobKoreaDetailScrape = async (jobUrl: string) => {
    console.log(`✅ [JobKorea Detail Scraper] 실행: ${jobUrl}`);

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(jobUrl, { waitUntil: "networkidle2" });

        const jobDetail = await page.evaluate(() => {
            // ✅ 특정 요소의 텍스트 가져오는 함수 (null & undefined 방지)
            const getText = (selector: string): string => {
                const element = document.querySelector(selector);
                return element?.textContent?.trim().replace(/\s+/g, " ") ?? "정보 없음";
            };

            // ✅ "dt" 태그의 특정 라벨을 찾아 다음 "dd" 태그 내용 가져오는 함수
            const getTextByLabel = (label: string): string => {
                const dtElements = Array.from(document.querySelectorAll("dt"));
                for (const dt of dtElements) {
                    if (dt.textContent?.includes(label)) {
                        const dd = dt.nextElementSibling;
                        return dd?.textContent?.trim().replace(/\s+/g, " ") ?? "정보 없음";
                    }
                }
                return "정보 없음";
            };

            // ✅ 직무명 추출 (기업 인증, 관심기업 관련 요소 제거)
            const titleElement = document.querySelector(".sumTit h3.hd_3");
            let title = "정보 없음";
            if (titleElement) {
                const clonedElement = titleElement.cloneNode(true) as HTMLElement;

                // ✅ 필요 없는 요소 제거 (회사명, 기업 인증, 관심기업 관련 요소)
                const unwantedElements = clonedElement.querySelectorAll(".coName, .ico-certify, .item.favorite, .tooltip-box-wrap");
                unwantedElements.forEach(el => el.remove());

                title = clonedElement.textContent?.trim().replace(/\s+/g, " ") ?? "정보 없음";
            }

            return {
                title, // ✅ 직무명
                company: getText(".coName"), // ✅ 회사명
                experience: getTextByLabel("경력"), // ✅ 경력
                education: getTextByLabel("학력"), // ✅ 학력
                employmentType: getTextByLabel("고용형태"), // ✅ 고용형태
                salary: getTextByLabel("급여"), // ✅ 급여
                location: getTextByLabel("지역"), // ✅ 지역
                industry: getTextByLabel("산업(업종)"), // ✅ 산업
                employees: getTextByLabel("사원수"), // ✅ 사원수
                established: getTextByLabel("설립년도"), // ✅ 설립년도
                companyType: getTextByLabel("기업형태"), // ✅ 기업 형태
                website: getTextByLabel("홈페이지"), // ✅ 홈페이지
            };
        });

        await browser.close();

        // console.log("✅ [스크래핑 결과]:", jobDetail);

        return jobDetail;
    } catch (error) {
        console.error("❌ [JobKorea Detail Scraper] 오류 발생:", error);
        return null;
    }
};

export { jobKoreaDetailScrape };
