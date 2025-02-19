import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";  // ✅ JobDetail이 pages에 위치함
import "./global.css";

function App() {
  return (
    <Router> {/* ✅ React Router 적용 */}
      <div className="min-h-full">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Routes> {/* ✅ Routes로 감싸기 */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/job-detail" element={<JobDetail />} />  {/* ✅ /job-detail/:id → /job-detail */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
