---
tipo: conceito
atualizado: 2026-10-07
tags: [dados, metricas, calculos, cpa, regras]
---

# Métricas e cálculos

Os cálculos da demonstração estão principalmente em `src/lib/metrics.ts`, com rótulos/unidades em `src/lib/objectives.ts` e formatação em `src/lib/format.ts`. A Visão geral agrega o intervalo escolhido usando `src/lib/dateRange.ts` e suas linhas de histórico. Contas reais usam `MetaReportSnapshot`, importado por `src/services/metaGraphApi.ts`, e não reutilizam os totais do mock. Ver [[dados-mock]], [[modelo-de-dados]] e [[meta-graph-api]].

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
- A [[visao-geral]] usa **Hoje**, **Ontem**, **Últimos 7 dias** e calendário **De/Até** (`DateRangeFilter`). Os presets seguem o dia do navegador; a demonstração começa explicitamente no intervalo disponível da amostra, não finge que setembro é hoje.
- `daysInRange` filtra as datas inclusivas e ordena os dias para o gráfico. KPIs e gráfico usam o mesmo recorte. Sem registros, mostram ausência de dados, não zero. Com lacunas, os totais usam os registros existentes e informam quantos dias têm dados.
- Um único dia mostra seu alcance; vários dias mostram a **média de alcance dos dias com registros**. Esse valor não é alcance único do período. Variações de resultado/CPA de um único dia só aparecem se o dia anterior de calendário existir no histórico.
- `periodSummary` permanece como auxiliar legado (`ALL`, `LAST_DAY`, `LAST_7`), mas não controla o calendário atual da Visão geral. Seu `LAST_DAY` ainda depende da ordem decrescente da lista.
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

## Relatórios reais importados da Meta

O contrato atual e as consultas exatas estão em [[meta-graph-api]]. A conexão em [[configuracoes]] importa totais, dias, campanhas, anúncios e criativos para `apiReport`; a interface `MetaReports` mantém conversas, cadastros, compras, cliques e alcance separados.

- O período real usa `since`/`until` no fuso da conta. A primeira importação traz 30 dias; outra faixa exige nova consulta e tem limite de 366 dias.
- Alcance único vem do total no nível da conta, com `time_increment=all_days`; não é soma de campanhas/dias nem média diária.
- Ausência de valor permanece `null`; ausência de linhas não comprova zero. `actions` escolhe um alias por família e não soma aliases sobrepostos. Não há deduplicação universal de pessoas entre famílias.
- CPA genérico da conta, nota de saúde, comparativo "Turbinar" e classificação de desgaste do mock não são calculados sobre a conta real. O destaque real é explicitamente o anúncio com mais cliques.
- Alterar o intervalo mantém o último snapshot visível até uma importação inteira concluir. Uma falha não troca o período exibido nem aplica números parciais. Impressão usa esse snapshot concluído.

Essas regras estão implementadas e cobertas por testes com respostas controladas; não houve validação de uma conta do usuário ao vivo nesta revisão. Conferir colunas, atribuição, fuso e período no Gerenciador é parte da validação real.

## Armadilhas

- **Comparar com os dias anteriores, nunca com a série inteira.** Até 2026-09-25 o Diário usava os 7 dias mais recentes, que incluíam o próprio dia e, para um dia antigo, dias posteriores. Qualquer média nova deve usar `weekBefore`.
- **Ordem do histórico.** O `LAST_DAY` legado usa posições da lista; o calendário atual filtra/ordena por data e `weekBefore` também ordena antes de selecionar dias anteriores. Não atribuir a eles a limitação do auxiliar antigo.
- **Recortes distintos, identificados.** O calendário filtra os KPIs e o gráfico da demonstração. Objetivos, criativo campeão, resumo e métricas técnicas têm rótulos explícitos de acumulado/último registro. Não apresentar esses blocos como pertencentes à faixa selecionada.
- **Unidades misturadas no mock.** O "resultado" soma conversas, cadastros e "contatos" de REACH e TRAFFIC (TRAFFIC usa a unidade "contato" para cliques). O `share`, o CPA da conta e o [[simulador-roi]] ainda misturam essas unidades ([[bugs-conhecidos]]). A conta real usa famílias separadas; o simulador ainda não consome `apiReport` e exige premissas manuais.
- **Dias no ar.** O "N dias no ar" dos cards de Campanhas conta até o último dia com dados da conta (`dailyHistory[0]`), não até hoje; assim o mock não "envelhece". Sem histórico, cai na data de hoje.
