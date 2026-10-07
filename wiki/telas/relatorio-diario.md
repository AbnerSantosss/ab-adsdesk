---
tipo: tela
atualizado: 2026-10-07
tags: [tela, relatorio, diario, whatsapp, email, impressao]
---

# Relatório diário

**Arquivos:** `src/components/screens/DailyReports.tsx`, `src/components/modals/SendReportEmailModal.tsx` e `src/components/ui/WhatsAppText.tsx`. Hash `#diario` ("Diário" na barra do celular).

> Mudou em 2026-09-25: o detalhamento estimado (rateio pelo gasto total, com `Math.max(1, …)` inventando resultado) saiu; agora a tela usa o `byObjective` de cada dia. Os textos fixos (R$ 95,00, −10,6%) e o rodapé "Clareza Ads" também saíram: a mensagem assina com o nome da agência (`parentBrand`). Entrou o envio por e-mail.

## Objetivo para o usuário
É a tela que cumpre a promessa central: "quanto foi gasto e quantas pessoas chamaram", sem o cliente precisar perguntar ([[visao-do-produto]]). Para o gestor, é a mensagem pronta para mandar todo dia.

## O que aparece
1. **Cabeçalho** neutro, com foto local ilustrativa, "Instagram & Facebook" e o botão "Imprimir ou salvar PDF" (`window.print()`). A identificação das plataformas é contextual, sem dados separados por canal.
2. **Faixa de dias:** um botão por dia do histórico, com data e investimento. O mais recente se chama "Último" e já vem selecionado; os outros mostram o dia da semana.
3. **KPIs do dia:**
   - Investimento, com a dica "média dos N dias anteriores: R$ X";
   - resultados e Custo por resultado, com a variação "vs. média dos N dias anteriores". A média vem de `weekBefore`: até 7 dias **antes** do dia escolhido. O dia mais antigo do histórico fica sem comparação;
   - Alcance, com os cliques na dica.
4. **"Por tipo de campanha":** investimento, resultados e custo de cada objetivo naquele dia. Se o dia não tiver esse detalhe: "O detalhamento por tipo de campanha não está disponível para este dia."
5. **"Destaques do dia":** a campanha que mais trouxe resultados e o anúncio destaque.
6. **"Mensagem para o cliente"** (só gestor): um balão no estilo do WhatsApp e três botões ([[compartilhamento-whatsapp]]):
   - "Abrir no WhatsApp": `wa.me/?text=`, e o gestor escolhe o contato;
   - "Copiar texto";
   - "Enviar por e-mail".

Os quatro KPIs usam a mesma superfície branca e ícones grafite, sobre o fundo branco gelo da aplicação. Detalhamento, destaques e mensagem usam camadas neutras; o dia selecionado recebe o acento da marca. Cores de variação e estado continuam acompanhadas de texto. A ação WhatsApp conserva seu verde identificável. Essa apresentação conserva valores, comparação com dias anteriores, permissões de envio e impressão; não acrescenta envio automático. Ver [[cores-e-hierarquia-visual]].

## A mensagem (`dailyReportMessage`)
Traz, com `*negrito*` do WhatsApp:
- título com o nome do negócio e a data por extenso;
- investimento, resultados e custo por resultado, com "(média dos N dias anteriores: R$ X)";
- a lista por tipo de campanha e o destaque do dia;
- "Qualquer dúvida, é só responder esta mensagem." e a assinatura com `parentBrand` ([[personalizar-marca]]).

`WhatsAppText` mostra o texto como ele aparece na conversa.

## Envio por e-mail
A janela "Enviar relatório por e-mail" tem Para, Assunto ("Relatório de DD/MM · negócio", até 160 caracteres) e a mensagem, que não pode ser editada. O servidor do Vite (`server/email.ts`, só com `npm run dev` ou `preview`) envia pelo SMTP do `.env.local` e transforma o `*negrito*` em HTML. Depois do primeiro envio, o destinatário fica guardado por conta neste navegador. Limites e variáveis em [[envio-de-email-smtp]].

## Gestor × cliente
O cliente vê o relatório do dia (KPIs, tipos e destaques) e pode imprimir, mas não vê a mensagem nem os botões de envio. O subtítulo também muda para ele: "Quanto foi investido e quantos contatos chegaram em cada dia."

## No celular
- Os dias rolam na horizontal.
- KPIs em 2 colunas (4 a partir de `xl`).
- A tabela por tipo vira lista.
- A caixa da mensagem desce para baixo do relatório; só fica ao lado, e presa na rolagem, a partir de `lg`.
- Na impressão, somem a faixa de dias, a mensagem, a navegação e o rodapé.

## De onde vêm os dados
Do `dailyHistory` da conta ([[dados-mock]]). No mock, a Raro Pilates tem 7 dias (17 a 23/09/2026), com `byObjective`, `topCampaignName` e `topCreativeName` escritos à mão. Numa conta real, sem histórico, aparece o `ApiAccountNotice`.

## Armadilhas
- **A média é dos dias anteriores, não da semana mais recente.** Antes da correção de 2026-09-25, um dia antigo era comparado com dias que vieram depois dele. Tela e mensagem usam a mesma função (`weekBefore`); mantenha assim ([[metricas-e-calculos]]).
- **O destaque do dia é escrito à mão no mock** (`topCreativeName`) e não bate com o nome exato do anúncio ([[bugs-conhecidos]]).
- Os resultados do dia somam objetivos diferentes, e o rótulo da conta ("Contatos gerados") esconde isso.
- Aberto pelo celular na rede local, o servidor recusa o e-mail (403) e a janela explica que o envio só funciona no computador onde o painel está rodando, oferecendo copiar o texto. Só `EMAIL_ALLOW_REMOTE=true` libera ([[envio-de-email-smtp]]).
- A dica "Para mudar o texto, escolha outro dia no relatório" só aparece quando o e-mail **não** está configurado.
- **O envio ainda é manual:** alguém precisa abrir a tela e clicar.

## A maior oportunidade do produto
Para cumprir a promessa "sem ficar perguntando", o relatório precisa **chegar sozinho**:
- agendamento diário (ex.: 8h, com os dados de ontem);
- envio pelo backend, por WhatsApp (Cloud API/BSP) ou e-mail;
- link para o painel no próprio relatório.

Ver [[pontos-de-melhoria]].
