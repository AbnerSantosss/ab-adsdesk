---
tipo: risco
atualizado: 2026-10-07
tags: [riscos, mock, simulado, divida-tecnica, verdade, meta-api]
---

# O que é simulado (inventário)

O produto tem **contas de demonstração e uma integração de leitura com a Meta**. A origem de cada tela precisa ser explícita. A implementação da API não significa que uma conta de produção já foi conectada: a revisão de 2026-10-07 não usou token real do usuário nem comprovou números ao vivo.

A refatoração de 2026-09-25 retirou o selo de conexão sempre aceso, a sincronização que só mudava horário, o botão de pausar sem efeito e a alegação de criptografia sem implementação. Em 2026-10-07, a importação passou a trazer insights em um contrato separado do mock. A conexão só é concluída depois de todas as consultas necessárias responderem; nenhum relatório parcial ou dado de exemplo preenche lacunas reais.

## Implementado

| Recurso | O que funciona | Limite |
| --- | --- | --- |
| Navegação e apresentação | Cinco abas de análise, Configurações para gestor, filtros do mock e calendário de relatórios | Guardas de perfil existem só na interface |
| Cálculos da demonstração | Totais, custos, variações, resumo e nota calculados a partir do mock | A entrada continua fictícia |
| Importação Meta | Conta, totais, dias, campanhas, anúncios, imagens/miniaturas disponíveis; API v26.0 somente leitura | Requer token e acesso concedidos pela Meta; não comprovado ao vivo nesta revisão |
| Período real | Primeira importação de 30 dias inclusivos no fuso da conta; depois até 366 dias por consulta | Hoje pode estar incompleto; não existe agendamento |
| Integridade da importação | Paginação, erros explícitos, preservação do snapshot anterior, ausência como `null` | Máximo de 100 páginas/10.000 linhas por coleção; sem consulta assíncrona para relatórios grandes |
| Impressão real | Imprimir/salvar PDF pelo navegador sobre o snapshot selecionado | Não oferece envio real por e-mail/WhatsApp no fluxo `MetaReports` |
| Relatório diário de demonstração | Copiar, abrir WhatsApp, imprimir e SMTP quando o servidor local está configurado | O envio pode ser real com conteúdo mock; não equivale ao relatório Meta integrado |
| Simulador | Matemática e premissas ajustáveis | É uma projeção; não importa matrículas/receita reais |
| Marca | Nome, ícone, cor e rodapé no navegador | Não distribui a marca a outros usuários/computadores |

## Demonstração ou ainda não disponível

| Funcionalidade | Estado honesto | Página |
| --- | --- | --- |
| Login | Perfis de exemplo entram com qualquer senha; sem autenticação no servidor | [[tela-login]] |
| Perfis e isolamento | Sessão em JSON no navegador; guardas de UI não são autorização de produção | [[perfis-e-modos-de-visao]] |
| Raro Pilates e Clínica Harmonize | Campanhas, anúncios, histórico e auditoria vêm de `src/data/mockData.ts` | [[dados-mock]] |
| Datas da amostra | O histórico do mock é fixo; o calendário real pode selecionar dias sem registros | [[visao-geral]] |
| Fotos nas contas demo | 11 imagens ilustrativas geradas por IA; vídeo, carrossel e Reel continuam com prévia estática | [[anuncios]] |
| Imagens em conta real | Somente `image_url` ou `thumbnail_url` retornadas; ausência tem aviso, sem substituir por foto gerada | [[meta-graph-api]] |
| Desempenho em queda | `FATIGUE` vem pronto do mock; não existe detector de fadiga na importação real | [[anuncios]] |
| Auditoria de Pixel/WhatsApp | Valores do mock na demo; não verificados na conta real | [[auditoria-transparencia]] |
| Origem Gerenciador/Turbinar | Marcada no mock; não inferida para campanhas reais | [[meta-graph-api]] |
| Saúde da conta real | Sem nota automática; a consulta não comprova todos os requisitos | [[meta-graph-api]] |
| Destaque real | Anúncio com mais cliques, com regra explícita; não é melhor conversão/menor custo universal | [[meta-graph-api]] |
| Metas, público e conjuntos reais | Não importados nesta versão | [[modelo-de-dados]] |
| Métricas por Instagram/Facebook | A conta de anúncios pode abranger plataformas; não há detalhamento por plataforma/posicionamento | [[meta-graph-api]] |
| Contatos únicos | Não calculados somando conversas, leads, compras, cliques ou alcance | [[modelo-de-dados]] |
| Login com Facebook/OAuth | Não implementado; conexão por ID e token manual | [[configuracoes]] |
| Renovação de token | Manual; token pode expirar ou ser revogado | [[configuracoes]] |
| Backend Meta e multiusuário | Inexistentes; token de sessão e snapshot local não são infraestrutura de produção | [[meta-graph-api]] |
| Várias contas reais | Só uma conta real salva por navegador; conectar outra substitui a anterior | [[configuracoes]] |
| White-label para cliente | Marca só local; link do cliente é texto copiável sem rota correspondente | [[personalizar-marca]] |
| E-mail em site estático | `dist/` sozinho não tem servidor SMTP | [[envio-de-email-smtp]] |

## Como distinguir os dados reais

`App.tsx` escolhe `MetaReports` quando `account.isRealApi` é verdadeiro. O snapshot guarda período, fuso, moeda, versão e instante da importação. Durante uma atualização, a tela continua mostrando o último snapshot concluído com aviso; ela não comunica que os dados já foram renovados.

A consulta inicial pode ter acesso válido e nenhum total no período. Nessa situação, a UI informa ausência de veiculação retornada; não inventa zeros. Contas legadas sem `apiReport` pedem importação em Configurações. Campanhas sem métricas podem constar como metadados atuais.

Conversas, cadastros e compras usam uma ação priorizada de cada família; aliases sobrepostos não são somados. Isso evita uma duplicação conhecida de tipos de ação, mas não demonstra pessoas únicas. Alcance único vem diretamente da consulta no nível da conta, nunca da soma de dias.

A desconexão remove token e snapshot deste navegador; não revoga o token na Meta. Fechar a aba encerra a sessão da credencial, mas o snapshot local pode permanecer. Sair pelo app também remove o snapshot. O usuário deve saber que os dados exibidos após reabrir são da última importação, não de uma atualização automática.

## Como usar esta lista

- Em demonstração, identificar a conta de exemplo. Apresentar a integração como implementada e dependente de autorização, sem alegar uma conexão real que não foi executada.
- Depois de uma conexão autorizada, comparar período, fuso, moeda, atribuição e números com o Gerenciador de Anúncios antes de afirmar equivalência dos relatórios.
- Registrar separadamente testes controlados, teste ao vivo e limitações. Lint/build aprovados não provam acesso a uma API externa.
- Atualizar esta página quando um limite for resolvido, junto da página funcional e de `wiki/log.md`.
- Nunca transformar valor ausente, erro, horário local ou dado de exemplo em prova de resultado da Meta.