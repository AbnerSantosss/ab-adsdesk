import type { Plugin } from 'vite';
import { createEmailMiddleware } from './email.ts';

/** Expõe /api/email/* no servidor do Vite (dev e preview). */
export function emailApi(env: Record<string, string | undefined>): Plugin {
  const middleware = createEmailMiddleware(env);
  return {
    name: 'ab-adsdesk-email-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
