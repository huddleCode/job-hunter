import puppeteer from "puppeteer";

// ✅ 채용 상세 정보 스크래핑 함수
const jobKoreaDetailScrape = async (jobUrl: string) => {
    console.log(`✅ [JobKorea Detail Scraper] 실행: ${jobUrl}`);

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
            const getTextByLabel = (label: string): string => {
                const dtElements = Array.from(document.querySelectorAll("dt"));
                for (const dt of dtElements) {
                    if (dt.textContent?.trim().includes(label)) {
                        const dd = dt.nextElementSibling;
                        return dd?.textContent?.trim().replace(/\s+/g, " ") ?? "";
                    }
                }
                return "";
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
                workingHours: getTextByLabel("시간"), // ✅ 근무 시간
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
        return jobDetail;
    } catch (error) {
        console.error("❌ [JobKorea Detail Scraper] 오류 발생:", error);
        return null;
    }
};

export { jobKoreaDetailScrape };
