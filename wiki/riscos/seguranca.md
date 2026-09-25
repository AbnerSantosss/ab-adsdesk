---
tipo: risco
atualizado: 2026-09-25
tags: [riscos, seguranca, lgpd, token, autenticacao, multi-tenant, email]
---

# Segurança

O app lida com **dados de anúncios de terceiros**, com **token de acesso à Meta** e, desde a refatoração, com **uma senha de e-mail real**. Hoje ele é um protótipo que roda no computador do gestor; antes de ter cliente pagante, os pontos abaixo são obrigatórios.

## Problemas atuais (por gravidade)
1. **Não existe autenticação.** Só os e-mails dos perfis de exemplo entram, com qualquer senha, e a sessão é um JSON no navegador (`ab_adsdesk_auth_user`). Trocar o `role` nesse JSON transforma o cliente em gestor ([[tela-login]], [[persistencia-localstorage]]).
2. **O isolamento entre clientes existe só na interface.** O `CLIENT_VIEWER` fica preso à própria conta e à visão cliente, mas os dados de todas as contas estão no mesmo pacote JavaScript, e há um caminho em que o cliente cai na conta errada ([[bugs-conhecidos]], [[perfis-e-modos-de-visao]]).
3. **Token da Meta no navegador** (`clareza_meta_api_config`): no `sessionStorage` por padrão, no `localStorage` com "Lembrar neste navegador", e enviado na query string direto do front. Qualquer XSS ou extensão consegue lê-lo. Não há CSP no `index.html` ([[meta-graph-api]]).
4. **Dados da conta conectada persistem** no `localStorage` mesmo sem "Lembrar": em computador compartilhado, o próximo usuário vê nome e gasto da conta.

## E-mail (SMTP)
O que já está certo, e não pode regredir ([[envio-de-email-smtp]]):
- A senha fica em `.env.local`, que o `.gitignore` exclui (`.env*`, exceto `.env.example`). O `vite.config.ts` lê o arquivo com `loadEnv` e entrega só ao plugin do servidor; nada chega ao bundle.
- As variáveis não têm prefixo `VITE_`. Quem criar uma com esse prefixo publica a senha no navegador.
- A rota `/api/email` aceita só pedidos deste computador (loopback), da mesma origem, em JSON, com até 20 KB e no máximo 20 envios por hora. O Vite barra `Host` estranho antes disso.

O que exige cuidado:
- **Se a senha de app já circulou** em arquivo de texto, conversa, print ou e-mail, revogue e gere outra na página de senhas de app da conta Google. Uma senha de app dá acesso à caixa de e-mail, não só ao envio.
- Use uma conta Gmail com senha de app **dedicada ao painel**, não o e-mail pessoal do gestor.
- **`EMAIL_ALLOW_REMOTE=true` só atrás de autenticação.** Como o `npm run dev` escuta na rede local, ligar essa opção deixa qualquer aparelho da rede mandar e-mail em nome da conta.
- `GET /api/email/status` devolve o endereço remetente. Localmente não há problema; publicada, a rota precisa exigir login.
- Nunca escreva a senha, o token ou o endereço remetente real na wiki, no README ou em issue.

## Lição da refatoração
O texto "Criptografia AES-256", que a tela de login exibia sem nada por trás, saiu. Afirmar segurança que não existe é problema legal (CDC, publicidade enganosa) e de confiança. Só anuncie proteção depois de implementada.

## Requisitos mínimos para produção
- **Autenticação real** com provedor (Supabase Auth, Clerk, Auth0, Firebase Auth), e-mail verificado e troca de senha de verdade.
- **Autorização no backend:** cada pedido checa agência → usuário → contas permitidas. No banco, Row Level Security ou equivalente. O front só recebe os dados da conta que pode ver.
- **Tokens da Meta e senha SMTP só no servidor**, criptografados em repouso (KMS ou pgsodium), com rotação e revogação quando o cliente sai.
- **Escopos mínimos:** `ads_read` para ler; `ads_management` só se o produto for pausar campanhas ([[campanhas]]).
- **E-mail:** remetente de domínio próprio com SPF, DKIM e DMARC; rota de envio autenticada e com limite por usuário.
- **LGPD:** política de privacidade e termos de uso, base legal, exclusão de dados ao cancelar e registro de quem acessou o quê. Os e-mails dos clientes guardados para o relatório já são dado pessoal; leads com nome e telefone serão, se um dia o app importar formulários.
- **Requisitos da Meta:** Platform Terms, política de dados, verificação do negócio e App Review ([[meta-graph-api]]).
- **Cabeçalhos de segurança** (CSP) e nenhuma credencial no bundle.

## Relacionados
[[o-que-e-simulado]] · [[pontos-de-melhoria]] · [[bugs-conhecidos]]
