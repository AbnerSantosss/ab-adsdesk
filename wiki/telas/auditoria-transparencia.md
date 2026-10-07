---
tipo: tela
atualizado: 2026-10-07
tags: [tela, auditoria, transparencia, turbinar, confianca]
---

# Auditoria

**Arquivo:** `src/components/screens/Audit.tsx`. Hash `#auditoria`. É o diferencial de confiança do produto: mostrar ao dono do negócio, com os números da própria conta, que a verba está em tráfego estruturado e não "só turbinando post" ([[profissional-vs-turbinar]], [[proposta-de-valor]]).

> Mudou em 2026-09-25: a auditoria passou a ser **calculada** (`auditChecks` e `auditScore` em `src/lib/metrics.ts`). Saíram a nota pronta do mock, o checklist fixo ("0% turbinados", "3 campanhas", "3km"), o modal `TransparencyAuditModal`, a faixa de custo inventada (R$ 4,90–6,50 × R$ 25–40) e o selo "Clareza Ads".

## O que aparece
O cabeçalho traz superfície neutra, foto local ilustrativa e "Instagram & Facebook". Nota, estrutura, checagens, observação e comparativo compartilham cards brancos com camadas internas claras. Sucesso ou atenção aparecem em ícones, selos e texto, sem colorir uma seção inteira. A faixa final mantém contraste escuro. Os estados têm significado verificável; não representam métricas separadas por plataforma. Ver [[cores-e-hierarquia-visual]].

1. **Saúde da conta:** um anel com a nota de 0 a 100, o nível e "N de 6 itens em ordem", seguido das seis checagens (tabela abaixo).
2. **"Observação do gestor de tráfego":** uma citação com `audit.managerNote`, quando existe.
3. **"Estrutura das campanhas":** todas as campanhas, inclusive as pausadas, com situação, tipo, "Gerenciador" ou "Post turbinado", públicos, investido e custo com selo de saúde.
4. **"Gerenciador de Anúncios × post turbinado":** dois cartões com investido, resultados e custo de cada lado, mais as boas práticas e os limites em texto. O subtítulo diz quantas vezes o turbinado (ou os turbinados) custou mais, e só aparece quando o multiplicador passa de 1,2×, a mesma régua do resumo da [[visao-geral]].
5. **Faixa final** com "Ver relatório diário" ([[relatorio-diario]]).

| Checagem | Peso | Passa quando |
|---|---|---|
| Pixel da Meta instalado | 20 | `audit.pixelConfigured` |
| WhatsApp conectado à página | 15 | `audit.whatsappConnected` |
| Verba ativa só em campanhas estruturadas | 30 | nenhum post turbinado **ativo** |
| Público definido em cada campanha | 15 | toda campanha estruturada ativa tem conjunto |
| Criativos ativos sem desgaste | 10 | nenhum anúncio ativo em `FATIGUE` |
| Relatório diário disponível | 10 | existe histórico diário |

Níveis da nota: a partir de 90, "Excelente"; a partir de 70, "Bom"; a partir de 50, "Precisa de atenção"; abaixo disso, "Crítico".

No mock, a Raro Pilates tira 100/100 ("Excelente"), com o comparativo em 6,6×. A Clínica Harmonize tira 60 ("Precisa de atenção"), porque tem um turbinado ativo e em queda.

## Gestor × cliente
A tela é a mesma. Só o gestor vê o "peso N" de cada checagem ([[perfis-e-modos-de-visao]]).

## No celular
A nota fica em cima das checagens (lado a lado só a partir de `lg`). A tabela de estrutura vira lista de cartões, e os dois cartões do comparativo ficam um embaixo do outro.

## De onde vêm os dados
O cálculo usa `account.campaigns`, `dailyHistory` e `account.audit` ([[metricas-e-calculos]]). Mas as entradas continuam escritas à mão em [[dados-mock]]: `pixelConfigured`, `whatsappConnected`, `isProfessionalStructure`, `FATIGUE` e `managerNote`. Numa conta real, aparece o `ApiAccountNotice`.

A revisão visual não altera pesos, guardas, comparações ou fontes dos dados, nem adiciona integração de insights. Fotos e identidade social não tornam a auditoria uma consulta real à Meta ([[o-que-e-simulado]]).

## Origem da dor
A aba nasceu do áudio de um dono de estúdio de Pilates com medo de pagar por post turbinado ([[personas]]). A frase "O maior receio citado no áudio" saiu da tela, mas essa dor continua sendo a razão da aba.

## Armadilhas
- **A nota ignora campanhas pausadas.** A Raro tira nota máxima mesmo tendo um turbinado pausado que custou 6,6× mais. Faz sentido ("verba **ativa**"), mas o cliente pode estranhar a nota 100 ao lado de um comparativo ruim.
- **O comparativo mistura objetivos:** o turbinado é de cliques, e as campanhas estruturadas são de conversa, cadastro e alcance ([[bugs-conhecidos]]).
- O limite de 1,2× está repetido na tela e no `executiveSummary`. Ao mudar, mude os dois.
- "Público definido" só reprova campanha estruturada ativa sem conjunto. Na API real, toda campanha tem conjunto, então a regra quase nunca vai reprovar.
- Chamar de "auditoria" algo que depende de dados digitados à mão ainda é um risco de reputação ([[o-que-e-simulado]]).

## Como calcular de verdade
A partir da [[meta-graph-api]]:
- % do gasto em campanhas do Gerenciador contra posts turbinados;
- objetivos usados;
- raio e segmentação dos conjuntos;
- quantidade de anúncios por conjunto;
- pixel ou dataset configurado e recebendo eventos;
- dono da conta (Business Manager do cliente ou do gestor).
