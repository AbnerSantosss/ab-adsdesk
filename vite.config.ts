import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import { emailApi } from './server/vitePlugin.ts';

export default defineConfig(({ mode }) => {
  // Prefixo vazio: lê também SMTP_*, que ficam só no Node. O navegador só recebe VITE_*.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), emailApi(env)],
    server: {
      // Ambientes que editam arquivos em lote (ex.: AI Studio) podem desligar o HMR com DISABLE_HMR=true.
      hmr: env.DISABLE_HMR !== 'true',
      watch: env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
