/**
 * Cliente das rotas /api/email/* (ver server/email.ts). O navegador nunca vê as
 * credenciais SMTP: só pede o envio ao servidor.
 */

export type EmailStatus =
  | { configured: true; from: string }
  | { configured: false; reason: 'NOT_CONFIGURED' | 'REMOTE_BLOCKED' | 'UNAVAILABLE' };

export async function getEmailStatus(signal?: AbortSignal): Promise<EmailStatus> {
  try {
    const response = await fetch('/api/email/status', { signal });
    // 403: o servidor existe, mas só aceita chamadas do próprio computador (ex.: aberto pelo celular na rede).
    if (response.status === 403) return { configured: false, reason: 'REMOTE_BLOCKED' };
    if (!response.ok) return { configured: false, reason: 'UNAVAILABLE' };
    const data = (await response.json()) as { configured?: boolean; from?: string };
    return data.configured && data.from
      ? { configured: true, from: data.from }
      : { configured: false, reason: 'NOT_CONFIGURED' };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    return { configured: false, reason: 'UNAVAILABLE' };
  }
}

export interface ReportEmail {
  to: string;
  subject: string;
  /** Texto no formato do WhatsApp; o servidor converte *negrito* em HTML. */
  text: string;
  senderName?: string;
}

export async function sendReportEmail(email: ReportEmail): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch('/api/email/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(email),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    return response.ok ? { ok: true } : { ok: false, error: data.error ?? `Falha no envio (HTTP ${response.status}).` };
  } catch {
    return { ok: false, error: 'Sem resposta do servidor. Confira se o painel está rodando com npm run dev.' };
  }
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i.test(value.trim());
}
