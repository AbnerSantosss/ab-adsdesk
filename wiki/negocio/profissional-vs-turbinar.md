---
tipo: conceito
atualizado: 2026-09-25
tags: [negocio, auditoria, turbinar, boost, gerenciador, diferencial]
---

# Tráfego profissional vs "botão Turbinar"

É o **conceito central de confiança** do produto. Ele vira tela em [[auditoria-transparencia]], selos "Gerenciador" e "Post turbinado" em [[campanhas]] (campo `isProfessionalStructure`), a nota "Saúde da conta" na [[visao-geral]] e um dos três destaques da [[tela-login]] ([[proposta-de-valor]]).

## Origem
Veio de um **áudio de cliente**: o maior receio do dono do negócio era pagar um gestor que só aperta "Turbinar publicação" no Instagram. A citação do áudio chegou a aparecer na tela de auditoria, mas saiu do código na refatoração ([[refatoracao-ux-2026-09-25]]). Continua valendo como história do produto e argumento de venda.

## A diferença, explicada para leigos
É o comparativo "Gerenciador de Anúncios × post turbinado" da auditoria:

| | Gerenciador de Anúncios (profissional) | Botão "Turbinar" (amador) |
|---|---|---|
| Objetivo | **Objetivo certo:** mensagens, cadastros, vendas | **Otimiza para interação:** curtidas e comentários, na maioria das vezes |
| Público | **Público definido:** região, idade e interesses | **Público amplo:** demais para um negócio local |
| Anúncios | **Vários anúncios em teste** | **Um anúncio só** |
| Medição | **Rastreamento:** pixel, conversas e relatório diário | **Sem captura de contato** |
| Custo por resultado | O app calcula na conta: "o post turbinado custou X× mais por resultado que as campanhas estruturadas" | |

A antiga faixa "R$ 4,90–6,50 contra R$ 25–40" saiu do app. Ela era exemplo de Pilates e nunca foi referência de mercado; não usar em material de venda.

## O que já é calculado hoje
A nota de 0 a 100 soma o peso das checagens que passam (`auditChecks` e `auditScore` em `src/lib/metrics.ts`):

| Checagem | Peso | De onde vem o sinal |
|---|---|---|
| Pixel da Meta instalado | 20 | marcação do mock |
| WhatsApp conectado à página | 15 | marcação do mock |
| Verba ativa só em campanhas estruturadas | 30 | `isProfessionalStructure` das campanhas **ativas** (marcação do mock) |
| Público definido em cada campanha | 15 | conjuntos de anúncios do mock |
| Criativos ativos sem desgaste | 10 | status "em queda" marcado no mock |
| Relatório diário disponível | 10 | existe histórico diário |

Níveis: Excelente (90+), Bom (70+), Precisa de atenção (50+) e Crítico. Os pesos aparecem só para o gestor.

## Armadilhas
> [!danger] A conta é real; as entradas, não.
> - Todas as entradas vêm de campos do [[dados-mock]]. Numa conta conectada pela [[meta-graph-api]] não há campanhas, e a auditoria mostra um aviso no lugar da nota. Quando as campanhas chegarem, pixel e WhatsApp vão aparecer como "não" por padrão, e não por leitura da conta. Ver [[o-que-e-simulado]].
> - **Tudo ou nada:** um único post turbinado ativo derruba os 30 pontos de estrutura, mesmo que gaste R$ 5 contra R$ 3.000 no Gerenciador.
> - **Ativas × histórico:** a checagem olha só as campanhas ativas, mas o multiplicador de custo usa todas. Na Raro Pilates, o post turbinado está pausado: a checagem passa e o comparativo ainda mostra quanto ele custou a mais. Isso é coerente, mas precisa estar claro no texto.
> - **Tom:** turbinar nem sempre é ruim. Serve, por exemplo, para dar alcance a um post que já viralizou. A auditoria deve mostrar a **proporção do investimento** e o contexto, não condenar qualquer boost.
> - **Rótulo:** o objetivo de tráfego tem rótulo curto "Cliques" para não confundir com o botão Turbinar, mas o rótulo longo ainda diz "Cliques no link / post turbinado". Objetivo e origem da campanha são coisas diferentes ([[glossario-sem-jargao]]).

## Proposta de cálculo real (`realTrafficScore` 0–100)
Com dados da [[meta-graph-api]] e pesos a calibrar, as seis checagens atuais viram leitura de verdade:

| Critério | Sinal na API | Peso sugerido | Checagem atual equivalente |
|---|---|---|---|
| % do gasto em campanhas do Gerenciador (não boost) | origem da campanha / `boosted_object_id` | 30 | "Verba ativa só em campanhas estruturadas", mas proporcional em vez de tudo ou nada |
| Objetivo alinhado ao negócio (mensagens, leads, vendas) | `objective` | 20 | não existe |
| Segmentação local coerente | `targeting.geo_locations` (raio) | 15 | "Público definido", hoje só confere se existe conjunto |
| ≥ 2 anúncios ativos por conjunto, sem desgaste | contagem de `ads` e tendência de frequência/CTR | 15 | "Criativos ativos sem desgaste" |
| Pixel/dataset ou conversas medidas | datasets / `actions` | 10 | "Pixel" e "WhatsApp", hoje fixos |
| A conta está no BM do cliente (não do gestor) | dono do ad account | 10 | não existe |

O "Relatório diário disponível" deixa de ser checagem quando o histórico vier de `/insights`. Cada critério continua como uma linha do checklist, com ✓/✗ e explicação em português simples ([[glossario-sem-jargao]]). Assim a auditoria deixa de calcular sobre marcações e passa a **provar** algo.

## Relacionados
[[auditoria-transparencia]] · [[metricas-e-calculos]] · [[personas]]
