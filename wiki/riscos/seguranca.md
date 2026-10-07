---
tipo: risco
atualizado: 2026-10-07
tags: [riscos, seguranca, lgpd, token, autenticacao, multi-tenant, email]
---

# Segurança

O app lida com **dados de anúncios de terceiros**, com **token de acesso à Meta** e, desde a refatoração, com **uma senha de e-mail real**. Hoje ele é um protótipo que roda no computador do gestor; antes de ter cliente pagante, os pontos abaixo são obrigatórios.

## Problemas atuais (por gravidade)
1. **Não existe autenticação.** Só os e-mails dos perfis de exemplo entram, com qualquer senha, e a sessão é um JSON no navegador (`ab_adsdesk_auth_user`). Trocar o `role` nesse JSON transforma o cliente em gestor ([[tela-login]], [[persistencia-localstorage]]).
2. **O isolamento entre clientes existe só na interface.** O `CLIENT_VIEWER` fica preso à própria conta; se ela estiver ausente, recebe “Conta indisponível”, sem cair em outra conta. Configurações e atualização são restritas ao gestor na visão de gestor. Ainda não há autorização no servidor; os mocks estão no bundle e o snapshot real está no navegador.
3. **Token da Meta ainda no navegador** (`clareza_meta_api_config`): somente memória/sessionStorage, enviado em `Authorization: Bearer`, sem query string. O legado local é removido sem leitura, mas scripts com acesso à página ainda podem ler a credencial. Esses cuidados não substituem backend, OAuth ou armazenamento seguro. A CSP do nginx é separada da execução em dev ([[deploy-vps-portainer]], [[meta-graph-api]]).
4. **Snapshot real local.** Conta e relatório sem token persistem no `localStorage` ao fechar a aba. Logout/desconexão removem esse snapshot e a credencial; marca e destinatários ainda permanecem. Em computador compartilhado, fechar a aba não equivale a sair.

## Correções implementadas em 2026-10-07

Credenciais não são persistidas no localStorage nem incorporadas às URLs. A paginação reconstrói chamadas na origem fixa `graph.facebook.com` e ignora URLs `paging.next`; redirecionamentos são recusados. Mensagens de erro remotas brutas não são exibidas. Consultas canceladas ou parciais não substituem o relatório concluído. Sair/desconectar cancela atualizações e limpa token/snapshot. Cliente sem conta não recebe fallback para outra conta.

São proteções da implementação local, não uma auditoria completa de segurança. Não houve conexão ao vivo com token do usuário nesta revisão. A importação real não comprova Pixel, WhatsApp ou origem Turbinar, e não produz nota de saúde presumida. Ver [[o-que-e-simulado]].

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
