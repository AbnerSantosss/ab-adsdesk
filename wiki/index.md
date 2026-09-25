---
tipo: indice
atualizado: 2026-09-25
tags: [indice, mapa]
---

# AB AdsDesk — wiki

Painel white-label de anúncios da Meta. A agência (AB Software) acompanha as contas dos clientes, e o
cliente, por exemplo um estúdio de Pilates, vê em linguagem simples quanto investiu, quantos contatos
chegaram e quanto custou cada um. Stack: React 19, Vite 8, Tailwind v4 e TypeScript, com um pequeno
servidor de e-mail no Vite.

**Estado em 2026-09-25:** demonstração navegável e responsiva. Os dados de campanhas ainda são de
exemplo, e o envio por e-mail funciona localmente. Para entender o que falta para produção, comece por
[[pontos-de-melhoria]]. Para o que mudou e por quê, leia [[refatoracao-ux-2026-09-25]].

## Por onde começar

| Se você quer... | Leia |
| --- | --- |
| Entender o produto em 5 minutos | [[visao-do-produto]] → [[proposta-de-valor]] |
| Rodar o projeto | [[stack-e-execucao]] |
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
- [[modal-conectar-meta]]: conexão com uma conta real pela Graph API.
- [[simulador-roi]]: projeção de matrículas e receita a partir do investimento.

## Arquitetura
- [[stack-e-execucao]]: dependências, comandos e estrutura de pastas.
- [[estado-e-navegacao]]: estado no `App.tsx`, rotas por hash e carregamento sob demanda.
- [[perfis-e-modos-de-visao]]: gestor, cliente e "ver painel como".
- [[persistencia-localstorage]]: o que fica salvo no navegador e com qual chave.
- [[interface-e-responsividade]]: componentes base, tema da marca, celular primeiro e armadilhas de layout.

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
- Registro de mudanças da wiki: `log.md`.
