---
tipo: tela
atualizado: 2026-09-25
tags: [tela, campanhas, publicos, filtros, custo-por-resultado]
---

# Campanhas

**Arquivo:** `src/components/screens/Campaigns.tsx`. Hash `#campanhas`. Responde três perguntas: "o que está rodando?", "quanto custa cada resultado?" e "para onde vai quem clica?".

> Mudou em 2026-09-25: saíram o botão pausar/ativar (que era falso), os cards fixos "o que está rodando agora" e o selo de custo com faixas fixas de R$ 6 e R$ 10. Agora o selo compara com a média da própria conta. O bug do estado dessincronizado acabou: a lista lê direto da conta, e a tela é montada de novo ao trocar de conta.

## O que aparece
1. **Chips de tipo:** "Todas" e um chip por objetivo presente na conta, com contagem ("Conversas no WhatsApp", "Cadastros", "Reconhecimento local", "Cliques no link / post turbinado"). O filtro fica guardado no `App`: chega pronto quando se toca num tipo na [[visao-geral]], continua valendo ao sair e voltar e só zera ao trocar de conta.
2. **Busca** "Buscar por nome, público ou destino": ignora acentos e procura no nome, no tipo, no destino e nos nomes dos públicos.
3. **Situação:** "Ativas e pausadas", "Só ativas" ou "Só pausadas".
4. **Ordenação:** "Maior investimento" (padrão), "Mais resultados", "Menor custo por resultado" (campanhas sem resultado vão para o fim) e "Mais recentes".
5. **Resumo do filtro:** "N campanhas · R$ X investidos · Y resultados", anunciado também ao leitor de tela.
6. **Cartão de cada campanha:**
   - nome, situação, tipo e "Desde DD/MM/AAAA · N dias no ar";
   - selo âmbar **"Post turbinado"** quando `isProfessionalStructure` é falso ([[profissional-vs-turbinar]]);
   - Investido, resultados (com o nome da métrica da campanha), Custo por resultado com selo de saúde e Orçamento diário (ou "Pausada");
   - uma frase explicando o selo, ex.: "12% mais barato que a média da conta".
7. **"Ver públicos, destino e anúncios"** abre:
   - "Para onde o contato vai" e "O que acontece quando a pessoa clica", em linguagem leiga;
   - os públicos (região, idade e gênero, interesses, investido, resultados, orçamento por dia);
   - os anúncios, com os selos "Em queda" e "Pausado".

   Campanha sem público mostra o aviso "Sem público definido: a Meta entrega para quem quiser...".

Se nenhum filtro encontrar campanhas, aparece "Nenhuma campanha com esses filtros" e o botão "Limpar filtros".

## Selo de saúde do custo (`cpaHealth`)
Divide o custo da campanha pela média da conta:
- até 0,9×: "Abaixo da média" (verde);
- até 1,15×: "Na média";
- até 2×: "Acima da média";
- acima de 2×: "Muito acima".

Detalhes em [[metricas-e-calculos]]. No mock da Raro, o post turbinado pausado (R$ 40 por resultado) aparece como "Muito acima".

## Gestor × cliente
A lista é a mesma. Só o gestor vê, no cartão aberto, a faixa com Alcance, Impressões, CTR e CPC ([[perfis-e-modos-de-visao]]). Ninguém pausa nem edita: a tela é só de leitura.

## No celular
Os chips rolam na horizontal. A busca ocupa uma linha, e os dois seletores dividem a linha de baixo. Os números do cartão ficam em 2 colunas (4 a partir de `sm`) e os públicos em 1 coluna (2 a partir de `lg`).

## De onde vêm os dados
`Campaign`, `AdSet` e `AdCreative` ([[modelo-de-dados]]), vindos de [[dados-mock]]. O destino, o "o que acontece ao clicar", `isProfessionalStructure` e os públicos foram escritos à mão no mock. Numa conta real, aparece o `ApiAccountNotice`, sem botão de conexão.

## Armadilhas
- **A média da conta mistura objetivos.** Um cadastro custa mais que uma conversa no WhatsApp, então "Acima da média" pode ser só efeito do tipo de campanha ([[bugs-conhecidos]]).
- "Menor custo por resultado" não pede amostra mínima: uma campanha com 1 resultado barato vai para o topo.
- "N dias no ar" conta da data de início até o último dia com dados da conta (`dailyHistory[0]`), não até hoje. Assim o número bate com o gasto mostrado; numa conta sem histórico, conta até hoje.
- O resumo do filtro soma resultados de objetivos diferentes.
- As regras e os textos pensam em estúdio de Pilates com WhatsApp. Outro nicho pode pedir outros tipos e outra leitura do custo ([[nicho-pilates-e-generalizacao]]).

## Pergunta de produto (em aberto)
Quando houver escrita pela API, **o cliente leigo deve poder pausar?** Isso pode sabotar o trabalho do gestor. Opções: deixar o recurso só com o gestor, ou criar um "pedir pausa" que avisa o gestor ([[pontos-de-melhoria]]).
