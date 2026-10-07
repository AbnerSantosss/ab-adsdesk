---
tipo: tela
atualizado: 2026-10-07
tags: [tela, visao-geral, dashboard, kpi, graficos]
---

# Visão geral (aba "Início")

**Arquivo:** `src/components/screens/Overview.tsx`. Hash `#visao-geral`; na barra inferior do celular aparece como "Início". É a primeira tela depois do login e funciona como o "extrato" do investimento.

> Mudou em 2026-09-25: saíram todos os números fixos no código (+18,4%, "Meta: R$ 8,00", CPM 31,40, frequência 1,54x, fatores 0,55 e 0,5), o "Resumo Executivo" de texto fixo e o banner que abria o modal de auditoria. Tudo passou a ser calculado em `src/lib/metrics.ts`. O filtro por objetivo saiu daqui e ficou só em [[campanhas]].

## Objetivo para o usuário
Responder em poucos segundos: "quanto investi, quanto voltou e quanto custou cada contato?" ([[visao-do-produto]]).

## O que aparece, de cima para baixo
1. **Cabeçalho compacto:** nome do negócio, contexto Instagram/Facebook e intervalo exato, sem foto. À direita ficam **Hoje**, **Ontem**, **Últimos 7 dias** e o botão de calendário. No celular os controles quebram linha. O calendário abre um modal com campos **De** e **Até**, validação, **Cancelar** e **Aplicar período**. Cancelar ou Esc preserva o intervalo já aplicado.
2. **4 KPIs:**
   - Investimento;
   - resultados, com o rótulo da conta (ex.: "Contatos gerados");
   - Custo por resultado;
   - Alcance.

   Os quatro cartões têm o mesmo fundo, contorno e tratamento de ícone. Em um intervalo de um único dia, resultados e custo comparam o dia anterior do calendário somente se esse registro existir. Sem registros, aparecem travessões e "Sem dados no período", nunca zeros inventados. Intervalos parcialmente disponíveis informam quantos dias têm registros.
3. **"Investimento e resultados por dia":** usa exatamente o mesmo intervalo dos KPIs, com barras de investimento (eixo esquerdo) e linha com pontos de resultados (eixo direito). Há um botão para trocar para **Tabela**, que é a forma acessível de ler os valores de cada dia. Sem registros, mostra estado vazio com o histórico disponível e ação para voltar a esse período.
4. **"Resultados por tipo de campanha"** (desde o início): um botão por objetivo, com resultados, barra de participação, custo por unidade e %. Tocar abre [[campanhas]] já filtrada por aquele objetivo.
5. **"Criativo de melhor performance":** cartão separado com a prévia fotográfica ilustrativa de 224 px de altura, reutilizando a mesma imagem local de [[anuncios]], Resultados, Custo cada, CTR e "Ver todos os anúncios". A foto deixa de ocupar o cabeçalho principal. Sem imagem ou em erro, permanece o gradiente de reserva. O subtítulo informa que a classificação é acumulada desde o início e explica a regra: menor custo com amostra suficiente ou, sem nenhum anúncio com 10 resultados, maior resultado ainda sem amostra suficiente.
6. **"Em poucas palavras":** frases de `executiveSummary`, montadas com os números:
   - "Desde o início, R$ X investidos trouxeram N resultados, a R$ Y cada.";
   - o objetivo que mais trouxe resultados;
   - "O anúncio de menor custo foi…" ou, no plano B, "O anúncio com mais resultados foi…";
   - quanto o turbinado custou a mais, só se passar de 1,2×;
   - o último dia comparado com a média dos dias anteriores ("6% abaixo da média dos 6 dias anteriores").

   Embaixo fica a faixa **"Saúde da conta: N/100"**, com o botão "Ver auditoria" ([[auditoria-transparencia]]).
7. **"Métricas técnicas"** (só gestor, desde o início): impressões, cliques, CTR, CPC, CPM e frequência, cada uma com uma explicação curta ([[glossario-sem-jargao]]).

O fundo geral é branco gelo e os cartões compartilham superfícies neutras. Títulos, espaçamento, contornos e camadas claras organizam os assuntos. As barras do gráfico são cinza-azuladas e a linha é grafite; forma e legenda distinguem as duas séries. Cor de marca fica nas ações e seleção; cor semântica fica nos estados com texto. A fundamentação e as regras de manutenção estão em [[cores-e-hierarquia-visual]].

## Gestor × cliente
O cliente vê tudo, menos "Métricas técnicas". Numa conta real ainda sem dados, só o gestor recebe o botão "Gerenciar conexão" ([[modal-conectar-meta]], [[perfis-e-modos-de-visao]]).

## No celular
- KPIs em 2 colunas (4 a partir de `lg`). Rótulos longos quebram em até 2 linhas sem estourar o cartão ([[interface-e-responsividade]]).
- O seletor de período usa quebra de linha, sem rolagem horizontal. O calendário usa o modal acessível já adotado pelo produto.
- O gráfico tem 256 px de altura. A tabela rola na horizontal.
- Os blocos ficam empilhados numa coluna só.

## De onde vêm os dados
- Contas de demonstração: `src/data/mockData.ts` ([[dados-mock]]).
- `src/lib/dateRange.ts` produz intervalos inclusivos e filtra `dailyHistory` em ordem cronológica. **Hoje**, **Ontem** e **Últimos 7 dias** usam o calendário local real do navegador; os sete dias incluem hoje.
- A demonstração abre em intervalo **personalizado**, abrangendo os últimos sete registros disponíveis, e identifica o intervalo como "Amostra". Para o Raro, inicialmente é 17 a 23/09/2026. Não chama o último registro de hoje nem de ontem. Contas reais usam `MetaReports` e começam no snapshot de 30 dias importado por [[configuracoes]], com fuso e período próprios.
- O filtro afeta os KPIs e o gráfico. Quebra por objetivo, criativo de melhor performance, resumo e métricas técnicas conservam seu escopo acumulado ou de último registro, escrito em seus subtítulos.
- Conta real depende do histórico importado pela [[meta-graph-api]]. Sem campanhas nem histórico, a tela mantém `ApiAccountNotice`; o botão de gerenciamento continua exclusivo do gestor.

## Armadilhas
- **Datas sem registro não significam zero.** O estado vazio deve ser preservado. Se houver registros em apenas parte do intervalo, totais e gráfico usam esses registros e uma mensagem indica a cobertura parcial.
- **"Resultados" somam objetivos diferentes** (conversa, cadastro, alcance local), e o custo por resultado é a média disso tudo ([[bugs-conhecidos]]).
- **Alcance:** em um dia, é o alcance daquele dia; em vários, é a média dos dias com dados, não pessoas únicas do intervalo. Não somar alcance diário e apresentar como alcance único.
- **Anúncio destaque:** o plano B (o de mais resultados) evita anúncios em queda. O subtítulo e a frase do resumo dependem de `MIN_RESULTS_FOR_CHAMPION`; ao mudar a regra do campeão, mude os três juntos ([[metricas-e-calculos]]).
- O resumo acumulado ainda pode citar "último dia"; nesse bloco significa o último registro disponível, não Hoje ou Ontem dos filtros.
- Variação que arredonda para 0% aparece como "0%" em cinza, com seta para o lado e "(estável)" para leitor de tela (`KpiCard`, `formatDelta`).

## Para produção
- Insights reais por período (`time_range`) e por objetivo.
- Meta de custo por resultado configurável pelo gestor para cada cliente.
- Resumo em linguagem natural, que é um bom candidato a IA ([[gemini-ai-studio]]).
