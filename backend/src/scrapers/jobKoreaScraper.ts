import puppeteer from "puppeteer";

const jobKoreaScrape = async () => {
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

        const jobs = await page.$$eval(
            'section.content-recruit[data-content="recruit"] article.list article.list-item',
            (elements) =>
                elements.map((e) => ({
                    title: (e.querySelector(".information-title-link") as HTMLElement)?.innerText.trim() || "제목 없음",
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
                    link: e.querySelector(".information-title-link")?.getAttribute("href")
                        ? `https://www.jobkorea.co.kr${e.querySelector(".information-title-link")?.getAttribute("href")}`
                        : "링크 없음",
                }))
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
