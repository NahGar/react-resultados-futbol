import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// Obtener el equivalente de __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno usando el directorio actual
  const env = loadEnv(mode, path.resolve(__dirname), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'X-Auth-Token': env.VITE_API_KEY
          }
        }
      }
    },
    define: {
      'process.env': {}
    }
  };
});