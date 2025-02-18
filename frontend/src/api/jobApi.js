// src/api/jobApi.ts
const fetchJobs = async () => {
    try {
        const response = await fetch("http://localhost:3001/jobs");
        if (!response.ok)
            throw new Error("Failed to fetch jobs");
        return await response.json();
    }
    catch (error) {
        console.error("❌ API 호출 실패:", error);
        return [];
    }
};
export default fetchJobs;
