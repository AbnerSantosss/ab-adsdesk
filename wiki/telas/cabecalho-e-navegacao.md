---
tipo: tela
atualizado: 2026-09-25
tags: [tela, cabecalho, navegacao, rotas, celular, layout]
---

# Cabeçalho e navegação

**Arquivos:** `src/components/layout/AppHeader.tsx`, `AccountSwitcher.tsx`, `UserMenu.tsx`, `BottomNav.tsx` e `AppFooter.tsx`. As abas ficam em `src/lib/navigation.ts`. Mudou em 2026-09-25: o antigo `Navbar.tsx`, que tinha tudo num arquivo só (~500 linhas), foi dividido nessas peças.

## Abas e rotas por hash
`TABS` (`navigation.ts`) é a única fonte das abas. Cada aba tem id, rótulo, rótulo curto, ícone e trecho da URL.

| Aba | URL | Na barra do celular | Página |
|---|---|---|---|
| Visão geral | `#visao-geral` | Início | [[visao-geral]] |
| Campanhas | `#campanhas` | Campanhas | [[campanhas]] |
| Anúncios | `#anuncios` | Anúncios | [[anuncios]] |
| Relatório diário | `#diario` | Diário | [[relatorio-diario]] |
| Auditoria | `#auditoria` | Auditoria | [[auditoria-transparencia]] |

- Ao trocar de aba, `selectTab` (`src/App.tsx`) faz `pushState` do hash e rola a página para o topo. Um ouvinte de `hashchange` troca a aba quando o usuário usa voltar ou avançar. Um hash vazio ou desconhecido abre a Visão geral, então voltar até a entrada sem `#` também funciona. Um link direto como `…/#diario` já abre na aba certa.
- As abas são links `<a href="#…">` de verdade e a aba atual tem `aria-current="page"`. O título da guia do navegador acompanha a aba, por exemplo "Campanhas · Raro Pilates · AB AdsDesk".
- O filtro de objetivo (quando a visão geral leva a [[campanhas]] já filtrada) **não vai para a URL**. Ver [[estado-e-navegacao]].

## Zonas do cabeçalho (`AppHeader`)
1. **Logo** (`BrandLogo`, ver [[personalizar-marca]]): leva à visão geral. Abaixo de 640 px aparece só o símbolo.
2. **Conta** (`AccountSwitcher`): avatar, nome e tipo de negócio. O gestor abre a lista de contas, que mostra a origem de cada uma ("Meta API" ou "Demonstração") e termina em "Conectar conta da Meta" ([[modal-conectar-meta]]). **Para o cliente é só um rótulo fixo, sem lista.** No celular a lista ocupa a largura do cabeçalho, com 12 px de margem de cada lado (`inset-x-3`, ancorada no cabeçalho, que é `sticky`); a partir de 640 px ela se ancora no seletor, com 20 rem de largura.
3. **Selo de origem**, a partir de 1024 px: "Meta API conectada" ou "Dados de demonstração".
4. **Atualizar**, só em conta real: consulta a Meta de novo. Se o token da sessão já sumiu, o gestor recebe um aviso e o modal de conexão abre; o cliente só vê "Não foi possível atualizar agora. A agência atualiza os dados desta conta.", porque conectar a Meta é tarefa do gestor. A partir de 1280 px mostra também "Atualizado às…".
5. **Simulador** ([[simulador-roi]]): só o ícone a partir de 640 px, ícone e texto a partir de 1024 px. No celular, fica só no menu.
6. **Menu do usuário** (`UserMenu`).
7. **Abas** numa segunda linha, a partir de 768 px.

Quando o gestor vê o painel como cliente, uma faixa escura no topo avisa "Você está vendo o painel como o cliente vê" e oferece "Voltar à visão do gestor" ([[perfis-e-modos-de-visao]]).

## Menu do usuário
| Item | Gestor | Cliente |
|---|---|---|
| Nome, e-mail e papel | sim | sim |
| "Ver painel como" Gestor / Cliente | sim | — |
| Personalizar marca · Conectar conta da Meta | sim | — |
| Simulador de retorno · Sair | sim | sim |

Antes de executar a ação, o menu devolve o foco ao botão do avatar. O item clicado desaparece junto com o menu. Sem essa volta, o foco cairia no `<body>` e o modal aberto em seguida não teria para onde devolvê-lo quando fechasse. A lista de contas faz o mesmo com o seletor, tanto ao escolher uma conta quanto em "Conectar conta da Meta".

## Celular × desktop
- **Abaixo de 768 px:** o `BottomNav` é uma barra fixa na base da tela, com 5 colunas (ícone e rótulo curto), e respeita a área segura do iPhone. As abas do cabeçalho somem.
- **A partir de 768 px:** as abas voltam ao cabeçalho e a barra inferior some.
- **Rodapé (`AppFooter`):** mostra o nome do painel, "Desenvolvido por" (se estiver ligado) e a fonte dos dados ("Meta Graph API v23.0" ou "dados de demonstração"). O cliente também vê "Falar com {agência}", que abre o WhatsApp de atendimento. No celular o rodapé ganha `pb-24` para não ficar escondido atrás da barra.
- Menus fecham com Esc ou com clique fora (`src/hooks/useDismiss.ts`). O hook informa o motivo (`'escape'` ou `'outside'`): no Esc, o foco volta ao botão que abriu o menu; no clique fora, fica onde o usuário clicou. Mais regras em [[interface-e-responsividade]].
- **"Pular para o conteúdo"** (primeiro Tab da página) move o foco para o `<main id="conteudo">` sem mexer no endereço. Se usasse o `href="#conteudo"`, o hash da tela seria trocado e o app voltaria para a Visão geral.

## Armadilhas
- **Todo item de menu que abre modal precisa devolver o foco antes** (ver acima). Um item novo no `UserMenu` ou no `AccountSwitcher` que chame `setOpen(false)` direto repete o bug antigo do foco no `<body>`.
- **A âncora da lista de contas muda com a largura.** No celular o root do seletor não é `relative` (`sm:relative`), então a lista se posiciona pelo cabeçalho. Colocar `relative` de volta faz a lista passar da borda direita em telas de 375 px.
- **Um link com `href="#…"` que não é aba** troca a tela para a Visão geral, porque o `hashchange` lê qualquer hash. Use `preventDefault` e mova o foco, como no link de pular.
- **As abas cancelam sempre o clique** (`preventDefault`), então Ctrl+clique não abre a aba em outra guia ([[bugs-conhecidos]]).
- O ícone da Raro Pilates agora vem do campo `logoKey` da conta, e não mais de `includes('Raro')`. Mesmo assim é um caso especial do cliente demo ([[nicho-pilates-e-generalizacao]]).
