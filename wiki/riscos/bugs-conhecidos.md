---
tipo: risco
atualizado: 2026-10-07
tags: [riscos, bugs, react, divida-tecnica]
---

# Bugs conhecidos

Inventário reconciliado com o código em 2026-10-07. A lista separa pendências atuais das correções históricas; a numeração antiga é preservada para referência. O que é simulação de propósito fica em [[o-que-e-simulado]]; o que é falha de proteção fica em [[seguranca]].

## Bugs
| # | Onde | Problema | Efeito |
|---|---|---|---|
| 3 | `src/App.tsx` | A conta conectada vai sempre para o `localStorage`, mesmo sem "Lembrar neste navegador" | Nome e gasto da conta ficam no computador depois de fechar o navegador; o token não, então **Atualizar** pede o token de novo ([[persistencia-localstorage]]) |
| 4 | `src/lib/storage.ts` | O que vem do storage é lido com `JSON.parse` e usado sem validar a forma | Um JSON antigo ou editado à mão quebra a tela ou vira gestor ([[persistencia-localstorage]]) |
| 5 | `src/lib/metrics.ts` + `RoiCalculatorModal.tsx` | No mock, "resultado" mistura unidades e o CPA soma objetivos. O simulador ainda lê `accountTotals`, não `apiReport` | A simulação não representa conversas únicas; conta real sem campanhas no modelo legado usa a premissa padrão, mesmo com insights importados. Ajustar manualmente; ver [[simulador-roi]] e [[metricas-e-calculos]] |
| 6 | `src/components/layout/*` | A prévia de cliente mantém seletor de contas e Personalizar marca; o atalho de conectar no seletor pode aparecer, embora a guarda bloqueie Configurações | A prévia não é uma reprodução completa do perfil cliente. Configurações e atualização real já estão protegidas por modo ([[perfis-e-modos-de-visao]]) |
| 7 | `Campaigns.tsx`, `Creatives.tsx` | Ordenar por "Menor custo por resultado" não pede amostra mínima | Um item com 1 resultado barato vai para o topo ([[campanhas]], [[anuncios]]) |
| 9 | `src/lib/metrics.ts` | O auxiliar legado `periodSummary/LAST_DAY` e o último registro de `executiveSummary` dependem da ordem decrescente do mock | Manter o mock ordenado. O calendário atual e `weekBefore` ordenam as datas; o relatório real tem contrato separado e não usa esse auxiliar |
| 10 | `src/data/mockData.ts` | `topCreativeName` do histórico é um apelido escrito à mão ("Reformer em ação (Reels)"), não o nome exato do anúncio | O relatório do dia cita um anúncio que o cliente não acha em [[anuncios]]. Com dados reais, usar o `ad_id` ([[dados-mock]]) |
| 11 | `BrandSettingsModal.tsx` | WhatsApp de suporte inválido mostra aviso mas não impede salvar | Os links "Falar com a agência" e "Esqueci a senha" levam a lugar nenhum ([[personalizar-marca]]) |
| 12 | `src/components/ui/BrandLogo.tsx` | O logo `CUSTOM_TEXT` ignora `showName` | No cabeçalho, que pede só o ícone (`showName={false}`), aparece o texto inteiro e um nome longo aperta o celular |
| 13 | `index.html` | O HTML inicia com a marca padrão `social`, antes de aplicar a preferência salva | Outra marca pode ter um breve flash da cor padrão antes do efeito React; não é mais um flash verde |
| 14 | `AppHeader.tsx` | O selo "Dados de demonstração" só aparece de `lg` para cima | No celular, falta o selo no cabeçalho global; o rodapé informa a origem e a Visão geral indica "Amostra". Melhorar consistência entre telas ([[o-que-e-simulado]]) |
| 15 | `SegmentedControl`, `button.ts`, `Toast`, abas | Alvos abaixo de 44 px: `SegmentedControl` pequeno (32 px), botão `sm` (36 px) e o fechar do aviso (32 px). As abas são links, mas o `onClick` sempre chama `preventDefault` | No celular erra-se o toque; Ctrl+clique numa aba não abre outra guia ([[interface-e-responsividade]]) |
| 16 | `BrandSettingsModal.tsx` | O `radiogroup` de cor não responde às setas do teclado | Quem navega por teclado precisa de Tab em cada cor |

## Sobras
- `public/raro-pilates-logo.svg` não é usado: o ícone da Raro vem do componente `RaroPilatesIcon`, escolhido por `logoKey` ([[dados-mock]]).
- A chave `clareza_meta_api_config` carrega o nome antigo do produto ([[inconsistencias-de-marca]]).

## Corrigidos em 2026-10-07

- **1 — Conta do cliente ausente:** o App mostra Conta indisponível, sem renderizar a primeira conta da lista. Continua faltando autorização no backend ([[perfis-e-modos-de-visao]]).
- **2 — Limpeza ao sair:** logout e desconexão cancelam operações e removem token e snapshot conectado. Marca, seleção e destinatários continuam locais; fechar a aba, sem sair, preserva o snapshot sem token ([[persistencia-localstorage]]).
- **8 — Período da Visão geral:** KPIs e gráfico seguem o mesmo calendário. Blocos acumulados têm rótulos explícitos. Hoje/Ontem usam datas atuais, e a amostra histórica não é deslocada; lacunas e ausência de dados são informadas ([[visao-geral]]).
- Credenciais passaram a usar somente sessão; não há "Lembrar" para token e a chave legada persistente é removida sem leitura. Contas reais usam relatório completo, com famílias de ações separadas, ausência como `null` e aplicação atômica do snapshot ([[configuracoes]], [[meta-graph-api]]).
- Fundos multicoloridos nos cartões deram lugar à base branco gelo e superfícies neutras. Cores ficam restritas à identidade, foco, ações e estados com rótulo ([[cores-e-hierarquia-visual]]).

## Corrigidos na refatoração de 2026-09-25

Registro histórico: as descrições de modal, períodos e token abaixo dizem respeito àquela versão; o estado atual está na seção anterior e nas páginas relacionadas.
- Diário comparava o dia com a "média de 7 dias" mais recentes, incluindo o próprio dia e dias posteriores: agora `weekBefore` usa até 7 dias **anteriores** ao escolhido, e o texto diz quantos ("média dos 6 dias anteriores"). O dia mais antigo fica sem comparação ([[metricas-e-calculos]]).
- Resumo "Em poucas palavras" chamava de "menor custo" o anúncio do plano B e comparava o último dia com uma média que o incluía: as frases seguem a regra usada e a média é a dos dias anteriores.
- Campeão de reserva podia estar em desgaste e ganhar "Menor custo": o plano B ignora anúncios em `FATIGUE` quando há outro, e o selo exige que o campeão não esteja em queda.
- Subtítulo do anúncio destaque dizia "amostra suficiente" mesmo no plano B: o texto muda conforme o caso.
- Variação que arredondava para 0 mostrava "+0%" com seta verde: `formatDelta` tira o sinal do valor arredondado e o `KpiCard` mostra "estável" em cinza.
- "N dias no ar" usava a data do computador: conta até o último dia com dados da conta.
- Subtítulo da Auditoria comparava turbinado × estruturado mesmo sem diferença relevante: só aparece acima de 1,2×, no singular ou no plural.
- Voltar até a entrada sem `#` não voltava para a Visão geral: hash desconhecido abre a Visão geral.
- Esc nos menus não devolvia o foco; a lista de contas não devolvia o foco antes de abrir o modal: os dois menus devolvem ([[cabecalho-e-navegacao]]).
- "Pular para o conteúdo" trocava o `#` da tela por `#conteudo`, e a tela saía do endereço: o link só move o foco para o `<main>`.
- Lista de contas estourava a largura no celular; grids sem colunas explícitas rolavam para o lado (login, marca, simulador, conectar Meta, Campanhas, Diário, Auditoria, Anúncios): `grid-cols-1` e trilhas `minmax(0,1fr)` ([[interface-e-responsividade]]).
- "Atualizar" como cliente sem conexão abria o modal de conectar a Meta: agora avisa que a agência atualiza os dados.
- "Lembrar neste navegador" começava sempre desmarcado: reflete se já há token salvo no localStorage ([[modal-conectar-meta]]).
- E-mail: status 403 aparecia como "só roda com npm run dev" (agora `REMOTE_BLOCKED` com aviso próprio); faltava `replyTo` (agora `EMAIL_REPLY_TO`); o limite só contava envios bem-sucedidos (agora conta tentativas); corpo grande dava 400 ou derrubava a conexão (agora 413); `SMTP_SECURE` não estava documentado ([[envio-de-email-smtp]]).
- Campanhas da conta anterior ao trocar de conta: as telas remontam com `key={account.id}`.
- Cliente via outras contas e a visão gestor: `CLIENT_VIEWER` fica preso à própria conta e à visão cliente.
- Hooks do simulador de ROI declarados depois de um `return null`: corrigido.
- Formulário de marca guardava a edição descartada: o rascunho é refeito a cada abertura.
- "Contatos no WhatsApp" somava todos os objetivos: o relatório usa `resultLabel` e separa por tipo de campanha.
- Filtro "30 dias" mostrava o total: os períodos são último dia, 7 dias e desde o início.
- Alcance de 7 dias somava o alcance diário: agora é "alcance médio por dia".
- Conta real herdava campanhas do mock: ela vem vazia e mostra o `ApiAccountNotice`.
- Conta conectada sumia ao recarregar: fica salva em `ab_adsdesk_connected_account`.
- Código morto e dependências sem uso (`@google/genai`, `express`, `dotenv`, `motion`, `tsx`) saíram ([[refatoracao-ux-2026-09-25]]).

## Checagem sugerida
Rodar `npm run lint`, `npm test`, `npm run build` e `node scripts/check-wiki.mjs` antes da entrega. Esses testes não substituem validação visual, de teclado ou uma conexão real autorizada. Um ESLint com `eslint-plugin-react-hooks` pegaria erros de hooks que o `tsc` não vê. A ordem de correção fica em [[pontos-de-melhoria]].
