import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CircleAlert, Eye, EyeOff, Link2, Loader2, LockKeyhole, Unplug } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import {
  META_GRAPH_API_VERSION,
  accountStatusInfo,
  buildConnectedAccount,
  fetchMetaAccount,
  getSavedMetaConfig,
  normalizeAccountId,
  removeMetaConfig,
  saveMetaConfig,
} from '../../services/metaGraphApi';
import { formatTime } from '../../lib/format';
import { STORAGE_KEYS, readJSON } from '../../lib/storage';
import { AccountAvatar } from '../ui/AccountAvatar';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { buttonClass } from '../ui/button';

interface MetaConnectModalProps {
  open: boolean;
  onClose: () => void;
  connectedAccount: AdAccount | null;
  demoAccounts: AdAccount[];
  onConnected: (account: AdAccount) => void;
  onDisconnect: () => void;
  onSelectDemo: (accountId: string) => void;
}

type ErrorState = { title: string; detail: string } | null;

const inputClass =
  'focus:border-brand-500 focus:ring-brand-100 mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:outline-none sm:text-sm';

/** Conecta uma conta de anúncios real pela Graph API (somente leitura). */
export function MetaConnectModal({
  open,
  onClose,
  connectedAccount,
  demoAccounts,
  onConnected,
  onDisconnect,
  onSelectDemo,
}: MetaConnectModalProps) {
  const [saved] = useState(getSavedMetaConfig);
  const [accountId, setAccountId] = useState(saved?.adAccountId ?? '');
  const [token, setToken] = useState(saved?.accessToken ?? '');
  const [showToken, setShowToken] = useState(false);
  // Reabre com a escolha anterior: se o token já estava lembrado, reconectar não o manda para a sessão.
  const [remember, setRemember] = useState(() => readJSON(STORAGE_KEYS.metaApi) !== null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accountFieldId = useId();
  const tokenFieldId = useId();
  const errorId = useId();

  // Cancela a consulta se o modal fechar no meio.
  useEffect(() => () => abortRef.current?.abort(), []);

  const accountIdTouched = accountId.trim().length > 0;
  const normalizedId = normalizeAccountId(accountId);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const result = await fetchMetaAccount(token, accountId, controller.signal);
      if (!result.ok) {
        setError({ title: result.title, detail: result.detail });
        return;
      }
      saveMetaConfig({ accessToken: token.trim(), adAccountId: result.account.id }, remember);
      onConnected(buildConnectedAccount(result.account));
      onClose();
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError({ title: 'Não foi possível conectar', detail: 'Tente de novo em instantes.' });
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const handleDisconnect = () => {
    removeMetaConfig();
    onDisconnect();
    onClose();
  };

  const status = connectedAccount?.apiSnapshot ? accountStatusInfo(connectedAccount.apiSnapshot.accountStatus) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Conectar conta da Meta"
      description="Leia os dados de uma conta de anúncios real pela Graph API."
      icon={Link2}
      size="lg"
    >
      <div className="space-y-6">
        {connectedAccount && (
          <section
            aria-label="Conta conectada"
            className="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:flex-row sm:items-center"
          >
            <AccountAvatar account={connectedAccount} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-slate-900">{connectedAccount.name}</p>
                {status && <Badge tone={status.tone}>{status.label}</Badge>}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                {connectedAccount.id}
                {connectedAccount.apiSnapshot && <> · atualizado às {formatTime(connectedAccount.apiSnapshot.fetchedAt)}</>}
              </p>
            </div>
            <button type="button" onClick={handleDisconnect} className={buttonClass('danger', 'md', 'shrink-0')}>
              <Unplug className="size-4" aria-hidden="true" />
              Desconectar
            </button>
          </section>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {connectedAccount && (
            <h3 className="text-sm font-bold text-slate-900">Conectar outra conta ou trocar o token</h3>
          )}

          <div>
            <label htmlFor={accountFieldId} className="text-sm font-semibold text-slate-700">
              ID da conta de anúncios
            </label>
            <input
              id={accountFieldId}
              data-autofocus
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className={inputClass}
              placeholder="act_123456789"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={accountIdTouched && !normalizedId ? true : undefined}
            />
            <p className={`mt-1 text-xs ${accountIdTouched && !normalizedId ? 'text-rose-700' : 'text-slate-500'}`}>
              {accountIdTouched && !normalizedId
                ? 'Use act_ seguido dos números, ou só os números.'
                : 'Fica no Gerenciador de Anúncios, ao lado do nome da conta.'}
            </p>
          </div>

          <div>
            <label htmlFor={tokenFieldId} className="text-sm font-semibold text-slate-700">
              Token de acesso
            </label>
            <div className="relative">
              <input
                id={tokenFieldId}
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className={`${inputClass} pr-12 font-mono`}
                placeholder="EAAB…"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={error ? errorId : undefined}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                aria-pressed={showToken}
                aria-label={showToken ? 'Ocultar token' : 'Mostrar token'}
                className="absolute top-1.5 right-0 grid h-11 w-12 place-items-center text-slate-400 hover:text-slate-700"
              >
                {showToken ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Precisa da permissão <code className="rounded bg-slate-100 px-1 text-slate-700">ads_read</code>. O painel só
              lê dados; nada é alterado na conta.
            </p>
          </div>

          <label className="flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="accent-brand-600 mt-0.5 size-4 shrink-0"
            />
            <span>
              <span className="block text-sm font-semibold text-slate-800">Lembrar neste navegador</span>
              <span className="block text-xs text-slate-500">
                Sem marcar, o token some ao fechar a aba. Marque só em computador de uso pessoal.
              </span>
            </span>
          </label>

          {error && (
            <div id={errorId} role="alert" className="flex gap-3 rounded-xl bg-rose-50 p-3.5 ring-1 ring-rose-200">
              <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
              <div className="text-sm">
                <p className="font-semibold text-rose-900">{error.title}</p>
                <p className="mt-0.5 text-rose-800">{error.detail}</p>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading} className={buttonClass('primary', 'lg', 'w-full')}>
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                Consultando a Meta…
              </>
            ) : (
              'Testar e conectar'
            )}
          </button>
          <p className="sr-only" aria-live="polite">
            {loading ? 'Consultando a Meta.' : ''}
          </p>
        </form>

        <details className="group rounded-2xl border border-slate-200 bg-slate-50/60">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
            <LockKeyhole className="size-4 text-slate-400" aria-hidden="true" />
            Como gerar um token que não expira
            <span className="ml-auto text-slate-400 transition group-open:rotate-180" aria-hidden="true">
              ▾
            </span>
          </summary>
          <ol className="list-decimal space-y-2 px-4 pb-4 pl-9 text-sm text-slate-600">
            <li>No Business Manager, abra Configurações do negócio → Usuários → Usuários do sistema.</li>
            <li>Crie um usuário do sistema (ou use um existente) e atribua a ele a conta de anúncios do cliente.</li>
            <li>
              Clique em “Gerar novo token”, escolha o seu app e marque a permissão{' '}
              <code className="rounded bg-slate-200/70 px-1">ads_read</code>.
            </li>
            <li>Copie o token e cole aqui. Tokens do Graph API Explorer também funcionam, mas expiram em poucas horas.</li>
          </ol>
          <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
            Consulta direta do navegador à Graph API {META_GRAPH_API_VERSION}. Por enquanto importamos o resumo da conta;
            campanhas e histórico diário entram na próxima etapa.
          </p>
        </details>

        {demoAccounts.length > 0 && (
          <section aria-labelledby="contas-demo">
            <h3 id="contas-demo" className="text-sm font-bold text-slate-900">
              Ou abra uma conta de demonstração
            </h3>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {demoAccounts.map((demo) => (
                <li key={demo.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDemo(demo.id);
                      onClose();
                    }}
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <AccountAvatar account={demo} size={32} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-slate-800">{demo.name}</span>
                      <span className="block truncate text-xs text-slate-500">{demo.businessType}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
