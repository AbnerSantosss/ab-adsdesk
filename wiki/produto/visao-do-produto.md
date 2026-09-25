---
tipo: visao
atualizado: 2026-09-25
tags: [produto, visao, saas, meta-ads, transparencia]
---

# Visão do produto

## Em uma frase
O **AB AdsDesk** é um **painel de transparência de Meta Ads** (Facebook + Instagram). Com ele, o **dono de negócio leigo** acompanha o trabalho do gestor de tráfego **sem precisar perguntar "e aí, como estão as campanhas?"** toda hora, e o gestor mostra resultado sem montar relatório à mão.

## O problema que resolve
- O dono do negócio paga um gestor de tráfego e não sabe se o dinheiro está sendo bem gasto.
- Ele não entende o Gerenciador de Anúncios da Meta (CPM, CTR, conjunto, pixel…).
- O maior receio é de que o gestor esteja só **"turbinando post"** em vez de fazer tráfego profissional. Esse medo nasceu de um áudio de cliente; a citação já saiu do código, mas continua sendo a origem do produto. O conceito está em [[profissional-vs-turbinar]] e a tela, em [[auditoria-transparencia]].
- Resultado: o cliente fica perguntando status por WhatsApp e o gestor perde tempo respondendo.

## Como o app responde
Cada pergunta típica do cliente tem uma tela que responde sozinha. O mapa completo está em [[proposta-de-valor]].

| Tela (rótulo no celular) | Link direto | Pergunta que ela responde |
|---|---|---|
| [[visao-geral]] (Início) | `#visao-geral` | "Está dando resultado? Quanto custa cada contato?" |
| [[campanhas]] | `#campanhas` | "O que está no ar agora e para onde o anúncio leva?" |
| [[anuncios]] | `#anuncios` | "Qual anúncio está funcionando melhor?" |
| [[relatorio-diario]] (Diário) | `#diario` | "Quanto foi gasto ontem e quantas pessoas chamaram?" |
| [[auditoria-transparencia]] | `#auditoria` | "Você está fazendo tráfego de verdade ou só turbinando?" |

Cada tela tem endereço próprio: dá para mandar o link de uma tela específica e o botão voltar do navegador funciona ([[estado-e-navegacao]]). No celular, as telas ficam numa barra fixa embaixo e as janelas abrem como painel que sobe da borda inferior ([[interface-e-responsividade]], [[cabecalho-e-navegacao]]).

Extras:
- **Relatório do dia pronto para enviar:** o gestor abre no WhatsApp, copia o texto ou manda por e-mail ([[compartilhamento-whatsapp]], [[envio-de-email-smtp]]).
- [[simulador-roi]] ("vale a pena investir mais?").
- [[personalizar-marca]]: o gestor coloca a própria marca no painel.

## Estado atual (setembro de 2026)
> [!warning] É um protótipo de demonstração, não um produto pronto para vender.
> - Front-end React + Vite. Nasceu de um export do Google AI Studio, mas a dependência do Gemini já foi removida ([[stack-e-execucao]]).
> - Campanhas, anúncios e histórico diário vêm dos dados de demonstração da conta **Raro Pilates** ([[dados-mock]]).
> - A conexão com a Meta é real, mas lê só o **resumo da conta** (nome, situação, moeda, total gasto) pela Graph API v23.0, sem `/insights`. Numa conta conectada, as telas de campanhas e o histórico ficam vazios, com aviso ([[meta-graph-api]]).
> - Login só com perfis de demonstração; não há contas de usuário nem backend de dados.
> - O botão **Atualizar** só aparece na conta conectada e relê o resumo de verdade. Não existe mais sincronização fingida nem botão de pausar campanha.
> - O envio por e-mail só funciona com o servidor local rodando (`npm run dev` ou `npm run preview`); a versão estática publicada não envia.
> - Inventário completo em [[o-que-e-simulado]]; caminho até vender em [[pontos-de-melhoria]]. Última rodada de mudanças: [[refatoracao-ux-2026-09-25]].

## Decisão em aberto: quem é o comprador?
O pedido do dono do projeto fala em vender "para pessoas leigas". O código, porém, foi desenhado para **vender ao gestor ou agência**, que repassa ao cliente (modelo B2B2C/white-label):
- modal "Marca do painel" com nome, cor, logotipo e WhatsApp da agência;
- "Link do painel do cliente", com botão de copiar (o link padrão é ilustrativo);
- rodapé "Desenvolvido por" com interruptor para esconder;
- relatório diário assinado pela agência, que também aparece como remetente do e-mail.

As duas opções mudam o preço, o onboarding e quem conecta a conta da Meta. Detalhes em [[modelo-saas-white-label]] e [[personas]].

## Nomes do produto
Hoje a interface usa **AB AdsDesk** (produto) e **AB Software** (agência padrão, o `parentBrand`), além do cliente demo Raro Pilates. "Clareza Ads" sumiu da interface; sobra só no nome da chave onde o token da Meta é guardado. Veja [[inconsistencias-de-marca]].

## Relacionados
[[personas]] · [[proposta-de-valor]] · [[glossario-sem-jargao]] · [[nicho-pilates-e-generalizacao]]
