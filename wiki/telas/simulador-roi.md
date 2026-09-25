---
tipo: tela
atualizado: 2026-09-25
tags: [tela, modal, roi, simulador, vendas]
---

# Modal: Simulador de retorno (ROI)

**Arquivos:** `src/components/modals/RoiCalculatorModal.tsx` e `src/components/ui/SliderField.tsx`. O modal abre pelo botão "Simulador" do cabeçalho (a partir de 640 px) e pelo item "Simulador de retorno" do menu do usuário. **Gestor e cliente** têm acesso ([[cabecalho-e-navegacao]]).

## Premissas (controles deslizantes)
| Controle | Padrão | Faixa |
|---|---|---|
| Investimento por dia | R$ 50 (R$ 1.500 em 30 dias) | 10–500, passo 5 |
| Custo por contato | custo por resultado da conta aberta, arredondado a R$ 0,50; sem histórico, R$ 8 | 1–60, passo 0,5 |
| Contatos que agendam aula experimental | 40% | 5–100% |
| Aulas experimentais que viram matrícula | 50% | 5–100% |
| Mensalidade média | R$ 350 | 100–1.500, passo 10 |
| Tempo médio que o aluno fica | 6 meses | 1–24 |

Cada `SliderField` é um `<input type="range">` com `<label>` e `<output>`. O valor aparece formatado ("R$ 50", "40%"), e leitores de tela ouvem esse mesmo texto por `aria-valuetext`.

## Cálculo (funil)
```
gasto_mês        = diário × 30
contatos         = floor(gasto_mês / custo_por_contato)
aulas            = floor(contatos × agendamento%)
alunos           = floor(aulas × matrícula%)
fat_1º_mês       = alunos × mensalidade
fat_total        = fat_1º_mês × meses_de_permanência
retorno          = fat_total − gasto_mês   ("Retorno acima do investido" ou "Faltam para empatar")
ROAS             = fat_total / gasto_mês   ("Cada R$ 1 investido volta R$ X")
custo_por_aluno  = gasto_mês / alunos
```
Com os padrões na Raro Pilates (custo por resultado de R$ 6,39, arredondado para R$ 6,50), o funil fica assim: 230 contatos → 92 aulas → **46 alunos**. Isso dá R$ 16.100 no 1º mês, R$ 96.600 em 6 meses e cerca de R$ 33 por aluno. A tela diz então que **cada R$ 1 volta R$ 64,40**.

## Para que serve no produto
É uma ferramenta de **venda e retenção**. Ela traduz custo por contato em "novos alunos" e dinheiro, que é a língua do dono do estúdio ([[glossario-sem-jargao]]), e ajuda o gestor a justificar um aumento de verba. O rodapé do resultado avisa: "Estimativa para conversa com o cliente, não uma promessa de resultado".

## Armadilhas
- **O número em destaque é otimista demais.** Ele multiplica a receita por 6 meses de permanência e compara com um único mês de verba. Além disso, supõe que 20% dos contatos viram alunos (40% × 50%). Um "R$ 64 para cada R$ 1" cria uma expectativa que o gestor não vai cumprir. Sugestão: começar pelo faturamento do 1º mês e usar taxas conservadoras, ajustáveis por cliente.
- **"Retorno acima do investido" não é lucro.** É faturamento menos anúncio: não desconta instrutora, aluguel nem a mensalidade da agência.
- **O cliente também abre o simulador.** O número otimista chega direto a ele, sem o gestor para contextualizar ([[perfis-e-modos-de-visao]]).
- **O "custo por contato" mistura objetivos.** `accountTotals` soma os resultados de todas as campanhas (WhatsApp, cadastro, alcance, cliques), mas o funil chama tudo de "Contatos no WhatsApp". Só com WhatsApp, a Raro Pilates teria R$ 5,66 ([[metricas-e-calculos]]).
- **As premissas zeram a cada abertura** e não ficam salvas por cliente.
- **Todo o texto é de Pilates:** "aula experimental", "studio", "aluno" ([[nicho-pilates-e-generalizacao]]).
- A seção do resultado inteira é `aria-live`. A cada passo do controle, o leitor de tela relê o bloco todo.

Mudou em 2026-09-25: o modal agora só é montado quando abre. Isso eliminou o `if (!isOpen) return null` antes dos `useState`, que violava a regra dos hooks. Os padrões também mudaram: antes eram agendamento de 45%, mensalidade de R$ 340 e "receita do ano = mês × 12"; agora a permanência é um controle próprio.
