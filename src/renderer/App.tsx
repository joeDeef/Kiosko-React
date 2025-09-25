import { HashRouter, Routes, Route } from "react-router-dom";
import { Loading, Home, Information, AdminPanel } from "./pages";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Loading />} />
                <Route path="/home" element={<Home />} />
                <Route path="/information" element={<Information />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </HashRouter>
    );
}

export default App;