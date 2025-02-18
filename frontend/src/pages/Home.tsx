// src/pages/Home.tsx
import JobList from "../components/JobList";

const Home = () => {
  return (
    <div>
      <h1 className="container text-3xl md:text-5xl m-5 p-4">🔥 JobHunter 채용 공고</h1>
      <JobList />
    </div>
  );
};

export default Home;
