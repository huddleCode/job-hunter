import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Job } from "../types/job";
import axiosInstance from "../api/axiosInstance"; // ✅ axiosInstance 추가

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log("📢 목록 데이터를 JSON에서 먼저 불러옴...");
        
        // ✅ JSON 데이터 먼저 확인
        const { data: jsonData } = await axiosInstance.get("/jobs");
        if (jsonData.length > 0) {
          console.log("✅ JSON 데이터가 존재함 → 목록 표시");
          setJobs(jsonData);
          return; // ✅ JSON 데이터 있으면 여기서 종료
        }

        console.log("⚠️ JSON 데이터 없음 → Weaviate에서 불러오기 시도");

        // ✅ Weaviate에서 데이터 가져오기
        const { data: weaviateData } = await axiosInstance.post("/weaviate/query");
        if (weaviateData.success && weaviateData.data.Get.JobPostings.length > 0) {
          console.log("✅ Weaviate에서 데이터 가져옴 → 목록 표시");
          setJobs(weaviateData.data.Get.JobPostings);
          return;
        }

        console.log("⚠️ Weaviate에도 데이터 없음 → 크롤링 실행 필요");

      } catch (error) {
        console.error("❌ 목록 데이터 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  console.log("jobs", jobs);

  if (loading) return <p>⏳ 로딩 중...</p>;
  if (!jobs.length) return <p>❌ 채용 정보가 없습니다.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {jobs.map((job, index) => (
        <Link
          key={index}
          to={`/job-detail/${job.listno}`}
          state={{ url: job.link, id: job.id }}
          className="block p-5 border-2 rounded-md transition hover:bg-gray-100"
        >
          <h3 className="text-xl font-bold mb-3">{job.title}</h3>
          <p>🏢 {job.company}</p>
          <p>📅 {job.deadline}</p>
          <p>📍 {job.location}</p>
          <p>
            📌 {job.workType} / {job.workExperience} / {job.education}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default JobList;
