import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import "./global.css"


function App() {
  return (
    <div className="min-h-full">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Home />
      </main>
    </div>
  );
}

export default App;
