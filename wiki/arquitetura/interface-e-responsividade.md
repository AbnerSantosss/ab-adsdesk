---
tipo: arquitetura
atualizado: 2026-10-07
tags: [arquitetura, interface, responsividade, acessibilidade, tailwind, componentes]
---

# Interface e responsividade

O painel é **pensado primeiro para o celular**, porque a dona do estúdio abre pelo telefone ([[personas]]). A interface usa Tailwind v4 com container queries nativas e uma biblioteca pequena em `src/components/ui/`. Não há shadcn nem outra biblioteca de componentes. Ver [[stack-e-execucao]].

## Biblioteca (`src/components/ui/`)
| Peça | Papel |
|---|---|
| `button.ts` → `buttonClass(variant, size, extra)` | classes de botão (`primary`, `secondary`, `ghost`, `danger`, `whatsapp`) que servem em `<button>` e em `<a>` |
| `Modal` | janela acessível; no celular vira painel que sobe da base |
| `Card`, `PageHeader`, `KpiCard`, `Badge`, `EmptyState` | blocos de tela (título `h1` no `PageHeader`, `h2` nos cartões) |
| `SegmentedControl`, `Switch`, `SliderField` | escolha única (`aria-pressed`), liga/desliga (`role="switch"`) e controle deslizante com valor falado |
| `DateRangeFilter` | filtros Hoje/Ontem/Últimos 7 dias e calendário De/Até; modal com validação e aplicação explícita do intervalo |
| `Toast` | aviso curto (`role="status"`) que some sozinho em 4,5 s e fica acima da barra inferior |
| `ErrorBoundary`, `PageSkeleton` | erro isolado por tela (limpa ao trocar de aba ou conta) e esqueleto enquanto a tela carrega |
| `BrandLogo`, `AccountAvatar`, `CreativePreview`, `WhatsAppText` | marca, ícone da conta, prévia ilustrativa do anúncio e texto com *negrito* do WhatsApp |
| `SocialChannels` | rótulos de contexto Instagram e Facebook; não são filtros, login social nem declaração de resultados por canal |

## Tema e marca
As classes `*-brand-*` leem variáveis `--brand-50…950`, e cada `[data-brand="…"]` em `src/index.css` troca a paleta. O `App` põe o atributo no `<html>`. Qualquer elemento pode sobrescrever a cor só para si, como fazem as amostras de cor e a prévia em [[personalizar-marca]]. O foco visível e a seleção de texto também seguem a cor da marca. Números usam `tabular-nums`, e animações somem com `prefers-reduced-motion`.

A identidade padrão continua `social`, mas a interface analítica usa fundo branco gelo `--app-canvas: #f5f6f8`, cards brancos `--app-surface`, camadas auxiliares neutras e ícones grafite. Não há uma cor decorativa por objetivo, formato ou KPI. O tipo legado `SocialTone` permanece aceito por componentes, sem impor superfícies multicoloridas. As cores da configuração white-label já salvas continuam sendo respeitadas como família de ação e seleção. A pesquisa, distinção entre cor de estado e decoração e critérios de contraste estão em [[cores-e-hierarquia-visual]].

A navegação principal e os botões usam as variáveis `brand` da configuração white-label. `PageHeader` centraliza os chips neutros `SocialChannels` nas telas que o utilizam. A [[visao-geral]] usa cabeçalho próprio compacto, sem imagem e sem duplicação de chips: nome e intervalo à esquerda, filtros à direita no desktop.

`Card` aceita `tone` e `icon`; `KpiCard` aceita `tone`; `PageHeader` aceita `tone`, `eyebrow` e `image: { src, alt }`. As classes compartilhadas `social-surface`, `social-inset`, `social-icon`, `social-filterbar`, `social-section-label` e `social-dark-panel` organizam superfícies neutras, ícones, filtros e painéis. A foto `/images/brand/social-studio.webp` permanece no login, mas saiu do fundo geral do painel; as 11 fotos de anúncios permanecem em `/images/ads/`. O gráfico distingue investimento e resultados por barras e linha com pontos, acompanhados de legenda e alternativa em tabela.

`DateRangeFilter` recebe `value: { start, end, preset }`, `onChange` e, opcionalmente, `availableRange: { start, end }`. As datas são strings `YYYY-MM-DD`; presets são `TODAY`, `YESTERDAY`, `LAST_7` ou `CUSTOM`. `src/lib/dateRange.ts` resolve o calendário local, filtra datas inclusivamente e valida intervalos. O modal edita um rascunho; fechar/cancelar não altera a seleção. Campos `required`, `min`/`max` e validação de calendário evitam datas ausentes, impossíveis ou invertidas. KPIs e gráfico devem consumir a mesma seleção.

O símbolo próprio AB, em `public/brand/ab-adsdesk-mark.svg`, é usado por `BrandLogo` quando as iniciais são AB e como favicon. Outras iniciais e os estilos de texto/mínimo continuam disponíveis no white-label ([[personalizar-marca]]). A identidade pertence ao AB AdsDesk; não comunica vínculo oficial com Meta, Instagram ou Facebook. A revisão visual não integra insights e mantém as fontes reais e simuladas existentes.

## Pontos de quebra (padrão do Tailwind)
| Largura | O que muda |
|---|---|
| < 640 px | modal vira painel inferior, o logo mostra só o símbolo e o simulador fica só no menu |
| ≥ 640 (`sm`) | modal centralizado; muitas grades passam a 2 colunas |
| ≥ 768 (`md`) | abas voltam ao cabeçalho e a barra inferior some; listas em cartões viram tabela (auditoria, diário) |
| ≥ 1024 (`lg`) | selo de origem dos dados, texto "Simulador", grades de 3 colunas na visão geral |
| ≥ 1280 (`xl`) | "Atualizado às…"; o conteúdo para de crescer em `max-w-7xl` |

## Padrões no celular
- **Barra inferior** (`BottomNav`) com `pb-safe`. O `index.html` usa `viewport-fit=cover` para o iPhone informar a área segura. O rodapé ganha `pb-24` e o toast fica em `bottom-20`. Ver [[cabecalho-e-navegacao]].
- **Modais como painel inferior:** `max-h-[92dvh]`, corpo com rolagem própria e rodapé de botões fixo com a margem da área segura.
- **Container queries:** o `CreativePreview` é um `@container`. Abaixo de 22rem de largura (`@[22rem]:`), o botão de ação desce para baixo do título. Assim, a prévia vertical (9:16) e os cartões estreitos reservam espaço para o texto, qualquer que seja a tela.
- **Imagens dos anúncios:** `CreativePreview` usa `previewImage` com `object-cover` e enquadramento opcional, descrição no nome acessível e carregamento sob demanda. A altura padrão é 224 px (usada na [[visao-geral]]); [[anuncios]] amplia cartões e destaque para 288 px. `fit="ratio"` conserva a proporção declarada no detalhe (1:1, 4:5 ou 9:16). `compact` tem base de 64 × 64 px; [[campanhas]] amplia as miniaturas para 80 × 80 px e 96 × 96 px a partir de `sm`, além da capa de 96 px do cartão nas telas maiores. Título e botão ficam sobre uma camada escura nas prévias completas; sem imagem ou em erro, aparece `previewGradient`. As fotos do mock são ilustrativas, geradas por IA ([[anuncios]]).
- **Rolagem lateral só local e de propósito:** chips de filtro com `overflow-x-auto scrollbar-none -mx-4`, tabela da visão geral com `min-w-[28rem]` dentro de `overflow-x-auto`. A página em si nunca rola para o lado.
- Rótulos de KPI e nomes longos usam `line-clamp-2`, para não empurrar ícones para outra linha. Campos têm `text-base` no celular porque, abaixo de 16 px, o iOS dá zoom ao focar.

## Armadilha: grade sem colunas e `min-w-0`
```tsx
// Estoura no celular se o filho não tiver min-w-0:
<div className="grid gap-5 lg:grid-cols-3">
  <div><ResponsiveContainer>…gráfico…</ResponsiveContainer></div>
</div>
// Certo: coluna minmax(0, 1fr) desde a base
<div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
```
Abaixo de `lg`, essa grade não define colunas, e o navegador cria uma coluna implícita `auto`. Essa coluna não encolhe abaixo do min-content dos filhos, porque itens de grade têm `min-width: auto`. Um texto com `truncate` (`nowrap`) ocupa a largura inteira do texto. O SVG do recharts mantém a última largura que mediu e nunca "descobre" que deveria encolher, porque mede um pai que já está largo demais. A coluna cresce, e a página passa a rolar para o lado.

`grid-cols-1` gera `minmax(0, 1fr)`, que corrige isso. A outra saída é `min-w-0` no filho: o `Card` já tem, e é por isso que as grades da visão geral não estouram. Em modelos próprios, use `minmax(0,1fr)`, porque `1fr` sozinho é `minmax(auto, 1fr)` e tem o mesmo problema. Em flex vale a mesma regra: um filho com texto truncado leva `min-w-0`, como no `AccountSwitcher`.

Na revisão de 2026-09-25 a regra foi aplicada em todas as grades com colunas só a partir de um breakpoint: login, [[personalizar-marca]] (`md:grid-cols-[minmax(0,1fr)_15rem]`), [[simulador-roi]], [[modal-conectar-meta]], [[campanhas]], [[relatorio-diario]], [[auditoria-transparencia]] (`lg:grid-cols-[16rem_minmax(0,1fr)]`) e [[anuncios]] (`sm:grid-cols-[13rem_minmax(0,1fr)]`). Note que a coluna flexível também vira `minmax(0,1fr)`.

## Acessibilidade
- `Modal`: `role="dialog"` com título e descrição ligados, foco preso dentro, Esc e clique fora fecham, a rolagem do fundo trava e o foco volta a quem abriu. Quem abre um modal a partir de um menu devolve o foco ao botão do menu antes (ver `UserMenu`).
- O link "Pular para o conteúdo" aparece ao receber foco e move o foco para o `<main id="conteudo" tabIndex={-1}>` com `preventDefault`, sem trocar o hash (trocar o hash mudaria a tela; ver [[cabecalho-e-navegacao]]). O idioma é `lang="pt-BR"`. Abas usam `aria-current="page"`.
- Menus (`useDismiss`): Esc fecha e devolve o foco ao botão que abriu; clique fora só fecha, para não roubar o foco de onde o usuário clicou.
- Áreas de toque de 44 px: `buttonClass` tamanho `md` (`h-11`), `size-11`/`h-11` no cabeçalho e `h-16` na barra inferior. Exceções abaixo disso: o fechar do modal (40 px), o fechar do toast (32 px), o `SegmentedControl` (32–40 px) e o botão `sm` (36 px).
- O gráfico da [[visao-geral]] tem a alternativa "Tabela". Variações de KPI dizem "(melhora)", "(piora)" ou "(estável)" para leitor de tela. Variação que arredonda para 0% aparece em cinza, com seta para o lado.

## Checklist para uma tela nova
1. Aba nova: registrar em `TABS` (`src/lib/navigation.ts`) com rótulo curto de até ~9 letras e carregar com `lazy` no `src/App.tsx`.
2. Toda `grid` leva `grid-cols-1` na base, ou filhos com `min-w-0`. Todo filho flex com texto truncado leva `min-w-0`.
3. Tabela larga: lista de cartões abaixo de 768 px ou rolagem só dentro do cartão.
4. Nada fixo na base sem descontar a barra inferior abaixo de `md`.
5. Testar em **375, 768 e 1280 px**, como gestor e como cliente, com conta demo e conta conectada, com menus e modais abertos. Critério: `document.documentElement.scrollWidth <= innerWidth`.
6. Teclado: Tab alcança tudo, foco visível, Esc fecha e o foco volta. Ver [[refatoracao-ux-2026-09-25]].
