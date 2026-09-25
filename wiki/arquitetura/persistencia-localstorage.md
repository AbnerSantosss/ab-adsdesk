---
tipo: arquitetura
atualizado: 2026-09-25
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
| `clareza_meta_api_config` | session por padrão; local com "Lembrar neste navegador" | `{ accessToken, adAccountId }` | [[modal-conectar-meta]] |
| `ab_adsdesk_connected_account` | local | `AdAccount` montado a partir da Meta, com `apiSnapshot` | App, ao conectar e ao atualizar |
| `ab_adsdesk_selected_account` | local | id da conta que o gestor está vendo | App |
| `ab_adsdesk_report_recipients` | local | `{ [accountId]: email }` | modal de e-mail do [[relatorio-diario]] |

Mudou em 2026-09-25:

- Eram 3 chaves; agora são 6.
- O token vai para o sessionStorage por padrão.
- A conta conectada sobrevive a um recarregamento.
- O login pode valer só para a aba.

## O que não é salvo

Não são salvos o filtro de objetivo, o período, a busca, o modo "ver como cliente" nem o modal aberto. A aba ativa também não vai para o storage: fica na URL (`#campanhas` etc.). Por isso, ao recarregar, só a aba é mantida; o resto volta ao padrão. Ver [[estado-e-navegacao]].

## Leitura defensiva

- `loadUser` descarta o que não tiver `id` e `role`.
- `loadBrand` junta o que foi salvo com `defaultBrandConfig` (assim, campos novos ganham o valor padrão) e troca uma cor inválida pela cor padrão.
- `connectedAccount` e `selectedAccount` são lidos sem validar o formato. Um JSON de uma versão antiga pode quebrar uma tela. O `ErrorBoundary` segura o erro, mas não limpa a chave.

## Armadilhas

- **Token em texto puro.** Mesmo no sessionStorage, qualquer script da página consegue ler o token. É aceitável numa demonstração com token de curta duração; em produção, o token deve ficar no servidor. Ver [[seguranca]] e [[meta-graph-api]].
- **Conta sem token.** A conta conectada fica no localStorage, mas o token, por padrão, fica só na sessão. Depois de fechar a aba, a conta continua na lista com os dados antigos, e o botão de atualizar pede o token de novo.
- **Sair não limpa tudo.** O logout apaga só `auth_user`. Token, conta conectada, marca e destinatários ficam para quem usar o mesmo navegador depois.
- **Cada navegador tem a sua marca.** A marca personalizada e os destinatários não viajam entre dispositivos. O cliente só vê a marca da agência se abrir o painel no mesmo navegador em que o gestor a configurou. Para um produto white-label, isso precisa ir para o servidor; ver [[modelo-saas-white-label]].
- **Nome legado.** `clareza_meta_api_config` mantém o prefixo do nome antigo do produto. Renomear a chave agora desconectaria quem já salvou o token. Ver [[inconsistencias-de-marca]].
