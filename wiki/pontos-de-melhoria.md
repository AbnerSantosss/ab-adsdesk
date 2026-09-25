---
tipo: roadmap
atualizado: 2026-09-25
tags: [roadmap, producao, melhorias, prioridades]
---

# Pontos de melhoria e roadmap para produção

O painel está pronto como **demonstração navegável**: telas revisadas, responsivo em 375/768/1280 px,
sem erros no console, e o envio do relatório por e-mail já funciona localmente. O que o separa de um
produto que a agência pode entregar a clientes é, principalmente, **ter um servidor**. Quase tudo na
lista P0 depende disso.

Ordem sugerida: P0 bloqueia a entrega a clientes reais. P1 é o que faz o produto valer o que promete.
P2 é polimento.

## P0 — antes de qualquer cliente real

1. **Backend próprio.** Hoje não há servidor em produção. O `dist/` é estático e a rota de e-mail só
   existe no `npm run dev`/`preview` (ver [[envio-de-email-smtp]]). Um backend pequeno (Node ou funções
   serverless) passa a guardar o token da Meta, as credenciais SMTP e os dados de cada agência. É a base
   dos itens 2 a 5.
2. **Autenticação de verdade.** O login aceita qualquer senha para os e-mails de demonstração
   (`src/components/screens/LoginScreen.tsx`), e o perfil fica no localStorage. O cliente precisa estar
   preso à própria conta **no servidor**, não só na interface (ver [[perfis-e-modos-de-visao]], [[seguranca]]).
3. **Token da Meta fora do navegador.** Hoje ele fica em sessionStorage, ou em localStorage se
   "Lembrar neste navegador" for marcado. O certo é um token de usuário do sistema (System User) do
   Business Manager, guardado no servidor e renovado lá (ver [[meta-graph-api]], [[modal-conectar-meta]]).
4. **Dados reais via `/insights`.** A conexão só lê os dados da conta; campanhas, anúncios e a série
   diária ainda vêm de `src/data/mockData.ts`. Falta mapear `actions` para "resultado" por objetivo,
   no mesmo critério de [[metricas-e-calculos]], e guardar em cache para respeitar o limite de chamadas
   da Meta (ver [[o-que-e-simulado]], [[dados-mock]]).
5. **Marca e preferências no servidor.** Marca, conta conectada e destinatários do relatório ficam no
   localStorage **do navegador de quem configurou**. O cliente, em outro aparelho, não vê a marca da
   agência (ver [[persistencia-localstorage]], [[personalizar-marca]]).
   Junto com isso: **sair precisa limpar** token, conta conectada e destinatários, e o cliente sem conta
   válida deve ver um erro, não `accounts[0]` ([[bugs-conhecidos]]).

## P1 — o produto entregar o que promete

6. **E-mail de produção.** Trocar o Gmail com senha de app por um provedor transacional com domínio da
   agência (SPF, DKIM e DMARC), para não cair no spam nem esbarrar no limite diário do Gmail. Guardar
   o histórico de envios.
7. **Relatório automático.** Hoje o envio é manual. Agendar o envio diário por WhatsApp e e-mail é o que
   tira trabalho do gestor (ver [[relatorio-diario]], [[compartilhamento-whatsapp]]).
8. **Prévia real do anúncio.** `CreativePreview` é uma ilustração com gradiente. A imagem real vem da API
   de criativos (`thumbnail_url`, `image_url`), com a mesma permissão `ads_read` (ver [[anuncios]]).
9. **Testes automatizados.** Não há nenhum. Começar por unidade em `src/lib/metrics.ts`, `format.ts` e
   `objectives.ts`, onde um erro muda o número que o cliente vê. Depois, um teste de ponta a ponta
   (Playwright) que abre as 5 telas em 375/768/1280 px e falha se houver rolagem horizontal, porque essa
   checagem hoje é manual (ver [[interface-e-responsividade]]).
10. **Moeda, fuso e idioma da conta.** A formatação assume BRL e pt-BR. A Meta devolve `currency` e
    `timezone` da conta; eles deveriam valer em todas as telas.
11. **Resultado com unidade por objetivo.** Hoje conversa, cadastro e clique somam no mesmo "resultado",
    e o CPA da conta e o [[simulador-roi]] herdam a mistura. Separar por objetivo antes de ligar a API
    real ([[metricas-e-calculos]]).
12. **Prévia "Ver painel como" fiel.** Esconder o seletor de contas e os itens de gestor durante a prévia
    ([[perfis-e-modos-de-visao]]).

## P2 — polimento

13. **Tamanho da Visão geral.** O chunk da tela tem ~386 kB (~111 kB gzip) por causa do recharts.
    Carregar o gráfico só quando ele aparece, ou usar uma biblioteca menor, acelera a primeira abertura
    no 4G. A alternativa em tabela já existe.
14. **Primeira abertura dos modais em dev.** No `npm run dev`, o Vite transforma cada modal na primeira
    abertura, o que parecia "não abrir". O pré-carregamento 2 s após o login resolveu. Em produção os
    chunks são pequenos; vale só não remover esse pré-carregamento.
15. **Chave legada.** A conexão da Meta ainda usa a chave `clareza_meta_api_config`, do nome antigo do
    produto. Migrar com leitura da chave antiga (ver [[inconsistencias-de-marca]]).
16. **Atalho na tela inicial (PWA).** O cliente abre o painel pelo celular; um manifesto e um ícone
    deixam o painel com cara de aplicativo.

17. **Validar o que vem do storage.** Ler com um esquema (zod ou checagem manual) e descartar o que não
    bate, em vez de confiar no `JSON.parse` ([[persistencia-localstorage]]).
18. **CSP e cabeçalhos de segurança** no servidor que publicar o `dist/` (Content-Security-Policy
    restrita a `graph.facebook.com`, `X-Frame-Options`, `Referrer-Policy`) ([[seguranca]]).
19. **Alvos de toque de 44 px** no `SegmentedControl` pequeno, no botão `sm` e no fechar do aviso; setas
    no seletor de cor ([[interface-e-responsividade]]).

## Decisões deliberadas (não são pendências)

- **Só leitura (`ads_read`).** O painel não pede `ads_management`. Pausar ou editar campanhas pelo painel
  mudaria a promessa de transparência e a revisão do app pela Meta. Se um dia for necessário, deve ser
  um recurso só do gestor, com registro de quem fez o quê.
- **Sem IA por enquanto.** A dependência do Gemini saiu porque nenhum recurso a usava (ver [[gemini-ai-studio]]).
  Um resumo em linguagem natural do dia pode voltar, mas só depois de haver dados reais.

Relacionado: [[refatoracao-ux-2026-09-25]], [[bugs-conhecidos]], [[index]].
