import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, Wrench, Users, Map, LayoutDashboard, ArrowRightLeft, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white';
    };

    const currentUser = localStorage.getItem('flota_user') || 'Usuario';

    const handleLinkClick = () => {
        setIsOpen(false); // Close sidebar on mobile after clicking a link
    };

    return (
        <>
            {/* Mobile Header Bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-white p-2 hover:bg-slate-800 rounded-lg transition"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                    <h1 className="text-white font-bold">Muni Huánuco</h1>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.charAt(0).toUpperCase()}
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-64 bg-slate-900 text-white flex flex-col h-full
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                lg:transform-none
                pt-14 lg:pt-0
            `}>
                <div className="p-6 border-b border-slate-800 hidden lg:block">
                    <h1 className="text-xl font-bold tracking-tight">Muni Huánuco</h1>
                    <p className="text-xs text-slate-400 mt-1">Gestión de Flota</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-auto">
                    <Link to="/" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/')}`}>
                        <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    <Link to="/vehiculos" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/vehiculos')}`}>
                        <Car size={20} /> Vehículos
                    </Link>
                    <Link to="/conductores" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/conductores')}`}>
                        <Users size={20} /> Conductores
                    </Link>
                    <Link to="/asignaciones" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/asignaciones')}`}>
                        <ArrowRightLeft size={20} /> Asignaciones
                    </Link>
                    <Link to="/mantenimiento" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/mantenimiento')}`}>
                        <Wrench size={20} /> Mantenimiento
                    </Link>
                    <Link to="/rutas" onClick={handleLinkClick} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/rutas')}`}>
                        <Map size={20} /> Rutas
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                                {currentUser.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-medium text-white">{currentUser}</p>
                                <p className="text-xs">Administrador</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                            title="Cerrar Sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
