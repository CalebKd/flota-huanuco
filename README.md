# Sistema de Gestión de Mantenimiento de Flota (Municipalidad de Huánuco)

Este proyecto consta de un Backend (API Node.js) y un Frontend (React + Vite).

## Requisitos Previos

Necesitas tener instalado **Node.js** en tu computadora.
Descárgalo aquí: [https://nodejs.org/](https://nodejs.org/) (versión LTS recomendada).

## Instrucciones de Instalación

Sigue estos pasos para configurar el proyecto:

### 1. Configurar Base de Datos
1. Asegúrate de tener PostgreSQL instalado y corriendo.
2. Crea una base de datos llamada `flota_huanuco`.
3. Ejecuta el script `database.sql` (ubicado en la raíz de este proyecto) en tu base de datos para crear las tablas.

### 2. Configurar Backend
1. Abre una terminal en la carpeta `backend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Verifica el archivo `.env` y ajusta las credenciales de tu base de datos si es necesario (DB_PASSWORD, etc).
4. Inicia el servidor:
   ```bash
   npm start
   ```
   El servidor correrá en `http://localhost:3000`.

### 3. Configurar Frontend
1. Abre otra terminal en la carpeta `frontend`.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación web:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en la URL que aparece (usualmente `http://localhost:5173`).

## Estructura del Proyecto

*   `/backend`: API RESTful con Express y PostgreSQL.
*   `/frontend`: Interfaz de usuario con React y TailwindCSS.
*   `database.sql`: Script de creación de tablas.

## Funcionalidades Implementadas (Código Base)

*   Dashboard Principal (UI).
*   Listado de Vehículos (conectado a API).
*   Navegación básica (Rutas, Conductores, Mantenimiento).
