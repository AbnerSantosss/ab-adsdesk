---
tipo: decisao
atualizado: 2026-09-25
tags: [negocio, nicho, pilates, generalizacao, textos]
---

# Nicho Pilates e generalização

O protótipo foi construído em torno de **um cliente real ou de referência: Raro Pilates** ([[dados-mock]]). Isso deixou o produto bom para demonstração a estúdios, mas **acoplado ao nicho**. A refatoração de 2026-09-25 ([[refatoracao-ux-2026-09-25]]) tirou boa parte desse acoplamento; o que sobrou está abaixo.

## Onde o Pilates ainda está fixo
| Onde | Exemplo |
|---|---|
| [[simulador-roi]] | "Novos alunos", "Aulas experimentais que viram matrícula", "Custo por aluno", "Tempo médio que o aluno fica", aviso "variam de studio para studio" |
| Descrições de objetivo (`src/lib/objectives.ts`) | WhatsApp: "Anúncios que abrem uma conversa direto com a recepção."; conversões chamadas de "Vendas e matrículas online" |
| Checagem de WhatsApp da [[auditoria-transparencia]] (`src/lib/metrics.ts`) | "As conversas iniciadas pelos anúncios chegam direto na recepção." |
| Avatar da conta ([[cabecalho-e-navegacao]]) | ícone próprio quando `logoKey === 'raro-pilates'` (`RaroPilatesIcon.tsx`) |
| [[dados-mock]] | campanhas "Aula Experimental - Raio 3km", públicos nos Jardins e em Pinheiros |
| [[personalizar-marca]] | link padrão do cliente termina em `/cliente/raropilates` |

**Já ficou neutro:** a [[tela-login]] (exemplo "Contatos na semana", sem "vivabem-pilates" nem "Raio 3km Jardins SP"), os textos da auditoria (sem "ninguém viaja 25 km"), o resumo "Em poucas palavras" da [[visao-geral]], que é montado a partir dos números, e o selo de custo em [[campanhas]], que deixou as faixas fixas 6/10. O ícone da conta deixou de depender de o nome conter "Raro", e o logo completo `RaroPilatesLogo.tsx` foi apagado.

## Por que importa
- **O julgamento de custo já não pune outros nichos:** o selo compara cada campanha com a média da própria conta. A conta demo **Harmonize** (clínica de estética, perto de R$ 16 por contato) antes caía em "Atenção" pela faixa de Pilates; agora é avaliada contra ela mesma. A armadilha voltaria se alguém reintroduzisse faixas em reais.
- **A comparação relativa tem limite:** ela diz qual campanha está melhor ou pior dentro da conta, mas não diz se a conta toda está cara para o mercado. Para isso seria preciso uma referência por nicho, e não há números confiáveis no projeto hoje.
- **Vocabulário ainda soa de studio:** "alunos", "aula experimental", "matrícula" e "recepção" soam estranhos para clínica, restaurante ou loja. O simulador é onde isso mais aparece, e é justamente a tela que fala de dinheiro.

## Estratégias
1. **Começar vertical, de propósito:** vender primeiro para estúdios de Pilates, yoga e academias boutique. Os textos já servem, e o case Raro Pilates vira prova social. Menor esforço.
2. **Parametrizar por "perfil de nicho":** um objeto de configuração por nicho com:
   - vocabulário (aluno/paciente/cliente, aula/consulta/visita, recepção/atendimento);
   - funil padrão do simulador (etapas e taxas iniciais);
   - rótulo do resultado (hoje já existe um por conta: "Contatos gerados");
   - textos das descrições de objetivo e da auditoria;
   - referência de custo, se um dia houver dado confiável.

   O gestor escolhe o nicho ao cadastrar o cliente.
3. **Genérico total:** textos neutros. Perde o encanto de falar a língua do cliente, que é justamente o diferencial para o leigo ([[glossario-sem-jargao]]).

**Sugestão:** 1 agora e 2 como evolução ([[pontos-de-melhoria]]). O primeiro passo barato do 2 é o simulador, que concentra quase todo o vocabulário de studio.
