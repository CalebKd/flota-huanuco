import React, { useState, useEffect } from 'react';
import { User, Truck, ArrowRight, Calendar, Trash2, Plus, Bike, Car } from 'lucide-react';

const API_HOST = `http://${window.location.hostname}:3000`;

const Assignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        driver_id: '',
        vehicle_id: '',
        fecha_asignacion: new Date().toISOString().split('T')[0],
        estado: 'VIGENTE'
    });

    // Fetch Initial Data
    useEffect(() => {
        fetchAssignments();
        fetchDrivers();
        fetchVehicles();
    }, []);

    const fetchAssignments = () => {
        fetch(`${API_HOST}/api/assignments`)
            .then(res => res.json())
            .then(data => setAssignments(data))
            .catch(err => console.error(err));
    };

    const fetchDrivers = () => {
        fetch(`${API_HOST}/api/drivers`)
            .then(res => res.json())
            .then(data => setDrivers(data)) // Ideally filter by status 'ACTIVO'
            .catch(err => console.error(err));
    };

    const fetchVehicles = () => {
        fetch(`${API_HOST}/api/vehicles`)
            .then(res => res.json())
            .then(data => setVehicles(data)) // Ideally filter by status 'OPERATIVO'
            .catch(err => console.error(err));
    };

    const validateLicense = (driverId, vehicleId) => {
        const driver = drivers.find(d => d.id == driverId);
        const vehicle = vehicles.find(v => v.id == vehicleId);

        if (!driver || !vehicle) return null;

        const lic = driver.tipo_licencia;
        const type = vehicle.tipo;

        // Reglas de Negocio (Perú)
        // 1. Motos y Trimóviles requieren Licencia Clase B
        if (type.includes('Strong') || type.includes('Moto') || type.includes('Trimóvil')) {
            if (!lic.startsWith('B')) {
                return `El vehículo '${type}' requiere licencia de Moto (Clase B). El conductor tiene ${lic}.`;
            }
        }

        // 2. Camiones Pesados requieren A-IIIb o superior
        if (type.includes('compactador')) {
            if (!['A-IIIb', 'A-IIIc'].includes(lic)) {
                return `El Camión Compactador requiere licencia A-IIIb o superior. El conductor tiene ${lic}.`;
            }
        }

        // 3. Camiones Medianos (Baranda) requieren A-IIb o superior
        if (type.includes('Baranda')) {
            if (['A-I', 'A-IIa'].includes(lic)) { // Las licencias menores no pueden
                return `El Camión Baranda requiere licencia A-IIb o superior. El conductor tiene ${lic}.`;
            }
        }

        return null; // Todo OK
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar Licencia antes de enviar
        const errorMsg = validateLicense(formData.driver_id, formData.vehicle_id);
        if (errorMsg) {
            alert("⚠️ Restricción de Licencia\n\n" + errorMsg);
            return;
        }

        try {
            const response = await fetch(`${API_HOST}/api/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setIsModalOpen(false);
                fetchAssignments();
                setFormData({ ...formData, driver_id: '', vehicle_id: '' });
            } else {
                alert('Error al crear asignación');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar asignación?')) return;
        await fetch(`${API_HOST}/api/assignments/${id}`, { method: 'DELETE' });
        fetchAssignments();
    };

    const getVehicleIcon = (type) => {
        const tipo = String(type || '');
        if (tipo.includes('Camión')) return <Truck className="w-5 h-5 text-slate-600" />;
        if (tipo.includes('Moto') || tipo.includes('Strong')) return <Bike className="w-5 h-5 text-orange-600" />;
        return <Car className="w-5 h-5 text-green-600" />;
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">Asignaciones</h1>
                    <p className="text-gray-500 text-sm">Vincula conductores con sus vehículos</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 w-full sm:w-auto justify-center"
                >
                    <Plus size={20} /> Nueva Asignación
                </button>
            </div>

            {/* Assignments List (Horizontal Cards) */}
            <div className="space-y-4">
                {assignments.map(a => (
                    <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition hover:shadow-md flex flex-col md:flex-row items-center gap-6">
                        {/* Driver Side */}
                        <div className="flex-1 flex items-center gap-4 w-full md:w-auto">
                            <div className="bg-blue-50 p-3 rounded-full">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{a.nombre_completo}</h3>
                                <div className="text-xs text-gray-500 mt-1 flex gap-2">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded">Licencia {a.tipo_licencia}</span>
                                    <span className={a.driver_status === 'ACTIVO' ? 'text-green-600' : 'text-red-500'}>
                                        {a.driver_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Connection Arrow */}
                        <div className="hidden md:flex text-gray-300">
                            <ArrowRight size={24} />
                        </div>

                        {/* Vehicle Side */}
                        <div className="flex-1 flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                            <div className="bg-orange-50 p-3 rounded-full">
                                {getVehicleIcon(a.vehicle_type)}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 uppercase">{a.placa}</h3>
                                <p className="text-xs text-gray-500">{a.marca} {a.modelo}</p>
                            </div>
                        </div>

                        {/* Info & Actions */}
                        <div className="flex items-center gap-6 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} />
                                    {new Date(a.fecha_asignacion).toLocaleDateString()}
                                </div>
                                <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 mt-1 inline-block">
                                    {a.estado}
                                </span>
                            </div>
                            <button
                                onClick={() => handleDelete(a.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Eliminar asignación"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {assignments.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed text-gray-500">
                        No hay asignaciones vigentes.
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">Nueva Asignación</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Conductor</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.driver_id}
                                    onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccione Conductor...</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.nombre_completo} ({d.tipo_licencia})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                                <select
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    required
                                >
                                    <option value="">Seleccione Vehículo...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.placa} - {v.marca} ({v.tipo})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    value={formData.fecha_asignacion}
                                    onChange={e => setFormData({ ...formData, fecha_asignacion: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Asignar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
