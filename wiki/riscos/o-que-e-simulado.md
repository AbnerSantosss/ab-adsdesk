---
tipo: risco
atualizado: 2026-09-25
tags: [riscos, mock, simulado, divida-tecnica, verdade]
---

# O que é simulado (inventário)

> [!danger] Leia antes de demonstrar ou vender
> A interface está pronta, mas os números das campanhas ainda são de demonstração. Esta página é a lista honesta do que é real e do que não é, para não prometer ao cliente algo que não existe.

A refatoração de 2026-09-25 tirou do app as encenações antigas: o selo "Meta Ads Conectado" sempre aceso, o "sincronizar" que só trocava o horário, o botão de pausar que não pausava, o "Criptografia AES-256", a versão da API anunciada errada e os textos fixos com cara de dado. O que continua simulado agora **se declara**: o selo do cabeçalho diz "Dados de demonstração" (só em telas largas; no celular ele some) e o rodapé diz "Fonte: dados de demonstração" ([[cabecalho-e-navegacao]]).

## Real (funciona de verdade)
- Navegação pelas cinco telas, filtros, busca e ordenação sobre os dados carregados ([[estado-e-navegacao]]).
- Todos os cálculos: somas, custo por resultado, variação contra o dia anterior, resumo da visão geral e nota da auditoria ([[metricas-e-calculos]]). As contas estão certas; a entrada é que é mock.
- Leitura da conta na Meta: nome, empresa, situação, moeda, fuso e gasto total, com botão **Atualizar** ([[meta-graph-api]]).
- Relatório diário: copiar, abrir no WhatsApp, imprimir ([[compartilhamento-whatsapp]]) e **enviar por e-mail de verdade**, quando o painel roda com `npm run dev` ou `npm run preview` e o SMTP está configurado ([[envio-de-email-smtp]]).
- Simulador de retorno: a matemática é real; as premissas são ajustáveis pelo gestor ([[simulador-roi]]).
- Marca (nome, logo em texto, cor, rodapé) salva e aplicada no navegador ([[personalizar-marca]], [[persistencia-localstorage]]).

## Simulado
| Funcionalidade | Como é hoje | Página |
|---|---|---|
| Login | Só os e-mails dos perfis de exemplo entram, com qualquer senha; "Esqueci a senha" abre o WhatsApp da agência | [[tela-login]] |
| Perfis e permissões | A sessão é um JSON no navegador; o isolamento do cliente existe só na interface | [[perfis-e-modos-de-visao]] |
| Campanhas, anúncios e histórico | `src/data/mockData.ts`: Raro Pilates e Clínica Harmonize | [[dados-mock]] |
| "Hoje" do painel | Os dias do mock são fixos (17 a 23/09/2026); o último dia não avança com o calendário | [[dados-mock]] |
| Conta conectada pela Meta | Só a situação e o gasto total; as telas mostram "Ainda não importamos..." | [[modal-conectar-meta]] |
| Prévia dos anúncios | Arte ilustrativa (gradiente, título e botão), marcada como tal; não é o criativo real | [[anuncios]] |
| "Desempenho em queda" | O status `FATIGUE` vem pronto do mock | [[anuncios]] |
| Auditoria | A nota é calculada, mas "pixel instalado", "WhatsApp conectado" e a nota do gestor vêm do mock e não podem ser editados | [[auditoria-transparencia]] |
| Destaques do dia | Campanha e anúncio destaque são campos prontos do mock | [[relatorio-diario]] |
| White-label para o cliente | A marca vale só no navegador de quem a salvou; o "link do cliente" é um texto copiável, sem rota por trás | [[personalizar-marca]] |
| E-mail na versão publicada | Não existe: o `dist/` não tem servidor | [[envio-de-email-smtp]] |

## Como usar esta lista
- **Em demo de vendas:** apresente como protótipo navegável, com as contas de demonstração, e mostre a conexão real com a Meta como prova de que a leitura funciona.
- **Para priorizar o desenvolvimento:** veja [[pontos-de-melhoria]]. O item que mais muda o produto é importar `/insights`, porque tira quase todas as linhas da tabela de uma vez.
- **Ao implementar algo:** remova a linha desta tabela e registre em `wiki/log.md`.
- **Não reintroduza encenação.** Selo, horário ou botão que finge funcionar custa mais confiança do que um aviso honesto de "ainda não".
