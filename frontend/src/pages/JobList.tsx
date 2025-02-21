import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Job } from "../types/job";
import { API_BASE_URL } from "../config";

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) throw new Error("Failed to fetch jobs");
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("❌ API 호출 실패:", error);
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
          state={{ url: job.link, id: job.id }} // ✅ id 추가
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
