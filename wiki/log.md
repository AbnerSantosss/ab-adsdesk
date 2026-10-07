---
tipo: log
atualizado: 2026-10-07
tags: [log, historico]
---

# Registro da wiki

Uma linha por operação, a mais recente embaixo. Formato: `## [AAAA-MM-DD] <tipo> | <resumo>`.

## [2026-09-25] setup | Wiki inicial com 30 páginas em 7 pastas (produto, negocio, telas, arquitetura, dados, integracoes, riscos)
Escrita sobre o código exportado do AI Studio, antes da refatoração. Registro retroativo, pois a
wiki não tinha `log.md`.

## [2026-09-25] update | Refatoração de UX e responsividade
Todas as páginas foram revisadas contra o código novo. As decisões e o porquê de cada uma estão em
[[refatoracao-ux-2026-09-25]].

## [2026-09-25] fix | Renomeações e link quebrado
- `melhores-criativos` → [[anuncios]]
- `navbar` → [[cabecalho-e-navegacao]]
- `relatorios-diarios` → [[relatorio-diario]]
- `roadmap-para-producao` era citado 15 vezes e não existia. Os links agora apontam para a nova
  [[pontos-de-melhoria]].

## [2026-09-25] update | Páginas novas
- [[index]]
- [[pontos-de-melhoria]]
- [[refatoracao-ux-2026-09-25]]
- [[interface-e-responsividade]]
- [[envio-de-email-smtp]]
- `CLAUDE.md` e `GEMINI.md` na raiz, com a regra de ler a wiki antes de mexer no código.

## [2026-09-25] update | Gemini removido
[[gemini-ai-studio]] virou uma página curta de histórico: a dependência saiu porque nenhum recurso
usava IA.

## [2026-09-25] fix | Segunda rodada de correções (revisão dos agentes)
Média do Diário e do resumo passou a ser a dos dias anteriores (`weekBefore`); campeão de reserva sem
anúncio em queda; textos do resumo e do anúncio destaque seguem a regra usada; "0%" estável no KPI;
"dias no ar" até o último dia com dados; voltar sem `#` abre a Visão geral; Esc devolve o foco nos
menus; link de pular não troca a tela; lista de contas e grids sem rolagem lateral no celular; e-mail
com `EMAIL_REPLY_TO`, 413, limite por tentativa e aviso próprio para acesso pela rede. Páginas
atualizadas: [[bugs-conhecidos]], [[metricas-e-calculos]], [[visao-geral]], [[relatorio-diario]],
[[anuncios]], [[campanhas]], [[auditoria-transparencia]], [[cabecalho-e-navegacao]],
[[interface-e-responsividade]], [[envio-de-email-smtp]], [[modal-conectar-meta]].

## [2026-09-25] update | Login com um botão rápido
A tela de login tem um único botão de entrada rápida, o do gestor (pedido do usuário). A cliente
entra pelo formulário ou é vista em "Ver painel como". Páginas: [[tela-login]],
[[perfis-e-modos-de-visao]], [[personas]], [[index]].

## [2026-09-25] lint | Links, nomes antigos e dados sensíveis
37 páginas, nenhum link quebrado nem página órfã, todas com `atualizado: 2026-09-25`. Nomes antigos
(Navbar, CreativesRanking, `bun.lock`, `GEMINI_API_KEY`) só aparecem como histórico. Nenhum endereço
ou senha real na wiki. [[pontos-de-melhoria]] ganhou os itens 11, 12 e 17 a 19.

## [2026-09-25] update | Deploy (GitHub + GHCR + Portainer + Cloudflare) — parado no meio
Criados `Dockerfile`, `deploy/nginx.conf`, `deploy/security-headers.conf` (CSP), `.dockerignore`,
`docker-compose.yml` (GHCR, `127.0.0.1:3340`) e `.github/workflows/build.yml`. Imagem testada
localmente. Commit local `832f46f`; o repositório público `AbnerSantosss/ab-adsdesk` foi criado,
mas o push foi recusado por falta do escopo `workflow` no `gh`. O usuário pediu para parar. Portainer
e Cloudflare não foram mexidos. Onde parou e os próximos passos: [[deploy-vps-portainer]].

## [2026-10-07] update | Imagens ilustrativas nos anúncios
Documentadas as 11 fotos geradas por IA (7 de Pilates e 4 de estética), o campo opcional
`AdCreative.previewImage`, os arquivos WebP locais, o gradiente de reserva e a reutilização das
imagens nos cartões, destaques, miniaturas de campanhas e detalhe. Cartões com 224 px de altura,
miniaturas com 64 × 64 px e detalhe nas proporções declaradas. Páginas atualizadas: [[anuncios]],
[[modelo-de-dados]], [[dados-mock]], [[o-que-e-simulado]], [[campanhas]], [[visao-geral]] e
[[interface-e-responsividade]]. As imagens continuam sendo prévias ilustrativas, sem importação
dos criativos reais da Meta.

## [2026-10-07] update | Identidade visual de anúncios Instagram e Facebook
Documentada a identidade própria AB AdsDesk, com SVG AB e favicon, tema padrão `social`, preservação
das configurações white-label já salvas, foto de estúdio no login/fundo e fundos por assunto.
`PageHeader`, `Card`, `KpiCard` e `SocialChannels` recebem os novos recursos visuais. As fotos de
anúncios permanecem ilustrativas; cartões de anúncios passam a 288 px e miniaturas de campanhas
a 80/96 px, mantendo proporções no detalhe. Atualizadas [[tela-login]], [[visao-geral]],
[[campanhas]], [[anuncios]], [[relatorio-diario]], [[auditoria-transparencia]],
[[interface-e-responsividade]], [[personalizar-marca]] e [[modelo-de-dados]]. O visual não acrescenta
insights, autenticação, métricas por plataforma ou envio automático; cálculos, guardas e fontes de
dados reais/simulados permanecem os mesmos.

Validação final: `npm run lint`, `npm run build` e `git diff --check` aprovados. No navegador,
as cinco seções foram conferidas em 375, 768 e 1280 px, sem rolagem horizontal ou valores cortados
nos cenários verificados, com imagens carregadas. Conferidos filtro "Imagem" (3 cartões), expansão
de campanha, modal com foto, troca do dia para 22/09, ocultação dos controles de envio no perfil
cliente e login em 375/1280 px. Ajustes finais incluem altura mínima do destaque, colunas dos seus
KPIs e remoção dos chips de canais duplicados da Visão geral. Tema `social`, SVG/favicon e a foto
`social-studio.webp` no login/fundo foram confirmados na implementação.

## [2026-10-07] update | Paleta neutra, pesquisa de cores e cabeçalho compacto com calendário
Aplicado fundo branco gelo, cards e ícones neutros, cor uniforme por linha de KPI e acento restrito
a ações, seleção e estados com significado. Fotos permanecem nos criativos e no login; saem do
fundo geral e do cabeçalho da Visão geral. Registrada a fundamentação em
[[cores-e-hierarquia-visual]], ligada pelo índice e pelas páginas de interface e telas. Mantidos
o símbolo próprio AB, as configurações white-label e as permissões de gestor/cliente.

A [[visao-geral]] passa a usar barra compacta com Hoje, Ontem, Últimos 7 dias e calendário De/Até.
`DateRangeFilter` edita um rascunho e aplica após validação; Cancelar/Esc não altera o intervalo.
Hoje/Ontem/7 dias seguem o calendário local real. O mock inicia no intervalo personalizado da
amostra, claramente datado. KPIs e gráfico usam o mesmo recorte; ausência de registro é estado
sem dados, e cobertura parcial é indicada. Campanhas por objetivo, criativo de melhor performance,
resumo e métricas técnicas mantêm escopo acumulado explicitado. A foto de melhor desempenho fica
apenas em seu cartão separado.

Verificação do filtro: 20 checagens de datas, ano bissexto, intervalos inválidos, ordenação, início
real/demonstração e recorte do mock aprovadas. Raro em 21–22/09/2026 soma R$ 182,70 e 33 resultados;
Hoje/Ontem/Últimos 7 dias em 07/10/2026 não têm registros. `npm run lint` e `npm run build` aprovados
após a implementação do calendário; a conferência visual final acompanha a revisão integrada.

## [2026-10-07] update | Configurações da Meta e importação de relatórios reais
A aba [[configuracoes]] substitui a entrada principal do antigo [[modal-conectar-meta]], com passo a
passo, links oficiais, formulário de ID/token, progresso, ajuda e atalho de marca. Contas reais
passam a usar `MetaReports` e `MetaReportSnapshot`, separados dos dados de demonstração.

`fetchMetaDashboard` consulta a Marketing API v26.0 em modo somente leitura: conta, totais, dias,
campanhas, anúncios e mídia disponível. A primeira leitura cobre 30 dias inclusivos no fuso da
conta; períodos posteriores podem ter até 366 dias. Paginação tem limites explícitos, falha não
aplica dados parciais e ausência continua `null`. Alcance único não soma dias; tipos de ação
sobrepostos não são somados como contatos. A auditoria real não inventa nota, Pixel, WhatsApp ou
origem Turbinar. O destaque real identifica o anúncio com mais cliques.

O token usa `Authorization: Bearer` e permanece em memória/sessionStorage. O legado persistente é
removido sem leitura; sair/desconectar limpa credencial e snapshot. A cópia do relatório, sem token,
pode permanecer local após fechar a aba. Não há OAuth, backend Meta, renovação automática,
agendamento ou autenticação de produção. Atualizadas [[meta-graph-api]], [[modal-conectar-meta]],
[[modelo-de-dados]] e [[o-que-e-simulado]], com nova [[configuracoes]] e link no índice.

Referências oficiais Meta verificadas em 07/10/2026 fundamentam escopos, acesso a ativos, diferenças
entre Standard/Advanced e Limited/Full, versões e validade/revogação de tokens. Não foi usada
credencial real nem comprovada conexão ao vivo nesta revisão; testes controlados e verificação da
interface devem ser registrados separadamente de validação com uma conta autorizada.
Sincronismo final desta entrega: corrigidas as páginas de persistência, navegação, segurança,
índice e roadmap para refletir token somente de sessão, relatório real separado do mock,
Configurações restritas ao gestor, limpeza/cancelamento ao sair e cliente sem conta sem fallback.
O roadmap agora reconhece insights, mídia real e testes controlados já implementados, mantendo
pendentes backend, OAuth, autenticação, operação multiusuário e validação ao vivo. A prévia real
recupera a imagem quando a URL muda. A varredura Tailwind fica limitada a `src` e `index.html`,
evitando que edições de documentação disparem reconstruções de estilos durante a configuração.
## [2026-10-07] update | Wiki conectada e entrega preparada para o GitHub
Revisados os vínculos entre produto, telas, dados, integrações e riscos. O índice conecta o histórico
[[log]] e o mapa [[README]], que oferece links Markdown navegáveis no GitHub. Documentação obsoleta
de login, métricas, anúncios e integração foi ajustada ao código atual. O README do projeto explica
execução, conexão Meta, publicação e limites de produção.

Adicionado `npm run wiki:check` para verificar metadados, slugs, links, âncoras e páginas órfãs ou
inalcançáveis. O GitHub Actions passa a executar essa verificação e os testes antes do build Docker.
Os arquivos necessários para execução, incluindo marca e imagens WebP, estão no escopo do commit;
originais de geração e evidências locais em `output/` ficam fora do Git e do contexto Docker.

Validação desta entrega: `npm run lint`, `npm run build` e os 15 testes de `npm test` aprovados.
A conferência anterior da interface cobriu 33 cenários de telas demonstrativas, Configurações e
relatórios reais com respostas controladas em 375, 768 e 1280 px, sem rolagem horizontal. Nenhuma
conexão Meta ao vivo foi comprovada. A revisão independente não encontrou bloqueio para publicação;
a varredura de padrões conhecidos de segredos não apontou arquivos publicáveis.

O envio ao GitHub e o resultado do workflow serão registrados em [[deploy-vps-portainer]]. A
publicação na VPS continua uma etapa separada; este registro não confirma atualização do servidor.

Checagem final da wiki: 41 páginas, 631 wikilinks e 41 links Markdown locais válidos; nenhum slug
repetido, metadado inválido, link/âncora quebrado ou página órfã/inalcançável. Os exemplos de links
em código inline ou blocos de código são ignorados pelo validador.
