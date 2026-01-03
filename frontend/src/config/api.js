// API Configuration - Change this IP to your computer's local IP
const API_HOST = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : `http://${window.location.hostname}:3000`;

export default API_HOST;
