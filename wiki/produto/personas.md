---
tipo: conceito
atualizado: 2026-09-25
tags: [produto, personas, usuarios, publico-alvo]
---

# Personas

O app tem dois perfis de usuário no código (`UserRole` em `src/types/auth.ts`), mais o dono do software. Na interface eles aparecem como **"Gestor da agência"** e **"Cliente"**. Veja como viram permissões em [[perfis-e-modos-de-visao]].

## 1. Dono de negócio leigo: `CLIENT_VIEWER` ("Cliente")
- **Exemplo no demo:** Camila Rocha, dona do estúdio **Raro Pilates** (conta `act_raro_pilates`). Entra pelo formulário da [[tela-login]], com o e-mail de demonstração dela; a entrada rápida da tela é só do gestor. Na demonstração comercial, o gestor mostra a visão dela com "Ver painel como".
- **Quem é:** dono de estúdio, clínica ou comércio local. Paga um gestor de tráfego, não entende o Gerenciador de Anúncios e usa mais o celular.
- **Dores:**
  - "Não sei se meu dinheiro está virando cliente."
  - "Tenho medo de que só estejam turbinando post" ([[profissional-vs-turbinar]]).
  - "Tenho vergonha de ficar cobrando o gestor."
- **O que precisa ver:** quanto gastou, quantas pessoas chamaram, quanto custou cada uma e se isso é bom ou ruim, em português simples ([[glossario-sem-jargao]]).
- **O que o app entrega a ele:**
  - só a própria conta: o seletor de conta é apenas leitura;
  - sempre a visão simplificada (`CLIENT`), sem métricas técnicas;
  - "Simulador de retorno" e "Sair" no menu;
  - "Imprimir ou salvar PDF" no relatório diário;
  - link "Falar com" a agência, que abre o WhatsApp dela, no rodapé;
  - navegação pensada para o celular ([[interface-e-responsividade]]).
- **O que ele não tem:** os botões de enviar o relatório (WhatsApp, copiar, e-mail). Quem manda o relatório é o gestor.

## 2. Gestor de tráfego ou agência: `AGENCY_MANAGER` ("Gestor da agência")
- **Exemplo no demo:** Abner Senna, da AB Software.
- **Quem é:** profissional que administra várias contas de anúncio de clientes pequenos.
- **Dores:**
  - interrupções constantes pedindo status;
  - dificuldade de provar que o trabalho é profissional;
  - montar relatório na mão todo dia.
- **O que ganha com o app:**
  - "Ver painel como" Gestor ou Cliente. Na visão de cliente aparece a faixa "Você está vendo o painel como o cliente vê", o que ajuda a conferir antes de mandar o link;
  - relatório do dia pronto para abrir no WhatsApp, copiar ou enviar por e-mail ([[compartilhamento-whatsapp]], [[envio-de-email-smtp]]);
  - painel com a própria marca ([[personalizar-marca]]);
  - conexão com a conta da Meta ([[modal-conectar-meta]]);
  - auditoria com nota calculada e pesos visíveis ([[auditoria-transparencia]]);
  - métricas técnicas (impressões, cliques, CTR, CPC, CPM, frequência) na visão de gestor.

## 3. Dono do software: AB Software
Quem vende a plataforma. Aparece como `parentBrand` (agência padrão do demo), no rodapé "Desenvolvido por", que pode ser desligado, e como assinatura do relatório ([[modelo-saas-white-label]]).

## Perguntas do cliente → onde o app responde
| Pergunta no WhatsApp do gestor | Resposta no app |
|---|---|
| "Quanto gastou ontem?" | [[relatorio-diario]] (ou a mensagem que o gestor mandou) |
| "Está dando resultado?" | "Contatos gerados" e "Custo por resultado" na [[visao-geral]], com o bloco "Em poucas palavras" |
| "O anúncio está no ar?" | situação (Ativa, Pausada, Arquivada) em [[campanhas]] |
| "Para onde vai quem clica?" | "Para onde o contato vai" em [[campanhas]] |
| "Qual anúncio está funcionando?" | "Anúncio campeão" em [[anuncios]] |
| "Você só turbina post?" | "Saúde da conta" e [[auditoria-transparencia]] |
| "Se eu colocar mais dinheiro, volta?" | [[simulador-roi]] |

## Armadilha
Parte dos textos ainda fala com dono de **studio de Pilates**: o simulador usa "novos alunos", "aulas experimentais", "mensalidade" e "studio"; as descrições de objetivo falam em "recepção" e "matrículas". A tela de login e a auditoria já ficaram neutras. Para vender a outros nichos, é preciso parametrizar o que sobrou: [[nicho-pilates-e-generalizacao]].
