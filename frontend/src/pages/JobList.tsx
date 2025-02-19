// src/components/JobList.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // ✅ Link 추가
import {fetchJobs} from "../api/jobApi";
import { Job } from "../types/job";

// export type Job = {
//   title: string;
//   company: string;
//   workExperience: string;
//   education: string;
//   workType: string;
//   location: string;
//   deadline: string;
//   link: string;
// };

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getJobs = async () => {
      const data = await fetchJobs();
      setJobs(data);
      setLoading(false);
    };
    getJobs();
  }, []);

  if (loading) return <p>⏳ 로딩 중...</p>;
  if (!jobs.length) return <p>❌ 채용 정보가 없습니다.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job, index) => (
            <Link
                key={index}
                to="/job-detail"
                state={{ url: job.link }}  // ✅ 상세페이지 URL 전달
                className="block p-5 border-2 rounded-md transition hover:bg-gray-100"
            >
                <h3 className="text-xl font-bold mb-3">{job.title}</h3>
                <p>🏢 {job.company}</p>
                <p>📅 {job.deadline}</p>
                <p>📍 {job.location}</p>
                <p>📌 {job.workType} / {job.workExperience} / {job.education}</p>
            </Link>
        ))}
    </div>
);
};

export default JobList;
