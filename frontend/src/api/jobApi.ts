// const API_BASE_URL = "http://localhost:3001";


// const fetchJobs = async () => {
//     try {
//         const response = await fetch(`${API_BASE_URL}/`);
//         if (!response.ok) throw new Error("Failed to fetch jobs");
//         return await response.json();
//     } catch (error) {
//         console.error("❌ API 호출 실패:", error);
//         return [];
//     }
// };

// const fetchJobDetail = async (jobId: string, jobUrl: string) => {
//     if (!jobId || !jobUrl) {
//       console.error("❌ fetchJobDetail: jobId 또는 jobUrl이 없습니다.", { jobId, jobUrl });
//       return null;
//     }
  
//     try {
//       const response = await fetch(
//         `${API_BASE_URL}/job-detail?id=${encodeURIComponent(jobId)}&url=${encodeURIComponent(jobUrl)}`
//       );
//       if (!response.ok) throw new Error("Failed to fetch job details");
//       return await response.json();
//     } catch (error) {
//       console.error("❌ 상세 정보 API 호출 실패:", error);
//       return null;
//     }
//   };
// export { fetchJobs, fetchJobDetail };
