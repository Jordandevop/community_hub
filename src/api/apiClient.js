
const API_URL = import.meta.env.VITE_API_URL
const PROJECT_KEY= import.meta.env.VITE_PROJECT_KEY

export async function apiRequest(endpoint, options = {}) {

    const token = localStorage.getItem("token");

      const headers = {
        "Content-Type": "application/json",
        "X-Project-Key": PROJECT_KEY,
        ...options.headers,

      };

      if (token){
        headers['X-Auth-Token'] = token;
      }

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok) {
    
            throw new Error(data?.message || "Une erreur est survenue lors de la communication avec le serveur.");
        }

        return data

      } catch (error) {
        console.error(`[API Error] sur l'endpoint ${endpoint}:`, error.message);
        throw error;
      }
}
