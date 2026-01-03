-- Database Schema for Municipal Fleet Maintenance System

-- 1. Table: Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    tipo VARCHAR(50),
    kilometraje_actual DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'OPERATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: Drivers
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    tipo_licencia VARCHAR(10) NOT NULL,
    telefono VARCHAR(15),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: Routes
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    distancia_km DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: Route Assignments
CREATE TABLE IF NOT EXISTS route_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    route_id INTEGER REFERENCES routes(id),
    fecha_asignacion DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: Maintenance Records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    tipo_mantenimiento VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_programada DATE NOT NULL,
    fecha_real_inicio DATE,
    fecha_real_fin DATE,
    costo_total DECIMAL(10, 2),
    taller_proveedor VARCHAR(100),
    kilometraje_al_momento DECIMAL(10, 2),
    estado VARCHAR(20) DEFAULT 'PROGRAMADO',
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: Monthly KPIs
CREATE TABLE IF NOT EXISTS monthly_kpis (
    id SERIAL PRIMARY KEY,
    mes DATE NOT NULL,
    total_gasto_mantenimiento DECIMAL(12, 2),
    flota_disponibilidad_porcentaje DECIMAL(5, 2),
    km_recorridos_total DECIMAL(12, 2),
    mantenimientos_preventivos_count INTEGER,
    mantenimientos_correctivos_count INTEGER,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
