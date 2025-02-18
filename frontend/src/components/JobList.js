import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/JobList.tsx
import { useEffect, useState } from "react";
import fetchJobs from "../api/jobApi";
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
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getJobs = async () => {
            const data = await fetchJobs();
            setJobs(data);
            setLoading(false);
        };
        getJobs();
    }, []);
    if (loading)
        return _jsx("p", { children: "\u23F3 \uB85C\uB529 \uC911..." });
    if (!jobs.length)
        return _jsx("p", { children: "\u274C \uCC44\uC6A9 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." });
    return (_jsxs("div", { className: "container", children: [_jsx("h1", { className: "text-2xl md:text-3xl m-3", children: "\uD83D\uDCCC \uCC44\uC6A9 \uACF5\uACE0" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: jobs.map((job, index) => (_jsxs("div", { className: "p-5 border-2 rounded-md", children: [_jsx("h3", { className: "text-xl font-bold mb-3", children: _jsx("a", { href: job.link, target: "_blank", rel: "noopener noreferrer", children: job.title }) }), _jsxs("p", { children: ["\uD83C\uDFE2 ", job.company] }), _jsxs("p", { children: ["\uD83D\uDCC5 ", job.deadline] }), _jsxs("p", { children: ["\uD83D\uDCCD ", job.location] }), _jsxs("p", { children: ["\uD83D\uDCCC ", job.workType, " / ", job.workExperience, " / ", job.education] })] }, index))) })] }));
};
export default JobList;
