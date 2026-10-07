---
tipo: tela
atualizado: 2026-10-07
tags: [tela, modal, meta-api, conexao, token, configuracoes]
---

# Conectar conta da Meta: migração do modal

**A entrada principal agora é a aba [[configuracoes]], em `#configuracoes`.** O menu do usuário, o seletor de contas e os avisos de conta real encaminham o gestor para essa aba. O `App.tsx` não abre mais o antigo modal de conexão.

O arquivo `src/components/modals/MetaConnectModal.tsx` permanece como invólucro de compatibilidade de `MetaConnectionPanel`. O fluxo e a orientação vigentes estão em [[configuracoes]]; não manter um segundo tutorial de token neste arquivo.

## Responsabilidades dos componentes

| Arquivo | Papel |
| --- | --- |
| `src/components/screens/Settings.tsx` | Passo a passo, atalhos oficiais, ajuda e identidade do painel |
| `src/components/ui/MetaConnectionPanel.tsx` | Campos de ID/token, mostrar/ocultar, progresso, erro e desconexão |
| `src/services/metaGraphApi.ts` | Consulta somente leitura, paginação e armazenamento temporário das credenciais |
| `src/components/screens/MetaReports.tsx` | Exibição dos snapshots reais, independente das telas mock |
| `src/components/modals/MetaConnectModal.tsx` | Compatibilidade; reutiliza o painel de conexão sem duplicar sua lógica |

## Mudanças de comportamento

A conexão passou de metadados básicos para importação de conta, insights, campanhas, anúncios e imagens disponíveis, começando pelos últimos 30 dias. Sucesso depende da conclusão de todas as consultas; falha não substitui a conta por um relatório parcial.

O token vai no cabeçalho `Authorization`, não na URL. É mantido em memória e `sessionStorage`; a opção de credencial persistente foi removida. Sair ou desconectar limpa a credencial e o snapshot. A cópia antiga de token no `localStorage` é descartada sem leitura. Detalhes e limitações em [[meta-graph-api]].

A orientação antiga “token que não expira” foi substituída por conferir validade e possibilidade de revogação. A disponibilidade de token de sistema sem vencimento depende das regras aplicáveis ao negócio; o produto não renova tokens automaticamente.

Contas reais antigas sem `apiReport` precisam importar novamente. Não recebem os números do mock, nota automática de auditoria ou fotos geradas como se fossem criativos da conta.

## Limite da validação

A implementação foi preparada para uma credencial autorizada, mas não houve conexão ao vivo com token do usuário na revisão de 2026-10-07. Testes sem token real verificam o contrato e o tratamento das respostas; não comprovam permissões ou números de produção.