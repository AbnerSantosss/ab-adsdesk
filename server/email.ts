import type { IncomingMessage, ServerResponse } from 'node:http';
import { createTransport } from 'nodemailer';

/**
 * Envio de e-mail pelo lado do servidor. As credenciais SMTP vêm do .env.local e
 * nunca chegam ao navegador: o front só chama /api/email/*.
 *
 * Hoje este handler roda dentro do servidor do Vite (npm run dev / npm run preview).
 * Para publicar o painel, mova-o para uma função serverless ou um backend próprio,
 * protegido por autenticação real (ver wiki/pontos-de-melhoria.md).
 */

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  allowRemote: boolean;
  /** Para onde vão as respostas do cliente, se não for a própria conta SMTP. */
  replyTo?: string;
}

type Env = Record<string, string | undefined>;

export function readEmailConfig(env: Env): EmailConfig | null {
  const user = env.SMTP_USER?.trim();
  // A senha de app do Gmail é exibida com espaços; o SMTP aceita sem eles.
  const pass = env.SMTP_PASS?.replace(/\s+/g, '');
  if (!user || !pass) return null;
  const port = Number(env.SMTP_PORT ?? 465) || 465;
  return {
    host: env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port,
    secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
    user,
    pass,
    fromName: env.EMAIL_FROM_NAME?.trim() || 'AB AdsDesk',
    allowRemote: env.EMAIL_ALLOW_REMOTE === 'true',
    replyTo: env.EMAIL_REPLY_TO?.trim() || undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* Conteúdo                                                                    */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** Converte o texto no formato do WhatsApp (*negrito*) em HTML simples. */
export function reportHtml(text: string, footer: string): string {
  const body = escapeHtml(text)
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px 12px;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0">
    <tr><td style="padding:24px 24px 8px;font-size:15px;line-height:1.6">${body}</td></tr>
    <tr><td style="padding:16px 24px 24px;font-size:12px;color:#64748b;border-top:1px solid #f1f5f9">${escapeHtml(footer)}</td></tr>
  </table>
</body>
</html>`;
}

export function reportPlainText(text: string): string {
  return text.replace(/\*([^*\n]+)\*/g, '$1');
}

/* -------------------------------------------------------------------------- */
/* Middleware HTTP (formato Connect, usado pelo Vite)                          */
/* -------------------------------------------------------------------------- */

type Next = (err?: unknown) => void;

const MAX_BODY_BYTES = 20_000;
const MAX_SENDS_PER_HOUR = 20;

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function isLoopback(req: IncomingMessage): boolean {
  const address = req.socket.remoteAddress ?? '';
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1';
}

/** Bloqueia chamadas vindas de outros sites (o navegador manda o Origin em POST). */
function sameOrigin(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      // Passou do limite: descarta o resto sem guardar e responde 413 no fim. Destruir o socket
      // deixaria o navegador sem resposta nenhuma.
      if (size > MAX_BODY_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => (tooLarge ? reject(new Error('too_large')) : resolve(Buffer.concat(chunks).toString('utf8'))));
    req.on('error', reject);
  });
}

interface ReportPayload {
  to: string;
  subject: string;
  text: string;
  senderName?: string;
}

function validatePayload(raw: unknown): ReportPayload | string {
  if (!raw || typeof raw !== 'object') return 'Pedido inválido.';
  const { to, subject, text, senderName } = raw as Record<string, unknown>;
  if (typeof to !== 'string' || !EMAIL_RE.test(to.trim())) return 'Informe um e-mail de destino válido.';
  if (typeof subject !== 'string' || !subject.trim() || subject.length > 160 || /[\r\n]/.test(subject)) {
    return 'Assunto inválido (até 160 caracteres, em uma linha).';
  }
  if (typeof text !== 'string' || !text.trim() || text.length > 6000) return 'O texto do relatório está vazio ou longo demais.';
  return {
    to: to.trim(),
    subject: subject.trim(),
    text,
    senderName: typeof senderName === 'string' ? senderName.replace(/[\r\n"<>]/g, '').slice(0, 60).trim() : undefined,
  };
}

function describeSmtpError(err: unknown): string {
  const e = err as { code?: string; responseCode?: number };
  if (e.code === 'EAUTH' || e.responseCode === 535) {
    return 'O provedor recusou o login SMTP. Confira SMTP_USER e SMTP_PASS (no Gmail, use uma senha de app).';
  }
  if (e.code === 'ECONNECTION' || e.code === 'ETIMEDOUT' || e.code === 'ESOCKET' || e.code === 'EDNS') {
    return 'Não foi possível conectar ao servidor SMTP. Verifique a internet e o SMTP_HOST/SMTP_PORT.';
  }
  if (e.code === 'EENVELOPE') return 'O provedor recusou o endereço de destino.';
  return 'O provedor de e-mail recusou o envio. Tente de novo em instantes.';
}

export function createEmailMiddleware(env: Env) {
  const config = readEmailConfig(env);
  const transport = config
    ? createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: { user: config.user, pass: config.pass },
      })
    : null;
  const sentAt: number[] = [];

  return async function emailMiddleware(req: IncomingMessage, res: ServerResponse, next: Next) {
    const url = req.url?.split('?')[0] ?? '';
    if (!url.startsWith('/api/email/')) return next();

    if (config && !config.allowRemote && !isLoopback(req)) {
      return sendJson(res, 403, { error: 'O envio de e-mail só está liberado neste computador.' });
    }

    if (url === '/api/email/status' && req.method === 'GET') {
      return sendJson(res, 200, config ? { configured: true, from: config.user } : { configured: false });
    }

    if (url === '/api/email/report' && req.method === 'POST') {
      if (!config || !transport) {
        return sendJson(res, 503, { error: 'O envio de e-mail não está configurado. Preencha o .env.local (veja .env.example).' });
      }
      if (!sameOrigin(req)) return sendJson(res, 403, { error: 'Origem não permitida.' });
      if (!req.headers['content-type']?.includes('application/json')) {
        return sendJson(res, 415, { error: 'Envie o pedido em JSON.' });
      }

      const now = Date.now();
      while (sentAt.length && now - sentAt[0] > 3_600_000) sentAt.shift();
      if (sentAt.length >= MAX_SENDS_PER_HOUR) {
        return sendJson(res, 429, { error: `Limite de ${MAX_SENDS_PER_HOUR} tentativas de envio por hora atingido. Tente mais tarde.` });
      }

      let payload: ReportPayload | string;
      try {
        payload = validatePayload(JSON.parse(await readBody(req)));
      } catch (err) {
        if ((err as Error).message === 'too_large') return sendJson(res, 413, { error: 'O relatório passou do tamanho máximo.' });
        return sendJson(res, 400, { error: 'Pedido inválido.' });
      }
      if (typeof payload === 'string') return sendJson(res, 400, { error: payload });

      const fromName = payload.senderName || config.fromName;
      // Conta a tentativa antes de enviar: falhas repetidas (senha errada, destinatário recusado)
      // também esbarram no limite. O contador fica em memória e zera ao reiniciar o servidor.
      sentAt.push(now);
      try {
        await transport.sendMail({
          from: { name: fromName, address: config.user },
          replyTo: config.replyTo,
          to: payload.to,
          subject: payload.subject,
          text: reportPlainText(payload.text),
          html: reportHtml(payload.text, `Enviado por ${fromName}. Responda este e-mail para falar com a equipe.`),
        });
        return sendJson(res, 200, { ok: true });
      } catch (err) {
        console.error('[email] falha no envio:', (err as Error).message);
        return sendJson(res, 502, { error: describeSmtpError(err) });
      }
    }

    return sendJson(res, 404, { error: 'Rota de e-mail não encontrada.' });
  };
}

/** Testa login no SMTP sem enviar nada. Uso: npm run email:check */
export async function verifyEmailConfig(env: Env): Promise<string> {
  const config = readEmailConfig(env);
  if (!config) return 'SMTP_USER e SMTP_PASS não estão definidos no .env.local.';
  const transport = createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
  try {
    await transport.verify();
    return `OK: login SMTP aceito em ${config.host}:${config.port} como ${config.user}.`;
  } catch (err) {
    return `Falhou: ${describeSmtpError(err)} (${(err as Error).message})`;
  } finally {
    transport.close();
  }
}
