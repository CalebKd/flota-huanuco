import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Assignments from './pages/Assignments';
import RoutesPage from './pages/RoutesPage';
import Maintenance from './pages/Maintenance';
import Login from './pages/Login';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const auth = localStorage.getItem('flota_auth');
        if (auth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('flota_auth');
        localStorage.removeItem('flota_user');
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <BrowserRouter>
            <div className="flex h-screen bg-gray-50 font-sans">
                <Sidebar onLogout={handleLogout} />
                {/* Main content with padding top on mobile for the header bar */}
                <main className="flex-1 overflow-auto pt-14 lg:pt-0">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/vehiculos" element={<Vehicles />} />
                        <Route path="/conductores" element={<Drivers />} />
                        <Route path="/asignaciones" element={<Assignments />} />
                        <Route path="/rutas" element={<RoutesPage />} />
                        <Route path="/mantenimiento" element={<Maintenance />} />
                        <Route path="*" element={<div className="p-10">Página no encontrada</div>} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
