---
tipo: roadmap
atualizado: 2026-10-07
tags: [roadmap, producao, melhorias, prioridades]
---

# Pontos de melhoria e roadmap para produção

O painel reúne **demonstração navegável e importação real por token de sessão**. A integração lê
insights e criativos disponíveis, mas ainda não é um SaaS pronto: falta autenticação e armazenamento
seguro no servidor. A revisão de 2026-10-07 não conectou uma conta ao vivo com token do usuário.
Quase tudo na lista P0 depende do backend.

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
3. **Token da Meta fora do navegador.** Agora só permanece em memória/sessionStorage e vai no
   cabeçalho Authorization; o legado persistente é descartado. Falta backend com armazenamento
   seguro, OAuth quando aplicável e ciclo de renovação/revogação (ver [[meta-graph-api]], [[configuracoes]]).
4. **Importação real pronta para operação.** `/insights`, campanhas, anúncios e série diária já são
   importados, em contrato separado do mock, com paginação limitada e ações distintas sem somar aliases.
   Faltam validação ao vivo autorizada, cache/jobs no servidor, múltiplas contas e processamento de
   relatórios grandes. Conferir atribuição, período e números com o Gerenciador antes de produção;
   não converter cliques ou métricas de objetivos diferentes em contatos únicos.
5. **Marca e preferências no servidor.** Marca, conta conectada e destinatários do relatório ficam no
   localStorage **do navegador de quem configurou**. O cliente, em outro aparelho, não vê a marca da
   agência (ver [[persistencia-localstorage]], [[personalizar-marca]]).
   Sair já limpa token e conta/relatório; cliente sem conta válida já recebe estado indisponível, sem
   fallback para outra conta. Falta política de retenção para destinatários/marca e autorização no servidor.

## P1 — o produto entregar o que promete

6. **E-mail de produção.** Trocar o Gmail com senha de app por um provedor transacional com domínio da
   agência (SPF, DKIM e DMARC), para não cair no spam nem esbarrar no limite diário do Gmail. Guardar
   o histórico de envios.
7. **Relatório automático.** Hoje o envio é manual. Agendar o envio diário por WhatsApp e e-mail é o que
   tira trabalho do gestor (ver [[relatorio-diario]], [[compartilhamento-whatsapp]]).
8. **Ampliar prévia real do anúncio.** A importação já usa `image_url`/`thumbnail_url` da Meta, com
   aviso de ausência e recuperação quando a URL muda. Falta reprodução de vídeo, carrossel e formatos
   completos de prévia. As fotos geradas continuam apenas nas contas de demonstração.
9. **Ampliar testes automatizados.** `npm test` executa `tests/metaGraphApi.test.ts` com respostas
   controladas e sem credencial real. Faltam cobertura dos cálculos legados e testes de ponta a ponta
   do navegador em 375/768/1280 px. Teste controlado não comprova integração ao vivo.
10. **Moeda, fuso e idioma da conta.** O relatório real já usa moeda e fuso da conta no intervalo e na
    formatação; a interface continua pt-BR. Revisar fluxos legados e internacionalização antes de ampliá-los.
11. **Resultado com unidade por objetivo.** O relatório real já separa conversas, cadastros, compras e
    cliques; falta revisar a mistura ainda presente no modelo de demonstração e no simulador legado.
    Não aplicar automaticamente a fórmula de resultado do mock a `MetaReportSnapshot`.
12. **Prévia "Ver painel como" fiel.** Esconder o seletor de contas e os itens de gestor durante a prévia
    ([[perfis-e-modos-de-visao]]).

## P2 — polimento

13. **Tamanho da Visão geral.** O chunk da tela tem ~386 kB (~111 kB gzip) por causa do recharts.
    Carregar o gráfico só quando ele aparece, ou usar uma biblioteca menor, acelera a primeira abertura
    no 4G. A alternativa em tabela já existe.
14. **Primeira abertura dos modais em dev.** No `npm run dev`, o Vite transforma cada modal na primeira
    abertura, o que parecia "não abrir". O pré-carregamento 2 s após o login resolveu. Em produção os
    chunks são pequenos; vale só não remover esse pré-carregamento.
15. **Chave legada.** A conexão ainda usa `clareza_meta_api_config` em sessão. Uma renomeação futura
    deve remover credenciais persistentes antigas sem lê-las nem migrá-las de volta ao localStorage.
16. **Atalho na tela inicial (PWA).** O cliente abre o painel pelo celular; um manifesto e um ícone
    deixam o painel com cara de aplicativo.

17. **Validar o que vem do storage.** Ler com um esquema (zod ou checagem manual) e descartar o que não
    bate, em vez de confiar no `JSON.parse` ([[persistencia-localstorage]]).
18. **CSP e cabeçalhos de segurança** (feito na imagem Docker em `deploy/security-headers.conf`, ver [[deploy-vps-portainer]]; falta no `npm run dev`) no servidor que publicar o `dist/` (Content-Security-Policy
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
