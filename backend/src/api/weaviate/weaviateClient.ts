import weaviate from "weaviate-ts-client";

const weaviateClient = () => {
    return weaviate.client({
        scheme: "http",
        host: "localhost:8080", // Weaviate 서버 주소
    });
};

export default weaviateClient;
