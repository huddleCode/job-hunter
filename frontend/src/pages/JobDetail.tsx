import { useParams, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance"; // ✅ axiosInstance 사용

const JobDetail = () => {
  const { listno } = useParams();
  const { state } = useLocation();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [gptAdvice, setGptAdvice] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!listno || !state?.id || hasFetched.current) return;
    hasFetched.current = true; // ✅ 한 번만 실행되도록 설정

    const getJobDetail = async () => {
      try {
        console.log(
          `📢 Fetching job detail: /job-detail/${listno}?id=${state.id}`
        );
        const { data } = await axiosInstance.get(
          `/job-detail/${listno}?id=${state.id}`
        );
        if (!data) throw new Error("❌ 받은 데이터가 null 또는 undefined");
        setJob(data);

        // ✅ GPT API 요청 추가
        console.log(`📢 Fetching GPT advice for jobId: ${state.id}`);
        const { data: gptResponse } = await axiosInstance.get(
          `/api/job-advice/${state.id}`
        );
        console.log("📌 [GPT Advice] Response:", gptResponse);
        setGptAdvice(gptResponse.advice);
      } catch (error) {
        console.error("❌ 상세 정보 API 호출 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    getJobDetail();
  }, [listno]); // ✅ `state` 제거!

  const formatBoldText = (text: string | null) => {
    if (!text) return "";
    return text.split(/\*\*(.*?)\*\*/g).map((part, index) =>
      index % 2 === 0 ? part : <strong key={index}>{part}</strong>
    );
  };


  if (loading) return <p>⏳ 상세 정보 불러오는 중...</p>;
  if (!job) return <p>❌ 채용 정보가 없습니다.</p>;

  return (
    <div className="grid lg:grid-cols-2 sm:grid-cols-1 gap-4">
      <div className="container mx-auto p-6 max-w-8xl col-span-1">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        <p className="text-2xl font-semibold">🏢 {job.company}</p>
        <hr className="my-4" />

        {/* ✅ 지원자격 섹션 */}
        {(job.experience ||
          job.education ||
          job.employmentType ||
          job.skills) && (
          <div className="border p-4 rounded-lg">
            <h2 className="text-xl font-semibold">🎯 지원자격</h2>
            {job.experience && (
              <p>
                <strong>💼 경력:</strong> {job.experience}
              </p>
            )}
            {job.education && (
              <p>
                <strong>🎓 학력:</strong> {job.education}
              </p>
            )}
            {job.employmentType && (
              <p>
                <strong>📄 고용 형태:</strong> {job.employmentType}
              </p>
            )}
            {job.skills && (
              <p>
                <strong>🛠️ 스킬:</strong> {job.skills}
              </p>
            )}
            {job.coreCompetencies && (
              <p>
                <strong>🚀 핵심역량:</strong> {job.coreCompetencies}
              </p>
            )}
            {job.preferredQualifications && (
              <p>
                <strong>🌟 우대사항:</strong> {job.preferredQualifications}
              </p>
            )}
          </div>
        )}

        {/* ✅ 근무조건 섹션 */}
        {(job.salary || job.location || job.workingHours) && (
          <div className="border p-4 rounded-lg mt-4">
            <h2 className="text-xl font-semibold">📌 근무조건</h2>
            {job.salary && (
              <p>
                <strong>💰 급여:</strong> {job.salary}
              </p>
            )}
            {job.location && (
              <p>
                <strong>📍 근무 지역:</strong> {job.location}
              </p>
            )}
            {job.workingHours && (
              <p>
                <strong>⏰ 근무 시간:</strong> {job.workingHours}
              </p>
            )}
            {job.position && (
              <p>
                <strong>🏆 직급:</strong> {job.position}
              </p>
            )}
          </div>
        )}

        {/* ✅ 기업정보 섹션 */}
        <h2 className="mt-6 mb-4 text-xl font-semibold">🏢 기업 정보</h2>
        <div className="border p-4 rounded-lg">
          {job.industry && (
            <p>
              <strong>🏭 산업:</strong> {job.industry}
            </p>
          )}
          {job.employees && (
            <p>
              <strong>👥 사원 수:</strong> {job.employees}
            </p>
          )}
          {job.established && (
            <p>
              <strong>📅 설립년도:</strong> {job.established}
            </p>
          )}
          {job.companyType && (
            <p>
              <strong>🏢 기업 형태:</strong> {job.companyType}
            </p>
          )}
          {job.revenue && (
            <p>
              <strong>💰 매출액:</strong> {job.revenue}
            </p>
          )}
          {job.certification && (
            <p>
              <strong>🔖 인증:</strong> {job.certification}
            </p>
          )}
          {job.website && (
            <p>
              <strong>🔗 홈페이지:</strong>
              <a
                href={`//${job.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {job.website}
              </a>
            </p>
          )}
        </div>

        {/* ✅ 원본 공고 보기 링크 */}
        <a
          href={state.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-3xl mt-4 block text-blue-500 underline text-center"
        >
          🔗 원본 공고 보기
        </a>
      </div>
      {/* ✅ GPT 조언 섹션 */}
      <div className="container mx-auto p-6 max-w-8xl col-span-1">
        <h2 className="text-xl font-semibold">🤖 GPT 추천 조언</h2>
        <div className="border p-4 rounded-lg mt-4 whitespace-pre-line">
          {gptAdvice ? (
            <p className="text-lg">{formatBoldText(gptAdvice)}</p>
          ) : (
            <p className="text-gray-500">⏳ AI 분석 중...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
