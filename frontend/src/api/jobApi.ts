const fetchJobs = async () => {
    try {
        const response = await fetch("http://localhost:3001/");
        if (!response.ok) throw new Error("Failed to fetch jobs");
        return await response.json();
    } catch (error) {
        console.error("❌ API 호출 실패:", error);
        return [];
    }
};

const fetchJobDetail = async (jobUrl: string) => {
    try {
        const response = await fetch(`http://localhost:3001/job-detail?url=${encodeURIComponent(jobUrl)}`);
        if (!response.ok) throw new Error("Failed to fetch job details");
        return await response.json();
    } catch (error) {
        console.error("❌ 상세 정보 API 호출 실패:", error);
        return null;
    }
};

export { fetchJobs, fetchJobDetail };
