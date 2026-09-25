---
tipo: entidade
atualizado: 2026-09-25
tags: [dados, tipos, typescript, entidades, modelo]
---

# Modelo de dados

Os tipos ficam em `src/types/metaAds.ts` (anúncios) e `src/types/auth.ts` (usuário e marca). O princípio desde 2026-09-25 é **guardar só números brutos**. CPA, CTR, CPC, CPM, totais, notas e selos são calculados em `src/lib/metrics.ts` (ver [[metricas-e-calculos]]). Um dado derivado salvo junto com o bruto acaba divergindo dele, como acontecia antes.

## Hierarquia

```
AdAccount ── campaigns: Campaign[] ── adSets: AdSet[]
   │                              └── creatives: AdCreative[]
   └── dailyHistory: DailyStat[]  (mais recente primeiro)
```

> Na Meta real, os anúncios (Ads) pertencem ao **AdSet**, e não à campanha. O app pula um nível: `adSets` e `creatives` ficam lado a lado na campanha. Ao integrar, montar `Campaign → AdSet → Ad → Creative`.

## Entidades

| Tipo | Campos principais | Observação |
|---|---|---|
| `AdAccount` | id, name, businessName, businessType, slogan?, logoKey?, currency, timezone, isRealApi, resultLabel, uniqueReach?, audit, campaigns, dailyHistory, apiSnapshot? | `audit` = `{ pixelConfigured, whatsappConnected, managerNote }` |
| `Campaign` | objective, status, isProfessionalStructure, dailyBudget, totalSpend, resultsCount, resultMetricName, reach, impressions, clicks, startDate | `true` = montada no Gerenciador; `false` = post turbinado ([[profissional-vs-turbinar]]) |
| `AdSet` | targetAudience, genderAge, location, dailyBudget, spend, leads, status | só `ACTIVE` ou `PAUSED` |
| `AdCreative` | headline, primaryText, format, aspectRatio, callToAction, previewGradient, tagline, spend, leads, clicks, impressions, status, notes | status `FATIGUE` = desempenho em queda |
| `DailyStat` | date, spend, results, clicks, reach, topCampaignName, topCreativeName, byObjective? | `byObjective` guarda `{ spend, results }` por objetivo |
| `MetaAccountSnapshot` | accountStatus, amountSpent, timezone, fetchedAt | só existe em conta real |

Enums:

- `CampaignObjective`: MESSAGES, LEADS, REACH, CONVERSIONS e TRAFFIC.
- `CampaignStatus`: ACTIVE, PAUSED e ARCHIVED.
- `CreativeFormat`: IMAGE, VIDEO, CAROUSEL e STORY_REEL.
- De navegação: `ViewMode`, `ActiveTab` e `ObjectiveFilter` (`'ALL'` ou um objetivo).

Rótulos, cores e unidades de cada objetivo ficam em `src/lib/objectives.ts`, não no tipo.

Mudou em 2026-09-25:

- Saíram cpa, ctr, cpc, cpm, objectiveLabel e campaignTypeDescription das campanhas; badge e previewIcon dos criativos; dayLabel e resultName dos dias.
- Da conta saíram summary, overallHealth, currencySymbol, logoUrl e a nota de auditoria.
- As datas passaram a ser `YYYY-MM-DD`.

## Usuário e marca (`auth.ts`)

- **`User`**: id, name, email, role, agencyName, clientAccountId?, avatarInitials. Ver [[perfis-e-modos-de-visao]].
- **`BrandConfig`**:
  - campos: appName, parentBrand, tagline, primaryColor, logoType, customLogoText, supportWhatsapp (só dígitos), showPoweredBy, clientCustomDomain;
  - `primaryColor`: emerald, indigo, blue, violet ou slate;
  - `logoType`: ICON_AB, CUSTOM_TEXT ou MINIMAL.
- **Padrão:** o `defaultBrandConfig` é "AB AdsDesk" da "AB Software", na cor emerald. Ver [[personalizar-marca]].

## Conta real (Meta)

`buildConnectedAccount` (`src/services/metaGraphApi.ts`) cria um `AdAccount` com `isRealApi: true`, `campaigns: []`, `dailyHistory: []`, `audit` zerado e `apiSnapshot`. As telas detectam a lista vazia e mostram o `ApiAccountNotice` em vez de números. Ver [[meta-graph-api]].

## Armadilhas

- **`leads` é o nome errado.** Em `AdSet` e `AdCreative`, o campo `leads` guarda "resultados" de qualquer objetivo: conversas, cadastros, contatos. O nome é legado.
- **Dois alcances diferentes.** `Campaign.reach` e `DailyStat.reach` não somam pessoas únicas: a mesma pessoa aparece em várias campanhas e em vários dias. Por isso existe `AdAccount.uniqueReach`; sem ele, a tela avisa que o alcance é "somado".
- **Texto solto.** `topCampaignName` e `topCreativeName` são texto livre, não ids, e já divergem dos nomes reais dos criativos no mock ([[dados-mock]]).
- **Campo só de exibição.** `resultMetricName` é só um rótulo e não entra em nenhum cálculo.
- **"Resultado" depende do objetivo.** Na Meta, `results` e `cpa` vêm de `actions` e `cost_per_action_type`, com `action_type` diferente por objetivo (`onsite_conversion.messaging_conversation_started_7d`, `lead`...). Não existe um campo "results" único.
- **Valores da Meta.** Os valores vêm como string, e `amount_spent` vem na menor unidade da moeda (centavos).
- **Falta o tenant.** Não há modelo de agência nem vínculo de um usuário com várias contas; ver [[pontos-de-melhoria]].
