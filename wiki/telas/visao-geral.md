---
tipo: tela
atualizado: 2026-09-25
tags: [tela, visao-geral, dashboard, kpi, graficos]
---

# Visão geral (aba "Início")

**Arquivo:** `src/components/screens/Overview.tsx`. Hash `#visao-geral`; na barra inferior do celular aparece como "Início". É a primeira tela depois do login e funciona como o "extrato" do investimento.

> Mudou em 2026-09-25: saíram todos os números fixos no código (+18,4%, "Meta: R$ 8,00", CPM 31,40, frequência 1,54x, fatores 0,55 e 0,5), o "Resumo Executivo" de texto fixo e o banner que abria o modal de auditoria. Tudo passou a ser calculado em `src/lib/metrics.ts`. O filtro por objetivo saiu daqui e ficou só em [[campanhas]].

## Objetivo para o usuário
Responder em poucos segundos: "quanto investi, quanto voltou e quanto custou cada contato?" ([[visao-do-produto]]).

## O que aparece, de cima para baixo
1. **Cabeçalho:** nome do negócio, tipo de negócio e legenda do período. O seletor de período tem "Último dia", "7 dias" (padrão) e "Desde o início". Sem histórico diário, sobra só "Desde o início".
2. **4 KPIs:**
   - Investimento;
   - resultados, com o rótulo da conta (ex.: "Contatos gerados");
   - Custo por resultado, em destaque;
   - Alcance.

   No "Último dia", resultados e custo mostram a variação "vs. dia anterior". Nos outros períodos, aparecem as dicas "somando todos os objetivos" e "quanto menor, melhor".
3. **"Investimento e resultados por dia":** barras de investimento (eixo esquerdo) e linha de resultados (eixo direito). Há um botão para trocar para **Tabela**, que é a forma acessível de ler os valores de cada dia.
4. **"Resultados por tipo de campanha"** (desde o início): um botão por objetivo, com resultados, barra de participação, custo por unidade e %. Tocar abre [[campanhas]] já filtrada por aquele objetivo.
5. **"Anúncio destaque":** prévia ilustrativa, Resultados, Custo cada, CTR e "Ver todos os anúncios" ([[anuncios]]). O subtítulo diz a regra usada: "Menor custo por resultado com amostra suficiente" ou, sem nenhum anúncio com 10 resultados, "Ainda sem amostra suficiente: este é o de mais resultados".
6. **"Em poucas palavras":** frases de `executiveSummary`, montadas com os números:
   - "Desde o início, R$ X investidos trouxeram N resultados, a R$ Y cada.";
   - o objetivo que mais trouxe resultados;
   - "O anúncio de menor custo foi…" ou, no plano B, "O anúncio com mais resultados foi…";
   - quanto o turbinado custou a mais, só se passar de 1,2×;
   - o último dia comparado com a média dos dias anteriores ("6% abaixo da média dos 6 dias anteriores").

   Embaixo fica a faixa **"Saúde da conta: N/100"**, com o botão "Ver auditoria" ([[auditoria-transparencia]]).
7. **"Métricas técnicas"** (só gestor, desde o início): impressões, cliques, CTR, CPC, CPM e frequência, cada uma com uma explicação curta ([[glossario-sem-jargao]]).

## Gestor × cliente
O cliente vê tudo, menos "Métricas técnicas". Numa conta real ainda sem dados, só o gestor recebe o botão "Gerenciar conexão" ([[modal-conectar-meta]], [[perfis-e-modos-de-visao]]).

## No celular
- KPIs em 2 colunas (4 a partir de `lg`). Rótulos longos quebram em até 2 linhas sem estourar o cartão ([[interface-e-responsividade]]).
- O seletor de período ocupa a largura toda.
- O gráfico tem 256 px de altura. A tabela rola na horizontal.
- Os blocos ficam empilhados numa coluna só.

## De onde vêm os dados
- Contas de demonstração: `src/data/mockData.ts` ([[dados-mock]]).
- "Último dia" é `dailyHistory[0]`; "7 dias" soma os 7 mais recentes; "Desde o início" soma as campanhas ([[metricas-e-calculos]]).
- Conta real: a [[meta-graph-api]] só entrega a situação da conta. Sem campanhas nem histórico, a tela mostra `ApiAccountNotice` ("Ainda não importamos as campanhas desta conta").

## Armadilhas
- **O período só muda os KPIs.** O gráfico mostra sempre os últimos 7 dias. A quebra por objetivo, o anúncio destaque e "Em poucas palavras" usam sempre o total desde o início.
- **"Resultados" somam objetivos diferentes** (conversa, cadastro, alcance local), e o custo por resultado é a média disso tudo ([[bugs-conhecidos]]).
- **Alcance:** em "7 dias" é a média por dia (rótulo "Alcance médio por dia"), não pessoas únicas. Em "Desde o início", usa `uniqueReach` quando existe; senão soma o alcance das campanhas e conta a mesma pessoa mais de uma vez.
- **Anúncio destaque:** o plano B (o de mais resultados) evita anúncios em queda. O subtítulo e a frase do resumo dependem de `MIN_RESULTS_FOR_CHAMPION`; ao mudar a regra do campeão, mude os três juntos ([[metricas-e-calculos]]).
- "Último dia" é o último dia do histórico (no mock, 23/09/2026), não necessariamente ontem.
- Variação que arredonda para 0% aparece como "0%" em cinza, com seta para o lado e "(estável)" para leitor de tela (`KpiCard`, `formatDelta`).

## Para produção
- Insights reais por período (`time_range`) e por objetivo.
- Meta de custo por resultado configurável pelo gestor para cada cliente.
- Resumo em linguagem natural, que é um bom candidato a IA ([[gemini-ai-studio]]).
