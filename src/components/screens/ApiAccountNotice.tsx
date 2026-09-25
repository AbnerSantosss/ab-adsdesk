import { CloudDownload, Link2 } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import { accountStatusInfo, META_GRAPH_API_VERSION } from '../../services/metaGraphApi';
import { formatMoney, formatTime } from '../../lib/format';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { buttonClass } from '../ui/button';

interface ApiAccountNoticeProps {
  account: AdAccount;
  /** O que falta nesta tela (ex.: "as campanhas", "os criativos"). */
  missing: string;
  onOpenConnect?: () => void;
}

/**
 * Aviso para contas conectadas pela API: por enquanto só a situação da conta é lida;
 * campanhas, criativos e histórico diário dependem da importação via /insights.
 */
export function ApiAccountNotice({ account, missing, onOpenConnect }: ApiAccountNoticeProps) {
  const snapshot = account.apiSnapshot;
  const status = snapshot ? accountStatusInfo(snapshot.accountStatus) : null;

  return (
    <div className="space-y-4">
      {snapshot && (
        <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900">Dados lidos da Meta</h2>
            <span className="text-xs text-slate-500">
              Graph API {META_GRAPH_API_VERSION} · às {formatTime(snapshot.fetchedAt)}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
              <dt className="text-xs font-semibold text-slate-500">Situação da conta</dt>
              <dd className="mt-1">{status && <Badge tone={status.tone}>{status.label}</Badge>}</dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
              <dt className="text-xs font-semibold text-slate-500">Gasto desde a criação</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900 tabular-nums">
                {formatMoney(snapshot.amountSpent, account.currency)}
              </dd>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-blue-100">
              <dt className="text-xs font-semibold text-slate-500">Fuso e moeda</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-slate-900">
                {snapshot.timezone} · {account.currency}
              </dd>
            </div>
          </dl>
        </section>
      )}

      <EmptyState
        icon={CloudDownload}
        title={`Ainda não importamos ${missing}`}
        description={
          <>
            A conexão com a Meta está funcionando, mas este painel por enquanto lê só a situação da conta. A importação de
            campanhas, anúncios e resultados diários é o próximo passo do projeto. Enquanto isso, use as contas de
            demonstração para ver o painel completo.
          </>
        }
        action={
          onOpenConnect && (
            <button type="button" onClick={onOpenConnect} className={buttonClass('secondary')}>
              <Link2 className="size-4" aria-hidden="true" />
              Gerenciar conexão
            </button>
          )
        }
      />
    </div>
  );
}
