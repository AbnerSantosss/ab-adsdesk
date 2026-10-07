import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { CircleAlert, Eye, EyeOff, Link2, Loader2, Unplug } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import { fetchMetaDashboard, getSavedMetaConfig, normalizeAccountId, removeMetaConfig, saveMetaConfig } from '../../services/metaGraphApi';
import { formatDate, formatTime } from '../../lib/format';
import { buttonClass } from './button';

interface Props {
  connectedAccount: AdAccount | null;
  onConnected: (account: AdAccount) => void;
  onDisconnect: () => void;
}

/** Credenciais digitadas apenas pelo gestor. Nunca registra token em logs ou URLs. */
export function MetaConnectionPanel({ connectedAccount, onConnected, onDisconnect }: Props) {
  const [saved] = useState(getSavedMetaConfig);
  const [accountId, setAccountId] = useState(saved?.adAccountId ?? connectedAccount?.id ?? '');
  const [token, setToken] = useState(saved?.accessToken ?? '');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<{title: string; detail: string} | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const accountField = useId();
  const tokenField = useId();
  const errorId = useId();
  const noteId = useId();
  useEffect(() => () => abortRef.current?.abort(), []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    if (!normalizeAccountId(accountId) || !token.trim()) {
      setError({title: 'Confira os dados de acesso', detail: 'Informe o ID numérico da conta (com ou sem act_) e o token de acesso com ads_read.'});
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setProgress('Validando a conta e o acesso aos relatórios…');
    try {
      const result = await fetchMetaDashboard(token, accountId, undefined, controller.signal, setProgress);
      if (controller.signal.aborted) return;
      if (!result.ok) { setError(result); return; }
      saveMetaConfig({accessToken: token.trim(), adAccountId: result.account.id}, false);
      onConnected({...result.account, apiReport: result.report});
      setProgress(result.report.isEmpty ? 'Acesso validado. A Meta não retornou veiculação neste período.' : 'Conta e relatórios importados com sucesso.');
    } catch (cause) {
      if ((cause as Error).name !== 'AbortError') setError({title:'Não foi possível conectar', detail:'A consulta não terminou. Confira a conexão e tente novamente.'});
    } finally {
      if (!controller.signal.aborted) setLoading(false);
      if (abortRef.current === controller) abortRef.current = null;
    }
  };

  const report = connectedAccount?.apiReport;
  const inputClass = 'mt-1.5 h-11 w-full rounded-xl border border-slate-400 bg-white px-3 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-700 focus:ring-2 focus:ring-brand-700 focus:outline-none sm:text-sm';

  return <div className="space-y-5">
    {connectedAccount && <section className="rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Última importação da Meta">
      <p className="text-xs font-semibold text-slate-600">{report ? 'Última importação concluída' : 'Conta cadastrada · falta importar relatórios'}</p>
      <h3 className="mt-1 break-words text-sm font-bold text-slate-900">{connectedAccount.name}</h3>
      <p className="mt-1 break-all text-xs text-slate-600">{connectedAccount.id}</p>
      {report && <>
        <p className="mt-2 text-xs text-slate-600">{formatDate(report.range.since)} a {formatDate(report.range.until)} · leitura às {formatTime(report.fetchedAt)}</p>
        <p className="mt-1 text-xs text-slate-600">{report.campaigns.length} campanhas · {report.ads.length} anúncios · {report.daily.length} dias com registros</p>
      </>}
      <button disabled={loading} type="button" className={buttonClass('danger','sm','mt-3')} onClick={() => {removeMetaConfig(); setToken(''); setProgress(''); setError(null); onDisconnect();}}><Unplug className="size-4" aria-hidden="true"/>Desconectar</button>
    </section>}
    <form onSubmit={submit} noValidate className="space-y-4">
      <div>
        <label htmlFor={accountField} className="text-sm font-semibold text-slate-700">ID da conta de anúncios</label>
        <input id={accountField} value={accountId} onChange={e=>setAccountId(e.target.value)} disabled={loading} autoComplete="off" spellCheck={false} placeholder="act_123456789" className={inputClass} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}/>
      </div>
      <div>
        <label htmlFor={tokenField} className="text-sm font-semibold text-slate-700">Token de acesso</label>
        <div className="relative">
          <input id={tokenField} type={showToken?'text':'password'} value={token} onChange={e=>setToken(e.target.value)} disabled={loading} autoComplete="off" spellCheck={false} placeholder="Cole o token gerado na Meta" className={`${inputClass} pr-12`} aria-invalid={error ? true : undefined} aria-describedby={`${noteId}${error ? ` ${errorId}` : ''}`}/>
          <button type="button" className="absolute right-0 top-1.5 grid size-11 place-items-center rounded-xl text-slate-600" aria-label={showToken?'Ocultar token':'Mostrar token'} aria-pressed={showToken} onClick={()=>setShowToken(!showToken)}>{showToken?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button>
        </div>
        <p id={noteId} className="mt-2 text-xs leading-relaxed text-slate-600">O token fica somente nesta sessão do navegador e é removido ao sair ou desconectar. Não cole sua senha do Facebook.</p>
      </div>
      {error && <div id={errorId} role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"><CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true"/><div><p className="font-semibold">{error.title}</p><p className="mt-1">{error.detail}</p></div></div>}
      <button disabled={loading} type="submit" className={buttonClass('primary','md','w-full')}>{loading?<Loader2 className="size-4 animate-spin" aria-hidden="true"/>:<Link2 className="size-4" aria-hidden="true"/>}{loading?'Importando dados…':connectedAccount?'Validar e importar novamente':'Conectar e importar dados'}</button>
      <p role="status" className="min-h-5 text-xs leading-relaxed text-slate-600">{error ? '' : progress}</p>
    </form>
  </div>;
}
