---
tipo: arquitetura
atualizado: 2026-10-07
tags: [arquitetura, estado, react, navegacao, app-tsx, hash]
---

# Estado e navegação

Não há biblioteca de estado nem roteador. O `src/App.tsx` é o orquestrador: guarda o estado global, escolhe a tela e repassa tudo por props. A conexão usa `MetaConnectionPanel` em [[configuracoes]] e o serviço Meta para credenciais de sessão; o modal de e-mail também tem memória própria (ver [[persistencia-localstorage]]).

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
| `openModal` | `null` | `'BRAND'` ou `'ROI'`: um modal por vez; conexão virou aba |
| `refreshing`, `notice` | — | botão de atualizar e Toast |

O `objectiveFilter` mora no App, e não em Campanhas, para que a [[visao-geral]] possa abrir Campanhas já filtrada.

Três valores são derivados, não guardados:

- `accounts = [connectedAccount, ...mockAccounts]`;
- `account`, a conta exibida;
- `viewMode`, o modo de visão.

Os dois últimos dependem do perfil; ver [[perfis-e-modos-de-visao]].

## Navegação por hash

O `src/lib/navigation.ts` define `TABS`: id, rótulo, rótulo curto, ícone e slug. As URLs são `#visao-geral`, `#campanhas`, `#anuncios`, `#diario`, `#auditoria` e `#configuracoes`. A forma `#/campanhas` também é aceita. Configurações exige `AGENCY_MANAGER` na visão `MANAGER`; acesso ao hash fora desse modo volta à Visão geral.

- `selectTab` grava o hash com `pushState` e rola a página ao topo. Um listener de `hashchange` faz o botão voltar do navegador trocar de aba.
- `navigate(tab, filter?)` é a função que as telas recebem. A Visão geral usa para abrir Campanhas filtrada por objetivo, e a [[auditoria-transparencia]] usa para levar ao [[relatorio-diario]].
- `document.title` fica "Aba · Conta · appName", ou "Entrar · appName" antes do login.
- No desktop (md+), as abas ficam no `AppHeader`. No celular, ficam na `BottomNav` fixa, com rótulos curtos (Início, Campanhas, Anúncios, Diário, Auditoria). Ver [[cabecalho-e-navegacao]] e [[interface-e-responsividade]].

## Carregamento sob demanda

- Login, telas de demonstração, Configurações e `MetaReports` usam `lazy()`/`Suspense`.
- Os modais de marca e simulador montam quando `openModal` pede e são pré-carregados após o login. O antigo modal de conexão permanece apenas como compatibilidade, fora do fluxo principal do App.
- O `SendReportEmailModal` é importado pelo próprio `DailyReports` e só monta quando é aberto.
- O `ErrorBoundary` usa `resetKey = aba:conta`. Se uma tela quebrar, trocar de aba ou de conta limpa o erro.

## Trocar de conta zera a tela

Cada tela recebe `key={account.id}`. Ao trocar de conta, a tela é remontada e perde o estado local: período, busca, ordenação, dia escolhido e criativo aberto. O `selectAccount` também volta o filtro de objetivo para `ALL`. É proposital: evita que o filtro de uma conta seja aplicado à outra.

Contas reais usam `MetaReports` nas cinco abas de análise; dados mock continuam nas telas próprias. O relatório real é um `apiReport` completo, com período, fuso e moeda. Uma conta antiga sem relatório pede importação em Configurações. “Campanhas da conta” pode incluir metadados sem métricas no período. A prévia real tenta carregar novamente quando sua URL muda, sem manter indevidamente o erro da imagem anterior.

`MetaConnectionPanel` cancela a consulta ao desmontar. Logout, desconexão e substituição por nova conexão cancelam atualização pendente; o App também cancela ao desmontar. Respostas canceladas não sobrescrevem o snapshot. Uma nova atualização cancela a anterior. O cabeçalho e as telas reais escondem atualização para cliente/visão de cliente, e o callback também verifica a permissão.

## Armadilhas

- O filtro de objetivo sobrevive à troca de aba, mas não vai para a URL. Recarregar a página perde o filtro, mas mantém a aba.
- A conta do gestor pode voltar à primeira conta se a seleção salva deixou de existir. O cliente sem conta vinculada disponível vê “Conta indisponível” e pode sair; não recebe outra conta como fallback. Isso corrige a exibição incorreta, mas não substitui autorização no backend.
- `handleRefresh` só age em conta real para gestor na visão de gestor. Sem token de sessão, orienta [[configuracoes]]. Falha preserva o último snapshot, inclusive seu período.
- `?view=login` força a tela de entrada (útil para demonstrar) e é removido da URL depois do login.

Mudou em 2026-09-25:

- `Navbar`, `AccountOverview`, `CreativesRanking` e o modal de auditoria foram removidos.
- `selectedConversionType` virou `objectiveFilter`.
- A sincronização simulada virou uma releitura real da Meta.
- Os modais deixaram de ficar sempre montados.

Detalhes em [[refatoracao-ux-2026-09-25]].
