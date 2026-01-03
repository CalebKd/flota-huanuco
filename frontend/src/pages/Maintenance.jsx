import React, { useState, useEffect } from 'react';
import { Wrench, AlertTriangle, CheckCircle, Clock, Calendar, Truck, Activity, Edit2, CheckSquare, Info, DollarSign } from 'lucide-react';

import API_HOST from '../config/api';

const Maintenance = () => {
    const [healthData, setHealthData] = useState([]);
    const [history, setHistory] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isCompletingId, setIsCompletingId] = useState(null);

    const [formData, setFormData] = useState({
        vehicle_id: '', tipo_mantenimiento: 'Preventivo', descripcion: '',
        fecha_programada: new Date().toISOString().split('T')[0],
        costo_total: '', taller_proveedor: '', estado: 'PROGRAMADO'
    });

    const MAINTENANCE_TYPES = ["Cambio de Aceite", "Frenos", "Neumáticos", "Suspensión", "Batería", "Afinamiento de Motor", "Inyectores", "Otro"];

    const fetchData = async () => {
        try {
            const [hRes, rRes, vRes] = await Promise.all([
                fetch(`${API_HOST}/api/maintenance/health`),
                fetch(`${API_HOST}/api/maintenance`),
                fetch(`${API_HOST}/api/vehicles`)
            ]);
            setHealthData(await hRes.json());
            setHistory(await rRes.json());
            setVehicles(await vRes.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const openNewModal = () => {
        setEditingId(null); setIsCompletingId(null);
        setFormData({ vehicle_id: '', tipo_mantenimiento: 'Preventivo', descripcion: '', fecha_programada: new Date().toISOString().split('T')[0], costo_total: '', taller_proveedor: '', estado: 'PROGRAMADO' });
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        if (record.estado === 'COMPLETADO') return alert("No se puede editar un mantenimiento completado.");
        setEditingId(record.id); setIsCompletingId(null);
        setFormData({ vehicle_id: record.vehicle_id, tipo_mantenimiento: record.tipo_mantenimiento, descripcion: record.descripcion, fecha_programada: record.fecha_programada.split('T')[0], costo_total: record.costo_total, taller_proveedor: record.taller_proveedor, estado: record.estado });
        setIsModalOpen(true);
    };

    const handleComplete = (record) => {
        setEditingId(record.id); setIsCompletingId(record.id);
        setFormData({ ...record, fecha_real_fin: new Date().toISOString().split('T')[0], estado: 'COMPLETADO', observaciones: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let url = `${API_HOST}/api/maintenance`;
        let method = 'POST';
        if (editingId) { url = `${API_HOST}/api/maintenance/${editingId}`; method = 'PUT'; }
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            if (res.ok) { setIsModalOpen(false); fetchData(); }
        } catch (e) { console.error(e); }
    };

    const getStatusColor = (color) => {
        switch (color) {
            case 'red': return 'bg-red-100 text-red-700';
            case 'yellow': return 'bg-yellow-100 text-yellow-800';
            case 'green': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="p-4 md:p-6">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Gestión de Mantenimiento</h1>
                    <p className="text-gray-500 text-sm">Control de flota y reparaciones</p>
                </div>
                <button onClick={openNewModal} className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm w-full sm:w-auto justify-center">
                    <Wrench size={18} /> Programar
                </button>
            </div>

            {/* Policies Banner - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 mb-6">
                <Info size={18} className="text-blue-600" />
                <div className="text-xs text-blue-800"><strong>Políticas:</strong> Aceite (5k km), Motor (10k km), Inyectores (20k km).</div>
            </div>

            {/* KPIs - Responsive Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="bg-red-100 p-2 md:p-3 rounded-full text-red-600"><AlertTriangle size={20} /></div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-800">{healthData.filter(d => d.health_color === 'red').length}</div>
                        <div className="text-xs text-gray-500">Críticos</div>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 md:p-3 rounded-full text-yellow-600"><Clock size={20} /></div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-800">{healthData.filter(d => d.health_color === 'yellow').length}</div>
                        <div className="text-xs text-gray-500">Precaución</div>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="bg-green-100 p-2 md:p-3 rounded-full text-green-600"><CheckCircle size={20} /></div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-800">{healthData.filter(d => d.health_color === 'green').length}</div>
                        <div className="text-xs text-gray-500">Operativos</div>
                    </div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border flex items-center gap-3">
                    <div className="bg-blue-100 p-2 md:p-3 rounded-full text-blue-600"><Activity size={20} /></div>
                    <div>
                        <div className="text-xl md:text-2xl font-bold text-gray-800">{history.filter(h => h.estado === 'PROGRAMADO').length}</div>
                        <div className="text-xs text-gray-500">Programados</div>
                    </div>
                </div>
            </div>

            {/* Health Grid */}
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-4 flex items-center gap-2"><Truck size={20} /> Estado de Salud</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {healthData.map(vehicle => (
                    <div key={vehicle.id} className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${vehicle.health_color === 'red' ? 'border-l-red-500' : vehicle.health_color === 'yellow' ? 'border-l-yellow-400' : 'border-l-green-500'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-800">{vehicle.placa}</h4>
                                <p className="text-xs text-gray-500">{vehicle.marca} {vehicle.modelo}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(vehicle.health_color)}`}>
                                {vehicle.health_status}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600"><span className="font-medium">Km:</span> {vehicle.kilometraje_actual}</div>
                        <div className="text-xs text-gray-500 mt-1">{vehicle.health_msg}</div>
                    </div>
                ))}
            </div>

            {/* History - Card based for mobile */}
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={20} /> Historial y Programación</h3>
            <div className="space-y-4">
                {history.map(record => (
                    <div key={record.id} className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-bold text-gray-800">{record.placa}</span>
                                    <span className="text-xs text-gray-400">{record.marca}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${record.estado === 'COMPLETADO' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                        {record.estado}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${record.tipo_mantenimiento === 'Preventivo' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {record.tipo_mantenimiento}
                                    </span>
                                    <span className="text-sm text-gray-700">{record.descripcion}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(record.fecha_programada).toLocaleDateString()}</span>
                                    {record.taller_proveedor && <span>{record.taller_proveedor}</span>}
                                    {record.costo_total && <span className="flex items-center gap-1"><DollarSign size={12} /> S/. {record.costo_total}</span>}
                                </div>
                            </div>
                            {record.estado !== 'COMPLETADO' && (
                                <div className="flex gap-2 ml-2">
                                    <button onClick={() => handleComplete(record)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Completar">
                                        <CheckSquare size={18} />
                                    </button>
                                    <button onClick={() => handleEdit(record)} className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100" title="Editar">
                                        <Edit2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                        No hay registros de mantenimiento.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 my-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{isCompletingId ? 'Finalizar' : editingId ? 'Editar' : 'Programar'} Mantenimiento</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editingId && !isCompletingId && (
                                <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="w-full p-2 border rounded" required>
                                    <option value="">Seleccione Vehículo...</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.placa} - {v.marca}</option>)}
                                </select>
                            )}
                            <select name="tipo_mantenimiento" value={formData.tipo_mantenimiento} onChange={handleChange} className="w-full p-2 border rounded">
                                <option value="Preventivo">Preventivo</option>
                                <option value="Correctivo">Correctivo</option>
                            </select>
                            <select value={MAINTENANCE_TYPES.includes(formData.descripcion) ? formData.descripcion : 'Otro'}
                                onChange={(e) => { if (e.target.value === 'Otro') setFormData({ ...formData, descripcion: '' }); else setFormData({ ...formData, descripcion: e.target.value }); }}
                                className="w-full p-2 border rounded">
                                {MAINTENANCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Detalle del servicio" className="w-full p-2 border rounded" required />
                            <div className="grid grid-cols-2 gap-4">
                                <input name={isCompletingId ? "fecha_real_fin" : "fecha_programada"} type="date" value={isCompletingId ? (formData.fecha_real_fin || '') : formData.fecha_programada} onChange={handleChange} className="w-full p-2 border rounded" />
                                <input name="costo_total" type="number" placeholder="Costo S/." value={formData.costo_total} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                            <input name="taller_proveedor" placeholder="Taller / Proveedor" value={formData.taller_proveedor} onChange={handleChange} className="w-full p-2 border rounded" />
                            {isCompletingId && (
                                <textarea name="observaciones" value={formData.observaciones || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Observaciones finales" />
                            )}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
                                <button type="submit" className={`flex-1 p-2 text-white rounded ${isCompletingId ? 'bg-green-600' : 'bg-gray-900'}`}>
                                    {isCompletingId ? 'Completar' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
