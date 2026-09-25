---
tipo: integracao
atualizado: 2026-09-25
tags: [integracao, whatsapp, relatorio, notificacao]
---

# Compartilhamento via WhatsApp

Não existe integração com a API do WhatsApp. Tudo usa links `wa.me`, que abrem o WhatsApp de quem clicou com o texto já escrito. O WhatsApp aparece no app de **três jeitos**, e é fácil confundir.

## 1. Destino dos anúncios (dado)
Campanhas de conversa (Click to WhatsApp) levam a pessoa ao WhatsApp da recepção. A tela de [[campanhas]] mostra isso ao cliente pelo campo `conversionDestination` ([[modelo-de-dados]]), só como texto. A [[auditoria-transparencia]] tem o item "WhatsApp conectado à página", que hoje vem do mock (`audit.whatsappConnected`).

## 2. Canal do relatório diário (funcionalidade)
No [[relatorio-diario]], só na visão gestor, o quadro "Mensagem para o cliente" mostra a prévia em balão de WhatsApp e três ações:
- **Abrir no WhatsApp:** `https://wa.me/?text=...`, **sem destinatário**; o gestor escolhe o contato.
- **Copiar texto:** `copyText` (`src/lib/clipboard.ts`) tenta a área de transferência moderna e cai para o método antigo. Se o navegador bloquear, a tela pede para copiar à mão.
- **Enviar por e-mail:** a mesma mensagem, por SMTP ([[envio-de-email-smtp]]).

A mensagem sai de `dailyReportMessage` (`src/lib/metrics.ts`): título em `*negrito*`, data, investimento, resultados com o rótulo da conta (`resultLabel`), custo por resultado com a "média de 7 dias" entre parênteses, bloco "Por tipo de campanha", anúncio destaque, convite para responder e o nome da agência (`parentBrand`) no fim. Não usa emojis nem itálico. A prévia (`src/components/ui/WhatsAppText.tsx`) interpreta só o `*negrito*`.

## 3. Contato com a agência (suporte)
O número `supportWhatsapp` da marca ([[personalizar-marca]]) vira link `wa.me/{número}` com texto pronto em três lugares: "Esqueci a senha" e "Quero conhecer" na [[tela-login]], e o botão de dúvida no rodapé, visível para o perfil cliente.

## Armadilhas
- **Não é automático.** Alguém precisa abrir o painel e clicar todo dia. Isso ainda não cumpre a promessa "sem ficar perguntando" da [[proposta-de-valor]].
- **Sem destinatário.** O telefone do cliente não está cadastrado em lugar nenhum, então o gestor escolhe o contato a cada envio.
- **O número de suporte padrão é fictício** (`5511999999999`). Como a marca fica salva só no navegador de quem a editou, em outro aparelho os links de suporte usam esse número ([[inconsistencias-de-marca]]).
- `*negrito*` só vira negrito dentro do WhatsApp. No e-mail, o servidor converte para HTML; se a mensagem ganhar outra formatação (itálico, listas), as duas pontas precisam ser ajustadas.
- **Link longo:** o texto inteiro vai na URL. Mensagens muito maiores que a atual podem ser cortadas por alguns navegadores.

## Evolução
Destinatário já preenchido, envio agendado, WhatsApp Business Cloud API (template aprovado, opt-in do cliente e custo por conversa) e alertas como "o custo subiu 40% ontem" ou "o saldo está acabando" são os passos que realmente acabam com o "e aí, como estão as campanhas?". Ordem e esforço estão em [[pontos-de-melhoria]].
