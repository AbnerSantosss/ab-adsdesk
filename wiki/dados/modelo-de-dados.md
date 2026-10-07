---
tipo: entidade
atualizado: 2026-10-07
tags: [dados, tipos, typescript, entidades, modelo]
---

# Modelo de dados

Os tipos ficam em `src/types/metaAds.ts` (conta e demonstração), `src/types/metaReport.ts` (relatórios reais) e `src/types/auth.ts` (usuário e marca). O princípio desde 2026-09-25 é **guardar números brutos**. No modelo de demonstração, CPA, CTR, CPC, CPM, totais, notas e selos são calculados em `src/lib/metrics.ts` (ver [[metricas-e-calculos]]). Os relatórios Meta usam um contrato próprio, preservando campos ausentes como `null`, sem forçar os dados reais ao modelo do mock.

## Hierarquia

```
AdAccount ── campaigns: Campaign[] ── adSets: AdSet[]
   │                              └── creatives: AdCreative[]
   └── dailyHistory: DailyStat[]  (mais recente primeiro)
```

> Na Meta real, os anúncios (Ads) pertencem ao **AdSet**, e não à campanha. A hierarquia acima é do mock: `adSets` e `creatives` ficam lado a lado na campanha. A importação atual não reconstrói conjuntos; usa listas de campanhas e anúncios em `apiReport`, com `campaignId` para vínculo e criativo embutido. Não inferir segmentação, orçamento ou estrutura profissional a partir dessas listas.

## Entidades

| Tipo | Campos principais | Observação |
|---|---|---|
| `AdAccount` | id, name, businessName, businessType, slogan?, logoKey?, currency, timezone, isRealApi, resultLabel, uniqueReach?, audit, campaigns, dailyHistory, apiSnapshot?, apiReport? | `audit` = `{ pixelConfigured, whatsappConnected, managerNote }`; em conta real, não usar esse legado como prova de auditoria |
| `Campaign` | objective, status, isProfessionalStructure, dailyBudget, totalSpend, resultsCount, resultMetricName, reach, impressions, clicks, startDate | `true` = montada no Gerenciador; `false` = post turbinado ([[profissional-vs-turbinar]]) |
| `AdSet` | targetAudience, genderAge, location, dailyBudget, spend, leads, status | só `ACTIVE` ou `PAUSED` |
| `AdCreative` | headline, primaryText, format, aspectRatio, callToAction, previewGradient, previewImage?, tagline, spend, leads, clicks, impressions, status, notes | status `FATIGUE` = desempenho em queda; `previewImage` = `{ src, description, position? }` |
| `DailyStat` | date, spend, results, clicks, reach, topCampaignName, topCreativeName, byObjective? | `byObjective` guarda `{ spend, results }` por objetivo |
| `MetaAccountSnapshot` | accountStatus, amountSpent, timezone, fetchedAt | só existe em conta real |

Enums:

- `CampaignObjective`: MESSAGES, LEADS, REACH, CONVERSIONS e TRAFFIC.
- `CampaignStatus`: ACTIVE, PAUSED e ARCHIVED.
- `CreativeFormat`: IMAGE, VIDEO, CAROUSEL e STORY_REEL.
- De navegação: `ViewMode`, `ActiveTab` e `ObjectiveFilter` (`'ALL'` ou um objetivo).

Rótulos, cores e unidades de cada objetivo ficam em `src/lib/objectives.ts`, não no tipo.

`AdCreative.previewImage` é opcional e guarda a imagem ilustrativa local: `src` é o caminho servido pelo site (no mock, `/images/ads/*.webp`), `description` compõe o nome acessível da prévia e `position` ajusta o recorte por `object-position`. Sem imagem ou se o arquivo falhar, `CreativePreview` usa `previewGradient`. Esse campo não implica importação do criativo real pela Meta; ver [[anuncios]] e [[o-que-e-simulado]].

Mudou em 2026-09-25:

- Saíram cpa, ctr, cpc, cpm, objectiveLabel e campaignTypeDescription das campanhas; badge e previewIcon dos criativos; dayLabel e resultName dos dias.
- Da conta saíram summary, overallHealth, currencySymbol, logoUrl e a nota de auditoria.
- As datas passaram a ser `YYYY-MM-DD`.

## Usuário e marca (`auth.ts`)

- **`User`**: id, name, email, role, agencyName, clientAccountId?, avatarInitials. Ver [[perfis-e-modos-de-visao]].
- **`BrandConfig`**:
  - campos: appName, parentBrand, tagline, primaryColor, logoType, customLogoText, supportWhatsapp (só dígitos), showPoweredBy, clientCustomDomain;
  - `primaryColor`: social, emerald, indigo, blue, violet ou slate; configurações válidas já salvas são preservadas;
  - `logoType`: ICON_AB, CUSTOM_TEXT ou MINIMAL.
- **Padrão:** o `defaultBrandConfig` é "AB AdsDesk" da "AB Software", na opção social, cuja aplicação atual usa base neutra e acentos contidos. O monograma conserva a identidade Instagram/Facebook sem colorir todos os cards. Ver [[personalizar-marca]] e [[cores-e-hierarquia-visual]].

## Conta real (Meta)

`buildConnectedAccount` (`src/services/metaGraphApi.ts`) cria um `AdAccount` com `isRealApi: true`, `campaigns: []`, `dailyHistory: []` e `apiSnapshot`. O `audit` legado recebe valores padrão, mas eles **não comprovam ausência de Pixel ou WhatsApp**. O `App` envia contas reais para `MetaReports`, que não calcula a auditoria do mock.

Após uma importação completa, o chamador anexa `apiReport: MetaReportSnapshot`. As coleções reais nunca são copiadas para `Campaign[]` ou `DailyStat[]`. Uma conta salva antes desse contrato, sem `apiReport`, pede nova importação em [[configuracoes]]. Ver [[meta-graph-api]].

### Contrato do relatório real (`metaReport.ts`)

| Tipo | Campos e significado |
| --- | --- |
| `MetaReportRange` | `since` e `until`, dias inclusivos `YYYY-MM-DD` no fuso da conta |
| `MetaReportAction` | `type` e `value: number \| null`, conservando o tipo retornado pela Meta |
| `MetaReportMetrics` | `spend`, `impressions`, `clicks`, `reach`, `actions`, `messagingConversations`, `leads`, `purchases`; números ausentes continuam `null` |
| `MetaReportDay` | Métricas e `date`; só existem dias efetivamente retornados |
| `MetaReportCampaign` | Métricas, `id`, `name`, `status`, `objective` |
| `MetaReportCreative` | `id`, `name`, `title`, `body`, `imageUrl`, `thumbnailUrl`, `videoId`, todos com possibilidade de ausência |
| `MetaReportAd` | Métricas, `id`, `name`, `campaignId`, `campaignName`, `status`, `creative` |
| `MetaReportSnapshot` | `apiVersion`, `fetchedAt`, `range`, `timezone`, `currency`, `isEmpty`, `totals`, `daily`, `campaigns`, `ads` |

`totals.reach` vem da consulta única no nível da conta; não é soma de campanhas ou dias. `daily` fica do mais recente para o mais antigo. `isEmpty` indica ausência de linhas na consulta de total, não um valor zero presumido. A primeira importação cobre 30 dias inclusivos; intervalos posteriores podem ter até 366 dias.

`actions` não vira um total universal de contatos. O serviço escolhe um alias por família de conversas, cadastros e compras, sem somar aliases sobrepostos; deduplicar `action_type` não significa deduplicar pessoas. A tabela de prioridade fica em [[meta-graph-api]]. A UI mantém essas famílias separadas de cliques e alcance.

Campanhas e anúncios unem IDs de insights e metadados. Portanto, um objeto pode ter estado/nome atuais e métricas ausentes no período. A imagem real usa apenas uma URL HTTPS válida retornada em `image_url` ou `thumbnail_url`; não recebe `previewImage` do mock. `videoId` não implica player, download do vídeo ou reprodução de carrossel.

O snapshot concluído fica sem token no `localStorage`; erro de atualização não o substitui por uma importação parcial. A credencial usa sessão separada. Não há sincronização multiusuário, tenant ou banco no servidor.

## Armadilhas

- **`leads` é o nome errado.** Em `AdSet` e `AdCreative`, o campo `leads` guarda "resultados" de qualquer objetivo: conversas, cadastros, contatos. O nome é legado.
- **Dois alcances diferentes.** `Campaign.reach` e `DailyStat.reach` não somam pessoas únicas: a mesma pessoa aparece em várias campanhas e em vários dias. Por isso existe `AdAccount.uniqueReach`; sem ele, a tela avisa que o alcance é "somado".
- **Texto solto.** `topCampaignName` e `topCreativeName` são texto livre, não ids, e já divergem dos nomes reais dos criativos no mock ([[dados-mock]]).
- **Campo só de exibição.** `resultMetricName` é só um rótulo e não entra em nenhum cálculo.
- **"Resultado" depende do objetivo.** Na Meta, `results` e `cpa` vêm de `actions` e `cost_per_action_type`, com `action_type` diferente por objetivo (`onsite_conversion.messaging_conversation_started_7d`, `lead`...). Não existe um campo "results" único.
- **Valores da Meta.** Os valores vêm como string, e `amount_spent` vem na menor unidade da moeda (centavos).
- **Falta o tenant.** Não há modelo de agência nem vínculo de um usuário com várias contas; ver [[pontos-de-melhoria]].
