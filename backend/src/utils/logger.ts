import winston from "winston";
import path from "path";

// 한국 시간 포맷 함수
const getKSTTimestamp = () => {
    return new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
};

// 로그 저장 경로
const logsDir = path.join(__dirname, "../../logs");

// ✅ 크롤러 로그 설정
const crawlerLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.printf(({ level, message }) => `${getKSTTimestamp()} [CRAWLER] ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logsDir, "crawler.log") }), // 크롤러 로그 파일
        new winston.transports.Console() // 콘솔 출력
    ],
});

// ✅ API 로그 설정
const apiLogger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.printf(({ level, message }) => `${getKSTTimestamp()} [API] ${level}: ${message}`)
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logsDir, "api.log") }), // API 로그 파일
        new winston.transports.Console()
    ],
});

export { crawlerLogger, apiLogger };
