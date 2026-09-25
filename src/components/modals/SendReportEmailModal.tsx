import { useEffect, useId, useState, type FormEvent } from 'react';
import { CircleAlert, CircleCheck, Loader2, Mail, Send } from 'lucide-react';
import { STORAGE_KEYS, readJSON, writeJSON } from '../../lib/storage';
import { getEmailStatus, isValidEmail, sendReportEmail, type EmailStatus } from '../../services/emailApi';
import { Modal } from '../ui/Modal';
import { WhatsAppText } from '../ui/WhatsAppText';
import { buttonClass } from '../ui/button';

interface SendReportEmailModalProps {
  open: boolean;
  onClose: () => void;
  accountId: string;
  defaultSubject: string;
  message: string;
  senderName: string;
}

type Recipients = Record<string, string>;

const inputClass =
  'focus:border-brand-500 focus:ring-brand-100 mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:outline-none sm:text-sm';

/** Envia o relatório do dia por e-mail pelo servidor (SMTP configurado no .env.local). */
export function SendReportEmailModal({
  open,
  onClose,
  accountId,
  defaultSubject,
  message,
  senderName,
}: SendReportEmailModalProps) {
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [to, setTo] = useState(() => readJSON<Recipients>(STORAGE_KEYS.reportRecipients)?.[accountId] ?? '');
  const [subject, setSubject] = useState(defaultSubject);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const formId = useId();
  const toId = useId();
  const subjectId = useId();

  useEffect(() => {
    const controller = new AbortController();
    getEmailStatus(controller.signal)
      .then(setStatus)
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const toInvalid = to.trim().length > 0 && !isValidEmail(to);
  const canSend = status?.configured === true && isValidEmail(to) && subject.trim().length > 0 && !sending;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError(null);
    const recipient = to.trim();
    const result = await sendReportEmail({ to: recipient, subject: subject.trim(), text: message, senderName });
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const saved = readJSON<Recipients>(STORAGE_KEYS.reportRecipients) ?? {};
    writeJSON(STORAGE_KEYS.reportRecipients, { ...saved, [accountId]: recipient });
    setSentTo(recipient);
  };

  if (sentTo) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Relatório enviado"
        icon={Mail}
        footer={
          <button type="button" onClick={onClose} className={buttonClass('primary')} data-autofocus>
            Concluir
          </button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center" role="status">
          <CircleCheck className="size-12 text-emerald-500" aria-hidden="true" />
          <p className="mt-3 text-base font-semibold text-slate-900">E-mail enviado para {sentTo}</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Se não aparecer na caixa de entrada em alguns minutos, peça ao cliente para olhar o spam e marcar como
            confiável.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enviar relatório por e-mail"
      description="O cliente recebe o mesmo texto da mensagem de WhatsApp, formatado para e-mail."
      icon={Mail}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className={buttonClass('secondary')}>
            Cancelar
          </button>
          <button type="submit" form={formId} disabled={!canSend} className={buttonClass('primary')}>
            {sending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            {sending ? 'Enviando…' : 'Enviar e-mail'}
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} noValidate className="space-y-4">
        {status && !status.configured && (
          <div className="flex gap-3 rounded-xl bg-amber-50 p-3.5 text-sm ring-1 ring-amber-200" role="alert">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-900">Envio de e-mail indisponível</p>
              <p className="mt-0.5 text-amber-800">
                {status.reason === 'NOT_CONFIGURED'
                  ? 'Preencha SMTP_USER e SMTP_PASS no arquivo .env.local e reinicie o npm run dev.'
                  : status.reason === 'REMOTE_BLOCKED'
                    ? 'Por segurança, o envio só funciona no computador onde o painel está rodando. Envie de lá ou copie o texto.'
                    : 'Esta versão do painel ainda não envia e-mail. Copie o texto ou mande pelo WhatsApp.'}
              </p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor={toId} className="text-sm font-semibold text-slate-700">
            Para
          </label>
          <input
            id={toId}
            data-autofocus
            type="email"
            inputMode="email"
            autoComplete="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="cliente@empresa.com.br"
            aria-invalid={toInvalid || undefined}
            className={inputClass}
          />
          {toInvalid && <p className="mt-1 text-xs text-rose-700">Confira o endereço de e-mail.</p>}
        </div>

        <div>
          <label htmlFor={subjectId} className="text-sm font-semibold text-slate-700">
            Assunto
          </label>
          <input
            id={subjectId}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={160}
            className={inputClass}
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700">Mensagem</p>
          <div className="mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            <WhatsAppText text={message} />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {status?.configured ? (
              <>
                Sai de <span className="font-medium text-slate-700">{status.from}</span> com o nome “{senderName}”.
              </>
            ) : (
              'Para mudar o texto, escolha outro dia no relatório.'
            )}
          </p>
        </div>

        {error && (
          <div id={`${formId}-erro`} role="alert" className="flex gap-3 rounded-xl bg-rose-50 p-3.5 text-sm ring-1 ring-rose-200">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
            <p className="text-rose-800">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
}
