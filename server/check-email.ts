import { verifyEmailConfig } from './email.ts';

// Faz login no SMTP e sai, sem enviar e-mail. Uso: npm run email:check
console.log(await verifyEmailConfig(process.env));
