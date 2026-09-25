---
tipo: log
atualizado: 2026-09-25
tags: [log, historico]
---

# Registro da wiki

Uma linha por operação, a mais recente embaixo. Formato: `## [AAAA-MM-DD] <tipo> | <resumo>`.

## [2026-09-25] setup | Wiki inicial com 30 páginas em 7 pastas (produto, negocio, telas, arquitetura, dados, integracoes, riscos)
Escrita sobre o código exportado do AI Studio, antes da refatoração. Registro retroativo, pois a
wiki não tinha `log.md`.

## [2026-09-25] update | Refatoração de UX e responsividade
Todas as páginas foram revisadas contra o código novo. As decisões e o porquê de cada uma estão em
[[refatoracao-ux-2026-09-25]].

## [2026-09-25] fix | Renomeações e link quebrado
- `melhores-criativos` → [[anuncios]]
- `navbar` → [[cabecalho-e-navegacao]]
- `relatorios-diarios` → [[relatorio-diario]]
- `roadmap-para-producao` era citado 15 vezes e não existia. Os links agora apontam para a nova
  [[pontos-de-melhoria]].

## [2026-09-25] update | Páginas novas
- [[index]]
- [[pontos-de-melhoria]]
- [[refatoracao-ux-2026-09-25]]
- [[interface-e-responsividade]]
- [[envio-de-email-smtp]]
- `CLAUDE.md` e `GEMINI.md` na raiz, com a regra de ler a wiki antes de mexer no código.

## [2026-09-25] update | Gemini removido
[[gemini-ai-studio]] virou uma página curta de histórico: a dependência saiu porque nenhum recurso
usava IA.

## [2026-09-25] fix | Segunda rodada de correções (revisão dos agentes)
Média do Diário e do resumo passou a ser a dos dias anteriores (`weekBefore`); campeão de reserva sem
anúncio em queda; textos do resumo e do anúncio destaque seguem a regra usada; "0%" estável no KPI;
"dias no ar" até o último dia com dados; voltar sem `#` abre a Visão geral; Esc devolve o foco nos
menus; link de pular não troca a tela; lista de contas e grids sem rolagem lateral no celular; e-mail
com `EMAIL_REPLY_TO`, 413, limite por tentativa e aviso próprio para acesso pela rede. Páginas
atualizadas: [[bugs-conhecidos]], [[metricas-e-calculos]], [[visao-geral]], [[relatorio-diario]],
[[anuncios]], [[campanhas]], [[auditoria-transparencia]], [[cabecalho-e-navegacao]],
[[interface-e-responsividade]], [[envio-de-email-smtp]], [[modal-conectar-meta]].

## [2026-09-25] update | Login com um botão rápido
A tela de login tem um único botão de entrada rápida, o do gestor (pedido do usuário). A cliente
entra pelo formulário ou é vista em "Ver painel como". Páginas: [[tela-login]],
[[perfis-e-modos-de-visao]], [[personas]], [[index]].

## [2026-09-25] lint | Links, nomes antigos e dados sensíveis
37 páginas, nenhum link quebrado nem página órfã, todas com `atualizado: 2026-09-25`. Nomes antigos
(Navbar, CreativesRanking, `bun.lock`, `GEMINI_API_KEY`) só aparecem como histórico. Nenhum endereço
ou senha real na wiki. [[pontos-de-melhoria]] ganhou os itens 11, 12 e 17 a 19.
