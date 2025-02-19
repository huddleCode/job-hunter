import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchJobDetail } from "../api/jobApi";

const JobDetail = () => {
    const { state } = useLocation();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!state?.url) return;
        const getJobDetail = async () => {
            const data = await fetchJobDetail(state.url);
            setJob(data);
            setLoading(false);
        };
        getJobDetail();
    }, [state]);

    if (loading) return <p>⏳ 상세 정보 불러오는 중...</p>;
    if (!job) return <p>❌ 채용 정보가 없습니다.</p>;

    return (
        <div className="container mx-auto p-6 max-w-8xl">
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <p className="text-2xl font-semibold">🏢 {job.company}</p>
            <hr className="my-4" />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>💼 경력:</strong> {job.experience}</p>
                    <p><strong>🎓 학력:</strong> {job.education}</p>
                    <p><strong>📄 고용 형태:</strong> {job.employmentType}</p>
                </div>
                <div>
                    <p><strong>💰 급여:</strong> {job.salary}</p>
                    <p><strong>📍 근무 지역:</strong> {job.location}</p>
                </div>
            </div>

            <h2 className="mt-6 mb-4 text-xl font-semibold">📌 기업 정보</h2>
            <div className="">
                <p><strong>🏭 산업:</strong> {job.industry}</p>
                <p><strong>👥 사원 수:</strong> {job.employees}</p>
                <p><strong>📅 설립년도:</strong> {job.established}</p>
                <p><strong>🏢 기업 형태:</strong> {job.companyType}</p>
                <p><strong>🔗 홈페이지:</strong> <a href={job.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{job.website}</a></p>
            </div>

            <a href={state.url} target="_blank" rel="noopener noreferrer" className="text-3xl mt-4 block text-blue-500 underline text-center">
                🔗 원본 공고 보기
            </a>
        </div>
    );
};

export default JobDetail;
