# AB AdsDesk

Painel white-label para acompanhar campanhas de Instagram e Facebook. Reúne investimento, resultados, campanhas, criativos, relatório diário e auditoria em uma interface para agências e seus clientes.

A aplicação inclui contas de demonstração e leitura real da Marketing API da Meta. A aba **Configurações** orienta o gestor a informar a conta de anúncios e um token autorizado, testar o acesso e importar os relatórios.

> A conexão real está implementada e coberta por testes controlados, mas ainda não foi validada ao vivo com uma credencial do usuário. O login é demonstrativo; backend Meta, OAuth e autenticação de produção continuam pendentes. Consulte [o que é real e o que é simulado](wiki/riscos/o-que-e-simulado.md).

## Rodar localmente

Requisitos: Node.js 22.18 ou mais novo e npm.

```bash
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000) e use a entrada de demonstração do gestor. O servidor também aceita acesso pela rede local.

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 3000 |
| `npm run lint` | Verificação de tipos TypeScript |
| `npm test` | Testes de leitura, erros, paginação, datas e sessão da integração Meta |
| `npm run wiki:check` | Validação de links, âncoras, metadados e conectividade da wiki |
| `npm run build` | Gera a aplicação em `dist/` |
| `npm run preview` | Serve o build localmente, com as rotas locais de e-mail |
| `npm run email:check` | Verifica o login SMTP sem enviar e-mail |

## Conectar Instagram e Facebook

1. Entre como gestor e abra **Configurações**.
2. Siga o guia da tela para obter acesso à conta de anúncios e à Marketing API.
3. Informe o ID da conta e um token válido com a permissão de leitura exigida.
4. Use **Conectar e importar dados** e aguarde a leitura completa.
5. Confira conta, moeda, fuso e período. Para atualizar os dados, use o controle de atualização do painel.

A importação é somente leitura: não cria nem altera anúncios. O token fica na sessão do navegador e é removido ao sair ou desconectar. Relatórios reais são separados dos exemplos; falhas não substituem o último relatório por dados parciais ou simulados. Consulte o [guia de Configurações](wiki/telas/configuracoes.md) e o [contrato da integração](wiki/integracoes/meta-graph-api.md).

As fotografias das contas de demonstração são ilustrações geradas por IA. Contas conectadas usam a mídia retornada pela Meta, quando disponível.

## E-mail local

O envio por e-mail existente atende ao fluxo demonstrativo do relatório diário. O relatório real oferece impressão/PDF; seu envio por e-mail ou WhatsApp ainda não está integrado.

1. Copie `.env.example` para `.env.local` e configure as variáveis SMTP no computador.
2. Para Gmail, utilize uma [senha de app](https://myaccount.google.com/apppasswords).
3. Execute `npm run email:check` e reinicie o servidor de desenvolvimento.

Credenciais SMTP não devem usar o prefixo `VITE_`. Arquivos `.env*` são ignorados pelo Git, exceto o modelo `.env.example`. A imagem Docker serve apenas o frontend: a rota de e-mail não é publicada. Veja [envio de e-mail SMTP](wiki/integracoes/envio-de-email-smtp.md).

## GitHub e publicação

O workflow [build](.github/workflows/build.yml) valida tipos, testes e wiki antes de construir a imagem Docker e publicá-la no GHCR:

```text
ghcr.io/abnersantosss/ab-adsdesk:latest
```

O push para `main` não atualiza uma VPS automaticamente. O [docker-compose.yml](docker-compose.yml) está preparado para o Portainer, com a porta local padrão `3340`. A publicação na VPS e a configuração do domínio são etapas separadas, descritas no [guia de deploy](wiki/arquitetura/deploy-vps-portainer.md).

Para testar a imagem localmente:

```bash
docker build -t ab-adsdesk:local .
docker run --rm -p 8088:80 ab-adsdesk:local
```

A imagem responde `ok` em `/healthz` e retorna 404 em `/api/*`.

## Estrutura e documentação

- `src/`: telas, componentes, regras de dados, integração Meta e navegação.
- `public/`: ícone AB AdsDesk e imagens otimizadas usadas pelo painel.
- `server/`: integração SMTP local do Vite.
- `tests/`: testes automatizados da integração Meta.
- `scripts/`: validação da wiki.
- `deploy/`: configuração nginx e cabeçalhos da imagem Docker.
- `wiki/`: documentação de produto, telas, arquitetura, integrações e riscos.

Comece pelo [mapa da wiki no GitHub](wiki/README.md). No Obsidian, use [wiki/index.md](wiki/index.md), com as conexões `[[slug]]` entre as páginas. As decisões de cores estão em [cores e hierarquia visual](wiki/arquitetura/cores-e-hierarquia-visual.md), e as pendências de produção em [pontos de melhoria](wiki/pontos-de-melhoria.md).

Os originais de geração de imagens e capturas de QA em `output/` ficam locais; as imagens necessárias para executar o projeto estão versionadas em `public/`.
