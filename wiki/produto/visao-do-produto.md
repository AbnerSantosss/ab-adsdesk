---
tipo: visao
atualizado: 2026-10-07
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
| [[configuracoes]] (gestor) | `#configuracoes` | "Como conectar a conta e importar os relatórios?" |

Cada tela tem endereço próprio: dá para mandar o link de uma tela específica e o botão voltar do navegador funciona ([[estado-e-navegacao]]). No celular, as telas ficam numa barra fixa embaixo e as janelas abrem como painel que sobe da borda inferior ([[interface-e-responsividade]], [[cabecalho-e-navegacao]]).

Extras:
- **Relatório demonstrativo pronto para enviar:** no fluxo do mock, o gestor abre no WhatsApp, copia o texto ou manda por e-mail. O relatório real importado oferece impressão/PDF; os canais de envio ainda não consomem esse contrato ([[compartilhamento-whatsapp]], [[envio-de-email-smtp]]).
- [[simulador-roi]] ("vale a pena investir mais?").
- [[personalizar-marca]]: o gestor coloca a própria marca no painel.

## Estado atual (outubro de 2026)
> [!warning] Integração local implementada; ainda não é um SaaS de produção.
> - React + Vite com demonstrações de **Raro Pilates** e **Clínica Harmonize** e fotos ilustrativas locais ([[stack-e-execucao]], [[dados-mock]]).
> - Configurações orienta o gestor e importa pela Marketing API totais, série diária, campanhas, anúncios e criativos autorizados. Os relatórios reais usam `MetaReports`, sem preencher ausências com mock ([[meta-graph-api]]).
> - O token fica somente na sessão do navegador. Há uma conta real por navegador, sem OAuth, backend Meta, sincronização entre dispositivos ou autenticação de produção ([[seguranca]]).
> - Não houve validação ao vivo com uma credencial do usuário nesta revisão. Implementação e testes controlados não comprovam acesso à conta nem igualdade com o Gerenciador.
> - Atualizar refaz a leitura do período real; falha preserva o snapshot anterior. Pixel, WhatsApp, origem Turbinar e nota de saúde não são verificados pela importação atual.
> - E-mail continua dependente do servidor local e do contrato demonstrativo; a imagem estática não inclui SMTP. O relatório real pode ser impresso.
> - A interface usa branco gelo, cartões neutros, indicadores uniformes e cabeçalho compacto com calendário. A decisão e suas fontes estão em [[cores-e-hierarquia-visual]].
> - Inventário completo em [[o-que-e-simulado]]; caminho até produção em [[pontos-de-melhoria]]; histórico em [[log]].

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
