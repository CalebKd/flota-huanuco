const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Middleware
app.use(cors({
    origin: '*', // Permitir todos los orígenes temporalmente para debugging
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes

// 1. Get All Vehicles
app.get('/api/vehicles', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM vehicles ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Create Vehicle
app.post('/api/vehicles', async (req, res) => {
    const { placa, marca, modelo, tipo, kilometraje_actual } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO vehicles (placa, marca, modelo, tipo, kilometraje_actual) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [placa, marca, modelo, tipo, kilometraje_actual || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 3. Update Vehicle
app.put('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const { placa, marca, modelo, tipo, estado } = req.body;
    try {
        const result = await db.query(
            'UPDATE vehicles SET placa = $1, marca = $2, modelo = $3, tipo = $4, estado = $5 WHERE id = $6 RETURNING *',
            [placa, marca, modelo, tipo, estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 4. Delete Vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vehicle not found' });
        }
        res.json({ message: 'Vehicle deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- DRIVERS ROUTES ---

// 5. Get All Drivers
app.get('/api/drivers', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM drivers ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 6. Create Driver
app.post('/api/drivers', async (req, res) => {
    const { nombre_completo, dni, tipo_licencia, telefono } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO drivers (nombre_completo, dni, tipo_licencia, telefono) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre_completo, dni, tipo_licencia, telefono]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 7. Update Driver
app.put('/api/drivers/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre_completo, dni, tipo_licencia, telefono, estado } = req.body;
    try {
        const result = await db.query(
            'UPDATE drivers SET nombre_completo = $1, dni = $2, tipo_licencia = $3, telefono = $4, estado = $5 WHERE id = $6 RETURNING *',
            [nombre_completo, dni, tipo_licencia, telefono, estado, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 8. Delete Driver
app.delete('/api/drivers/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM drivers WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Driver not found' });
        }
        res.json({ message: 'Driver deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- ASSIGNMENTS ROUTES ---

// 9. Get All Assignments
app.get('/api/assignments', async (req, res) => {
    try {
        const query = `
            SELECT ra.id, ra.fecha_asignacion, ra.estado, ra.hora_inicio, ra.hora_fin, ra.turno,
                   v.id as vehicle_id, v.placa, v.marca, v.modelo, v.tipo as vehicle_type,
                   d.id as driver_id, d.nombre_completo, d.tipo_licencia, d.estado as driver_status,
                   r.id as route_id, r.nombre as route_name, r.tipo_residuo
            FROM route_assignments ra
            JOIN vehicles v ON ra.vehicle_id = v.id
            JOIN drivers d ON ra.driver_id = d.id
            LEFT JOIN routes r ON ra.route_id = r.id
            ORDER BY ra.id DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 10. Create Assignment
app.post('/api/assignments', async (req, res) => {
    const { vehicle_id, driver_id, route_id, fecha_asignacion, estado, turno } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO route_assignments (vehicle_id, driver_id, route_id, fecha_asignacion, estado, turno) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [vehicle_id, driver_id, route_id || null, fecha_asignacion || new Date(), estado || 'PENDIENTE', turno || 'Mañana']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 11. Delete Assignment
app.delete('/api/assignments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM route_assignments WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }
        res.json({ message: 'Assignment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 11a. Start Route
app.put('/api/assignments/:id/start', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            "UPDATE route_assignments SET estado = 'EN_RUTA', hora_inicio = CURRENT_TIME WHERE id = $1 RETURNING *",
            [id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 11b. Finish Route (Move to History + Update KM)
app.post('/api/assignments/:id/finish', async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT ra.*, v.placa, d.nombre_completo, r.nombre as route_name, r.distancia_km 
            FROM route_assignments ra 
            JOIN vehicles v ON ra.vehicle_id = v.id
            JOIN drivers d ON ra.driver_id = d.id
            LEFT JOIN routes r ON ra.route_id = r.id
            WHERE ra.id = $1
        `;
        const data = await db.query(query, [id]);
        if (data.rows.length === 0) return res.status(404).json({ error: 'Not found' });

        const item = data.rows[0];
        const kmEx = parseFloat(item.distancia_km) || 0;

        await db.query('UPDATE vehicles SET kilometraje_actual = COALESCE(kilometraje_actual, 0) + $1 WHERE id = $2', [kmEx, item.vehicle_id]);

        await db.query(
            'INSERT INTO route_history (route_name, driver_name, vehicle_plate, turno, fecha_inicio, fecha_fin, description) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)',
            [item.route_name || 'Ruta Sin Nombre', item.nombre_completo, item.placa, item.turno || 'Mañana', item.fecha_asignacion, `Ruta finalizada. +${kmEx}km`]
        );

        await db.query('DELETE FROM route_assignments WHERE id = $1', [id]);

        res.json({ message: 'Route finished, mileage updated, and archived.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- HISTORY ROUTES ---
app.get('/api/history', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM route_history ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- MAINTENANCE ROUTES ---

// 16. Get Maintenance Records
app.get('/api/maintenance', async (req, res) => {
    try {
        const query = `
            SELECT m.*, v.placa, v.marca, v.modelo, v.tipo, v.kilometraje_actual
            FROM maintenance_records m
            JOIN vehicles v ON m.vehicle_id = v.id
            ORDER BY m.fecha_programada DESC
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 17. Create Maintenance Record
app.post('/api/maintenance', async (req, res) => {
    const { vehicle_id, tipo_mantenimiento, descripcion, fecha_programada, costo_total, taller_proveedor, estado } = req.body;
    try {
        const vRes = await db.query('SELECT kilometraje_actual FROM vehicles WHERE id = $1', [vehicle_id]);
        const kmAtMoment = vRes.rows[0]?.kilometraje_actual || 0;

        const result = await db.query(
            'INSERT INTO maintenance_records (vehicle_id, tipo_mantenimiento, descripcion, fecha_programada, costo_total, taller_proveedor, estado, kilometraje_al_momento) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [vehicle_id, tipo_mantenimiento, descripcion, fecha_programada, costo_total || 0, taller_proveedor, estado || 'PROGRAMADO', kmAtMoment]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 18. Update Maintenance Record (e.g. Complete it)
app.put('/api/maintenance/:id', async (req, res) => {
    const { id } = req.params;
    const { estado, costo_total, fecha_real_fin, observaciones } = req.body;
    try {
        let updateQuery = 'UPDATE maintenance_records SET estado = $1, costo_total = $2, fecha_real_fin = $3, observaciones = $4 WHERE id = $5 RETURNING *';
        let params = [estado, costo_total, fecha_real_fin, observaciones, id];

        // If completing, update the mileage snapshot to current vehicle mileage
        if (estado === 'COMPLETADO') {
            const mRes = await db.query('SELECT vehicle_id FROM maintenance_records WHERE id = $1', [id]);
            if (mRes.rows.length > 0) {
                const vehicleId = mRes.rows[0].vehicle_id;
                const vRes = await db.query('SELECT kilometraje_actual FROM vehicles WHERE id = $1', [vehicleId]);
                const currentKm = vRes.rows[0]?.kilometraje_actual || 0;

                updateQuery = 'UPDATE maintenance_records SET estado = $1, costo_total = $2, fecha_real_fin = $3, observaciones = $4, kilometraje_al_momento = $5 WHERE id = $6 RETURNING *';
                params = [estado, costo_total, fecha_real_fin, observaciones, currentKm, id];
            }
        }

        const result = await db.query(updateQuery, params);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 19. Get Fleet Health (Semáforo) - Now counts ANY completed maintenance
app.get('/api/maintenance/health', async (req, res) => {
    try {
        const query = `
            SELECT v.id, v.placa, v.marca, v.modelo, v.tipo, v.kilometraje_actual, v.estado as vehicle_status,
                   MAX(m.fecha_programada) as ultimo_mantenimiento_fecha,
                   MAX(m.kilometraje_al_momento) as ultimo_mantenimiento_km
            FROM vehicles v
            LEFT JOIN maintenance_records m ON v.id = m.vehicle_id AND m.estado = 'COMPLETADO'
            GROUP BY v.id
        `;
        const result = await db.query(query);

        const healthData = result.rows.map(v => {
            const kmSince = v.kilometraje_actual - (v.ultimo_mantenimiento_km || 0);
            const daysSince = v.ultimo_mantenimiento_fecha
                ? (new Date() - new Date(v.ultimo_mantenimiento_fecha)) / (1000 * 60 * 60 * 24)
                : 999;

            let status = 'BIEN';
            let color = 'green';
            let msg = 'Operativo y al día';

            if (kmSince >= 5000 || daysSince >= 90) {
                status = 'CRITICO';
                color = 'red';
                msg = kmSince >= 5000 ? `Excede km (${kmSince})` : `Excede tiempo (${Math.floor(daysSince)} días)`;
            } else if (kmSince >= 4000 || daysSince >= 75) {
                status = 'PRECAUCION';
                color = 'yellow';
                msg = 'Próximo a mantenimiento';
            }

            return { ...v, health_status: status, health_color: color, health_msg: msg, km_since: kmSince };
        });

        res.json(healthData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- ROUTES ROUTES ---

// 12. Get All Routes
app.get('/api/routes', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM routes ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 13. Create Route
app.post('/api/routes', async (req, res) => {
    const { nombre, descripcion, distancia_km, tipo_residuo } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO routes (nombre, descripcion, distancia_km, tipo_residuo) VALUES ($1, $2, $3, $4) RETURNING *',
            [nombre, descripcion, distancia_km, tipo_residuo]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 14. Update Route
app.put('/api/routes/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, distancia_km, tipo_residuo } = req.body;
    try {
        const result = await db.query(
            'UPDATE routes SET nombre = $1, descripcion = $2, distancia_km = $3, tipo_residuo = $4 WHERE id = $5 RETURNING *',
            [nombre, descripcion, distancia_km, tipo_residuo, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 15. Delete Route
app.delete('/api/routes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM routes WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Route not found' });
        }
        res.json({ message: 'Route deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// --- DASHBOARD STATS ---

// 20. Dashboard Aggregated Stats
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        // 1. Total Spent
        const costRes = await db.query("SELECT COALESCE(SUM(costo_total), 0) as total FROM maintenance_records WHERE estado = 'COMPLETADO'");
        const totalCost = costRes.rows[0].total || 0;

        // 2. Counts by Type (Preventivo vs Correctivo)
        const typeRes = await db.query("SELECT tipo_mantenimiento, COUNT(*) as count FROM maintenance_records GROUP BY tipo_mantenimiento");

        // 3. Top 5 Most Expensive Vehicles
        const topRes = await db.query(`
            SELECT v.placa, v.marca, COALESCE(SUM(m.costo_total), 0) as total_spent 
            FROM maintenance_records m 
            JOIN vehicles v ON m.vehicle_id = v.id 
            WHERE m.estado = 'COMPLETADO' 
            GROUP BY v.id, v.placa, v.marca 
            ORDER BY total_spent DESC 
            LIMIT 5
        `);

        res.json({
            financial: { total_cost: totalCost },
            distribution: typeRes.rows,
            top_vehicles: topRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Basic Health Check
app.get('/', (req, res) => {
    res.send('Fleet Maintenance API is running');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
