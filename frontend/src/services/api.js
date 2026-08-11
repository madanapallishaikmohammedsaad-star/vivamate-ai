import axios from "axios";

const api = axios.create({
  baseURL: "",
});

// Attach the OpenRouter API key from localStorage to every request
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem("vivamate_api_key");
  if (apiKey) {
    config.headers["X-API-Key"] = apiKey;
  }
  return config;
});

export default api;
