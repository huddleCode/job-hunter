import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import JobList from "./pages/JobList";
import JobDetail from "./pages/JobDetail";  
import "./global.css";

function App() {
  return (
    <Router>
      <div className="min-h-full">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/job-detail/:listno" element={<JobDetail />} />  {/* ✅ id를 URL에 포함 */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
