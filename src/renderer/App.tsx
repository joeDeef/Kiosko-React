import { HashRouter, Routes, Route } from "react-router-dom";
import { Loading, Home } from "./pages";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Loading />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </HashRouter>
    );
}

export default App;