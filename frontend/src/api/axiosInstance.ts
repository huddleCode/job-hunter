import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api", // ✅ Vite 프록시 설정 적용됨
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 5000, // ⏳ 5초 타임아웃 설정
});

export default axiosInstance;
