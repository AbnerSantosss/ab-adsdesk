---
tipo: tela
atualizado: 2026-10-07
tags: [tela, login, autenticacao, demonstracao]
---

# Tela de login

**Arquivo:** `src/components/screens/LoginScreen.tsx`. Aparece quando não há usuário salvo ou quando a URL tem `?view=login`, que força a tela mesmo com sessão guardada. O parâmetro é removido da URL depois de entrar ([[estado-e-navegacao]]).

> Mudou em 2026-09-25: saíram o cadastro, o login social (Google/Meta), a regra "qualquer e-mail entra" e as promessas técnicas falsas (v21.0, AES-256, URL "vivabem"). Hoje só entram os perfis de demonstração de `src/types/auth.ts`, e a tela mostra **um único botão de entrada rápida**, o do gestor (pedido do usuário em 2026-09-25).

## Objetivo para o usuário
Entrar sem fricção. Na demonstração comercial, um toque leva ao painel do gestor. De lá, "Ver painel como" mostra o lado do cliente ([[personas]]).

## O que aparece
- **Formulário "Entrar no painel":** e-mail, senha (com botão mostrar/ocultar), "Manter conectado" (já vem marcado) e "Esqueci a senha".
- **"Ou use a entrada rápida":** um único botão, "Entrar como gestor da agência", com a legenda "Abner Senna · demonstração, sem senha". O usuário vem de `QUICK_LOGIN_USER` (o primeiro `AGENCY_MANAGER` de `demoUsers`). Um toque e já entra. Ver [[perfis-e-modos-de-visao]].
- **Cliente (Camila Rocha, presa à conta Raro Pilates):** não tem botão. Entra pelo formulário, com o e-mail de demonstração dela, ou é vista pelo gestor em "Ver painel como" ([[cabecalho-e-navegacao]]).
- **Rodapé:** "Ainda não tem acesso? Fale com a {parentBrand}".
- **Identidade social:** chips neutros de contexto "Instagram" e "Facebook" (`SocialChannels`), formulário em fundo claro e entrada rápida em superfície neutra. Os chips não são botões de login social nem prometem resultados separados por canal. Ações usam a família da marca; ver [[cores-e-hierarquia-visual]].
- **Painel de vendas (só em telas largas, `lg` para cima):**
  - marca própria AB AdsDesk e o título "Suas campanhas. Uma visão clara.", com a frase "Cada real investido em anúncios, explicado para o cliente.";
  - a tagline da marca;
  - três destaques: contatos do WhatsApp com custo, auditoria turbinado × estruturado e relatório diário ([[proposta-de-valor]]);
  - foto ilustrativa local (`/images/brand/social-studio.webp`) e a legenda "Do anúncio ao resultado. Criativos, investimento e contatos no mesmo painel.", sobre painel grafite sem manchas multicoloridas;
  - "Desenvolvido por {parentBrand}", se `showPoweredBy` estiver ligado.

## Como decide quem entra
1. E-mail ou senha vazios: "Preencha o e-mail e a senha."
2. O e-mail, em minúsculas, precisa ser igual ao de um dos `demoUsers` de `src/types/auth.ts`. Senão: "Não encontramos esse e-mail. Nesta versão de demonstração, use a entrada rápida logo abaixo."
3. **A senha não é conferida.** Qualquer texto não vazio serve.
4. Com "Manter conectado", o usuário vai para o `localStorage`. Sem ele, vai para o `sessionStorage` e some ao fechar a aba ([[persistencia-localstorage]]).

## Gestor × cliente
A tela é igual para os dois. A diferença vem do perfil que entrou:
- o cliente entra travado na conta do `clientAccountId`, no modo de visão do cliente;
- o gestor entra no modo gestor e pode trocar de conta e "Ver painel como" o cliente ([[cabecalho-e-navegacao]]).

## No celular
- O painel de vendas some e o logo aparece em cima do formulário.
- Os campos têm 48 px de altura e fonte de 16 px, o que evita o zoom automático do iPhone ao tocar.
- O botão de entrada rápida tem pelo menos 64 px de altura, e "Manter conectado", 44 px.
- A grade da página usa `grid-cols-1` no celular. Sem isso, a trilha implícita crescia com o conteúdo e a tela rolava para o lado ([[interface-e-responsividade]]).

## De onde vêm os dados
Nada vem da Meta. Os perfis são fixos em `src/types/auth.ts`, e a marca (nome, cor, logo, WhatsApp de suporte) vem de `defaultBrandConfig` mesclado com o que foi salvo neste navegador ([[personalizar-marca]]).

## Armadilhas
- **Não existe autenticação.** Os e-mails de demonstração estão no bundle (`src/types/auth.ts`), a senha não é conferida e o perfil salvo no navegador pode ser editado à mão ([[seguranca]], [[o-que-e-simulado]]).
- **Um botão só é decisão de momento.** Se a demonstração voltar a precisar do cliente com um toque, basta outro botão com o `CLIENT_VIEWER` de `demoUsers`; o resto da tela não muda.
- "Esqueci a senha" e "Fale com a..." abrem `wa.me/` com o `supportWhatsapp` da marca. O padrão é o número fictício `5511999999999`: sem configurar em [[personalizar-marca]], o link não leva a ninguém.
- A marca vem do `localStorage` **deste navegador**. O cliente que abre o painel no próprio aparelho vê a marca padrão "AB AdsDesk", não a do gestor ([[modelo-saas-white-label]], [[inconsistencias-de-marca]]).
- A foto e os elementos sociais são ilustrativos. O visual não acrescenta autenticação real, integração de insights nem vínculo oficial com Instagram, Facebook ou Meta.

## Para produção
- Autenticação real (Supabase Auth, Clerk, Auth0 ou similar).
- Convite do cliente pelo gestor, por link mágico.
- Recuperação de senha de verdade.
- Vínculo usuário ↔ conta de anúncio guardado no backend, não no navegador.

Ver [[pontos-de-melhoria]].
