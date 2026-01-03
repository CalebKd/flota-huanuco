import React, { useState, useEffect } from 'react';
import { Truck, Car, Bike, Edit2, Trash2, Plus } from 'lucide-react';
import API_HOST from '../config/api';

const Vehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        placa: '', marca: '', modelo: '', tipo: 'Strong con cabina roja', kilometraje_actual: '', estado: 'OPERATIVO'
    });

    // Debug & Error States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVehicles = () => {
        setLoading(true);
        setError(null);

        fetch(`${API_HOST}/api/vehicles`)
            .then(res => {
                if (!res.ok) throw new Error(`Server Error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setVehicles(data);
                } else {
                    console.error("Data validation failed:", data);
                    setError(`Error de datos recibidos: ${JSON.stringify(data)}`);
                    setVehicles([]);
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setError(`Error de conexión: ${err.message}. Intentando conectar a: ${API_HOST}/api/vehicles`);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchVehicles(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEdit = (vehicle) => {
        setFormData({
            placa: vehicle.placa,
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            tipo: vehicle.tipo,
            kilometraje_actual: vehicle.kilometraje_actual,
            estado: vehicle.estado || 'OPERATIVO'
        });
        setEditingId(vehicle.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar vehículo?')) return;
        try {
            await fetch(`${API_HOST}/api/vehicles/${id}`, { method: 'DELETE' });
            fetchVehicles();
        } catch (err) {
            alert("Error eliminando: " + err.message);
        }
    };

    const openNewModal = () => {
        setFormData({ placa: '', marca: '', modelo: '', tipo: 'Strong con cabina roja', kilometraje_actual: '', estado: 'OPERATIVO' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_HOST}/api/vehicles/${editingId}` : `${API_HOST}/api/vehicles`;
        try {
            const res = await fetch(url, {
                method: editingId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsModalOpen(false);
                fetchVehicles();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(`Error guardando: ${errData.error || res.statusText}`);
            }
        } catch (err) {
            alert(`Error de red: ${err.message}`);
        }
    };

    const getVehicleIcon = (tipo) => {
        const type = String(tipo || '');
        if (type.includes('Camión')) return <Truck className="w-10 h-10 text-slate-700" />;
        if (type.includes('Strong') || type.includes('Moto') || type.includes('Trimóvil')) {
            if (type.includes('roja')) return <Bike className="w-10 h-10 text-red-600" />;
            if (type.includes('azul')) return <Bike className="w-10 h-10 text-blue-600" />;
            return <Bike className="w-10 h-10 text-orange-500" />;
        }
        if (type.includes('Camioneta')) return <Car className="w-10 h-10 text-emerald-600" />;
        return <Truck className="w-10 h-10 text-gray-400" />;
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'OPERATIVO': return 'bg-green-100 text-green-700';
            case 'EN_MANTENIMIENTO': return 'bg-orange-100 text-orange-700';
            case 'BAJA': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Flota Vehicular</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona el inventario de unidades</p>
                </div>
                <button onClick={openNewModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm justify-center w-full sm:w-auto">
                    <Plus size={18} /> Nuevo
                </button>
            </div>

            {/* Debug Error Message */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm">
                    <p className="font-bold">Ha ocurrido un problema:</p>
                    <p>{error}</p>
                    <button
                        onClick={fetchVehicles}
                        className="mt-2 text-sm bg-red-200 hover:bg-red-300 px-3 py-1 rounded transition"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl w-full max-w-md p-6 my-8">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Nuevo'} Vehículo</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="placa" placeholder="Placa" required className="w-full p-2 border rounded uppercase" value={formData.placa} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="marca" placeholder="Marca" required className="w-full p-2 border rounded" value={formData.marca} onChange={handleChange} />
                                <input name="modelo" placeholder="Modelo" required className="w-full p-2 border rounded" value={formData.modelo} onChange={handleChange} />
                            </div>
                            <select name="tipo" className="w-full p-2 border rounded" value={formData.tipo} onChange={handleChange}>
                                <option value="Strong con cabina roja">Strong cabina roja</option>
                                <option value="Strong azul">Strong azul</option>
                                <option value="Camión Baranda">Camión Baranda</option>
                                <option value="Camión compactador">Camión compactador</option>
                                <option value="Trimóvil de carga">Trimóvil</option>
                                <option value="Camioneta">Camioneta</option>
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input name="kilometraje_actual" type="number" placeholder="Kilometraje" className="w-full p-2 border rounded" value={formData.kilometraje_actual} onChange={handleChange} />
                                <select name="estado" className="w-full p-2 border rounded" value={formData.estado} onChange={handleChange}>
                                    <option value="OPERATIVO">OPERATIVO</option>
                                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                                    <option value="BAJA">BAJA</option>
                                </select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 border rounded">Cancelar</button>
                                <button type="submit" className="flex-1 p-2 bg-blue-600 text-white rounded">{editingId ? 'Actualizar' : 'Guardar'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
                    <p className="text-gray-500">Cargando flota...</p>
                </div>
            ) : vehicles.length === 0 && !error ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                        <Truck className="text-gray-400" size={32} />
                    </div>
                    <p className="text-gray-500 mb-2 font-medium">Todavía no hay vehículos registrados</p>
                    <p className="text-sm text-gray-400">Usa el botón "Nuevo" para registrar el primero</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map(v => (
                        <div key={v.id} className="bg-white rounded-xl shadow-sm border p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-gray-50 rounded-lg">{getVehicleIcon(v.tipo)}</div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(v.estado)}`}>{v.estado}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">{v.placa}</h3>
                            <p className="text-gray-500 text-sm">{v.marca} {v.modelo}</p>
                            <p className="text-xs text-blue-600 mt-1">{v.tipo}</p>
                            <div className="mt-3 text-sm text-gray-600"><span className="font-semibold">{v.kilometraje_actual || 0}</span> km</div>
                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <button onClick={() => handleEdit(v)} className="flex-1 flex items-center justify-center gap-1 p-2 border rounded text-sm hover:bg-gray-50"><Edit2 size={14} /> Editar</button>
                                <button onClick={() => handleDelete(v.id)} className="flex-1 flex items-center justify-center gap-1 p-2 border border-red-100 text-red-600 rounded text-sm hover:bg-red-50"><Trash2 size={14} /> Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Vehicles;
