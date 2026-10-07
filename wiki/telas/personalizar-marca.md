---
tipo: tela
atualizado: 2026-10-07
tags: [tela, modal, white-label, marca, branding, tema]
---

# Modal: Personalizar marca (white-label)

**Arquivos:** `src/components/modals/BrandSettingsModal.tsx` (formulário), `src/components/ui/BrandLogo.tsx` (logotipo) e `src/index.css` (paletas por `data-brand`). O modal abre pelo item "Personalizar marca" do menu do usuário, só para o gestor ([[cabecalho-e-navegacao]]), e o título da janela é "Marca do painel".

Mudou em 2026-09-25: o selo "Agência PRO" saiu. A cor, o estilo do logotipo e o WhatsApp de atendimento passaram a ter efeito de verdade.

## Campos e onde aparecem
| Campo (`BrandConfig`) | Onde aparece |
|---|---|
| `appName`, "Nome do painel" (obrigatório) | logo do cabeçalho, rodapé, [[tela-login]], título da guia do navegador |
| `parentBrand`, "Nome da agência" (obrigatório) | embaixo do nome no logo, "Desenvolvido por", "Falar com…" do cliente, remetente do relatório no WhatsApp e no e-mail ([[relatorio-diario]], [[envio-de-email-smtp]]) |
| `tagline`, "Frase de apresentação" | tela de login |
| `logoType` + `customLogoText` | estilo do `BrandLogo` (ver abaixo) |
| `primaryColor` | tudo que usa `brand-*`: botão principal, aba ativa, contorno de foco, seleção de texto |
| `supportWhatsapp` | links de WhatsApp do login e "Falar com {agência}" no rodapé do cliente |
| `clientCustomDomain` | só o botão "Copiar" do próprio modal |
| `showPoweredBy` | "Desenvolvido por" no rodapé e no login |

## Logotipo (`BrandLogo`)
- **Símbolo + nome** (`ICON_AB`): as iniciais AB usam o símbolo próprio em `public/brand/ab-adsdesk-mark.svg`, também usado como favicon. Outras iniciais aparecem em um quadrado na cor da marca, seguido do nome do painel e da agência. As iniciais saem de `brandInitials`: "AB Software" vira "AB" e "Studio Leve" vira "SL". O símbolo é da AB AdsDesk, sem representar marca oficial da Meta.
- **Só texto** (`CUSTOM_TEXT`): o texto com um ponto final na cor da marca.
- **Mínimo** (`MINIMAL`): uma bolinha colorida e o nome do painel.

## Como a cor funciona
As classes `bg-brand-600`, `text-brand-700` etc. apontam para as variáveis `--brand-50…950`, pelo `@theme inline` de `src/index.css`. Cada cor (`social`, `emerald`, `indigo`, `blue`, `violet`, `slate`) redefine essas variáveis num seletor `[data-brand="…"]`. O `App` grava `data-brand` no `<html>`. `social` é o padrão para uma configuração nova, com identidade de anúncios no Instagram/Facebook; configurações válidas já salvas permanecem iguais.

Os fundos dos assuntos são neutros: branco gelo no fundo geral, branco nos cards e camadas claras nos blocos internos. A cor primária atua em ações, foco e seleção, sem transformar cada assunto em uma nova família de cor. Chips de plataforma também são neutros; nomes e ícones identificam Instagram e Facebook. O símbolo AB conserva sua identidade colorida em uma área pequena. Ver [[interface-e-responsividade]] e [[cores-e-hierarquia-visual]].

O modal usa o mesmo atributo em cada amostra de cor e na pré-visualização. Assim elas aparecem na cor escolhida sem mudar o resto da tela antes de salvar. Os tons do grafite foram escurecidos para o botão principal não parecer apagado. Ver [[interface-e-responsividade]].

## Comportamento do formulário
- As edições ficam num rascunho. Como o modal só é montado quando abre, **Cancelar descarta tudo**. Acabou o bug antigo em que as edições voltavam ao reabrir.
- "Restaurar padrão" só volta o rascunho para AB AdsDesk. Para valer, é preciso salvar.
- Ao salvar, o código tira espaços das pontas, deixa só dígitos no WhatsApp e remove o `https://` do link. A marca vai para `ab_adsdesk_brand_config` ([[persistencia-localstorage]]) e aparece o aviso "Marca atualizada.". Se a cor salva não for válida, o painel volta para o padrão `social` ao carregar.
- A partir de 768 px, a pré-visualização fica ao lado do formulário. No celular, fica embaixo.

## Armadilhas
> [!warning] O white-label só funciona no navegador de quem configurou
> A marca fica no localStorage do gestor. A cliente, em outro aparelho, vê "AB AdsDesk" no tema padrão `social`, inclusive na tela de login. O ícone da aba (SVG próprio AB), o `<title>` inicial e as tags de compartilhamento do `index.html` também são fixos.

- O "link do painel do cliente" (`app.absoftware.io/cliente/raropilates`) **não existe**: não há rota, servidor nem domínio. É só texto copiado.
- Um WhatsApp inválido deixa a dica vermelha, mas **não impede salvar**. Aí o "Falar com…" leva para um número errado.
- No estilo "Só texto", o `BrandLogo` ignora `showName={false}`. Então, no celular, o cabeçalho mostra o texto inteiro (até 30 caracteres) no lugar do símbolo, e esse bloco não encolhe.
- É uma marca por navegador, não por cliente. Faz sentido, porque a marca é da agência ([[modelo-saas-white-label]]).

## O que falta para produção
- `BrandConfig` guardado no servidor por agência (tenant) e carregado antes do login.
- Envio de logo personalizado (hoje existe o SVG próprio AB, além de iniciais ou texto).
- Subdomínio ou domínio próprio para cada agência e um link por cliente, com convite e autenticação.

Ver [[pontos-de-melhoria]].
