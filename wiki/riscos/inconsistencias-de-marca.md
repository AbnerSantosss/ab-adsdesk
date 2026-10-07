---
tipo: risco
atualizado: 2026-10-07
tags: [riscos, marca, branding, consistencia, textos]
---

# Inconsistências de marca

Antes da refatoração de 2026-09-25, o código misturava três nomes de produto (Clareza Ads, AB AdsDesk, AB Software) e dois clientes demo (Raro Pilates e um resto de "VivaBem"). Isso foi arrumado: hoje cada nome tem um papel, e o que sobrou de errado é pequeno. Para um produto que se vende como transparente, nome trocado passa amadorismo, então vale manter esta página em dia.

## Quem é quem hoje
| Nome | Papel | Onde aparece |
|---|---|---|
| **AB AdsDesk** | Produto (nome padrão) | `defaultBrandConfig.appName` em `src/types/auth.ts`, `<title>` e `og:title` do `index.html`, `metadata.json`, `package.json`, chaves `ab_adsdesk_*`, `EMAIL_FROM_NAME` padrão |
| **AB Software** | Agência dona do painel (`parentBrand`) | "Desenvolvido por" no rodapé, assinatura da mensagem do relatório, nome do remetente do e-mail, e-mail do gestor demo, domínio de exemplo `app.absoftware.io` |
| **Raro Pilates** | Cliente demo principal | Conta `act_raro_pilates`, ícone `RaroPilatesIcon` (via `logoKey`), e-mail da cliente demo ([[dados-mock]]) |
| **Clínica Harmonize** | Segunda conta demo | `src/data/mockData.ts` |
| **Clareza** | Nome antigo | Só na chave `clareza_meta_api_config` (`src/lib/storage.ts`) |

`BrandLogo` calcula as iniciais de `customLogoText` (ou `appName`); quando são AB, usa o monograma exclusivo `public/brand/ab-adsdesk-mark.svg`, também adotado como favicon. Outras iniciais, texto personalizado e estilo mínimo continuam disponíveis. A mensagem do relatório assina com `parentBrand`. A base branco gelo e os cartões neutros seguem [[cores-e-hierarquia-visual]], sem eliminar as opções de [[personalizar-marca]].

## O que ainda está inconsistente
- **Chave `clareza_meta_api_config`.** O usuário não vê, mas o nome legado permanece. O token hoje fica somente em memória/sessionStorage. A cópia antiga de localStorage é removida **sem leitura nem migração de credenciais**. Uma renomeação deve manter essa limpeza e jamais reintroduzir token persistente; ver [[persistencia-localstorage]] e [[configuracoes]].
- **Dois nomes para o mesmo remetente de e-mail.** O painel manda o `parentBrand` ("AB Software") como nome do remetente; o `EMAIL_FROM_NAME` padrão é "AB AdsDesk" e só aparece quando o nome não vem ([[envio-de-email-smtp]]). Num produto white-label, o padrão deveria ser o nome da agência.
- **A marca personalizada não chega ao cliente.** Ela fica no `localStorage` do navegador de quem a salvou. Em outro aparelho, o cliente vê "AB AdsDesk" e o WhatsApp de suporte fictício (`5511999999999`) nos links da [[tela-login]] e do rodapé ([[compartilhamento-whatsapp]]).
- **`public/raro-pilates-logo.svg` sobrou** sem uso ([[bugs-conhecidos]]).

## Decisão pendente
**Qual é o nome do produto?** O código adotou "AB AdsDesk" como padrão. "Clareza Ads" comunicava melhor a proposta de transparência para o leigo; "AB AdsDesk" soa como ferramenta de agência. Num white-label o cliente vê a marca da agência, então o nome do produto pesa mais na venda para agências do que no painel. A escolha se liga ao modelo em [[modelo-saas-white-label]].

## Como manter consistente
1. Um nome novo muda em três lugares: `defaultBrandConfig` (`src/types/auth.ts`), `index.html` e `metadata.json`. O resto lê da marca.
2. Todo texto voltado ao cliente usa a `BrandConfig`, nunca um nome escrito no código.
3. Quando existir backend, a marca vem dele, por agência, e vale em qualquer aparelho ([[pontos-de-melhoria]]).
4. Chaves de storage novas seguem o prefixo `ab_adsdesk_`.
