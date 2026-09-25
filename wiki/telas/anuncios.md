---
tipo: tela
atualizado: 2026-09-25
tags: [tela, anuncios, criativos, campeao, desgaste]
---

# Anúncios

**Arquivos:** `src/components/screens/Creatives.tsx` e `src/components/ui/CreativePreview.tsx`. Hash `#anuncios`. Antes chamava "Melhores Criativos".

> Mudou em 2026-09-25: "criativo" saiu da interface ([[glossario-sem-jargao]]). Os selos escritos à mão (`TOP_PERFORMER` e afins) viraram regras. O campeão deixou de ser "o primeiro da lista" e passou a exigir amostra mínima. Saíram a ordenação por CTR e o estado nunca usado `comparingIds`. "Diagnóstico do Criativo" virou "Observação do gestor".

## Objetivo para o usuário
Responder "qual arte e qual texto trazem contato mais barato?" e avisar quando um anúncio cansou e precisa de arte nova. Também mostra ao cliente que o gestor testa várias peças, um dos sinais de tráfego profissional ([[profissional-vs-turbinar]]).

## O que aparece
1. **Destaque no topo:** prévia, nome, campanha, Resultados, Custo cada, Investido e "Ver texto e detalhes".
   - **"Anúncio campeão"** quando algum anúncio tem pelo menos 10 resultados e não está em desgaste. Vence o de menor custo (`pickChampion`), com a frase que o compara à média da conta.
   - **"Anúncio com mais resultados"** quando nenhum atinge essa amostra. A tela explica o motivo.
2. **Chips de formato:** "Todos", "Imagem", "Vídeo", "Carrossel" e "Reels / Stories", só os que existem na conta.
3. **Ordenar por:** "Menor custo por resultado" (padrão), "Mais resultados" ou "Maior investimento".
4. **Cartões:** prévia (mais apagada se o anúncio ou a campanha estiver parado), selos, nome, tipo · campanha, Resultados, Custo cada e um terceiro número. Selos de `creativeBadges`:
   - "Menor custo": o campeão, se tiver 10 ou mais resultados;
   - "Mais resultados";
   - "Desempenho em queda": status `FATIGUE`;
   - "Pausado": anúncio ou campanha parados.
5. **Janela de detalhe:** prévia na proporção real (1:1, 4:5 ou 9:16), selos, Título, Texto do anúncio, Botão, números, selo de saúde do custo com frase e, se houver, a "Observação do gestor" (`notes`).
6. **Rodapé:** "As prévias são ilustrativas: a arte original fica no Gerenciador de Anúncios da Meta."

## Gestor × cliente
- No cartão, o terceiro número é o **CTR** para o gestor e o **Investido** para o cliente.
- Na janela de detalhe, só o gestor vê Cliques, Impressões e CTR ([[perfis-e-modos-de-visao]]).

## No celular
- O destaque empilha: prévia de 192 px em cima, texto embaixo.
- Os chips rolam na horizontal, e o seletor de ordenação ocupa o resto da linha.
- Cartões em 1 coluna (2 a partir de `sm`, 3 a partir de `lg`).
- Na prévia estreita (formato vertical), o botão do anúncio desce para baixo do título. É uma container query `@[16rem]` ([[interface-e-responsividade]]).

## De onde vêm os dados
Todos os anúncios de todas as campanhas, juntos por `flattenCreatives` ([[metricas-e-calculos]]). Título, texto, botão, formato, proporção, status (inclusive `FATIGUE`), `notes` e o degradê da prévia foram escritos à mão em [[dados-mock]]. Numa conta real, aparece o `ApiAccountNotice`.

## Armadilhas
- **A prévia não é o anúncio real.** É um degradê com o título e o botão. Em produção, usar as prévias e miniaturas da Meta (`/{ad_id}/previews` ou `creative{thumbnail_url, image_url}`) pela [[meta-graph-api]].
- **O "Em queda" é manual:** `FATIGUE` vem do mock. Regra sugerida: frequência alta e CTR caindo por alguns dias.
- A ordenação padrão por custo não pede amostra mínima: um anúncio com 1 resultado barato fica na frente do campeão.
- O selo de saúde compara com a média da conta inteira, que mistura objetivos (um cadastro costuma custar mais que uma conversa).
- No plano B (nenhum anúncio com 10 resultados fora de desgaste), o destaque é o de mais resultados **entre os que não estão em queda**; só se todos estiverem em queda ele pode ser um deles. "Menor custo" exige amostra mínima e campeão fora de desgaste, então um anúncio nunca ganha "Menor custo" e "Desempenho em queda" juntos ([[metricas-e-calculos]]).
- `previewGradient` é uma classe do Tailwind escrita no mock. Só funciona porque o Tailwind lê `mockData.ts`; dados vindos da API não terão essa classe.
