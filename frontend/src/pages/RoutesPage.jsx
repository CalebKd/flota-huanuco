import React, { useState, useEffect } from 'react';
import { Map, Edit2, Trash2, Plus, UserPlus, Play, CheckCircle, Clock, Calendar, Sun, Moon, Sunset } from 'lucide-react';

const API_HOST = `http://${window.location.hostname}:3000`;

const RoutesPage = () => {
    const [routes, setRoutes] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('active');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ nombre: '', descripcion: '', distancia_km: '', tipo_residuo: 'Orgánico' });
    const [assignData, setAssignData] = useState({ driver_id: '', vehicle_id: '', turno: 'Mañana' });

    const fetchData = async () => {
        try {
            const [rRes, aRes, dRes, vRes, hRes] = await Promise.all([
                fetch(`${API_HOST}/api/routes`),
                fetch(`${API_HOST}/api/assignments`),
                fetch(`${API_HOST}/api/drivers`),
                fetch(`${API_HOST}/api/vehicles`),
                fetch(`${API_HOST}/api/history`)
            ]);
            setRoutes(await rRes.json());
            setAssignments(await aRes.json());
            setDrivers(await dRes.json());
            setVehicles(await vRes.json());
            setHistory(await hRes.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssign = (route) => { setSelectedRoute(route); setAssignData({ driver_id: '', vehicle_id: '', turno: 'Mañana' }); setIsAssignModalOpen(true); };
    const submitAssign = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_HOST}/api/assignments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...assignData, route_id: selectedRoute.id, estado: 'PENDIENTE' })
            });
            if (res.ok) { setIsAssignModalOpen(false); fetchData(); }
        } catch (e) { console.error(e); }
    };
    const handleStartRoute = async (id) => { await fetch(`${API_HOST}/api/assignments/${id}/start`, { method: 'PUT' }); fetchData(); };
    const handleFinishRoute = async (id) => { if (!confirm('¿Finalizar ruta?')) return; await fetch(`${API_HOST}/api/assignments/${id}/finish`, { method: 'POST' }); fetchData(); };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleEdit = (route) => { setFormData({ nombre: route.nombre, descripcion: route.descripcion, distancia_km: route.distancia_km, tipo_residuo: route.tipo_residuo || 'Orgánico' }); setEditingId(route.id); setIsModalOpen(true); };
    const handleDelete = async (id) => { if (!confirm('¿Eliminar ruta?')) return; await fetch(`${API_HOST}/api/routes/${id}`, { method: 'DELETE' }); fetchData(); };
    const handleSubmit = async (e) => { e.preventDefault(); const url = editingId ? `${API_HOST}/api/routes/${editingId}` : `${API_HOST}/api/routes`; await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) }); setIsModalOpen(false); fetchData(); };

    const getWasteColor = (type) => {
        switch (type) {
            case 'Aprovechable': return 'bg-green-100 text-green-700';
            case 'Orgánico': return 'bg-amber-100 text-amber-900';
            case 'Inservible': return 'bg-gray-800 text-white';
            case 'Peligroso': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-50 text-gray-600';
        }
    };
    const getTurnoIcon = (turno) => {
        switch (turno) {
            case 'Mañana': return <Sun size={12} className="text-orange-500" />;
            case 'Tarde': return <Sunset size={12} className="text-purple-500" />;
            case 'Noche': return <Moon size={12} className="text-blue-900" />;
            default: return null;
        }
    };
    const getActiveAssignment = (routeId) => assignments.find(a => a.route_id === routeId);

    return (
        <div className="p-4 md:p-6">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Rutas</h1>
                    <p className="text-gray-500 text-sm">Control de recolección</p>
                </div>
                <button onClick={() => { setEditingId(null); setFormData({ nombre: '', descripcion: '', distancia_km: '', tipo_residuo: 'Orgánico' }); setIsModalOpen(true); }}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                    <Plus size={18} /> Nueva Ruta
                </button>
            </div>

            {/* Tabs - Responsive */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    Rutas Activas
                </button>
                <button onClick={() => setActiveTab('history')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
                    Historial
                </button>
            </div>

            {activeTab === 'active' ? (
                /* ROUTES LIST - Card based for mobile */
                <div className="space-y-4">
                    {routes.map(r => {
                        const active = getActiveAssignment(r.id);
                        return (
                            <div key={r.id} className="bg-white rounded-xl shadow-sm border p-4">
                                {/* Route Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-800">{r.nombre}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{r.descripcion}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getWasteColor(r.tipo_residuo)}`}>
                                                {r.tipo_residuo}
                                            </span>
                                            <span className="text-xs text-gray-400">{r.distancia_km} km</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(r)} className="p-2 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
                                        <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                    </div>
                                </div>

                                {/* Assignment Section */}
                                {active ? (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mt-3">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${active.estado === 'EN_RUTA' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                                                {active.estado.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border">
                                                {getTurnoIcon(active.turno)} {active.turno || 'Mañana'}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> {active.hora_inicio ? active.hora_inicio.substring(0, 5) : '--:--'}
                                            </span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-800">{active.placa}</div>
                                        <div className="text-xs text-gray-600 mb-3">{active.nombre_completo}</div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            {active.estado === 'PENDIENTE' && (
                                                <button onClick={() => handleStartRoute(active.id)}
                                                    className="flex-1 bg-green-600 text-white text-sm py-2 rounded flex items-center justify-center gap-1">
                                                    <Play size={14} /> Iniciar
                                                </button>
                                            )}
                                            {active.estado === 'EN_RUTA' && (
                                                <button onClick={() => handleFinishRoute(active.id)}
                                                    className="flex-1 bg-gray-800 text-white text-sm py-2 rounded flex items-center justify-center gap-1">
                                                    <CheckCircle size={14} /> Finalizar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => handleAssign(r)}
                                        className="w-full mt-3 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 flex items-center justify-center gap-2">
                                        <UserPlus size={16} /> Asignar Conductor
                                    </button>
                                )}
                            </div>
                        );
                    })}
                    {routes.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                            No hay rutas registradas.
                        </div>
                    )}
                </div>
            ) : (
                /* HISTORY - Card based for mobile */
                <div className="space-y-4">
                    {history.length > 0 ? history.map(h => (
                        <div key={h.id} className="bg-white rounded-xl shadow-sm border p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800">{h.route_name}</h3>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    {getTurnoIcon(h.turno)} {h.turno}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                                <div>
                                    <span className="text-gray-500">Vehículo:</span>
                                    <span className="font-bold ml-1">{h.vehicle_plate}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Conductor:</span>
                                    <span className="ml-1">{h.driver_name}</span>
                                </div>
                            </div>
                            <div className="flex gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(h.fecha_inicio).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock size={10} /> {new Date(h.fecha_fin).toLocaleTimeString()}</span>
                            </div>
                            {h.description && <p className="text-xs text-gray-400 italic mt-2">{h.description}</p>}
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                            No hay historial de rutas.
                        </div>
                    )}
                </div>
            )}

            {/* Modal Nueva/Editar Ruta */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Nueva'} Ruta</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" className="w-full p-2 border rounded" required />
                            <select name="tipo_residuo" value={formData.tipo_residuo} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="Orgánico">Orgánico</option>
                                <option value="Aprovechable">Aprovechable</option>
                                <option value="Inservible">Inservible</option>
                                <option value="Peligroso">Peligroso</option>
                            </select>
                            <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" className="w-full p-2 border rounded" />
                            <input name="distancia_km" type="number" step="0.1" value={formData.distancia_km} onChange={handleChange} placeholder="Distancia (km)" className="w-full p-2 border rounded" />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
                                <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Asignar */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-1">Asignar a {selectedRoute?.nombre}</h2>
                        <p className="text-sm text-gray-500 mb-4">Selecciona conductor, vehículo y turno.</p>
                        <form onSubmit={submitAssign} className="space-y-4">
                            <select className="w-full p-2 border rounded bg-gray-50" value={assignData.turno} onChange={e => setAssignData({ ...assignData, turno: e.target.value })} required>
                                <option value="Mañana">Mañana (06:00 - 14:00)</option>
                                <option value="Tarde">Tarde (14:00 - 22:00)</option>
                                <option value="Noche">Noche (22:00 - 06:00)</option>
                            </select>
                            <select className="w-full p-2 border rounded" value={assignData.driver_id} onChange={e => setAssignData({ ...assignData, driver_id: e.target.value })} required>
                                <option value="">Seleccione Conductor...</option>
                                {drivers.filter(d => d.estado === 'ACTIVO').map(d => (<option key={d.id} value={d.id}>{d.nombre_completo} ({d.tipo_licencia})</option>))}
                            </select>
                            <select className="w-full p-2 border rounded" value={assignData.vehicle_id} onChange={e => setAssignData({ ...assignData, vehicle_id: e.target.value })} required>
                                <option value="">Seleccione Vehículo...</option>
                                {vehicles.filter(v => v.estado === 'OPERATIVO').map(v => (<option key={v.id} value={v.id}>{v.placa} - {v.tipo}</option>))}
                            </select>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
                                <button type="submit" className="flex-1 p-2 bg-green-600 text-white rounded">Confirmar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoutesPage;
