// API Base URL Configuration
// Supports both development and production environments

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production"
    ? "https://gameboxd-backend.vercel.app/api"
    : "http://localhost:3000/api");

export default API_BASE_URL;
