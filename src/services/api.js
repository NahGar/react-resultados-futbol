// Usamos el proxy local en desarrollo
const BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL;

// Tiempo de vida del caché (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

// Función para obtener datos con caché
const fetchWithCache = async (endpoint, options) => {
  const cacheKey = `fd-cache:${endpoint}`;
  const now = new Date().getTime();
  
  // 1. Intentar obtener del caché
  const cachedData = localStorage.getItem(cacheKey);
  
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    
    // Verificar si el caché es reciente
    if (now - timestamp < CACHE_TTL) {
      return data;
    }
  }

  try {
    // 2. Hacer solicitud a la API
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      let errorMsg = `Error ${response.status}`;
      
      if (response.status === 403) {
        errorMsg = 'API key inválida o no proporcionada';
      } else if (response.status === 429) {
        errorMsg = 'Límite de solicitudes excedido';
      }
      
      // Intentar usar caché expirado como respaldo
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
        console.warn(errorMsg + ". Usando caché expirado.");
        return data;
      }
      
      throw new Error(errorMsg);
    }
    
    const data = await response.json();
    
    // 3. Guardar en caché
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: now
    }));
    
    return data;
  } catch (error) {
    // 4. Manejo de errores con respaldo de caché
    if (cachedData) {
      const { data } = JSON.parse(cachedData);
      console.warn(`Error en solicitud: ${error.message}. Usando caché expirado.`);
      return data;
    }
    
    console.error("API Error:", error);
    throw error;
  }
};

// Limpieza de caché antiguo (más de 1 día)
const cleanOldCache = () => {
  const now = new Date().getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('fd-cache:')) {
      try {
        const cached = JSON.parse(localStorage.getItem(key));
        if (now - cached.timestamp > oneDay) {
          localStorage.removeItem(key);
        }
      } catch (e) { // eslint-disable-line no-unused-vars
        localStorage.removeItem(key);
      }
    }
  });
};

// Ejecutar limpieza al cargar el módulo
cleanOldCache();

// Función principal adaptada
export const fetchData = async (endpoint) => {
  return fetchWithCache(endpoint, {
    headers: {
      'X-Auth-Token': import.meta.env.DEV ? '' : import.meta.env.VITE_API_KEY
    }
  });
};

// Funciones específicas
export const getCompetitions = () => fetchData('/competitions?plan=TIER_ONE');
export const getTeams = (competitionId) => fetchData(`/competitions/${competitionId}/teams`);
export const getMatches = (competitionId, status = 'FINISHED') => 
  fetchData(`/competitions/${competitionId}/matches?status=${status}`);