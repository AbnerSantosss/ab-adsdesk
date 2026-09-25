# AB AdsDesk

Painel white-label de anúncios da Meta para agências de tráfego. O gestor acompanha as contas dos
clientes, e o cliente (por exemplo, um estúdio de Pilates) vê em linguagem simples quanto investiu,
quantos contatos chegaram e quanto custou cada um. O relatório do dia pode ser enviado por
WhatsApp ou por e-mail.

> Os dados de campanhas, anúncios e dias ainda são de demonstração. A conexão com a Meta já lê os
> dados da conta, mas ainda não lê `/insights`. Veja `wiki/riscos/o-que-e-simulado.md`.

## Requisitos

- Node.js 22.18 ou mais novo (testado no 24). O script `email:check` roda TypeScript direto no Node.
- npm. O projeto usa `package-lock.json` (o antigo `bun.lock` foi removido).

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
```

Entre com um dos usuários de exemplo que aparecem na tela de login: gestor da agência ou cliente.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 3000, aceitando acesso pela rede local |
| `npm run lint` | Checagem de tipos (`tsc --noEmit`) |
| `npm run build` | Gera a versão estática em `dist/` |
| `npm run preview` | Serve o `dist/` localmente, já com a rota de e-mail |
| `npm run email:check` | Testa o login no servidor SMTP sem enviar nada |
| `npm run clean` | Apaga o `dist/` |

## Envio do relatório por e-mail

O botão **Enviar por e-mail**, no Relatório diário, usa um pequeno servidor que roda junto com o
Vite (`server/`). A senha do e-mail fica só no computador, nunca no navegador.

1. Copie `.env.example` para `.env.local`.
2. Preencha `SMTP_USER` e `SMTP_PASS`. No Gmail, ative a verificação em duas etapas e gere uma
   [senha de app](https://myaccount.google.com/apppasswords). A senha normal da conta não funciona.
3. Rode `npm run email:check`. Ele deve responder que o login foi aceito.
4. Reinicie o `npm run dev`. Mudanças no `.env.local` só valem depois de reiniciar.

Regras importantes:

- Não use o prefixo `VITE_` nessas variáveis: tudo que começa com `VITE_` vai para o navegador.
- `.env.local` está no `.gitignore`. Não o envie para repositórios nem por mensagem.
- Por padrão a rota `/api/email` só aceita chamadas deste computador e no máximo 20 envios por hora.
- A versão publicada (imagem Docker com nginx) não tem essa rota, então não envia e-mail: o modal
  avisa e oferece copiar o texto ou mandar pelo WhatsApp. Publicar a rota sem login viraria um
  disparador de spam. Para isso é preciso um backend com autenticação (veja
  `wiki/pontos-de-melhoria.md`).

Detalhes em `wiki/integracoes/envio-de-email-smtp.md`.

## Publicação (VPS + Portainer + Cloudflare)

A imagem é construída pelo GitHub Actions e publicada no GHCR; a VPS só puxa.

1. **Imagem:** cada push em `main` roda `.github/workflows/build.yml` (lint, build e
   `ghcr.io/abnersantosss/ab-adsdesk:latest`). O `Dockerfile` gera o `dist/` e o serve com nginx
   (`deploy/nginx.conf`), com cabeçalhos de segurança e CSP (`deploy/security-headers.conf`).
2. **Portainer:** *Stacks → Add stack → Repository*, URL deste repositório, *Compose path*
   `docker-compose.yml`. O container publica só em `127.0.0.1:3340` (mude com a variável
   `APP_PORT`). Para atualizar: *Pull and redeploy*.
3. **Cloudflare:** *Zero Trust → Networks → Tunnels →* túnel do servidor *→ Public Hostname → Add*,
   `adsdesk.proxserverabner.site` → `HTTP` `localhost:3340`. O registro de DNS é criado pelo túnel.

Para testar a imagem no próprio computador:

```bash
docker build -t ab-adsdesk:local .
docker run --rm -p 8088:80 ab-adsdesk:local   # http://localhost:8088
```

`/healthz` responde `ok`; `/api/*` responde 404 em JSON.

## Estrutura

```
deploy/                 nginx e cabeçalhos de segurança da imagem Docker
server/                 Envio de e-mail (plugin do Vite: /api/email/status e /api/email/report)
src/
  App.tsx               Estado global, rotas por hash (#visao-geral, #campanhas...) e modais
  components/
    layout/             Cabeçalho, seletor de conta, menu do usuário, barra inferior, rodapé
    screens/            Login, Visão geral, Campanhas, Anúncios, Relatório diário, Auditoria
    modals/             Marca, Conectar Meta, Simulador de retorno, Enviar por e-mail
    ui/                 Componentes base (Card, Modal, KpiCard, botões, controles)
  lib/                  Formatação pt-BR, métricas, objetivos, navegação, armazenamento local
  services/             Meta Graph API e cliente da rota de e-mail
  types/  data/         Tipos e dados de demonstração
wiki/                   Documentação do produto e do código (abra no Obsidian; comece por wiki/index.md)
```

## Documentação

A wiki em `wiki/` explica o produto, cada tela, as regras de cálculo, as integrações, os riscos e o
que falta para produção. Comece por `wiki/index.md`.
