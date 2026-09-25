---
tipo: decisao
atualizado: 2026-09-25
tags: [refatoracao, ux, responsividade, decisao, historico]
---

# Refatoração de UX e responsividade (2026-09-25)

Pedido: revisar o código, refatorar a UX, deixar o app funcional e responsivo, levantar pontos de
melhoria e atualizar esta wiki. No mesmo dia entrou o envio do relatório por e-mail.

Esta página explica **por que** cada mudança foi feita. O estado atual de cada tela está na página
dela; o que ficou pendente está em [[pontos-de-melhoria]].

## O que a revisão encontrou

- **Números fixos no código em vez de calculados.** Deltas como "+18.4%", metas como "R$ 8,00",
  CPM e frequência de gestor, o "Resumo Executivo" e o detalhamento por campanha do relatório eram
  texto fixo. Com a conta Clínica Harmonize, os números não batiam com os dados.
- **Afirmações que o app não cumpria.** Por exemplo: "Criptografia AES-256", selo "Meta Ads Conectado"
  com dados de demonstração, "sincronização em tempo real", logins sociais que não faziam nada e
  "100% Verificado" na auditoria. Num produto cuja promessa é transparência, isso é o pior tipo de bug.
- **Bugs.** São quatro:
  - a lista de campanhas não mudava ao trocar de conta (estado copiado das props);
  - o `RoiCalculatorModal` quebrava a regra dos hooks;
  - datas `YYYY-MM-DD` apareciam um dia antes no Brasil;
  - a tela quebrava em contas sem histórico.
- **Celular.** Não havia navegação no rodapé, as linhas de métricas não quebravam e a tabela tinha 6
  colunas. Os menus fechavam só com `onMouseLeave`, o que não funciona no toque.
- **Acessibilidade.** Havia `div` clicáveis, modais sem Esc, sem `role` e sem controle de foco, alvos
  de toque pequenos e texto de 10 px.
- **Marca.** Clareza Ads, AB AdsDesk e VivaBem conviviam no mesmo app, e a cor escolhida pelo gestor
  não era aplicada (ver [[inconsistencias-de-marca]]).
- **Peso morto.** O projeto tinha dependências sem uso (`@google/genai`, express, dotenv, motion,
  esbuild, tsx), um `bun.lock` desatualizado e um bundle único de 795 kB.

## Decisões

| Decisão | Por quê |
| --- | --- |
| Tirar do código todo número fixo e calcular tudo em `src/lib/metrics.ts` | Se o dado muda, a tela muda junto. É o que prepara a troca do mock pela API real ([[metricas-e-calculos]]). |
| Formatar tudo em `src/lib/format.ts` e usar `parseISODate` | Acaba com o `toFixed(2).replace('.', ',')` repetido e com o bug de fuso. |
| Separar a navegação em `navigation.ts`, com rotas por hash (`#campanhas`...) | O botão voltar funciona e dá para mandar o link direto de uma tela ao cliente, sem precisar de roteador ([[estado-e-navegacao]]). |
| Trocar o Navbar de 506 linhas por `AppHeader`, `AccountSwitcher`, `UserMenu`, `BottomNav` e `AppFooter` | No celular, as abas ficam no polegar (barra inferior). Os menus passam a fechar com toque fora e com Esc (`useDismiss`) ([[cabecalho-e-navegacao]]). |
| Criar a biblioteca `src/components/ui/` (Card, Modal, KpiCard, SegmentedControl...) | Um único `Modal` acessível no lugar de quatro implementações. Os cards de KPI iguais em todas as telas ([[interface-e-responsividade]]). |
| Aplicar a marca por tokens `--brand-*` trocados via `data-brand` | A cor escolhida em [[personalizar-marca]] finalmente pinta o app inteiro. |
| Deixar o cliente sempre em modo Cliente (`viewMode` derivado do papel) | Antes o cliente conseguia alternar para a visão de gestor ([[perfis-e-modos-de-visao]]). |
| Remover as afirmações falsas e marcar os dados de demonstração | Transparência é o produto. O que é simulado está listado em [[o-que-e-simulado]]. |
| Escolher o anúncio destaque pelo menor custo com amostra mínima | Antes era o primeiro da ordenação e mudava conforme o filtro ([[anuncios]]). |
| Deixar a auditoria só como tela, com afirmações derivadas dos dados | O modal repetia a tela, e os dois tinham afirmações fixas, como "0% em posts turbinados" numa conta com post turbinado ([[auditoria-transparencia]]). |
| Carregar telas e modais sob demanda, com pré-carregamento dos modais 2 s após o login | Saímos de um bundle único de 795 kB para um núcleo de ~269 kB mais chunks por tela. |
| Limpar as dependências e trocar o `bun.lock` pelo `package-lock.json` | O `npm install` falhava com ERESOLVE por causa de um esbuild sem uso. |
| Enviar o relatório por e-mail com SMTP no servidor do Vite | O pedido veio do usuário. A senha fica só no Node, nunca no navegador ([[envio-de-email-smtp]]). |

## Armadilhas encontradas no caminho

- **Grid sem colunas explícitas estoura no celular.** A trilha implícita `auto` cresce até o
  min-content dos filhos (texto com `truncate`, gráfico do recharts). Correção: `grid-cols-1` ou
  `min-w-0`. O `Card` já vem com `min-w-0`. Detalhes em [[interface-e-responsividade]].
- **Um item de menu que abre modal perde o foco.** O item some junto com o menu antes de o modal
  guardar quem o abriu. Por isso o foco caía no `<body>`. Hoje o `UserMenu` devolve o foco ao botão
  antes de executar a ação.
- **Modal lazy parece "não abrir" no `npm run dev`.** O Vite transforma o arquivo no primeiro clique.
  O pré-carregamento resolve; não removê-lo.

## Como foi verificado

- `npm run lint` e `npm run build` limpos.
- Varredura automática sem rolagem horizontal em 375, 768 e 1280 px, nas 5 telas, como gestor e como
  cliente.
- Os modais de marca, conexão com a Meta, simulador e e-mail foram abertos no celular.
- Esc e devolução de foco testados.
- Console sem erros nem avisos.
- `npm run email:check` aceitou o login SMTP. As rotas de e-mail foram testadas com `curl`, sem enviar
  mensagem real.

O código anterior foi guardado fora do projeto, só para comparação durante a sessão. Não faz parte
do repositório.
