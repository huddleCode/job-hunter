// src/types/job.ts (새로 생성 또는 기존 타입 파일에 추가)
export interface JobDetail {
    title: string;
    company: string;
    experience: string;
    education: string;
    employmentType: string;
    salary: string;
    location: string;
    workingHours: string;
    skills: string;
    industry: string;
    employees: string;
    established: string;
    companyType: string;
    website: string;
    coreCompetencies: string;
    preferredQualifications: string;
    position: string;
    certification: string;
    revenue: string;
     // ✅ 추가된 필드
     isImageType: boolean; // ✅ 이미지 여부
     detailedText?: string; // 상세 요강 텍스트 (이미지일 경우 생략 가능)
 }
