-- Tabla: vehicles
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    kilometraje_actual DECIMAL(10, 2) DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'OPERATIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla: drivers
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(100) NOT NULL,
    dni VARCHAR(20) UNIQUE NOT NULL,
    tipo_licencia VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla: routes
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    distancia_km DECIMAL(10, 2),
    tipo_residuo VARCHAR(50) DEFAULT 'Orgánico',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla: route_assignments
CREATE TABLE IF NOT EXISTS route_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    route_id INTEGER REFERENCES routes(id),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    -- PENDIENTE, EN_RUTA
    turno VARCHAR(20) DEFAULT 'Mañana',
    hora_inicio TIME,
    hora_fin TIME
);
-- Tabla: route_history
CREATE TABLE IF NOT EXISTS route_history (
    id SERIAL PRIMARY KEY,
    route_name VARCHAR(100),
    driver_name VARCHAR(100),
    vehicle_plate VARCHAR(20),
    turno VARCHAR(20),
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);
-- Tabla: maintenance_records
CREATE TABLE IF NOT EXISTS maintenance_records (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    tipo_mantenimiento VARCHAR(50) NOT NULL,
    -- Preventivo, Correctivo
    descripcion TEXT,
    fecha_programada DATE NOT NULL,
    fecha_real_fin DATE,
    costo_total DECIMAL(10, 2) DEFAULT 0,
    taller_proveedor VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'PROGRAMADO',
    -- PROGRAMADO, COMPLETADO
    kilometraje_al_momento DECIMAL(10, 2),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Datos de Ejemplo (Opcional - Ejecutar si quieres datos iniciales)
INSERT INTO vehicles (placa, marca, modelo, tipo, kilometraje_actual)
VALUES ('EGM-123', 'Toyota', 'Hilux', 'Camioneta', 15000),
    ('W2R-456', 'Volvo', 'FMX', 'Compactador', 45000),
    (
        'X1T-789',
        'Mercedes',
        'Atego',
        'Cisterna',
        28000
    ) ON CONFLICT DO NOTHING;
INSERT INTO drivers (nombre_completo, dni, tipo_licencia, telefono)
VALUES ('Juan Pérez', '12345678', 'A-IIIc', '999888777'),
    ('Carlos Ruiz', '87654321', 'A-IIb', '999111222') ON CONFLICT DO NOTHING;
INSERT INTO routes (nombre, descripcion, distancia_km, tipo_residuo)
VALUES (
        'Ruta Centro',
        'Recolección plaza de armas y alrededores',
        12.5,
        'Orgánico'
    ),
    (
        'Ruta Amarilis',
        'Av. Colectora y zonas aledañas',
        18.2,
        'Inservible'
    ) ON CONFLICT DO NOTHING;