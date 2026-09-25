# AB AdsDesk — instruções do projeto

## Leia a wiki primeiro
- Antes de mudar código ou responder sobre o produto, leia `wiki/index.md` e as páginas ligadas ao
  assunto. As armadilhas conhecidas estão em `wiki/arquitetura/interface-e-responsividade.md`,
  `wiki/riscos/` e `wiki/pontos-de-melhoria.md`.
- Depois de mudar comportamento, atualize a página afetada (campo `atualizado:`) e registre uma linha
  em `wiki/log.md` no formato `## [AAAA-MM-DD] <tipo> | <resumo>` (setup, ingest, query, lint, update, fix).
- Convenções da wiki: frontmatter `tipo`/`atualizado`/`tags`, nomes em kebab-case sem acento, links
  `[[slug]]`. Prefira corrigir uma página a acrescentar changelog nela.

## Regras
- Responder sempre em português do Brasil.
- Nunca ler, copiar ou exibir o conteúdo de `.env.local` (credencial SMTP real). Use `.env.example`.
- Segredos só no servidor (`server/`, lidos pelo `loadEnv` do Vite). Nunca com prefixo `VITE_`.
- Não enviar e-mail real (`POST /api/email/report`) sem confirmação explícita do usuário.
- Toda tela nova ou alterada: sem rolagem horizontal em 375, 768 e 1280 px; grids com `grid-cols-1`
  ou filhos com `min-w-0`.

## Comandos
- `npm run dev` (porta 3000) · `npm run lint` · `npm run build` · `npm run email:check`
- Antes de concluir uma tarefa de código: `npm run lint` e `npm run build`.
