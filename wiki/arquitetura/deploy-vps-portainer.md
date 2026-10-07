---
tipo: arquitetura
atualizado: 2026-10-07
tags: [deploy, docker, nginx, ghcr, portainer, cloudflare, github, pendente]
---

# Deploy: GitHub, GHCR, Portainer e Cloudflare

Pedido do usuário em 2026-09-25: publicar o projeto no GitHub como repositório **público**, subir na VPS
pelo **Portainer** e dar um domínio na **Cloudflare**. O deploy segue o padrão das outras stacks do
servidor `proxserverabner` (capi-console, codigo-vencedor, Dubra Frame).

> **Estado em 2026-10-07: código e wiki publicados no GitHub.** O commit `b2dbbc8` foi enviado para `main`, com correspondência confirmada entre o SHA local e o remoto. A publicação usou a autenticação existente do Git e não exigiu alterar permissões nem reescrever o histórico. VPS e Cloudflare continuam sem validação nesta revisão. Veja [O que falta](#o-que-falta-para-terminar).

Repositório: [AbnerSantosss/ab-adsdesk](https://github.com/AbnerSantosss/ab-adsdesk).
Entrega: [commit b2dbbc8](https://github.com/AbnerSantosss/ab-adsdesk/commit/b2dbbc82d6bea80011e70cd4f111c8d65f6465eb).
Execução inicial: [GitHub Actions 37699900956](https://github.com/AbnerSantosss/ab-adsdesk/actions/runs/37699900956).
Essa execução terminou com sucesso: instalação, tipos, 15 testes, validação da wiki e construção/publicação da imagem no GHCR. Isso confirma a imagem publicada pelo workflow; não confirma acesso anônimo ao pacote nem atualização da VPS.

## Como fica quando estiver pronto

```
git push (main) → GitHub Actions → ghcr.io/abnersantosss/ab-adsdesk:latest
                                         ↓ Pull and redeploy
              Portainer (stack ab-adsdesk) → container nginx em 127.0.0.1:3340
                                         ↓
     cloudflared no host (túnel) → https://adsdesk.proxserverabner.site
```

- **Imagem estática, sem e-mail.** O `Dockerfile` roda `npm run build` e serve o `dist/` com nginx. A
  rota `/api/email` não vai junto: publicada sem login, viraria um disparador de spam com a conta Gmail.
  O nginx responde `/api/*` com 404 em JSON, o front lê isso como `UNAVAILABLE`, e o modal diz "Esta
  versão do painel ainda não envia e-mail. Copie o texto ou mande pelo WhatsApp." ([[envio-de-email-smtp]]).
- **A VPS não constrói.** São 6,4 GB para cerca de 40 containers, então a imagem é feita no GitHub
  Actions e publicada no GHCR. O Portainer só puxa.
- **Porta 3340 só no loopback.** Quem publica para a internet é o `cloudflared` que roda no próprio
  host (systemd). Portas já usadas por outras stacks: 3000, 3007, 3100, 3333, 3334, 5432, 5433, 8099,
  8760. A 3340 não apareceu em nenhum compose do usuário, mas **não foi conferida na VPS**. Se estiver
  ocupada, mude com a variável `APP_PORT` na stack.

## Arquivos criados

| Arquivo | O que faz |
|---|---|
| `Dockerfile` | Build em `node:22-alpine` (`npm ci` + `npm run build`), serve em `nginx:1.27-alpine`, `HEALTHCHECK` em `/healthz` |
| `deploy/nginx.conf` | `/healthz` → 200 `ok`; `/api/` → 404 JSON; `/assets/` com cache de 1 ano (`immutable`); `/` com `no-cache` e fallback para `index.html`; gzip; `server_tokens off` |
| `deploy/security-headers.conf` | CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| `.dockerignore` | Deixa fora `node_modules`, `dist`, `.env*`, `.git`, `.claude`, `.impeccable`, `output`, `wiki`, `*.md` |
| `docker-compose.yml` | Stack do Portainer: imagem do GHCR, `pull_policy: always`, `127.0.0.1:${APP_PORT:-3340}:80`, log com `max-size`, healthcheck |
| `.github/workflows/build.yml` | A cada push em `main`: instalação, lint, testes, validação da wiki, build Docker e push para GHCR com tags `latest` e SHA |
| `README.md` | Execução, integração Meta, GitHub e publicação |

`.gitignore` ganhou `.claude/settings.local.json` e `.impeccable/`. O `.env.local` já era ignorado
(`.env*`), e o `git check-ignore` confirmou.

## O que foi testado

Os resultados Docker abaixo registram a preparação de **25/09/2026**, não o build remoto desta revisão. A evidência nova de lint/testes/build/wiki é registrada em [[log]]; confirmar um push não equivale a confirmar o deploy da VPS.

- `npm run lint` e `npm run build` passaram depois da última mudança no texto do modal de e-mail.
- Imagem construída localmente (`ab-adsdesk:local`) e rodando em `http://127.0.0.1:8088`:
  - `index.html` com 200, CSP, `X-Frame-Options` e `Cache-Control: no-cache`;
  - `/api/email/status` com 404 JSON e `/healthz` com 200;
  - JS principal com cerca de 98 kB em gzip.
- No navegador, pela imagem:
  - login rápido, fontes, gráfico e Diário funcionam;
  - o modal de e-mail mostra "Envio de e-mail indisponível";
  - sem erros no console e sem violação de CSP.
- A imagem local histórica era **anterior** à troca do texto do modal. Uma imagem nova só estará disponível no GHCR depois de um workflow concluído com sucesso.
- `docker compose config -q` validou o `docker-compose.yml`.
- Varredura de segredos no que foi para o commit, sem imprimir valores:
  - nenhum `@hotmail`, nenhum token `gh*_`/`EAA`/`AIza`/`sk-`, nenhuma chave privada;
  - nenhuma senha de app;
  - no `.env.example`, só textos de exemplo.

## Onde parou em 25/09/2026 (histórico)

1. `git init -b main` e um commit local (`832f46f`, "AB AdsDesk: painel white-label de anúncios da Meta")
   com 107 arquivos, **incluindo** `.github/workflows/build.yml`.
2. `gh repo create AbnerSantosss/ab-adsdesk --public` criou o repositório
   (<https://github.com/AbnerSantosss/ab-adsdesk>), mas o push foi **recusado**: o token do `gh` não tem
   o escopo `workflow`. Sem esse escopo, o GitHub não aceita arquivos em `.github/workflows/`.
3. O workflow permaneceu no histórico local. A revisão atual preserva o arquivo e os commits; não remove automação nem reescreve o histórico para contornar autenticação.
4. A wiki foi editada depois daquele commit. O estado do commit/publicação de outubro deve ser conferido em [[log]] e no GitHub.
5. Portainer e Cloudflare **não foram mexidos**.

## O que falta para terminar

1. **Publicação no GitHub concluída.** O bloqueio de autenticação de setembro é histórico; o envio de outubro funcionou com o Git. Nas próximas alterações, validar e selecionar os arquivos antes do commit:
   ```bash
   npm run lint
   npm test
   npm run wiki:check
   npm run build
   git diff --check
   git status --short
   # Revisar arquivos e segredos antes de selecionar o que entra no commit.
   git push -u origin main
   ```
   Se o GitHub recusar o workflow, corrigir a autenticação autorizada com escopo adequado e repetir o push. Não retirar o workflow nem reescrever commits como atalho. Conferir que o SHA remoto corresponde ao commit local.
2. **Acompanhar o Actions:** `gh run watch`, ou a aba Actions do repositório. O job `imagem` precisa
   terminar verde.
3. **Conferir se o pacote GHCR está público:**
   - pull anônimo de `ghcr.io/abnersantosss/ab-adsdesk:latest`; os pacotes `capi-console` e `aquablast`
     respondem 200 sem login;
   - se estiver privado: GitHub → perfil → Packages → `ab-adsdesk` → Package settings → Change
     visibility → Public;
   - outra saída é cadastrar um registry com token no Portainer.
4. **Portainer:**
   - Stacks → Add stack → nome `ab-adsdesk` → **Repository**;
   - URL `https://github.com/AbnerSantosss/ab-adsdesk`, referência `refs/heads/main`, Compose path
     `docker-compose.yml`;
   - nenhuma variável obrigatória; `APP_PORT` só se a 3340 estiver ocupada;
   - Deploy. Opcional: ligar *GitOps updates*.
   - Na VPS, `curl -s http://127.0.0.1:3340/healthz` deve responder `ok`.
5. **Cloudflare:**
   - Zero Trust → Networks → Tunnels → túnel do servidor → Public Hostname → Add;
   - subdomínio `adsdesk`, domínio `proxserverabner.site`, tipo `HTTP`, URL `localhost:3340`;
   - o registro de DNS é criado pelo túnel. Se o túnel for gerenciado por arquivo, edite
     `/etc/cloudflared/config.yml` na VPS e reinicie o `cloudflared`;
   - o subdomínio `adsdesk` é sugestão e pode mudar.
6. **Conferir no ar:** `https://adsdesk.proxserverabner.site`:
   - login rápido e as telas funcionam;
   - no console, nenhuma violação de CSP;
   - `/healthz` responde `ok`.
7. **Recomendado:** proteger o endereço com Cloudflare Access (liberar só os e-mails da agência).
   O login do painel é de demonstração e aceita qualquer senha ([[seguranca]], [[tela-login]]).
8. **Limpeza local:** o container de teste `adsdesk-test` já foi removido. A imagem `ab-adsdesk:local`
   pode ser apagada com `docker rmi ab-adsdesk:local`.

## Armadilhas
- **`add_header` dentro de `location` anula os do `server`.** Por isso os cabeçalhos ficam num snippet
  incluído em cada `location`. Uma `location` nova sem o `include` sai sem CSP.
- **CSP restrita.** Libera só Google Fonts, `graph.facebook.com` (conexão com a Meta pelo navegador) e
  imagens `https:` (prévias dos anúncios). Um script, fonte ou API nova vai ser bloqueado até entrar em
  `deploy/security-headers.conf`. Em `npm run dev` não há CSP, então o problema só aparece publicado.
- **`index.html` nunca fica em cache**, e os arquivos de `/assets/` ficam por um ano. Isso funciona porque
  o Vite põe hash no nome. Não sirva arquivos sem hash em `/assets/`.
- **A marca e o login continuam no navegador** de quem acessa: publicar não muda nada disso
  ([[persistencia-localstorage]], [[modelo-saas-white-label]]).
- **Push de workflow exige o escopo `workflow`** no token do `gh` ou do git. Sem ele, o GitHub recusa o
  push inteiro, não só o arquivo.

Ver [[stack-e-execucao]] e [[pontos-de-melhoria]].

A hospedagem estática permite as consultas Meta feitas pelo navegador, mas não acrescenta OAuth, autenticação real ou backend de tokens: ver [[configuracoes]], [[meta-graph-api]] e [[seguranca]].
