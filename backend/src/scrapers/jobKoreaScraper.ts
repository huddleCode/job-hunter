import puppeteer from "puppeteer";

// ✅ Job 타입 정의
interface Job {
    id: string;
    listno: string;
    title: string;
    company: string;
    workExperience: string;
    education: string;
    workType: string;
    location: string;
    deadline: string;
    link: string;
    description: string;
}

const jobKoreaScrape = async (): Promise<Job[]> => {
    console.log("✅ [JobKorea Scraper] 실행됨!");

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        console.log("✅ Puppeteer 브라우저 실행됨!");

        const jobName = "프론트엔드";
        const region = "B040"; // 과천

        await page.goto(
            `https://www.jobkorea.co.kr/Search/?stext=${jobName}&local=${region}&tabType=recruit&Page_No=1`,
            { waitUntil: "networkidle2" }
        );
        console.log("✅ 페이지 이동 완료!");

        const jobs: Job[] = await page.$$eval(
            'section.content-recruit[data-content="recruit"] article.list article.list-item',
            (elements) => {
                const baseUrl = "https://www.jobkorea.co.kr";
                const jobList: Job[] = [];

                elements.forEach((e) => {
                    const jobId = e.getAttribute("data-gno") || e.getAttribute("data-gino") || "";
                    if (!jobId) {
                        console.warn("⚠️ 공고 ID 없음 → 스킵됨!", e);
                        return;
                    }

                    const linkElement = e.querySelector(".information-title-link") as HTMLAnchorElement;
                    const relativeUrl = linkElement?.getAttribute("href") || "";
                    const fullUrl = relativeUrl.startsWith("http") ? relativeUrl : baseUrl + relativeUrl;

                    if (!fullUrl || fullUrl === baseUrl) {
                        console.warn("⚠️ URL이 없음 또는 올바르지 않음 → 스킵됨!", jobId);
                        return;
                    }

                    // ✅ listno 값 추출 (기본값 설정)
                    const listnoMatch = fullUrl.match(/listno=(\d+)/);
                    const listno = listnoMatch ? listnoMatch[1] : ""; // ✅ null 대신 "" (빈 문자열)

                    jobList.push({
                        id: jobId,
                        listno, // ✅ string 타입으로 설정됨
                        title: linkElement?.innerText.trim() || "제목 없음",
                        company: (e.querySelector(".corp-name-link") as HTMLElement)?.innerText.trim() || "회사명 없음",
                        workExperience:
                            (e.querySelector(".chip-information-group .chip-information-item:nth-child(1)") as HTMLElement)
                                ?.innerText.trim() || "경력 없음",
                        education:
                            (e.querySelector(".chip-information-group .chip-information-item:nth-child(2)") as HTMLElement)
                                ?.innerText.trim() || "학력 없음",
                        workType:
                            (e.querySelector(".chip-information-group .chip-information-item:nth-child(3)") as HTMLElement)
                                ?.innerText.trim() || "근무형태 없음",
                        location:
                            (e.querySelector(".chip-information-group .chip-information-item:nth-child(4)") as HTMLElement)
                                ?.innerText.trim() || "지역 없음",
                        deadline:
                            (e.querySelector(".chip-information-group .chip-information-item:nth-child(5)") as HTMLElement)
                                ?.innerText.trim() || "마감일 없음",
                        link: fullUrl,
                        description: "채용 상세 정보를 불러오는 중입니다." // ✅ Weaviate 저장을 위해 기본값 추가
                    });
                });

                return jobList;
            }
        );

        await browser.close();
        console.log("✅ 스크래핑 완료!");

        return jobs;
    } catch (error) {
        console.error("❌ [JobKorea Scraper] 스크래핑 오류 발생:", error);
        return [];
    }
};


export { jobKoreaScrape };
