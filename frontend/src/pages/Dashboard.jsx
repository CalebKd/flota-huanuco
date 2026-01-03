import React, { useState, useEffect } from 'react';
import { DollarSign, PieChart, TrendingUp, Truck, AlertCircle, RefreshCw } from 'lucide-react';

// Dynamic API host - works on localhost and network
import API_HOST from '../config/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        financial: { total_cost: 0 },
        distribution: [],
        top_vehicles: []
    });
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_HOST}/api/dashboard/stats`);
            const data = await res.json();
            setStats(data);
            setLastUpdate(new Date());
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(() => { fetchStats(); }, 10000);
        return () => clearInterval(interval);
    }, []);

    const getPieData = () => {
        const total = stats.distribution.reduce((acc, curr) => acc + parseInt(curr.count), 0);
        if (total === 0) return [];
        let currentAngle = 0;
        return stats.distribution.map((item) => {
            const percentage = (parseInt(item.count) / total) * 100;
            const angle = (percentage / 100) * 360;
            const path = describeArc(50, 50, 45, currentAngle, currentAngle + angle);
            currentAngle += angle;
            return { ...item, path, color: item.tipo_mantenimiento === 'Preventivo' ? '#10B981' : '#F59E0B' };
        });
    };

    const describeArc = (x, y, radius, startAngle, endAngle) => {
        const start = polarToCartesian(x, y, radius, endAngle);
        const end = polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return ["M", start.x, start.y, "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, "L", x, y, "L", start.x, start.y].join(" ");
    }

    const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return { x: centerX + (radius * Math.cos(angleInRadians)), y: centerY + (radius * Math.sin(angleInRadians)) };
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Resumen Ejecutivo</h1>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <RefreshCw size={14} className={loading ? 'animate-spin text-blue-500' : ''} />
                    <span>Actualizado: {lastUpdate.toLocaleTimeString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">Inversión Total</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">S/. {Number(stats.financial.total_cost).toLocaleString()}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 md:p-4 rounded-full text-blue-600"><DollarSign size={24} /></div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">Mantenimientos</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{stats.distribution.reduce((acc, curr) => acc + parseInt(curr.count), 0)}</h3>
                    </div>
                    <div className="bg-purple-50 p-3 md:p-4 rounded-full text-purple-600"><TrendingUp size={24} /></div>
                </div>
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sm:col-span-2 md:col-span-1">
                    <div>
                        <p className="text-xs md:text-sm font-medium text-gray-500 mb-1">Mayor Inversión</p>
                        <h3 className="text-xl font-bold text-gray-900 truncate max-w-[150px]">{stats.top_vehicles[0]?.placa || 'N/A'}</h3>
                        <p className="text-xs text-gray-400">{stats.top_vehicles[0]?.marca}</p>
                    </div>
                    <div className="bg-orange-50 p-3 md:p-4 rounded-full text-orange-600"><Truck size={24} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                        <PieChart size={20} className="text-gray-400" /> Preventivo vs Correctivo
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-8">
                        <div className="relative w-36 h-36 md:w-48 md:h-48">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                {getPieData().map((slice, i) => (<path key={i} d={slice.path} fill={slice.color} stroke="white" strokeWidth="2" />))}
                                {stats.distribution.length === 0 && <circle cx="50" cy="50" r="45" fill="#E5E7EB" />}
                            </svg>
                        </div>
                        <div className="space-y-3">
                            {stats.distribution.map(d => (
                                <div key={d.tipo_mantenimiento} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${d.tipo_mantenimiento === 'Preventivo' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    <span className="text-sm font-semibold text-gray-700">{d.tipo_mantenimiento}</span>
                                    <span className="text-gray-500 text-sm">({d.count})</span>
                                </div>
                            ))}
                            {stats.distribution.length === 0 && <span className="text-gray-400 text-sm">Sin datos aún</span>}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20} className="text-gray-400" /> Mayor Gasto
                    </h3>
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 md:px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Placa</th>
                                    <th className="px-3 md:px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Marca</th>
                                    <th className="px-3 md:px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {stats.top_vehicles.map((v, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-3 md:px-4 py-3 text-sm font-medium text-gray-900">{v.placa}</td>
                                        <td className="px-3 md:px-4 py-3 text-sm text-gray-500">{v.marca}</td>
                                        <td className="px-3 md:px-4 py-3 text-sm font-bold text-gray-900 text-right">S/. {Number(v.total_spent).toLocaleString()}</td>
                                    </tr>
                                ))}
                                {stats.top_vehicles.length === 0 && (<tr><td colSpan="3" className="px-4 py-8 text-center text-gray-400 text-sm">Sin datos</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
