import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "/api", // ✅ Vite 프록시 설정 적용됨
    headers: {
        "Content-Type": "application/json",
    },
});

export default axiosInstance;
