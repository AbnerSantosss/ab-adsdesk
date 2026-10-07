---
tipo: conceito
atualizado: 2026-10-07
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

Os itens abaixo descrevem principalmente a demonstração. Na conta real, [[meta-graph-api]] define quais métricas e verificações estão disponíveis; não transferir promessas de auditoria, contatos únicos ou envio automático para a importação atual.
- **Linguagem sem jargão:**
  - "Custo por resultado" no lugar de CPA, sempre com a dica "quanto menor, melhor";
  - "Pessoas alcançadas" no lugar de Reach;
  - o bloco **"Em poucas palavras"**, um resumo do acumulado e do último registro, identificado separadamente do período dos KPIs.

  Ver [[glossario-sem-jargao]].
- **Número contextualizado:** quando há comparação válida, a demonstração informa a variação contra o dia anterior ou a média dos dias anteriores (até 7). Ausência de dados não recebe julgamento inventado.
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
> - **Demonstração e importação coexistem:** dados de exemplo continuam identificados, e a conta real usa insights próprios. A conexão ao vivo com uma conta do usuário ainda precisa ser comprovada ([[dados-mock]], [[configuracoes]]).
> - **A importação não é a operação completa:** há totais, dias, campanhas e anúncios, mas faltam OAuth, backend Meta, sincronização e isolamento multiusuário ([[meta-graph-api]]).
> - **O token continua acessível a scripts do navegador:** hoje somente memória/sessionStorage, sem opção persistente; logout e desconexão limpam credenciais e snapshot ([[seguranca]]).
> - **A auditoria calcula, mas sobre sinais do mock:** pixel, WhatsApp, estrutura e desgaste são marcações dos dados de exemplo, não leitura da Meta ([[profissional-vs-turbinar]]).
> - **O e-mail depende do servidor local:** a versão estática publicada não envia ([[envio-de-email-smtp]]).
> - **Os botões de envio são do fluxo demonstrativo do gestor:** o cliente não recebe essas ações e o relatório real oferece impressão/PDF, sem e-mail/WhatsApp integrado.
>
> Vender como produto pronto antes de resolver isso é risco jurídico e de reputação. Ver [[o-que-e-simulado]].

## Relacionados
[[visao-do-produto]] · [[personas]] · [[pontos-de-melhoria]] · [[cores-e-hierarquia-visual]]
