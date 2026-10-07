---
tipo: integracao
atualizado: 2026-09-25
tags: [integracao, email, smtp, gmail, relatorio, servidor]
---

# Envio de e-mail (SMTP)

O botão **Enviar por e-mail**, no [[relatorio-diario]], manda ao cliente a mesma mensagem preparada para o WhatsApp. É a única parte do app que roda num servidor: a senha do e-mail não pode chegar ao navegador, então o envio acontece dentro do processo do Vite, e o front só chama `/api/email/*`.

## Fluxo ponta a ponta
1. Na visão gestor, o botão abre o `SendReportEmailModal` (`src/components/modals/SendReportEmailModal.tsx`).
2. O modal consulta `GET /api/email/status` (`src/services/emailApi.ts`). Sem configuração ou sem resposta, mostra um aviso no lugar do formulário.
3. O gestor confere destinatário, assunto e prévia. O destinatário fica lembrado por conta em `ab_adsdesk_report_recipients`, gravado só depois de um envio que deu certo.
4. `POST /api/email/report` com `{to, subject, text, senderName}`. O `senderName` é o `parentBrand` da marca ([[personalizar-marca]]).
5. `server/email.ts` valida o pedido, converte o `*negrito*` do WhatsApp em HTML (com uma versão em texto puro) e envia com nodemailer. O remetente é a conta SMTP, exibida com o nome da agência.
6. A tela de sucesso pede para o cliente olhar também o spam.

`server/vitePlugin.ts` pendura esse middleware no `npm run dev` e no `npm run preview`; o `vite.config.ts` lê o `.env.local` com `loadEnv(mode, cwd, '')` e entrega os valores só ao plugin.

## Configuração
1. Copiar `.env.example` para `.env.local`, que já está no `.gitignore`.
2. Preencher `SMTP_USER` e `SMTP_PASS`. No Gmail, ativar a verificação em duas etapas e gerar uma **senha de app**; a senha normal da conta não funciona. Os espaços da senha de app são removidos pelo código.
3. Opcionais, todos descritos no `.env.example`:
   - `SMTP_HOST` (padrão `smtp.gmail.com`) e `SMTP_PORT` (465);
   - `SMTP_SECURE`: `true` na porta 465 (TLS direto); na 587, `false`, e a conexão sobe com STARTTLS;
   - `EMAIL_FROM_NAME`: nome usado quando o painel não manda a marca;
   - `EMAIL_REPLY_TO`: para onde vão as respostas do cliente (o e-mail da agência ou do gestor);
   - `EMAIL_ALLOW_REMOTE`: libera o envio a partir de outros aparelhos da rede.
4. `npm run email:check` (`server/check-email.ts`) faz login no SMTP e sai, sem enviar nada.
5. Reiniciar o `npm run dev`: o `.env.local` só é lido na subida do servidor.

Nenhuma dessas variáveis pode ter prefixo `VITE_`, porque tudo que começa com `VITE_` vai para o navegador.

## Rotas e proteções
| Rota | Resposta |
|---|---|
| `GET /api/email/status` | `{configured: true, from}` ou `{configured: false}`; com o SMTP configurado, 403 para quem não está neste computador |
| `POST /api/email/report` | `200 {ok: true}`; erros com mensagem em pt-BR: 400 (pedido inválido), 403, 413 (relatório acima do tamanho máximo), 415, 429, 502 (o provedor recusou), 503 (sem configuração) |

No front, `src/services/emailApi.ts` traduz o status em `reason`: `NOT_CONFIGURED`, `REMOTE_BLOCKED` (o 403) ou `UNAVAILABLE` (sem servidor, como na versão publicada). O modal mostra um aviso diferente para cada um.

As barreiras, na ordem em que agem:
- O Vite checa o cabeçalho `Host` e aplica sua política de CORS antes dos middlewares de plugin, o que barra DNS rebinding.
- **Só este computador:** pedidos de fora do loopback recebem 403, a menos que `EMAIL_ALLOW_REMOTE=true`.
- **Mesma origem** (`Origin` igual ao `Host`) e corpo em JSON.
- Corpo de até 20 KB (acima disso, 413; o servidor lê e descarta o resto antes de responder, porque cortar a conexão impedia a resposta), destinatário validado, assunto de até 160 caracteres numa linha só, texto de até 6.000 caracteres e nome do remetente limpo de quebras de linha e de `<>"`.
- **No máximo 20 tentativas por hora**, contadas em memória. A tentativa conta antes do `sendMail`, então senha errada ou destinatário recusado também gastam a cota. Assim uma sequência de falhas não martela o Gmail, que pode travar a conta.

## Por que só roda em dev/preview
O `npm run build` gera arquivos estáticos em `dist/`, sem servidor. A imagem Docker publica só esse `dist/` com nginx, que responde `/api/*` com 404 ([[deploy-vps-portainer]]); o modal então avisa "Esta versão do painel ainda não envia e-mail. Copie o texto ou mande pelo WhatsApp." Publicar a rota sem login viraria um disparador de spam. Para produção falta:
- levar `server/email.ts` para um backend ou função serverless;
- proteger a rota com autenticação real, porque hoje a proteção é "só este computador" ([[seguranca]]);
- trocar a conta Gmail por um remetente próprio (domínio da agência com SPF, DKIM e DMARC) ou por um serviço de e-mail transacional;
- fila com novas tentativas e, se o envio for agendado, um job diário. A ordem está em [[pontos-de-melhoria]].

## Armadilhas
- **O Gmail limita envios** por dia e pode travar a conta se parecer disparo em massa. Serve para demonstração e poucos clientes, não para escala.
- **Spam:** mensagem de uma conta pessoal com o nome de outra marca tende a cair no lixo eletrônico. Avise o cliente no primeiro envio.
- **Mudou o `.env.local`? Reinicie o `npm run dev`.** Até reiniciar, o status continua o antigo.
- **Sem `EMAIL_REPLY_TO`, as respostas voltam para a conta SMTP.** O rodapé do e-mail diz "Responda este e-mail para falar com a equipe"; se a conta SMTP não for lida por ninguém, configure a variável.
- **Acesso por outro aparelho da rede:** o `npm run dev` aceita conexões da rede local (`--host=0.0.0.0`), mas a rota responde 403 a elas. O modal explica: "Por segurança, o envio só funciona no computador onde o painel está rodando. Envie de lá ou copie o texto." Só `EMAIL_ALLOW_REMOTE=true` libera, e isso abre a rota para qualquer um da rede.
- O limite de 20 por hora fica em memória e zera quando o servidor reinicia. Em produção, precisa ir para o banco ou para o provedor.
