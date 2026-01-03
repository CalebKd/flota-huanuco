// API Configuration
// Cuando estamos en localhost, usa localhost (o la IP local para móviles)
// Cuando estamos en producción (Vercel), usa la URL de Render

const API_HOST = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168.')
    ? (window.location.hostname === 'localhost' ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`)
    : 'https://flota-huanuco-api.onrender.com';

console.log("🚀 Flota App Config Loaded. API Host:", API_HOST);

export default API_HOST;
