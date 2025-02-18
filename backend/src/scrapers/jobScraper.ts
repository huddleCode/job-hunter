// 스크래핑 코드
import puppeteer from "puppeteer";

const scrapeJobs = async () => {
    console.log("✅ scrapeJobs 함수 실행됨!"); // ✅ 실행 확인용 로그

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        console.log("✅ Puppeteer 브라우저 실행됨!"); // ✅ 실행 확인용 로그

        const jobName = "프론트엔드";
        const region = "B040"; // 과천

        await page.goto(
            `https://www.jobkorea.co.kr/Search/?stext=${jobName}&local=${region}&tabType=recruit&Page_No=1`,
            { waitUntil: "networkidle2" }
        );
        console.log("✅ 페이지 이동 완료!"); // ✅ 실행 확인용 로그

        const targets = await page.$$eval(
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
        console.log("✅ 스크래핑 완료");
        // console.log("✅ 스크래핑된 데이터:", JSON.stringify(targets, null, 2)); // ✅ 데이터 로그 추가

        return targets;
    } catch (error) {
        console.error("❌ 스크래핑 오류 발생:", error);
        return [];
    }

};

export { scrapeJobs };
