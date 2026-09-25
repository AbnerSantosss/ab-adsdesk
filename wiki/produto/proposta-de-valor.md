---
tipo: conceito
atualizado: 2026-09-25
tags: [produto, proposta-de-valor, vendas, diferenciais]
---

# Proposta de valor

## Promessa central
> "Acompanhe o seu investimento em anúncios como quem olha o saldo do banco: simples, diário e sem precisar perguntar a ninguém."

Título atual da [[tela-login]]: **"Cada real investido em anúncios, explicado para o cliente."**

## Os 3 destaques da vitrine
São os três itens mostrados na [[tela-login]]:
1. **Contatos e custo de cada um:** "Quantos contatos chegaram pelo WhatsApp e quanto custou cada um." Ver [[visao-geral]].
2. **Auditoria:** "mostra se a verba está em campanhas estruturadas ou em posts turbinados." Ver [[profissional-vs-turbinar]] e [[auditoria-transparencia]].
3. **Relatório pronto:** "Relatório diário pronto para enviar ao cliente em um toque." Ver [[relatorio-diario]], [[compartilhamento-whatsapp]] e [[envio-de-email-smtp]].

A marca própria saiu da vitrine, mas continua sendo o argumento de venda para a agência ([[personalizar-marca]], [[modelo-saas-white-label]]).

## Diferenciais já na interface
- **Linguagem sem jargão:**
  - "Custo por resultado" no lugar de CPA, sempre com a dica "quanto menor, melhor";
  - "Pessoas alcançadas" no lugar de Reach;
  - o bloco **"Em poucas palavras"**, um resumo montado a partir dos números do período (não é texto fixo).

  Ver [[glossario-sem-jargao]].
- **Número com julgamento:** cada KPI mostra se melhorou ou piorou em relação ao dia anterior ou à média dos dias anteriores (até 7).
- **Dois modos de visão:** o cliente vê o essencial; o gestor vê também impressões, cliques, CTR, CPC, CPM e frequência, cada um com explicação em português. Ver [[perfis-e-modos-de-visao]].
- **Explica o caminho do clique:** cada campanha mostra "Para onde o contato vai", "O que acontece quando a pessoa clica" e para quais públicos aparece. Ver [[campanhas]].
- **Selo de custo relativo à conta:** "Abaixo da média", "Na média", "Acima da média" ou "Muito acima", comparando cada campanha com a média da própria conta. O leigo sabe se o número é bom sem saber o que é CPA, e o selo não depende de faixa fixa de Pilates. Ver [[metricas-e-calculos]].
- **Nota de "Saúde da conta" (0 a 100):** calculada por seis checagens e exibida na Visão geral, com atalho para a auditoria. Ver [[auditoria-transparencia]].
- **Anúncio campeão:** destaca o anúncio de menor custo com volume mínimo e sem desgaste, e marca os que estão "em queda". Ver [[anuncios]].
- **Simulador de retorno:** traduz custo por contato em "novos alunos" e faturamento. Ver [[simulador-roi]].
- **Relatório que sai do painel:** abrir no WhatsApp, copiar o texto, enviar por e-mail (esses três, só para o gestor) ou imprimir/salvar PDF (para todos).
- **Funciona no celular e por link:** barra de navegação embaixo no celular e endereço próprio para cada tela ([[interface-e-responsividade]], [[estado-e-navegacao]]).

## Onde a promessa ainda não se sustenta
> [!danger] O que a demonstração mostra e o código ainda não entrega
> As frases exageradas antigas ("tempo real", "API v21", "criptografia AES-256", "auditoria 100% verificada") saíram da interface. Os riscos que sobraram são outros:
> - **Os números são de demonstração:** campanhas, anúncios e histórico diário vêm do mock ([[dados-mock]]).
> - **A Meta só entrega o resumo da conta:** sem `/insights`, uma conta conectada não mostra campanhas nem resultados ([[meta-graph-api]]).
> - **O token fica em texto puro no navegador:** sessionStorage por padrão e localStorage se marcar "Lembrar" ([[seguranca]]).
> - **A auditoria calcula, mas sobre sinais do mock:** pixel, WhatsApp, estrutura e desgaste são marcações dos dados de exemplo, não leitura da Meta ([[profissional-vs-turbinar]]).
> - **O e-mail depende do servidor local:** a versão estática publicada não envia ([[envio-de-email-smtp]]).
> - **"Em um toque" vale só para o gestor:** o cliente não tem os botões de envio.
>
> Vender como produto pronto antes de resolver isso é risco jurídico e de reputação. Ver [[o-que-e-simulado]].

## Relacionados
[[visao-do-produto]] · [[personas]] · [[pontos-de-melhoria]]
