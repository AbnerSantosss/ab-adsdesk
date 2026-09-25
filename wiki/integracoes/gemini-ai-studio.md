---
tipo: integracao
atualizado: 2026-09-25
tags: [integracao, gemini, ia, ai-studio, historico]
---

# Gemini / Google AI Studio (removido)

## Situação
- O app nasceu como template do **Google AI Studio** ([[stack-e-execucao]]). O template trazia `@google/genai`, a variável `GEMINI_API_KEY`, `express`, `dotenv` e a capacidade "server-side Gemini" declarada no `metadata.json`.
- **Nenhum recurso usava IA.** Nenhum arquivo importava `@google/genai`. Por isso, na refatoração de 2026-09-25 ([[refatoracao-ux-2026-09-25]]), a dependência, a variável e os pacotes sem uso saíram, e o `metadata.json` ficou com `majorCapabilities` vazio.
- A única sobra do AI Studio é `DISABLE_HMR`, no `vite.config.ts`. Com `DISABLE_HMR=true`, o Vite desliga o recarregamento automático, o que ajuda em ambientes que editam muitos arquivos de uma vez.
- O `GEMINI.md` da raiz não tem relação com a API: é o arquivo de instruções para agentes, como o `CLAUDE.md`.

## Armadilhas
- **Não reinstalar por hábito.** Se o projeto voltar ao AI Studio, o ambiente pode sugerir `GEMINI_API_KEY` de novo. Sem um recurso que use IA, a dependência só aumenta a superfície de ataque e confunde quem lê o código.
- **Documentação antiga mente.** Páginas ou prints que falem em `GEMINI_API_KEY`, `express` ou "server-side Gemini" descrevem o template, não o app atual. O servidor que existe hoje é o de e-mail, em `server/`.

## Se a IA voltar
São ideias, não decisões:
1. Explicar em linguagem simples por que o custo subiu ou caiu, a partir dos números reais.
2. "Pergunte ao painel": o cliente pergunta "por que gastou mais ontem?" e recebe resposta baseada nos dados, em vez de mandar mensagem ao gestor. Ataca a dor central da [[visao-do-produto]].
3. Comentário automático sobre anúncios com desempenho em queda ([[anuncios]]).
4. Justificativa em texto simples da nota de [[profissional-vs-turbinar]] na auditoria.

O resumo da [[visao-geral]] já é montado por regra a partir dos números da conta, sem IA. Vale medir se a regra não basta antes de pagar por um modelo.

## Regras que continuam valendo
- A chave de qualquer provedor (Gemini, Claude ou outro) fica **só no servidor**, como a senha do e-mail ([[envio-de-email-smtp]]). Nada com prefixo `VITE_`, porque o Vite põe essas variáveis no navegador.
- O texto gerado precisa se apoiar nos números e **não pode inventar resultado**. Para esse público, confiança é o produto.
- Dados de anúncios de clientes enviados a um modelo externo entram na conta da LGPD ([[seguranca]]).
