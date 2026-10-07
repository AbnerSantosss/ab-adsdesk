import { ArrowUpRight, Check, CircleHelp, Link2, Palette, Settings2 } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import { META_GRAPH_API_VERSION } from '../../services/metaGraphApi';
import { Card } from '../ui/Card';
import { MetaConnectionPanel } from '../ui/MetaConnectionPanel';
import { buttonClass } from '../ui/button';

interface Props {
  connectedAccount: AdAccount | null;
  onConnected: (account: AdAccount) => void;
  onDisconnect: () => void;
  onOpenBrand: () => void;
}

const steps = [
  {title:'Confira a conta e o seu acesso', text:'Abra o Gerenciador de Anúncios e escolha a conta correta. Copie o ID numérico da conta, não o ID da Página ou do Instagram. Seu usuário precisa ter acesso aos relatórios dessa conta.', href:'https://adsmanager.facebook.com/', link:'Abrir Gerenciador de Anúncios'},
  {title:'Prepare o aplicativo da Meta', text:'Em Meta for Developers, crie ou selecione um aplicativo com o caso de uso da Marketing API. Para dados de uma conta própria, confira o acesso padrão; para contas de outros negócios, verifique os requisitos de acesso avançado e revisão do aplicativo.', href:'https://developers.facebook.com/apps/', link:'Abrir seus aplicativos'},
  {title:'Gere um token com ads_read', text:'Para testar, selecione o app no Graph API Explorer e gere um token de usuário com ads_read. Para a operação da agência, use um usuário do sistema do portfólio empresarial, atribua a conta de anúncios e gere o token para esse app com acesso de leitura.', href:'https://developers.facebook.com/tools/explorer/', link:'Abrir Graph API Explorer'},
  {title:'Conecte e confira os números', text:'Cole o ID e o token no formulário. O painel valida a conta e importa os últimos 30 dias. Compare período, fuso, moeda e métricas com o Gerenciador de Anúncios antes de enviar o relatório ao cliente.', href:'https://developers.facebook.com/tools/debug/accesstoken/', link:'Verificar validade do token'},
];

export function Settings({connectedAccount,onConnected,onDisconnect,onOpenBrand}:Props) {
  return <div className="space-y-5">
    <header className="flex items-center gap-3"><span className="social-icon"><Settings2 className="size-5" aria-hidden="true"/></span><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações</h1><p className="mt-1 text-sm text-slate-600">Conexão com a Meta e identidade do seu painel.</p></div></header>
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      <Card title="Conecte Instagram e Facebook" description="Os anúncios das duas plataformas são consultados pela conta de anúncios da Meta." icon={Link2}>
        <ol className="space-y-5">
          {steps.map((step,index)=><li key={step.title} className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">{index+1}</span><div className="min-w-0"><h3 className="text-sm font-bold text-slate-900">{step.title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-600">{step.text}</p><a href={step.href} target="_blank" rel="noreferrer" className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-brand-700 underline underline-offset-4">{step.link}<ArrowUpRight className="size-3.5" aria-hidden="true"/></a></div></li>)}
        </ol>
        <div className="social-inset mt-5 rounded-xl p-4 text-xs leading-relaxed text-slate-600"><p className="font-semibold text-slate-800">Token e acesso à conta são verificações diferentes.</p><p className="mt-1">Mesmo com ads_read, o usuário que gerou o token precisa ter acesso à conta escolhida. Tokens podem expirar ou ser revogados; confira a validade na Meta. Não é necessário conceder permissão para editar campanhas.</p><a className="mt-2 inline-block font-semibold underline underline-offset-4" href="https://business.facebook.com/settings/system-users" target="_blank" rel="noreferrer">Abrir usuários do sistema</a></div>
      </Card>
      <div className="min-w-0 space-y-5">
        <Card title="Acesso e importação" description={`Marketing API ${META_GRAPH_API_VERSION} · somente leitura`} icon={Link2}><MetaConnectionPanel connectedAccount={connectedAccount} onConnected={onConnected} onDisconnect={onDisconnect}/></Card>
        <Card title="O que será importado" icon={Check}><ul className="space-y-2 text-sm text-slate-600"><li>Investimento, impressões, cliques e alcance do período.</li><li>Campanhas, anúncios, imagens disponíveis e histórico diário.</li><li>Ações retornadas pela Meta, sem transformar cliques em contatos.</li></ul><p className="mt-3 text-xs leading-relaxed text-slate-600">A auditoria de pixel, WhatsApp e origem “Turbinar” não é comprovada por essa consulta. Esses itens ficam como não verificados.</p></Card>
      </div>
    </div>
    <Card title="Se a conexão não concluir" icon={CircleHelp}><dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2"><div><dt className="font-semibold text-slate-900">Token inválido ou expirado</dt><dd className="mt-1 text-slate-600">Gere um novo token para o app correto e confira a validade no depurador da Meta.</dd></div><div><dt className="font-semibold text-slate-900">Sem permissão ou conta não encontrada</dt><dd className="mt-1 text-slate-600">Confira o ID, ads_read, o acesso ao ativo e o nível de acesso do aplicativo.</dd></div><div><dt className="font-semibold text-slate-900">Acesso validado, sem veiculação</dt><dd className="mt-1 text-slate-600">Selecione um período em que houve anúncios. Uma resposta vazia não é substituída por dados de demonstração.</dd></div><div><dt className="font-semibold text-slate-900">Rede ou limite de consultas</dt><dd className="mt-1 text-slate-600">Verifique a internet e bloqueadores que possam impedir graph.facebook.com. Se a Meta limitar consultas, aguarde antes de tentar novamente.</dd></div></dl></Card>
    <Card title="Marca do painel" icon={Palette} action={<button onClick={onOpenBrand} className={buttonClass('secondary','sm')}>Personalizar marca</button>}><p className="text-sm text-slate-600">Ajuste o nome, o logotipo e a cor das ações mantendo os relatórios com base neutra.</p></Card>
    <p className="text-xs leading-relaxed text-slate-600">Esta conexão funciona nesta sessão do navegador. Acesso compartilhado entre gestores e clientes exige autenticação e armazenamento seguro no servidor; o login atual do projeto é de demonstração.</p>
  </div>;
}
