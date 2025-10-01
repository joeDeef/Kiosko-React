
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loading, Home, Information, AdminPanel } from "./pages";
import { AdminPanelProvider } from "../shared/context/AdminPanelContext";

// Componente de prueba para la página de licencia
function LicensePage() {
    return <div>Licencia inválida. Por favor ingrese una licencia válida.</div>;
}

import { useEffect, useState } from "react";

function App() {
    const [licenseValid, setLicenseValid] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkLicense() {
            if (window.electronAPI && typeof window.electronAPI.isLicenseValid === "function") {
                const valid = await window.electronAPI.isLicenseValid();
                setLicenseValid(valid);
            }
        }
        checkLicense();
    }, []);

    if (licenseValid === null) {
        // Puedes mostrar un loader si lo prefieres
        return <div>Cargando...</div>;
    }

    return (
        <HashRouter>
            <Routes>
                {!licenseValid && (
                    <Route path="*" element={<LicensePage />} />
                )}
                {licenseValid && (
                    <>
                        <Route path="/" element={
                            <AdminPanelProvider>
                                <AdminPanel />
                            </AdminPanelProvider>} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/information" element={<Information />} />
                        <Route path="/admin" element={
                            <AdminPanelProvider>
                                <AdminPanel />
                            </AdminPanelProvider>} />
                    </>
                )}
            </Routes>
        </HashRouter>
    );
}

export default App;
