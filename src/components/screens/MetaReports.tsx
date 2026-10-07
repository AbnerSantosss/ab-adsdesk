import { useState } from 'react';
import { BarChart3, CalendarDays, CircleHelp, Coins, Eye, ImageOff, Link2, Loader2, MousePointerClick, Printer, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ActiveTab, AdAccount } from '../../types/metaAds';
import type { MetaReportAd, MetaReportMetrics, MetaReportRange, MetaReportSnapshot } from '../../types/metaReport';
import { formatDate, formatDayMonth, formatMoney, formatNumber, parseISODate } from '../../lib/format';
import { presetDateRange, type DateRange } from '../../lib/dateRange';
import { TABS } from '../../lib/navigation';
import { Card } from '../ui/Card';
import { KpiCard } from '../ui/KpiCard';
import { EmptyState } from '../ui/EmptyState';
import { DateRangeFilter } from '../ui/DateRangeFilter';
import { buttonClass } from '../ui/button';

interface Props {
  account: AdAccount;
  tab: ActiveTab;
  canConfigure: boolean;
  refreshing: boolean;
  onRefresh: (range?: MetaReportRange) => Promise<void>;
  onOpenSettings: () => void;
}

function reportToday(timezone: string): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part = (type: string) => parts.find(p=>p.type===type)?.value;
  return parseISODate(`${part('year')}-${part('month')}-${part('day')}`);
}

export function MetaReports({account,tab,canConfigure,refreshing,onRefresh,onOpenSettings}: Props) {
  const report = account.apiReport;
  const title = TABS.find(item=>item.id===tab)?.label ?? 'Relatórios';
  const [preset, setPreset] = useState<DateRange['preset']>('CUSTOM');
  const money = (value:number|null) => formatMoney(value,account.currency);
  const importRange = async (range:DateRange) => {
    const current = range.preset==='CUSTOM' ? range : presetDateRange(range.preset, reportToday(account.timezone));
    setPreset(current.preset);
    await onRefresh({since:current.start,until:current.end});
  };
  if (!report) return <div className="space-y-5"><h1 className="text-2xl font-bold">{title}</h1><EmptyState icon={Link2} title="Importe os relatórios desta conta" description="O cadastro antigo continha somente o resumo da conta. Valide o acesso aos relatórios em Configurações para consultar os dados da Meta." action={canConfigure?<button onClick={onOpenSettings} className={buttonClass('primary')}>Abrir Configurações</button>:undefined}/></div>;

  const selectedRange:DateRange = {start:report.range.since,end:report.range.until,preset:'CUSTOM'};
  // Só indicar um preset como selecionado quando corresponde ao snapshot exibido.
  if(preset!=='CUSTOM') {
    const expected=presetDateRange(preset,reportToday(report.timezone));
    if(expected.start===selectedRange.start&&expected.end===selectedRange.end) selectedRange.preset=preset;
  }
  const champion=report.ads.filter(ad=>(ad.clicks??0)>0).sort((a,b)=>(b.clicks??0)-(a.clicks??0))[0];
  return <div className="space-y-5">
    <header className="social-surface flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
      <div className="min-w-0"><h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-1 break-words text-xs text-slate-600">{account.name} · {formatDate(report.range.since)} a {formatDate(report.range.until)}</p></div>
      {canConfigure && <fieldset disabled={refreshing} className="min-w-0 print:hidden"><DateRangeFilter value={selectedRange} onChange={range=>{void importRange(range);}}/></fieldset>}
    </header>
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600"><p>Fonte: Meta · {report.currency} · {report.timezone} · importado em {new Intl.DateTimeFormat('pt-BR',{timeZone:report.timezone,dateStyle:'short',timeStyle:'short'}).format(new Date(report.fetchedAt))}</p><div className="flex flex-wrap gap-2 print:hidden">{canConfigure&&<button disabled={refreshing} className={buttonClass('secondary','sm')} onClick={()=>{void onRefresh();}}>{refreshing?<Loader2 className="size-4 animate-spin" aria-hidden="true"/>:<RefreshCw className="size-4" aria-hidden="true"/>}Atualizar</button>}<button onClick={()=>window.print()} className={buttonClass('secondary','sm')}><Printer className="size-4" aria-hidden="true"/>Imprimir</button></div></div>
    {refreshing&&<p role="status" className="text-sm text-slate-600">Consultando a Meta. Os dados abaixo são da última importação concluída.</p>}
    {report.isEmpty&&<EmptyState icon={CalendarDays} title="Sem veiculação retornada neste período" description="O acesso aos relatórios foi validado, mas a Meta não retornou métricas para estas datas. Escolha outro período; dados ausentes não são substituídos por exemplos."/>}

    {tab==='OVERVIEW'&&<>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><KpiCard label="Investimento" value={money(report.totals.spend)} icon={Coins} hint="No período selecionado"/><KpiCard label="Impressões" value={formatNumber(report.totals.impressions)} icon={Eye} hint="Exibições dos anúncios"/><KpiCard label="Cliques" value={formatNumber(report.totals.clicks)} icon={MousePointerClick} hint="Cliques reportados pela Meta"/><KpiCard label="Alcance único" value={formatNumber(report.totals.reach)} icon={Users} hint="Pessoas no período; sem somar dias"/></div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"><Card title="Investimento por dia" description="Dias retornados pela Meta; todos no mesmo período." icon={BarChart3}><div className="h-64 min-w-0">{report.daily.length>0?<ResponsiveContainer width="100%" height="100%"><BarChart data={[...report.daily].reverse()} margin={{top:12,right:8,bottom:0,left:0}}><CartesianGrid vertical={false} stroke="#e1e5eb"/><XAxis dataKey="date" tickFormatter={formatDayMonth} tick={{fontSize:11,fill:'#526178'}} tickLine={false} axisLine={false}/><YAxis width={65} tickFormatter={value=>formatMoney(value,account.currency,0)} tick={{fontSize:11,fill:'#526178'}} tickLine={false} axisLine={false}/><Tooltip labelFormatter={value=>formatDate(String(value))} formatter={value=>[money(Number(value)),'Investimento']}/><Bar dataKey="spend" fill="#758399" radius={[5,5,0,0]} maxBarSize={40}/></BarChart></ResponsiveContainer>:<p className="text-sm text-slate-600">Nenhuma série diária retornada.</p>}</div><details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-slate-700">Ler valores em tabela</summary><DailyRows report={report}/></details></Card><Card title="Ações atribuídas" description="Métricas distintas. Não representam uma soma de contatos únicos."><ActionMetrics metrics={report.totals}/><p className="mt-4 text-xs leading-relaxed text-slate-600">A atribuição segue a resposta da Meta. Um travessão indica métrica não retornada. Cliques não são classificados como conversas ou cadastros.</p></Card></div>
      {champion&&<Card title="Anúncio com mais cliques" description="Destaque por volume de cliques no período; não é uma comparação de conversão entre objetivos."><div className="grid grid-cols-1 gap-4 sm:grid-cols-[14rem_minmax(0,1fr)]"><AdImage ad={champion}/><div className="min-w-0"><h3 className="text-base font-bold text-slate-900">{champion.name}</h3><p className="mt-1 text-sm text-slate-600">{champion.campaignName}</p><dl className="mt-4 grid grid-cols-2 gap-3"><div><dt className="text-xs text-slate-600">Cliques</dt><dd className="font-bold">{formatNumber(champion.clicks)}</dd></div><div><dt className="text-xs text-slate-600">Investimento</dt><dd className="font-bold">{money(champion.spend)}</dd></div></dl></div></div></Card>}
    </>}
    {tab==='CAMPAIGNS'&&<Card title="Campanhas da conta" description="Objetivo e estado atuais; métricas do intervalo selecionado. Travessão indica métrica não retornada no período.">{report.campaigns.length===0?<p className="text-sm text-slate-600">Nenhuma campanha retornada.</p>:<div className="space-y-3">{report.campaigns.map(row=><article key={row.id} className="social-inset rounded-xl p-4"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="min-w-0 break-words text-sm font-bold">{row.name}</h3><span className="text-xs text-slate-600">{statusLabel(row.status)}</span></div><p className="mt-1 text-xs text-slate-600">Objetivo: {objectiveLabel(row.objective)}</p><MetricRow metrics={row} currency={report.currency}/><ActionMetrics metrics={row} compact/></article>)}</div>}</Card>}
    {tab==='CREATIVES'&&<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{report.ads.length===0?<Card title="Anúncios"><p className="text-sm text-slate-600">Nenhum anúncio retornado neste período.</p></Card>:report.ads.map(ad=><article key={ad.id} className="social-surface min-w-0 overflow-hidden rounded-2xl border"><div className="flex items-start justify-between gap-2 p-4"><h2 className="min-w-0 break-words text-sm font-bold">{ad.name}</h2><span className="shrink-0 text-xs text-slate-600">{statusLabel(ad.status)}</span></div><AdImage ad={ad}/><div className="p-4"><p className="text-xs text-slate-600">{ad.campaignName??'Campanha não informada'}</p>{ad.creative?.body&&<p className="mt-2 line-clamp-3 text-sm text-slate-700">{ad.creative.body}</p>}<MetricRow metrics={ad} currency={report.currency}/><ActionMetrics metrics={ad} compact/></div></article>)}</div>}
    {tab==='DAILY_REPORTS'&&<Card title="Relatório diário" description="Cada linha contém o valor retornado naquele dia. O alcance diário não deve ser somado como pessoas únicas."><DailyRows report={report}/><p className="mt-3 text-xs text-slate-600">Use Imprimir para salvar o relatório em PDF. A exportação inclui somente os dados desta consulta.</p></Card>}
    {tab==='AUDIT'&&<Card title="Verificações da conexão" icon={ShieldCheck} description="Somente verificações sustentadas pelos dados importados."><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><dt className="text-sm font-bold">Leitura da conta e dos relatórios</dt><dd className="mt-1 text-sm text-slate-600">Concluída na última importação. Token e acesso podem ser revogados posteriormente.</dd></div><div><dt className="text-sm font-bold">Campanhas e anúncios consultados</dt><dd className="mt-1 text-sm text-slate-600">{report.campaigns.length} campanhas e {report.ads.length} anúncios retornados.</dd></div><div><dt className="text-sm font-bold">Pixel e WhatsApp conectados</dt><dd className="mt-1 text-sm text-slate-600">Não verificados por esta consulta. Confira os ativos no Gerenciador de Eventos e nas configurações do negócio.</dd></div><div><dt className="text-sm font-bold">Gerenciador ou botão Turbinar</dt><dd className="mt-1 text-sm text-slate-600">Origem não comprovada. Objetivo e desempenho não bastam para classificar uma campanha como turbinada.</dd></div></dl><p className="social-inset mt-4 flex gap-2 rounded-xl p-3 text-sm text-slate-600"><CircleHelp className="size-4 shrink-0" aria-hidden="true"/>Uma nota automática de saúde não é calculada sem as verificações necessárias.</p></Card>}
  </div>;
}

function ActionMetrics({metrics,compact=false}:{metrics:MetaReportMetrics;compact?:boolean}) {
  return <dl className={`grid grid-cols-1 gap-3 ${compact?'mt-3 sm:grid-cols-3':''}`}>{[['Conversas iniciadas',metrics.messagingConversations],['Cadastros',metrics.leads],['Compras',metrics.purchases]].map(([label,value])=><div key={String(label)}><dt className="text-xs text-slate-600">{label}</dt><dd className={`${compact?'text-sm':'text-xl'} mt-0.5 font-bold text-slate-900 tabular-nums`}>{formatNumber(value as number|null)}</dd></div>)}</dl>;
}
function MetricRow({metrics,currency}:{metrics:MetaReportMetrics;currency:string}) {
  return <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-600">Investimento</dt><dd className="font-bold tabular-nums">{formatMoney(metrics.spend,currency)}</dd></div><div><dt className="text-xs text-slate-600">Cliques</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.clicks)}</dd></div><div><dt className="text-xs text-slate-600">Impressões</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.impressions)}</dd></div><div><dt className="text-xs text-slate-600">Alcance</dt><dd className="font-bold tabular-nums">{formatNumber(metrics.reach)}</dd></div></dl>;
}
function DailyRows({report}:{report:MetaReportSnapshot}) {
  return <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[34rem] text-sm"><caption className="sr-only">Valores diários da Meta</caption><thead><tr>{['Dia','Investimento','Impressões','Cliques','Alcance','Conversas','Cadastros'].map(label=><th scope="col" key={label} className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold text-slate-600">{label}</th>)}</tr></thead><tbody>{report.daily.map(day=><tr key={day.date} className="border-b border-slate-100"><th scope="row" className="whitespace-nowrap px-3 py-3 text-left font-medium">{formatDate(day.date)}</th><td className="whitespace-nowrap px-3 py-3">{formatMoney(day.spend,report.currency)}</td>{[day.impressions,day.clicks,day.reach,day.messagingConversations,day.leads].map((value,index)=><td key={index} className="px-3 py-3 tabular-nums">{formatNumber(value)}</td>)}</tr>)}</tbody></table>{report.daily.length===0&&<p className="py-4 text-sm text-slate-600">Nenhum registro diário retornado.</p>}</div>;
}
function AdImage({ad}:{ad:MetaReportAd}) {
  const source=ad.creative?.imageUrl??ad.creative?.thumbnailUrl;
  return <AdImageSource key={source??'unavailable'} source={source} label={ad.creative?.title??ad.name}/>;
}
function AdImageSource({source,label}:{source?:string|null;label:string}) {
  const [failed,setFailed]=useState(false);
  return <div className="grid h-56 min-w-0 place-items-center overflow-hidden bg-slate-100">{source&&!failed?<img src={source} onError={()=>setFailed(true)} alt={label} className="size-full object-contain" loading="lazy" referrerPolicy="no-referrer"/>:<div className="p-5 text-center text-sm text-slate-600"><ImageOff className="mx-auto mb-2 size-6" aria-hidden="true"/>Prévia não disponível na resposta da Meta</div>}</div>;
}
function statusLabel(status:string|null):string {return ({ACTIVE:'Ativo',PAUSED:'Pausado',ARCHIVED:'Arquivado',DELETED:'Excluído',CAMPAIGN_PAUSED:'Campanha pausada',ADSET_PAUSED:'Conjunto pausado',IN_PROCESS:'Em processamento',PENDING_REVIEW:'Em análise',DISAPPROVED:'Reprovado'} as Record<string,string>)[status??'']??status??'Estado não informado';}
function objectiveLabel(objective:string|null):string {return ({OUTCOME_AWARENESS:'Reconhecimento',OUTCOME_TRAFFIC:'Tráfego',OUTCOME_ENGAGEMENT:'Engajamento',OUTCOME_LEADS:'Cadastros',OUTCOME_APP_PROMOTION:'Promoção de app',OUTCOME_SALES:'Vendas',MESSAGES:'Mensagens',LEAD_GENERATION:'Cadastros',LINK_CLICKS:'Cliques no link',CONVERSIONS:'Conversões',REACH:'Alcance'} as Record<string,string>)[objective??'']??objective??'Não informado';}
