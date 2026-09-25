---
tipo: conceito
atualizado: 2026-09-25
tags: [dados, metricas, calculos, cpa, regras]
---

# Métricas e cálculos

Todo número derivado sai de `src/lib/metrics.ts` (as contas), `src/lib/objectives.ts` (rótulos, unidades e cores de cada objetivo) e `src/lib/format.ts` (exibição em pt-BR). As telas não fazem conta própria, e o mock guarda só números brutos ([[dados-mock]], [[modelo-de-dados]]).

Mudou em 2026-09-25: saíram as faixas fixas de CPA (≤ 6 e ≤ 10), a meta de R$ 8, os fatores 0,55 e 0,5, o rateio diário inventado e o "+18,4%" escrito à mão. Tudo agora é calculado a partir dos dados.

## Fórmulas base

| Métrica | Fórmula | Detalhe |
|---|---|---|
| CPA (custo por resultado) | gasto ÷ resultados | `null` sem resultado; aparece como "—" |
| CTR | cliques ÷ impressões | **fração** (0,0183); o `formatPercent` multiplica por 100 |
| CPC | gasto ÷ cliques | |
| CPM | gasto ÷ impressões × 1000 | |
| Frequência | impressões ÷ alcance | |
| Variação | (atual − anterior) ÷ anterior | `deltaPct`; `null` quando o anterior é 0 |

A função `ratio` devolve `null` quando o denominador é ≤ 0, então nunca aparece `Infinity` nem `NaN` na tela.

## Totais e períodos

- `accountTotals` soma as campanhas. Para o **alcance**, usa `account.uniqueReach` quando existe, porque somar o alcance das campanhas conta a mesma pessoa várias vezes.
- `periodSummary` alimenta a [[visao-geral]] com três períodos:
  - "Desde o início" (`ALL`): os totais da conta.
  - "Último dia" (`LAST_DAY`): `dailyHistory[0]`, com variação contra `dailyHistory[1]`.
  - "7 dias" (`LAST_7`): soma de gasto e resultados. O alcance é a **média por dia** ("Alcance médio por dia"), porque somar alcances diários não faz sentido.
- `breakdownByObjective` junta as campanhas desde o início (Visão geral). `breakdownDays` junta o `byObjective` dos dias ([[relatorio-diario]]). Nos dois, `share` é a fração dos resultados, na ordem de `OBJECTIVE_ORDER`.

## Selos e notas

- **`cpaHealth`** compara um CPA com a média da própria conta: até 0,9× é "Abaixo da média"; até 1,15× é "Na média"; até 2× é "Acima da média"; acima disso, "Muito acima". Por ser relativo, uma clínica com CPA de R$ 16 não é punida por réguas feitas para Pilates ([[nicho-pilates-e-generalizacao]]).
- **Campeão (`pickChampion`):** o menor CPA entre os anúncios com pelo menos 10 resultados (`MIN_RESULTS_FOR_CHAMPION`) que não estão em `FATIGUE`. Se nenhum se qualificar, vale o de mais resultados entre os que não estão em queda (e, só se todos estiverem, o de mais resultados). Os selos (`creativeBadges`) são "Menor custo", "Mais resultados", "Desempenho em queda" e "Pausado"; "Menor custo" exige amostra mínima e que o campeão não esteja em queda.
- **Auditoria (`auditChecks` + `auditScore`):** seis itens com pesos.
  - Pixel: 20.
  - WhatsApp: 15.
  - Estrutura (nenhum turbinado ativo): 30.
  - Público (toda campanha estruturada ativa tem conjunto de anúncios): 15.
  - Desgaste (nenhum criativo `FATIGUE` em campanha ativa): 10.
  - Histórico diário: 10.

  A nota vai de 0 a 100: a partir de 90 é "Excelente", de 70 "Bom", de 50 "Precisa de atenção", e abaixo disso "Crítico". Ver [[auditoria-transparencia]].
- **`structureComparison`:** CPA das campanhas estruturadas contra o dos posts turbinados, e o multiplicador entre eles ([[profissional-vs-turbinar]]).

## Textos gerados

- **Média de comparação (`weekBefore`):** soma até 7 dias **anteriores** à data escolhida (a lista é ordenada por data antes). Nunca inclui o próprio dia nem dias posteriores. `previousDaysLabel(n)` gera "do dia anterior" ou "dos N dias anteriores", porque no começo do histórico há menos de 7. O dia mais antigo não tem comparação.
- **`executiveSummary`** ("Em poucas palavras") monta as frases a partir dos números:
  - "Desde o início, R$ X investidos trouxeram N resultados, a R$ Y cada.";
  - "O anúncio de menor custo foi…" quando o campeão tem amostra mínima; senão, "O anúncio com mais resultados foi…";
  - a frase do post turbinado ("custou" ou "custaram") só aparece se o multiplicador passar de 1,2×;
  - o último dia é comparado com `weekBefore` ("…abaixo da média dos 6 dias anteriores"), e uma diferença de até ±5% conta como "em linha".
- **`dailyReportMessage`** gera o texto do WhatsApp, com `*negrito*`, para o dia escolhido, com "(média dos N dias anteriores: R$ X)" vindo de `weekBefore` ([[compartilhamento-whatsapp]]).
- **Formatação:**
  - `formatMoney` guarda em cache um `Intl.NumberFormat` por moeda e casas decimais.
  - `formatDelta` usa o sinal tipográfico "−" e tira o sinal do valor **já arredondado**: −0,3% vira "0%", não "−0%". O `KpiCard` trata abaixo de 0,5 ponto como estável (cinza, seta para o lado).
  - `parseISODate` monta a data local, o que impede "2026-09-23" de virar dia 22 por causa do UTC.

## Como obter da Meta (produção)

- **Endpoint:** `GET /{act_id}/insights`, com `level` (`account`, `campaign`, `adset` ou `ad`), `time_range` e `time_increment=1` para a série diária.
- **Campos:** `spend`, `impressions`, `reach`, `clicks`, `frequency`, `actions`, `cost_per_action_type` e `objective`.
- **"Resultado" por `action_type`:**
  - mensagens: `onsite_conversion.messaging_conversation_started_7d`;
  - cadastros: `lead`;
  - tráfego: `link_click`;
  - conversões: o evento do pixel.
- **Alcance único:** o da semana exige uma consulta própria, sem `time_increment`. Ver [[meta-graph-api]].

## Armadilhas

- **Comparar com os dias anteriores, nunca com a série inteira.** Até 2026-09-25 o Diário usava os 7 dias mais recentes, que incluíam o próprio dia e, para um dia antigo, dias posteriores. Qualquer média nova deve usar `weekBefore`.
- **Ordem do histórico.** `LAST_DAY` usa `dailyHistory[0]` e `[1]` e assume ordem decrescente de data. Ao mapear a API real, ordene.
- **"Dia anterior" pode não ser ontem.** `LAST_DAY` compara com o item anterior da lista; se faltar um dia no histórico, a comparação pula o buraco.
- **Unidades misturadas.** O "resultado" soma conversas, cadastros e "contatos" de REACH e TRAFFIC (TRAFFIC usa a unidade "contato" para cliques). O `share`, o CPA da conta e o [[simulador-roi]] misturam essas unidades ([[bugs-conhecidos]]).
- **Dias no ar.** O "N dias no ar" dos cards de Campanhas conta até o último dia com dados da conta (`dailyHistory[0]`), não até hoje; assim o mock não "envelhece". Sem histórico, cai na data de hoje.
