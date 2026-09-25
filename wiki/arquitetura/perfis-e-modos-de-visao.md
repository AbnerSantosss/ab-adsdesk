---
tipo: arquitetura
atualizado: 2026-09-25
tags: [arquitetura, permissoes, perfis, view-mode, multi-tenant]
---

# Perfis e modos de visão

Há duas ideias que é fácil confundir:

- **Perfil** (`user.role`): quem entrou no painel. Pode ser `AGENCY_MANAGER` ("Gestor da agência") ou `CLIENT_VIEWER` ("Cliente"), conforme `roleLabel` em `src/types/auth.ts`.
- **Modo de visão** (`viewMode`): como as telas se desenham. `'MANAGER'` mostra as métricas técnicas; `'CLIENT'` esconde o jargão (ver [[glossario-sem-jargao]]).

O cliente vê sempre no modo `CLIENT`. O gestor começa em `MANAGER` e pode alternar para `CLIENT` como prévia, pela opção "Ver painel como" no menu do usuário.

## Como o perfil é decidido

Na [[tela-login]], o e-mail digitado é procurado em `demoUsers`; se não estiver lá, aparece um erro.

- A senha só precisa estar preenchida. Ela não é conferida.
- O único botão de entrada rápida entra direto como gestor (Abner Senna). A cliente não tem botão: entra digitando o e-mail de demonstração dela ou é vista pelo gestor com "Ver painel como".
- "Manter conectado" (marcado por padrão) decide se a sessão vai para o localStorage ou só para a aba.

| Usuário demo | Perfil | Conta |
|---|---|---|
| Abner Senna | Gestor da agência | todas as contas |
| Camila Rocha | Cliente | `act_raro_pilates` (Raro Pilates) |

Mudou em 2026-09-25: a heurística antiga ("e-mail com certa palavra vira gestor") saiu. Os rótulos "Gestor de Tráfego" e "Cliente Convidado" viraram "Gestor da agência" e "Cliente".

## O que cada um vê

| Elemento | Gestor | Gestor vendo como cliente | Cliente |
|---|---|---|---|
| Seletor de contas | lista e "Conectar conta da Meta" | igual ao gestor | nome fixo (`readOnly`) |
| Métricas técnicas (impressões, cliques, CTR, CPC, CPM, frequência) | sim | não | não |
| Painel de WhatsApp e e-mail no Diário | sim | não | não |
| Peso de cada item na Auditoria | sim | não | não |
| Menu: Personalizar marca, Conectar Meta | sim | sim | não |
| Menu: Simulador de retorno, Sair | sim | sim | sim |
| Link "Falar com {parentBrand}" no rodapé | não | não | sim |

Durante a prévia, uma faixa escura no topo avisa "Você está vendo o painel como o cliente vê" e oferece "Voltar à visão do gestor".

## Isolamento do cliente

A conta exibida é `accounts.find(id === user.clientAccountId) ?? accounts[0]`. O cliente não tem seletor nem troca de modo, então fica preso à própria conta.

Mudou em 2026-09-25: o vazamento antigo foi fechado. Antes, o cliente podia trocar de conta pelo seletor e ativar a "Visão Gestor".

## Armadilhas

- **Tudo é client-side.** O usuário logado vem do storage e só é validado por `id` e `role`. Editar esse JSON transforma qualquer um em gestor. Em produção, o perfil e a conta precisam vir do servidor; ver [[seguranca]].
- **Fallback perigoso.** Por causa do `?? accounts[0]`, se o `clientAccountId` não existir, o cliente vê a primeira conta da lista. Essa conta pode ser a conta real conectada naquele navegador ou a de outro cliente. O certo seria mostrar um erro.
- **Prévia imperfeita.** A prévia de cliente não é fiel: o seletor de contas e os itens de gestor do menu continuam ativos, porque dependem do perfil. Pelo mesmo motivo, o link de WhatsApp do rodapé não aparece.
- **Modo não salvo.** `managerViewMode` volta para `MANAGER` a cada login e não é gravado.
- **Uma conta por cliente.** `clientAccountId` guarda uma conta só, então uma rede com vários estúdios não cabe no modelo; ver [[modelo-saas-white-label]] e [[pontos-de-melhoria]].
- **Cópia desatualizada.** O objeto `User` salvo é uma cópia. Se `demoUsers` mudar (nome, conta), quem já estava logado continua com os dados antigos até sair.

Personas por trás dos perfis: [[personas]].
