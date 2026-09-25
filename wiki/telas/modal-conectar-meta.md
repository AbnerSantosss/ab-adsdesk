---
tipo: tela
atualizado: 2026-09-25
tags: [tela, modal, meta-api, conexao, token]
---

# Modal: Conectar conta da Meta

**Arquivos:** `src/components/modals/MetaConnectModal.tsx` (tela), `src/services/metaGraphApi.ts` (consulta e credenciais) e `src/components/screens/ApiAccountNotice.tsx` (o que as telas mostram depois). Só o gestor chega aqui, por três caminhos: o menu do usuário, o fim da lista de contas na [[cabecalho-e-navegacao]] e o botão "Gerenciar conexão" na [[visao-geral]] de uma conta conectada.

## Fluxo
1. O gestor informa o **ID da conta de anúncios** e cola o **token de acesso**. O ID pode ser `act_123…` ou só os números; `normalizeAccountId` exige 5 dígitos ou mais. O token fica num campo de senha com botão para mostrar ou ocultar.
2. "Testar e conectar" faz um `GET` direto do navegador para `graph.facebook.com/v23.0/act_…`. Pede os campos `name`, `business_name`, `account_status`, `currency`, `amount_spent` e `timezone_name`. Basta a permissão `ads_read`, e nada é alterado na conta. Se o modal fechar no meio, a consulta é cancelada (`AbortController`).
3. No sucesso, o token é salvo (ver abaixo) e `buildConnectedAccount` monta a conta. O `App` põe essa conta no topo da lista, seleciona e mostra o aviso "Conta X conectada.".
4. Se já existe uma conta conectada, o topo do modal mostra nome, situação, ID, horário da leitura e o botão **Desconectar**.
5. A seção "Como gerar um token que não expira" ensina o caminho do **usuário do sistema** no Business Manager. O token do Graph API Explorer também serve, mas expira em poucas horas.
6. No fim do modal há atalhos para as contas de demonstração.

## O que a conexão traz e o que não traz
| Campo da Meta | Uso no painel |
|---|---|
| `name`, `business_name` | nome da conta e do negócio |
| `account_status` | selo "Ativa", "Pagamento pendente", "Desativada"… (`ACCOUNT_STATUS`) |
| `amount_spent` | "Gasto desde a criação". A Meta manda em centavos e o código converte conforme a moeda |
| `currency`, `timezone_name` | formatação dos valores e o quadro "Fuso e moeda" |

**A conexão ainda não lê `/insights`.** A conta conectada começa com `campaigns: []` e `dailyHistory: []`. Por isso as cinco telas mostram o `ApiAccountNotice`: um quadro "Dados lidos da Meta" e o aviso "Ainda não importamos as campanhas / os anúncios / o histórico diário…". Ver [[meta-graph-api]] e [[o-que-e-simulado]].

Mudou em 2026-09-25: antes, a conta "real" mostrava o nome do cliente com números copiados da conta mock que estava aberta. Isso acabou.

## Onde o token fica
- **Por padrão, no sessionStorage:** some quando a aba é fechada.
- **No localStorage, só com "Lembrar neste navegador" marcado.** O próprio texto do modal recomenda marcar só em computador de uso pessoal.
- A chave é `clareza_meta_api_config` ([[persistencia-localstorage]]). A conta conectada, sem o token, fica em `ab_adsdesk_connected_account` no localStorage. Por isso ela continua na lista depois que o token some. Nesse caso, o botão atualizar do cabeçalho avisa "A sessão da Meta expirou" e reabre este modal.

## Erros em linguagem leiga
`describeGraphError` troca o código de erro da Graph API por uma frase simples:
- 190: token inválido ou expirado;
- 100: conta não encontrada;
- 10 e 200–299: permissão insuficiente;
- 4, 17, 32 e 613: limite de consultas.

Quando a Meta não responde, o aviso lembra que bloqueadores de anúncio costumam barrar `graph.facebook.com`. Antes de consultar, o código já recusa token vazio e ID inválido.

## Armadilhas
- **Só cabe uma conta real por vez.** "Conectar outra conta" substitui a anterior, e uma agência com vários clientes não cabe nesse modelo ([[pontos-de-melhoria]]).
- **Token no navegador só serve para o protótipo.** Ele vai na URL da consulta (`access_token=`) e qualquer script da página consegue ler. Em produção, o caminho é Login com Facebook (OAuth) ou um token de usuário do sistema guardado no servidor ([[seguranca]]).
- **"Lembrar neste navegador" começa marcado se já houver token no localStorage** (`readJSON(STORAGE_KEYS.metaApi) !== null`). Desmarcar e reconectar move o token para a sessão; ele some ao fechar a aba.
- **Cliente leigo não deve colar token nem ver esta tela.** O menu e a lista de contas já escondem o modal do cliente. Mas o botão atualizar aparece para qualquer perfil numa conta real e, com a sessão expirada, abre o modal. Hoje isso não acontece porque a cliente demo está presa a uma conta mock ([[perfis-e-modos-de-visao]]).
- O prefixo `clareza_` da chave é resto do nome antigo do produto ([[inconsistencias-de-marca]]).
