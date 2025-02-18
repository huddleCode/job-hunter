import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import "./global.css";
function App() {
    return (_jsxs("div", { className: "min-h-full", children: [_jsx(Navbar, {}), _jsx("main", { className: "mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8", children: _jsx(Home, {}) })] }));
}
export default App;
