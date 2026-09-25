---
tipo: arquitetura
atualizado: 2026-09-25
tags: [arquitetura, estado, react, navegacao, app-tsx, hash]
---

# Estado e navegação

Não há biblioteca de estado nem roteador. O `src/App.tsx` (~270 linhas) é o único orquestrador: guarda o estado global, escolhe a tela e repassa tudo por props. As telas recebem dados e callbacks e não leem o storage. As exceções são os modais de conexão e de e-mail, que têm memória própria (ver [[persistencia-localstorage]]).

## Estado do App

| Estado | Valor inicial | Para que serve |
|---|---|---|
| `user` | usuário salvo, validado por `id` e `role` | `null` mostra a [[tela-login]] |
| `brand` | `defaultBrandConfig` + o que foi salvo, com a cor validada | white-label ([[personalizar-marca]]) |
| `connectedAccount` | conta real salva, ou `null` | entra no topo da lista de contas |
| `selectedAccountId` | conta salva, ou `mockAccounts[0]` | conta que o gestor está vendo |
| `managerViewMode` | `'MANAGER'` | prévia "ver como cliente" |
| `activeTab` | aba lida do hash, ou `OVERVIEW` | tela visível |
| `objectiveFilter` | `'ALL'` | filtro de objetivo de [[campanhas]] |
| `openModal` | `null` | `'BRAND'`, `'CONNECT'` ou `'ROI'`: um modal por vez |
| `refreshing`, `notice` | — | botão de atualizar e Toast |

O `objectiveFilter` mora no App, e não em Campanhas, para que a [[visao-geral]] possa abrir Campanhas já filtrada.

Três valores são derivados, não guardados:

- `accounts = [connectedAccount, ...mockAccounts]`;
- `account`, a conta exibida;
- `viewMode`, o modo de visão.

Os dois últimos dependem do perfil; ver [[perfis-e-modos-de-visao]].

## Navegação por hash

O `src/lib/navigation.ts` define `TABS`: id, rótulo, rótulo curto, ícone e slug. Cada aba tem uma URL: `#visao-geral`, `#campanhas`, `#anuncios`, `#diario` e `#auditoria`. A forma `#/campanhas` também é aceita.

- `selectTab` grava o hash com `pushState` e rola a página ao topo. Um listener de `hashchange` faz o botão voltar do navegador trocar de aba.
- `navigate(tab, filter?)` é a função que as telas recebem. A Visão geral usa para abrir Campanhas filtrada por objetivo, e a [[auditoria-transparencia]] usa para levar ao [[relatorio-diario]].
- `document.title` fica "Aba · Conta · appName", ou "Entrar · appName" antes do login.
- No desktop (md+), as abas ficam no `AppHeader`. No celular, ficam na `BottomNav` fixa, com rótulos curtos (Início, Campanhas, Anúncios, Diário, Auditoria). Ver [[cabecalho-e-navegacao]] e [[interface-e-responsividade]].

## Carregamento sob demanda

- As seis telas, incluindo o login, usam `lazy()` e aparecem dentro de `Suspense`, com o `PageSkeleton` enquanto carregam.
- Os modais de marca, conexão e simulador só montam quando `openModal` pede. Dois segundos depois do login, o App já baixa os três em segundo plano, para que abram sem atraso.
- O `SendReportEmailModal` é importado pelo próprio `DailyReports` e só monta quando é aberto.
- O `ErrorBoundary` usa `resetKey = aba:conta`. Se uma tela quebrar, trocar de aba ou de conta limpa o erro.

## Trocar de conta zera a tela

Cada tela recebe `key={account.id}`. Ao trocar de conta, a tela é remontada e perde o estado local: período, busca, ordenação, dia escolhido e criativo aberto. O `selectAccount` também volta o filtro de objetivo para `ALL`. É proposital: evita que o filtro de uma conta seja aplicado à outra.

## Armadilhas

- O filtro de objetivo sobrevive à troca de aba, mas não vai para a URL. Recarregar a página perde o filtro, mas mantém a aba.
- A conta selecionada vem do storage sem checagem. Se ela não existir mais, a tela cai em `accounts[0]` sem avisar.
- `handleRefresh` só age em conta real e usa o token salvo. Se o token sumiu, mostra "A sessão da Meta expirou..." e abre o [[modal-conectar-meta]].
- `?view=login` força a tela de entrada (útil para demonstrar) e é removido da URL depois do login.

Mudou em 2026-09-25:

- `Navbar`, `AccountOverview`, `CreativesRanking` e o modal de auditoria foram removidos.
- `selectedConversionType` virou `objectiveFilter`.
- A sincronização simulada virou uma releitura real da Meta.
- Os modais deixaram de ficar sempre montados.

Detalhes em [[refatoracao-ux-2026-09-25]].
