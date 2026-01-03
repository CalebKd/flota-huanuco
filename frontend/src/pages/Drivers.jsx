import React, { useState, useEffect } from 'react';
import { User, Phone, CreditCard, Edit2, Trash2, Plus } from 'lucide-react';

const API_HOST = `http://${window.location.hostname}:3000`;

const Drivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nombre_completo: '', dni: '', tipo_licencia: 'A-I', telefono: '', estado: 'ACTIVO' });

    const fetchDrivers = () => {
        fetch(`${API_HOST}/api/drivers`).then(res => res.json()).then(data => setDrivers(data)).catch(err => console.error(err));
    };

    useEffect(() => { fetchDrivers(); }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleEdit = (driver) => {
        setFormData({ nombre_completo: driver.nombre_completo, dni: driver.dni, tipo_licencia: driver.tipo_licencia, telefono: driver.telefono || '', estado: driver.estado || 'ACTIVO' });
        setEditingId(driver.id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar conductor?')) return;
        await fetch(`${API_HOST}/api/drivers/${id}`, { method: 'DELETE' });
        fetchDrivers();
    };

    const openNewModal = () => {
        setFormData({ nombre_completo: '', dni: '', tipo_licencia: 'A-I', telefono: '', estado: 'ACTIVO' });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_HOST}/api/drivers/${editingId}` : `${API_HOST}/api/drivers`;
        const res = await fetch(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
        if (res.ok) { setIsModalOpen(false); fetchDrivers(); }
    };

    const getStatusColor = (estado) => {
        switch (estado) {
            case 'ACTIVO': return 'bg-green-100 text-green-700';
            case 'VACACIONES': return 'bg-blue-100 text-blue-700';
            case 'LICENCIA': return 'bg-orange-100 text-orange-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Conductores</h1>
                    <p className="text-gray-500 text-sm mt-1">Gestiona el personal</p>
                </div>
                <button onClick={openNewModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
                    <Plus size={18} /> Nuevo
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Nuevo'} Conductor</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="nombre_completo" placeholder="Nombre Completo" required className="w-full p-2 border rounded" value={formData.nombre_completo} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <input name="dni" placeholder="DNI" required maxLength="8" className="w-full p-2 border rounded" value={formData.dni} onChange={handleChange} />
                                <input name="telefono" placeholder="Teléfono" className="w-full p-2 border rounded" value={formData.telefono} onChange={handleChange} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select name="tipo_licencia" className="w-full p-2 border rounded" value={formData.tipo_licencia} onChange={handleChange}>
                                    <option value="A-I">A-I</option>
                                    <option value="A-IIa">A-IIa</option>
                                    <option value="A-IIb">A-IIb</option>
                                    <option value="A-IIIa">A-IIIa</option>
                                    <option value="A-IIIb">A-IIIb</option>
                                    <option value="B-IIc">B-IIc</option>
                                </select>
                                <select name="estado" className="w-full p-2 border rounded" value={formData.estado} onChange={handleChange}>
                                    <option value="ACTIVO">ACTIVO</option>
                                    <option value="VACACIONES">VACACIONES</option>
                                    <option value="LICENCIA">LICENCIA</option>
                                    <option value="INACTIVO">INACTIVO</option>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map(d => (
                    <div key={d.id} className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2 bg-blue-50 rounded-full"><User className="w-8 h-8 text-blue-600" /></div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.estado)}`}>{d.estado}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{d.nombre_completo}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm"><CreditCard size={14} /> DNI: {d.dni}</div>
                        <div className="mt-3 space-y-1 text-sm">
                            <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Licencia</span><span className="font-semibold">{d.tipo_licencia}</span></div>
                            <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Tel.</span><span className="font-semibold flex items-center gap-1"><Phone size={12} />{d.telefono || '-'}</span></div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                            <button onClick={() => handleEdit(d)} className="flex-1 flex items-center justify-center gap-1 p-2 border rounded text-sm"><Edit2 size={14} /> Editar</button>
                            <button onClick={() => handleDelete(d.id)} className="flex-1 flex items-center justify-center gap-1 p-2 border border-red-100 text-red-600 rounded text-sm"><Trash2 size={14} /> Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Drivers;
