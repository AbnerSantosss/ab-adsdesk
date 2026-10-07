---
tipo: arquitetura
atualizado: 2026-10-07
tags: [arquitetura, persistencia, localstorage, sessionstorage, seguranca]
---

# Persistência (localStorage e sessionStorage)

Não há banco de dados. Tudo o que o painel lembra fica no navegador de quem usa, por meio de `src/lib/storage.ts`. Nenhum outro arquivo acessa `localStorage` diretamente.

## A camada `storage.ts`

- `readJSON(key, kind = 'local')` e `writeJSON(key, value, kind = 'local')` guardam JSON dentro de try/catch. Em aba anônima, com a cota cheia ou com o armazenamento bloqueado, falham em silêncio e o painel continua funcionando; o dado só deixa de ser lembrado.
- `removeKey(key)`, chamado sem `kind`, apaga a chave nos dois armazenamentos. O App e o serviço da Meta chamam essa função antes de gravar, para o mesmo dado nunca ficar nos dois lugares.
- `readFromAny(key)` procura primeiro no local e depois no session.
- `STORAGE_KEYS` centraliza os nomes das chaves.

## Chaves

| Chave | Onde fica | Conteúdo | Quem grava |
|---|---|---|---|
| `ab_adsdesk_auth_user` | local com "Lembrar" (padrão); senão, session | o objeto `User` inteiro | login no App |
| `ab_adsdesk_brand_config` | local | `BrandConfig` | [[personalizar-marca]] |
| `clareza_meta_api_config` | somente session, com cópia em memória | `{ accessToken, adAccountId }`; legado local removido sem leitura | [[configuracoes]] |
| `ab_adsdesk_connected_account` | local | `AdAccount` da Meta com `apiSnapshot` e `apiReport`, sem token | App, após conectar ou atualizar com sucesso |
| `ab_adsdesk_selected_account` | local | id da conta que o gestor está vendo | App |
| `ab_adsdesk_report_recipients` | local | `{ [accountId]: email }` | modal de e-mail do [[relatorio-diario]] |

Mudou em 2026-09-25:

- Eram 3 chaves; agora são 6.
- O token vai para o sessionStorage por padrão.
- A conta conectada sobrevive a um recarregamento.
- O login pode valer só para a aba.

## O que não é salvo

Não são salvos o filtro de objetivo, a busca, o modo "ver como cliente" nem o modal aberto. O período de exploração do mock também é local à tela; o período da última importação real fica em `apiReport.range`, pois faz parte do snapshot. A aba ativa fica na URL (`#campanhas`, `#configuracoes` etc.), sem chave de storage. Ver [[estado-e-navegacao]].

## Leitura defensiva

- `loadUser` descarta o que não tiver `id` e `role`.
- `loadBrand` junta o que foi salvo com `defaultBrandConfig` (assim, campos novos ganham o valor padrão) e troca uma cor inválida pela cor padrão.
- `connectedAccount` e `selectedAccount` são lidos sem validar o formato. Um JSON de uma versão antiga pode quebrar uma tela. O `ErrorBoundary` segura o erro, mas não limpa a chave.

## Armadilhas

- **Token em texto puro.** Mesmo no sessionStorage, qualquer script da página consegue ler o token. É aceitável numa demonstração com token de curta duração; em produção, o token deve ficar no servidor. Ver [[seguranca]] e [[meta-graph-api]].
- **Conta sem token.** A conta/relatório fica no localStorage, mas o token fica somente na sessão. Depois de fechar a aba, o snapshot anterior pode permanecer; atualizar exige token válido em [[configuracoes]]. O cliente não recebe esse formulário.
- **Limpeza ao sair.** Logout e desconexão cancelam atualizações e removem token e conta/relatório conectado. Logout também remove `auth_user`. Marca, seleção anterior e destinatários continuam locais; ainda falta política de retenção e isolamento no servidor para uso compartilhado.
- **Cada navegador tem a sua marca.** A marca personalizada e os destinatários não viajam entre dispositivos. O cliente só vê a marca da agência se abrir o painel no mesmo navegador em que o gestor a configurou. Para um produto white-label, isso precisa ir para o servidor; ver [[modelo-saas-white-label]].
- **Nome legado.** `clareza_meta_api_config` mantém o prefixo antigo, mas sua cópia em localStorage é descartada sem leitura ou migração de credenciais. Uma futura mudança de nome deve preservar essa limpeza, sem reintroduzir token persistente.

A importação é aplicada de forma completa: falha, cancelamento ou limite preserva o snapshot anterior. Esses cuidados não oferecem OAuth, criptografia em repouso ou autorização real; ver [[meta-graph-api]] e [[seguranca]].
