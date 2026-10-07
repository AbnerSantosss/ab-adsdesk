---
tipo: arquitetura
atualizado: 2026-10-07
tags: [arquitetura, ux, cores, acessibilidade, dashboard, pesquisa]
---

# Cores e hierarquia visual

Esta página registra a pesquisa e a decisão de reduzir o excesso de cores no AB AdsDesk. O painel deve ajudar o cliente a comparar investimento, resultados e custo. A identidade Instagram/Facebook permanece nas marcas e nos criativos; a área de análise usa uma base clara e estável. Complementa [[interface-e-responsividade]], [[visao-geral]] e [[personalizar-marca]].

## Problema observado no projeto

Na revisão de 2026-10-07, o usuário relatou confusão visual causada por muitos fundos coloridos. A linha de KPIs usava quatro famílias de cor; o gráfico, os objetivos e o resumo introduziam outras superfícies. Isso criava destaque simultâneo para blocos com funções semelhantes. Trata-se de feedback real deste projeto, não de um experimento controlado nem de uma medida clínica de sobrecarga cognitiva.

O pedido atual estabelece fundo branco gelo e cor uniforme na linha de indicadores. A interpretação de implementação é manter os cards e os números, retirar a competição entre fundos e reconstruir a hierarquia com agrupamento, tamanho, texto e espaçamento.

## O que a pesquisa sustenta

### 1. A base neutra pode organizar um produto analítico

O Carbon organiza interfaces com famílias neutras predominantes, diferenças sutis entre camadas e uma cor principal de ação. Outras cores são aplicadas com intenção e parcimônia. Seus tokens descrevem papéis, permitindo mudar o tema sem mudar o significado de cada elemento. Essa é uma orientação do design system da IBM, não uma norma que obrigue todos os produtos a usar cinza ou azul. [Carbon — Color](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview).

**Decisão local:** usar branco gelo no fundo geral, superfícies claras para conteúdo e uma família de acento para ações. Separar seções por espaçamento, títulos e contornos discretos. O valor exato do branco gelo é uma escolha visual do AB AdsDesk; as fontes consultadas não demonstram que um hexadecimal específico reduz fadiga.

### 2. Itens relacionados precisam compartilhar sinais visuais

A orientação de similaridade do NNGroup explica que características comuns, como cor, forma e tamanho, fazem elementos parecerem relacionados. Consistência também ajuda a reconhecer funções. Isso dá suporte ao agrupamento dos indicadores do mesmo período. [NNGroup — Similarity Principle in Visual Design](https://www.nngroup.com/articles/gestalt-similarity/).

**Decisão local:** os quatro KPIs da visão geral e os indicadores equivalentes do relatório recebem a mesma superfície, o mesmo tratamento de ícone e a mesma hierarquia tipográfica. O rótulo e o número distinguem cada indicador. Se o custo exigir atenção, usar uma explicação ou um estado verificável, em vez de uma cor decorativa permanente.

O NNGroup também explica que muitas cores com luminosidade ou saturação semelhantes enfraquecem a hierarquia percebida. Escala, contraste tipográfico, proximidade e regiões comuns ajudam a direcionar a leitura sem exigir uma nova cor em cada bloco. **Inferência para este painel:** neutralizar os fundos devolve destaque aos números, às imagens relevantes e à ação principal; essa hipótese deve ser conferida nas tarefas do usuário. [NNGroup — Visual Hierarchy in UX: Definition](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/).

### 3. Acento decorativo, estado e dado são papéis diferentes

A Atlassian distingue acentos usados para diferenciar conteúdo das cores com significado, como erro, alerta e sucesso. Recomenda parear primeiro plano e fundo da mesma família quando houver acento. Esse cuidado evita que uma cor decorativa seja confundida com um estado do sistema. [Atlassian — Accents](https://atlassian.design/foundations/color/accents).

**Decisão local:** verde em um aviso de sucesso precisa corresponder a sucesso; vermelho precisa corresponder a erro ou piora comprovada. Um card comum de campanhas não fica verde apenas para variar a composição. A cor da marca não altera os significados de sucesso, alerta e erro. Os chips Instagram e Facebook identificam plataformas e não representam métricas atribuídas a cada canal.

### 4. Cores de gráficos devem representar diferenças nos dados

O Carbon diferencia paletas categóricas, sequenciais e de alerta. Cores categóricas distinguem grupos; sequências de luminosidade representam progressão ordenada. A recomendação de evitar múltiplos gradientes em gráficos é específica da visualização de dados, não uma proibição universal de gradientes em logos. [Carbon — Data visualization color palettes](https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes).

**Decisão local:** no gráfico de investimento e resultados, manter no máximo as duas séries existentes, com barras para investimento e linha com pontos para resultados. As formas, nomes e unidades continuam distinguindo as séries, mesmo sem percepção das cores. Não reaproveitar automaticamente o rosa do Instagram e o azul do Facebook se o gráfico não contiver uma divisão real por plataforma. A tabela alternativa permanece disponível.

### 5. Cor não pode ser a única forma de transmitir informação

O critério WCAG 2.2 1.4.1, nível A, exige outra pista visual quando cor transmite significado. [W3C — Use of Color](https://www.w3.org/TR/WCAG22/#use-of-color).

**Aplicação:** estado inclui texto; seleção inclui forma, borda ou sublinhado; variação informa melhora, piora ou estabilidade; gráfico combina forma e rótulos. Um nome acessível invisível ao usuário, sozinho, não resolve um significado indicado apenas por cor para quem enxerga mas não distingue os matizes.

### 6. Superfície suave não significa texto fraco

O critério WCAG 2.2 1.4.3, nível AA, define contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande: ao menos 18 pt, ou 14 pt em negrito. A exigência considera o fundo efetivamente atrás do texto. [W3C — Contrast (Minimum)](https://www.w3.org/TR/WCAG22/#contrast-minimum).

**Aplicação:** textos auxiliares e rótulos de eixos precisam ser legíveis. Reduzir saturação do fundo não autoriza reduzir o contraste dos valores. Em transparências, fotos ou gradientes, medir a composição final e o trecho de menor contraste.

### 7. Controles e gráficos essenciais também precisam de contraste

O critério WCAG 2.2 1.4.11, nível AA, requer 3:1 contra cores adjacentes para informação visual necessária à identificação de controles, estados e partes significativas de gráficos. [W3C — Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast).

**Aplicação:** medir indicadores de foco, seleção, ícones funcionais e séries do gráfico. Uma borda meramente decorativa entre card e página não precisa receber o mesmo peso visual de um controle; o contraste entre dois fundos claros não é uma avaliação suficiente de acessibilidade da tela.

## Norma, orientação e decisão do produto

| Categoria | O que significa aqui | Como usar |
| --- | --- | --- |
| Critério normativo | Requisitos WCAG citados, com níveis A/AA | Medir os pares e os estados aplicáveis; uma revisão de cores não prova conformidade integral do produto |
| Orientação de design | Carbon, Atlassian e princípio de similaridade do NNGroup | Adaptar ao objetivo do relatório, sem transformar preferência de outro produto em obrigação universal |
| Decisão local | Branco gelo, linha KPI uniforme, uma família de acento e superfícies neutras | Manter até que feedback ou teste do AB AdsDesk justifique mudança |

Esta pesquisa é uma revisão de fontes primárias de referência, não uma revisão sistemática de estudos. Não foi identificado fundamento nestas fontes para prometer aumento percentual de conversão, tratar a regra “60/30/10” como requisito científico ou afirmar que uma única paleta funciona para todos. A melhora esperada de leitura precisa ser observada com tarefas reais no produto.

## Paleta adotada no AB AdsDesk

Os valores abaixo são **decisões locais de implementação de 2026-10-07**, não cores prescritas pelas referências. A área externa fica branco gelo; cards brancos criam uma diferença discreta de camada. Os pares finais devem ser medidos no navegador, incluindo estados de interação e sobreposições.

| Papel | Token ou aplicação | Cor |
| --- | --- | --- |
| Fundo geral branco gelo | `--app-canvas` | `#F5F6F8` |
| Superfície dos cards e da linha de KPI | `--app-surface` | `#FFFFFF` |
| Camada neutra auxiliar | `--app-subtle` | `#F0F2F5` |
| Bloco interno discreto | Insets | `#F8F9FB` |
| Contorno decorativo | Bordas de superfícies | `#E1E5EB` |
| Texto auxiliar | Muted | `#526178` |
| Ícones comuns | Grafite | `#475569` |
| Ação e seleção no tema padrão | Família de marca | `#872366` |
| Fundo de seleção discreto | Active light | `#FFF1F6` |
| Série de investimento | Barras do gráfico | `#758399` |
| Série de resultados | Linha com pontos | `#172033` |
| Ação de WhatsApp | Botão com texto branco | `#166534` |

Os relatórios não usam gradientes nem fotos no fundo geral. Os ícones comuns compartilham grafite sobre cinza claro, e os chips de plataforma são neutros com nome e ícone. O símbolo AB mantém sua identidade colorida em uma área pequena. As fotos continuam nos criativos. A cor de ação pode mudar pelo white-label, preservando os papéis de superfície e estado.

## Regras práticas para novas telas

1. **Fundo:** usar o token do branco gelo da aplicação. Não introduzir foto, manchas ou gradiente multicolorido atrás de números e tabelas.
2. **Cards comuns:** usar a mesma superfície neutra. O fato de um tópico ser diferente não é motivo suficiente para criar uma nova família de cor.
3. **Blocos relacionados:** repetir fundo, borda, alinhamento e escala dos números. Em grupos de KPI, manter a cor uniforme também quando a grade quebra para duas colunas no celular.
4. **Separação:** usar títulos claros, espaçamento, agrupamento e divisores; usar uma camada neutra ligeiramente diferente nos blocos internos quando necessário.
5. **Ações:** reservar o acento principal para o que é acionável ou está selecionado. Botões secundários usam superfície neutra. Não tornar todos os botões simultaneamente “principais”.
6. **Identidade:** manter o símbolo AB personalizado e as fotos dos anúncios. Gradientes da marca ficam em áreas pequenas e intencionais. Não recolorir as fotos para igualar todos os conteúdos.
7. **Estado:** usar badge, ícone e texto compacto. Evitar pintar um painel inteiro de verde ou vermelho quando um aviso local comunica o mesmo resultado.
8. **Gráficos:** definir cor pela variável, com nomes e formas redundantes. Em uma evolução com mais séries, justificar a paleta e verificar legibilidade; não adicionar cores para preencher espaço.
9. **White-label:** alterar a família de ação preservando superfícies neutras e cores semânticas. Validar contraste novamente para cada tema suportado.
10. **Manutenção:** preferir tokens compartilhados a hexadecimais espalhados em telas. Antes de criar uma cor, registrar seu papel: superfície, texto, interação, dado, estado ou identidade.

## Como validar a próxima alteração

- Comparar a tela inteira: o título, o período e os números devem ser encontrados antes dos detalhes decorativos.
- Confirmar que todos os cards da linha de KPI compartilham fundo e tratamento de ícone, inclusive em 375, 768 e 1280 px.
- Conferir texto comum, texto auxiliar, valores, ícones funcionais, foco e séries com as cores finais do navegador. Não arredondar um resultado abaixo do mínimo para considerá-lo aprovado.
- Ler a interface sem depender de matiz: nomes de estado, seleção, legendas e formas precisam preservar o entendimento. Simulação de daltonismo é complemento, não certificação.
- Exercitar período, filtros, campanha expandida, detalhe do anúncio e tabela do gráfico. Mudança estética não pode alterar métricas ou permissões.
- Validar temas white-label afetados; registrar qualquer limitação de cobertura em vez de declarar conformidade global.
- Em uma avaliação com usuários, pedir que encontrem investimento do período, custo por contato e anúncio de melhor desempenho. Registrar erros, tempo e dúvidas; não induzir a resposta perguntando apenas se a tela ficou “mais bonita”.
- Rodar `npm run lint` e `npm run build`; atualizar a página da tela, [[interface-e-responsividade]] e `wiki/log.md` quando uma decisão visual mudar.

## Onde aplicar no código

Os tokens de cor e estilos compartilhados ficam em `src/index.css`. `Card`, `KpiCard` e `PageHeader`, em `src/components/ui/`, devem consumir a mesma hierarquia de superfícies. `src/lib/socialTheme.ts` centraliza os papéis das superfícies e impede que o objetivo ou formato do anúncio imponha uma nova paleta decorativa. O tema configurável continua em [[personalizar-marca]]. A forma concreta de implementação e a lista atual de tokens ficam em [[interface-e-responsividade]].

**Fontes consultadas em 2026-10-07:** as oito referências estão ligadas diretamente às conclusões acima. Ao rever este documento, conferir as versões de WCAG e das páginas de design system; os exemplos de outros produtos podem mudar sem que as decisões locais mudem automaticamente.

## Aplicações relacionadas

[[cabecalho-e-navegacao]] usa identidade contida e indicador de seleção. [[campanhas]], [[anuncios]] e [[relatorio-diario]] usam superfícies neutras e fotos somente onde representam criativos. [[auditoria-transparencia]] e [[configuracoes]] reservam estados semânticos a avisos identificados por texto. A comunicação desses limites ao cliente está em [[proposta-de-valor]].
