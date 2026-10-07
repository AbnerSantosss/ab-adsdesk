---
tipo: integracao
atualizado: 2026-10-07
tags: [integracao, meta, graph-api, marketing-api, oauth, token, insights]
---

# Meta Graph API (Marketing API)

**Implementação:** `src/services/metaGraphApi.ts`, contrato em `src/types/metaReport.ts`, conexão em `MetaConnectionPanel` e exibição em `MetaReports`. O gestor configura a conta em [[configuracoes]]. A integração faz consultas de leitura diretamente do navegador e importa relatórios; não cria, pausa ou altera anúncios.

**Limite da evidência:** a implementação pode consultar uma conta autorizada, mas a revisão de 2026-10-07 não conectou uma conta real nem utilizou token do usuário. Testes com respostas controladas não demonstram acesso concedido pela Meta nem validam números de uma conta de produção.

## Versão e contrato

`META_GRAPH_API_VERSION` está fixada em `v26.0`. A Meta lista o lançamento em 29/07/2026. Em 07/10/2026, a tabela da Marketing API mostra v25/v26 disponíveis e v24 encerrada em 06/10/2026. Não confundir esse ciclo com o da Graph API geral, que ainda lista v23 até 08/10/2027. [Changelog oficial](https://developers.facebook.com/docs/graph-api/changelog/).

| Função | Responsabilidade |
| --- | --- |
| `fetchMetaAccount` | Consulta apenas metadados; mantida para consumidores que não precisam de insights |
| `fetchMetaDashboard` | Consulta conta, totais, dias, campanhas, anúncios e metadados dos criativos; retorna sucesso somente após concluir todas as etapas |
| `defaultMetaReportRange` | Monta os últimos 30 dias corridos inclusivos, terminando hoje no fuso da conta |
| `normalizeAccountId` | Aceita números ou prefixo `act_`; exige pelo menos cinco dígitos |
| `buildConnectedAccount` | Cria a conta real sem copiar campanhas ou histórico do mock |
| `saveMetaConfig` / `getSavedMetaConfig` / `removeMetaConfig` | Gerenciam token em memória e `sessionStorage`; removem o legado persistente |

A conexão inicial importa 30 dias, incluindo o dia atual, que pode estar incompleto. Depois, o calendário pode solicitar outro intervalo, com máximo de 366 dias por importação. A mudança de período faz uma nova consulta: não recorta um total anterior e não soma alcances diários para produzir alcance único.

## O que é consultado

Todas as requisições usam `GET https://graph.facebook.com/v26.0/...` e `Authorization: Bearer ...`. O token não entra na URL. O serviço não segue redirecionamentos e constrói as URLs em uma origem fixa.

| Caminho | Consulta |
| --- | --- |
| `/{act_id}` | `id,name,business_name,account_status,currency,amount_spent,timezone_name` |
| `/{act_id}/insights`, nível `account`, `time_increment=all_days` | Total do intervalo, inclusive alcance único da conta |
| `/{act_id}/insights`, nível `account`, `time_increment=1` | Valores de cada dia retornado |
| `/{act_id}/insights`, nível `campaign` | Métricas e identificação por campanha |
| `/{act_id}/insights`, nível `ad` | Métricas e identificação por anúncio |
| `/{act_id}/campaigns` | Nome, objetivo e estado efetivo atuais |
| `/{act_id}/ads` | Nome, campanha, estado e `creative{id,name,title,body,image_url,thumbnail_url,video_id}` |

Os insights pedem `date_start,date_stop,spend,impressions,clicks,reach,actions`, com `action_breakdowns=action_type` e `action_report_time=impression`. A janela de atribuição não é escolhida pelo usuário nesta interface. Comparações com o Gerenciador de Anúncios precisam conferir período, fuso, atribuição, coluna e nível de agregação equivalentes. Não há detalhamento por plataforma ou posicionamento; “Instagram e Facebook” identifica a integração, não dois resultados separados.

Metadados de campanhas e anúncios não recebem o filtro de datas dos insights. O relatório une IDs encontrados nos metadados e nas métricas; portanto, pode listar objetos sem métricas no intervalo. Estado e objetivo são os atuais, não uma reconstrução histórica. Não são importados conjuntos, segmentações, públicos, orçamento diário, provas de Pixel/WhatsApp ou origem “Turbinar”.

## Integridade dos números

- Valores ausentes ou inválidos permanecem `null`; a interface usa travessão. Uma resposta vazia não vira zero nem recebe dados de exemplo.
- Dias ausentes não são inventados. `isEmpty` significa que a consulta de total não retornou linhas.
- Alcance do período vem de uma única linha de insights no nível da conta. Mais de uma linha nessa consulta causa erro, em vez de somar pessoas repetidas.
- `amount_spent` é gasto desde a criação da conta, na menor unidade da moeda, convertido por `Intl`. O `spend` dos insights já é a unidade da moeda e pertence ao intervalo. Não misturar os dois.
- Cliques, alcance, conversas, cadastros e compras são métricas distintas. O painel não os soma como “contatos únicos”.
- `actions` conserva tipos retornados, elimina repetição do mesmo `action_type` e seleciona um alias por família; não soma aliases agregados e suas fontes.

Prioridades atuais, na ordem:

| Família | `action_type` selecionado |
| --- | --- |
| Conversas | `onsite_conversion.messaging_conversation_started_7d`, `onsite_conversion.messaging_conversation_started`, `messaging_conversation_started_7d` |
| Cadastros | `lead`, `onsite_conversion.lead_grouped`, `offsite_conversion.fb_pixel_lead`, `onsite_conversion.lead` |
| Compras | `omni_purchase`, `purchase`, `offsite_conversion.fb_pixel_purchase`, `app_custom_event.fb_mobile_purchase` |

A primeira ação presente prevalece; seu valor pode continuar ausente. Essa seleção evita a soma conhecida de aliases sobrepostos, mas não é uma deduplicação de pessoas entre métricas. Novos tipos não reconhecidos permanecem em `actions` e não são reclassificados por suposição. Ver [[modelo-de-dados]].

## Paginação, falhas e cancelamento

O serviço solicita páginas de 100 linhas, percorre apenas `paging.cursors.after` e reconstrói a requisição. Nunca reutiliza `paging.next`, que pode conter token. Cada coleção tem limite de 100 páginas e 10.000 linhas; atingir o limite causa erro explícito, sem truncar nem aplicar parte do relatório.

Uma requisição tem prazo de 30 segundos; a importação inteira, três minutos. Datas inválidas, IDs duplicados, datas repetidas, respostas malformadas e cursores ausentes/repetidos interrompem a operação. Não há consulta assíncrona de relatórios grandes nem repetição automática das chamadas.

Fechar a tela de conexão cancela a importação. Sair ou desconectar cancela a atualização. Uma falha de atualização preserva o último snapshot concluído; a interface informa que os dados anteriores continuam visíveis. Os códigos de erro são traduzidos para token, permissão, consulta recusada, limite ou indisponibilidade. A mensagem remota bruta não é exibida, pois pode repetir parâmetros sensíveis.

## Token, armazenamento e permissões

O token fica em memória e em `sessionStorage`, na chave `clareza_meta_api_config`. Não existe mais “Lembrar neste navegador” para credenciais. Ao ler a configuração, a implementação remove o registro legado de token no `localStorage` sem ler ou migrar seu conteúdo. Sair e desconectar removem credenciais e snapshot da conta conectada.

O snapshot sem token fica em `ab_adsdesk_connected_account` no `localStorage`, para reabrir a última importação. Fechar a aba não apaga esse snapshot. Ele não é um banco seguro, não sincroniza computadores e não comprova que o token continua válido. Se a sessão acabar, o gestor precisa informar novamente o token para atualizar. O armazenamento do navegador pode ser bloqueado ou ficar sem espaço; nesse caso, a cópia em memória continua durante a execução, sem garantia de persistência.

O escopo necessário é `ads_read`, além do acesso do titular do token à conta. O usuário do sistema precisa receber o ativo e a tarefa de análise; um token válido com escopo correto pode não ter acesso à conta escolhida. Não é preciso pedir `ads_management` para este painel de leitura. [Permissões de usuário do sistema](https://developers.facebook.com/docs/marketing-api/businessmanager/systemuser/permissions), [autorização da Marketing API](https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization).

Conta própria e acesso a contas de terceiros têm requisitos distintos. Standard/Advanced Access são níveis das permissões; o Marketing API Access Tier Limited/Full é outro mecanismo, ligado a limites e capacidade. Apps para clientes precisam cumprir revisão e requisitos aplicáveis, inclusive verificação empresarial para Advanced Access. Um token colado no painel não substitui essas aprovações. [Autorização, atualizada em 05/05/2026](https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization), [referência de permissões](https://developers.facebook.com/docs/permissions/reference/ads_read/).

Tokens podem expirar ou ser revogados. Tokens curtos de usuário geralmente duram uma ou duas horas; conferir o valor real no depurador. A documentação detalhada de sistema recomenda validade de 60 dias, e algumas empresas precisam obrigatoriamente usá-la. “Sem data de expiração”, quando disponível, não significa irrevogável. O painel não renova tokens. [Autenticação, atualizada em 24/06/2026](https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authentication), [geração, renovação e revogação de tokens](https://developers.facebook.com/docs/marketing-api/system-users/install-apps-and-generate-tokens).

## Telas e limites de produto

`App.tsx` encaminha contas reais para `MetaReports` nas cinco abas de análise. As contas de demonstração continuam usando suas telas próprias. Contas antigas, sem `apiReport`, recebem orientação para importar em Configurações.

- Visão geral real: investimento, impressões, cliques, alcance único, investimento diário e ações separadas. O destaque é o anúncio com mais cliques, com esse critério escrito; não se apresenta como o melhor anúncio de conversão.
- Campanhas e anúncios reais: métricas importadas e estado atual. Prévias usam imagem ou miniatura devolvida pela Meta; se ausentes ou em erro, mostram indisponibilidade. Não entram fotos ilustrativas locais como substitutas.
- Diário real: tabela e impressão/PDF do navegador. Não oferece envio por e-mail ou WhatsApp nesta versão.
- Auditoria real: mostra a última leitura concluída; Pixel, WhatsApp e origem “Turbinar” ficam não verificados. Não calcula nota automática de saúde com dados ausentes.

Só cabe uma conta real por vez; conectar outra substitui a anterior no navegador. A configuração é acessível ao gestor na visão de gestor; o cliente e “ver como cliente” não recebem formulário nem atualização. Essas guardas são de interface: o login continua sendo demonstração, sem autorização no servidor.

Não há backend Meta, OAuth/Login com Facebook, armazenamento cifrado de tokens, agendamento, sincronização multiusuário ou validação de produção. Para produção, esses recursos precisam ser implementados no servidor, com autorização por conta e política de retenção. A integração de SMTP existente é separada e não resolve esses pontos. Ver [[configuracoes]] e [[o-que-e-simulado]].

## Referências oficiais e data da pesquisa

As páginas Meta acima foram verificadas em **07/10/2026**; quando a ferramenta de busca recebeu 429, a consulta pública HTTP direta retornou o conteúdo oficial. A [coleção oficial Meta no Postman](https://www.postman.com/meta/facebook-marketing-api/collection/0zr4mes/facebook-marketing-api-mapi) foi usada como apoio para requisitos e ID da conta. Em divergência sobre duração de token ou nomenclatura, prevalecem as páginas específicas atuais da Meta, não uma promessa genérica de token permanente.