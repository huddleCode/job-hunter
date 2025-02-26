import weaviateClient from "./weaviateClient"; // ✅ 클라이언트 import 추가

export const saveJobSummaryToWeaviate = async (jobId: string, title: string, company: string, location: string, employmentType: string) => {
    const client = weaviateClient(); // ✅ 올바르게 클라이언트 호출

    await client.data
        .creator()
        .withClassName("JobPosting")
        .withProperties({ jobId, title, company, location, employmentType })
        .do();
};
