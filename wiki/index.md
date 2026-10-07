---
tipo: indice
atualizado: 2026-10-07
tags: [indice, mapa]
---

# AB AdsDesk — wiki

Painel white-label de anúncios da Meta. A agência (AB Software) acompanha as contas dos clientes, e o
cliente, por exemplo um estúdio de Pilates, vê em linguagem simples quanto investiu, quantos contatos
chegaram e quanto custou cada um. Stack: React 19, Vite 8, Tailwind v4 e TypeScript, com um pequeno
servidor de e-mail no Vite.

**Estado em 2026-10-07:** contas de demonstração e importação real da Meta por token de sessão,
com Configurações, insights e criativos disponíveis. Ainda não é um SaaS pronto: faltam backend Meta,
OAuth e autenticação de produção. Não houve conexão ao vivo com credencial do usuário nesta revisão.
O envio por e-mail existente é local e separado do novo relatório real. Veja [[configuracoes]],
[[o-que-e-simulado]] e [[pontos-de-melhoria]].

## Por onde começar

| Se você quer... | Leia |
| --- | --- |
| Entender o produto em 5 minutos | [[visao-do-produto]] → [[proposta-de-valor]] |
| Rodar o projeto | [[stack-e-execucao]] |
| Publicar na VPS (continuar o deploy) | [[deploy-vps-portainer]] |
| Mexer numa tela | a página da tela + [[interface-e-responsividade]] |
| Saber o que é real e o que é simulado | [[o-que-e-simulado]] |
| Configurar o e-mail | [[envio-de-email-smtp]] |
| Planejar a próxima etapa | [[pontos-de-melhoria]] |

## Produto
- [[visao-do-produto]]: problema, público e o que o painel entrega.
- [[proposta-de-valor]]: por que a agência paga e por que o cliente usa.
- [[personas]]: gestor de tráfego, dona do estúdio e recepção.
- [[glossario-sem-jargao]]: como cada métrica aparece para o cliente leigo.

## Negócio
- [[modelo-saas-white-label]]: marca da agência, planos e o que é personalizável.
- [[nicho-pilates-e-generalizacao]]: por que começar pelo Pilates e como abrir para outros nichos.
- [[profissional-vs-turbinar]]: campanha estruturada × botão Turbinar, o argumento central.

## Telas
- [[tela-login]]: formulário de demonstração e um botão de entrada rápida (gestor).
- [[cabecalho-e-navegacao]]: cabeçalho, seletor de conta, menu do usuário, barra inferior e rotas.
- [[visao-geral]]: KPIs do período, gráfico, resultados por objetivo e anúncio destaque.
- [[campanhas]]: lista filtrável com detalhes de conjuntos e anúncios.
- [[anuncios]]: anúncios ranqueados por custo, com prévia e detalhe.
- [[relatorio-diario]]: resumo do dia, envio por WhatsApp ou e-mail e impressão.
- [[auditoria-transparencia]]: saúde da conta e campanhas profissionais × turbinadas.
- [[personalizar-marca]]: modal white-label (nome, logotipo, cor).
- [[configuracoes]]: passo a passo de conexão Meta, importação real por token e ajuda para o gestor.
- [[modal-conectar-meta]]: histórico do modal, agora substituído pela aba Configurações.
- [[simulador-roi]]: projeção de matrículas e receita a partir do investimento.

## Arquitetura
- [[stack-e-execucao]]: dependências, comandos e estrutura de pastas.
- [[estado-e-navegacao]]: estado no `App.tsx`, rotas por hash e carregamento sob demanda.
- [[perfis-e-modos-de-visao]]: gestor, cliente e "ver painel como".
- [[persistencia-localstorage]]: o que fica salvo no navegador e com qual chave.
- [[interface-e-responsividade]]: componentes base, tema da marca, celular primeiro e armadilhas de layout.
- [[cores-e-hierarquia-visual]]: pesquisa de UX sobre cores, contraste, agrupamento e paleta neutra aplicada ao painel.
- [[deploy-vps-portainer]]: Docker/nginx, GHCR, Portainer e Cloudflare. Publicação no GitHub e etapas separadas para a VPS.

## Dados
- [[modelo-de-dados]]: tipos de conta, campanha, anúncio e dia.
- [[dados-mock]]: as contas de demonstração e o que cada uma exercita.
- [[metricas-e-calculos]]: como cada número é calculado.

## Integrações
- [[meta-graph-api]]: o que já é lido da Meta e o que falta.
- [[envio-de-email-smtp]]: relatório por e-mail, configuração e proteções.
- [[compartilhamento-whatsapp]]: texto do relatório e link do WhatsApp.
- [[gemini-ai-studio]]: origem no AI Studio (dependência removida).

## Riscos
- [[o-que-e-simulado]]: inventário do que ainda é demonstração.
- [[bugs-conhecidos]]: bugs em aberto.
- [[seguranca]]: token, credenciais, autenticação e o que muda com um backend.
- [[inconsistencias-de-marca]]: nomes antigos que ainda aparecem.

## Planejamento e histórico
- [[pontos-de-melhoria]]: roadmap para produção por prioridade.
- [[refatoracao-ux-2026-09-25]]: decisões da refatoração de UX e responsividade.
- [[log]]: registro de mudanças e validações da wiki.

## Navegação no GitHub

[[README]] reúne links Markdown para todas as páginas desta wiki. No Obsidian, use as conexões deste índice e os assuntos relacionados em cada página.
