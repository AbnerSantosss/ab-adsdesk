---
tipo: entidade
atualizado: 2026-09-25
tags: [dados, mock, demo, raro-pilates]
---

# Dados mock (demonstração)

O arquivo `src/data/mockData.ts` (~656 linhas) exporta `mockAccounts: AdAccount[]`, com duas contas. É a fonte de todos os números do painel enquanto nenhuma conta real está conectada (ver [[o-que-e-simulado]]). Os usuários demo ficam em `demoUsers`, no `src/types/auth.ts` (ver [[perfis-e-modos-de-visao]]).

**Regra do arquivo:** só guarda números brutos (gasto, resultados, cliques, impressões, alcance). Totais, CPA, CTR, notas e selos são calculados em `src/lib/metrics.ts`, para nunca divergirem. Os valores abaixo são o que o painel mostra hoje, e foram conferidos somando o mock.

## Conta 1: Raro Pilates (`act_raro_pilates`)

A conta-vitrine: "Studio de Pilates personalizado", slogan "Cada aluno é único, cada evolução é valiosa". O ícone próprio vem de `logoKey: 'raro-pilates'`, desenhado pelo `AccountAvatar`. Tem pixel e WhatsApp conectados, e `uniqueReach` de 48.250.

| Campanha | Objetivo | R$/dia | Gasto | Resultados | CPA | Selo (vs. média) |
|---|---|---|---|---|---|---|
| `camp_01` [WhatsApp] Aula Experimental - Raio 3km | MESSAGES | 45 | 1.120,40 | 198 | 5,66 | Abaixo da média |
| `camp_02` [Cadastro] Alívio de dores na coluna e hérnia de disco | LEADS | 35 | 890,10 | 134 | 6,64 | Na média |
| `camp_03` [Local] Conheça o novo espaço do Raro Pilates nos Jardins | REACH | 15 | 310,00 | 52 | 5,96 | Na média |
| `camp_04` [Pausada] Post turbinado antigo do Instagram | TRAFFIC | 0 | 160,00 | 4 | 40,00 | Muito acima |

- **Totais desde o início:** R$ 2.480,50, 388 resultados, CPA de R$ 6,39, CTR de 1,83%, CPC de R$ 1,70 e frequência de 1,66.
- **Profissional × turbinado:** R$ 6,04 contra R$ 40,00, ou seja, o turbinado custa ≈6,6× mais. A `camp_04` é o "amador que o gestor já pausou" (ver [[profissional-vs-turbinar]]).
- **Criativos:** são 7. O campeão é "Reformer em ação…" (`creat_01`, 108 resultados a R$ 5,00). O `creat_07`, do post turbinado, está em `FATIGUE`.
- **Auditoria:** nota 100, "Excelente". O post turbinado e o criativo em fadiga não contam contra, porque a campanha está pausada.
- **Histórico:** 7 dias, de 23/09/2026 a 17/09/2026, todos com `byObjective`. Na semana: R$ 592,50 e 97 resultados (CPA de R$ 6,11). O último dia (23/09) teve R$ 92,40 e 16 resultados.

## Conta 2: Clínica Harmonize (`act_492019481`)

"Harmonize Dermatologia & Estética", uma clínica de estética. Serve de contraste: ticket mais alto e um post turbinado ainda no ar.

| Campanha | Objetivo | Gasto | Resultados | CPA |
|---|---|---|---|---|
| `camp_harm_01` [WhatsApp] Toxina botulínica e bioestimuladores | MESSAGES | 2.100 | 125 | 16,80 |
| `camp_harm_02` [Cadastro] Limpeza de pele profunda | LEADS | 1.320 | 85 | 15,53 |
| `camp_harm_03` [Turbinado] Post "Promoção de setembro" | TRAFFIC (ativa) | 180 | 5 | 36,00 |

- **Totais:** R$ 3.600, 215 resultados, CPA de R$ 16,74; `uniqueReach` de 39.800.
- **Profissional × turbinado:** R$ 16,29 contra R$ 36,00, ≈2,2×.
- **Auditoria:** nota 60, "Precisa de atenção". Falham os itens "estrutura", porque há um turbinado ativo, e "desgaste", porque o `creat_harm_04` está em `FATIGUE` numa campanha ativa.
- **Histórico:** 7 dias (MESSAGES, LEADS e TRAFFIC). Na semana: R$ 786 e 44 resultados.

Mudou em 2026-09-25:

- Os totais deixaram de ser digitados. Antes, o mock dizia 384 resultados e CPA de R$ 6,46 para a Raro; a soma real é 388 e R$ 6,39.
- A Harmonize ganhou 3 campanhas e 7 dias de histórico; antes tinha 1 campanha e 1 dia.
- O resíduo "VivaBem" saiu da `camp_03`.
- "Dra. Camila" virou Camila Rocha.

## Usuários demo

- **Abner Senna:** gestor da agência, vê todas as contas.
- **Camila Rocha:** cliente, presa a `act_raro_pilates`.

Os e-mails de login estão em `demoUsers`, e a [[tela-login]] tem botões que entram direto em cada perfil.

## Armadilhas

- **Datas fixas.** O "último dia" é sempre 23/09/2026, qualquer que seja a data de hoje. Por isso o Diário chama esse dia de "Último", e não de "Ontem".
- **Nomes que não batem.** `topCampaignName` e `topCreativeName` do histórico são texto livre e já divergem dos nomes reais. Por exemplo, "Reformer em ação (Reels)" no histórico contra "Reformer em ação: alongamento profundo e alívio de tensão" no criativo.
- **Alcance somado.** A soma do alcance das campanhas (53.050 na Raro e 44.100 na Harmonize) é maior que o `uniqueReach`, como seria na Meta; ver [[metricas-e-calculos]].
- **Unidade forçada.** REACH e TRAFFIC entram nos "resultados" com a unidade "contato". O objetivo TRAFFIC se chama "Cliques no link", mas os 4 resultados da `camp_04` são "Mensagens recebidas" (`resultMetricName`). Somar objetivos diferentes num único "resultado" é uma escolha do produto, não algo que a Meta faz.
- **Arquivo órfão.** `public/raro-pilates-logo.svg` não é referenciado por nenhum arquivo, porque o logo agora é o componente `RaroPilatesIcon`.
- **Manter separado.** Os mocks são ótimos para demonstração de vendas. Vale mantê-los como um "modo demonstração" separado dos dados reais; ver [[modal-conectar-meta]].
