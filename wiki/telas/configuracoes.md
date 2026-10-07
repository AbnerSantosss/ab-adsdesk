---
tipo: tela
atualizado: 2026-10-07
tags: [tela, configuracoes, meta-api, conexao, token, importacao]
---

# Configurações

**Arquivos:** `src/components/screens/Settings.tsx` e `src/components/ui/MetaConnectionPanel.tsx`. Hash `#configuracoes`, aba `SETTINGS`. Centraliza a conexão com a Meta, ajuda para preparar o acesso e atalho de [[personalizar-marca]]. Substitui a entrada antiga de [[modal-conectar-meta]].

## Quem acessa

A aba aparece somente para `AGENCY_MANAGER` na visão `MANAGER`. O cliente e o gestor em “ver como cliente” não podem configurar ou atualizar a conexão. Acessar diretamente o hash sem esse modo redireciona à Visão geral. Trata-se de uma guarda da interface; o login atual continua sendo de demonstração, sem autenticação de produção no servidor.

## Passo a passo para o gestor

A tela usa quatro etapas, com links oficiais que abrem em outra aba:

1. **Confira a conta e o seu acesso.** Abra o [Gerenciador de Anúncios](https://adsmanager.facebook.com/), escolha a conta correta e copie seu ID numérico. É o identificador da conta de anúncios, não da Página, perfil do Instagram ou portfólio empresarial. O ID também aparece depois de `act=` na URL. Confirme que seu usuário pode consultar seus relatórios.
2. **Prepare o aplicativo da Meta.** Abra [Seus aplicativos](https://developers.facebook.com/apps/), crie ou selecione um app habilitado para Marketing API e confira seu vínculo ao negócio. Para conta própria, verifique Standard Access; para outros negócios, verifique Advanced Access e os requisitos de revisão. Esses nomes de permissão não são o mesmo que o nível Limited/Full da Marketing API.
3. **Gere um token com `ads_read`.** No [Graph API Explorer](https://developers.facebook.com/tools/explorer/), selecione o app correto, escolha token de usuário, adicione `ads_read` e gere a credencial. Para a operação com usuário do sistema, abra [Usuários do sistema](https://business.facebook.com/settings/system-users), associe o app e atribua a conta de anúncios com acesso de análise. O escopo do token e a atribuição do ativo precisam estar corretos; um não substitui o outro.
4. **Conecte e confira os números.** Use o [Depurador de token](https://developers.facebook.com/tools/debug/accesstoken/) para conferir app, permissões e validade. No formulário do painel, informe o ID e cole o token; clique **Conectar e importar dados**. A importação inicial usa os últimos 30 dias corridos inclusivos, no fuso da conta. Compare o resultado com o Gerenciador de Anúncios antes de usá-lo em um relatório para cliente.

O passo a passo se baseia na documentação oficial de [autorização](https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authorization) e [autenticação](https://developers.facebook.com/documentation/ads-commerce/marketing-api/get-started/authentication), verificadas em 07/10/2026. Os nomes dos menus externos podem mudar. Nenhum destes links concede acesso sozinho, e a aplicação não cria o app, o usuário de sistema ou o token automaticamente.

## Uso do formulário

O ID aceita números ou `act_` e precisa de pelo menos cinco dígitos. O token aparece em campo de senha, com botão mostrar/ocultar; não se deve colar a senha do Facebook. Não é solicitado App Secret.

Durante a importação, campos e envio ficam desabilitados e uma mensagem de progresso mostra a etapa. `fetchMetaDashboard` valida primeiro conta e fuso e depois lê as coleções do relatório. Ao sair da tela, `AbortController` cancela a operação. O token só é salvo após todas as consultas terminarem com sucesso.

Depois do sucesso, o painel mostra nome/ID, período, horário da leitura e quantidades de campanhas, anúncios e dias retornados. “Validar e importar novamente” repete a importação inicial de 30 dias. Para outro período, use o calendário nas abas do relatório real, com limite de 366 dias. O período exibido pertence ao último snapshot concluído, inclusive durante uma atualização pendente ou com erro.

**Sem veiculação retornada** é um sucesso de acesso com ausência de linhas de total no intervalo, não prova de investimento zero. Campanhas/anúncios podem existir como metadados sem métricas de período. Nada é preenchido com números de demonstração.

## O que a conexão entrega

- Totais de investimento, impressões, cliques e alcance único; série diária.
- Campanhas e anúncios, com estado/objetivo atuais e métricas do intervalo.
- Conversas, cadastros e compras como métricas distintas, quando retornados.
- Imagens ou miniaturas que a Meta disponibilizar; ausência de mídia tem aviso explícito.
- Impressão do relatório real pelo navegador.

Não comprova Pixel, vínculo de WhatsApp, origem “Turbinar” ou saúde da conta. Não separa métricas entre Instagram e Facebook por posicionamento. Não importa conjuntos/públicos. Não publica, pausa ou edita campanhas. Detalhes de endpoints e integridade em [[meta-graph-api]].

## Credencial, snapshot e desconexão

O token fica somente em memória e `sessionStorage`; não existe opção “Lembrar” para ele. Sair ou desconectar limpa token e snapshot. “Desconectar” remove o acesso armazenado neste aplicativo, **não revoga o token na Meta**.

A última conta/relatório, sem token, permanece no `localStorage` ao fechar a aba. Pode ser lida novamente, mas atualizar exige token válido. Há somente uma conta real por navegador; conectar outra substitui essa conta. Não há compartilhamento seguro com outros computadores, gestores ou clientes.

Tokens podem expirar ou ser revogados. A Meta recomenda tokens de sistema com validade e algumas empresas são obrigadas a usá-los; não prometer uma opção “Nunca” universal. [Gerar, renovar e revogar tokens de sistema](https://developers.facebook.com/docs/marketing-api/system-users/install-apps-and-generate-tokens).

## Ajuda e limitações

| Situação | Orientação |
| --- | --- |
| Token inválido ou expirado | Conferir o app e a validade no depurador; gerar outro token quando necessário |
| Permissão insuficiente | Conferir `ads_read`, acesso à conta e nível de acesso do app |
| Consulta recusada/ID incorreto | Confirmar o ID da conta e os campos suportados; erro 100 não prova sozinho que a conta inexiste |
| Resposta vazia | Selecionar um período em que houve veiculação, sem inventar métricas |
| Rede ou bloqueador | Conferir internet e bloqueios a `graph.facebook.com` |
| Limite ou relatório grande | Aguardar quando houver limite da Meta; reduzir o período em consultas grandes |

O painel é uma integração local por token, sem OAuth/Login com Facebook, backend Meta, renovação automática, agendamento ou autenticação real. O armazenamento de sessão reduz a persistência, mas não torna a credencial inacessível a scripts do navegador. A revisão de 2026-10-07 não utilizou um token do usuário e não comprova uma conexão de produção concluída. Ver [[o-que-e-simulado]].

## Layout

Dois blocos principais no desktop: orientação e formulário; no celular, uma coluna. Ajuda e marca ficam abaixo. Mantém branco gelo, superfícies neutras e foco visível, conforme [[cores-e-hierarquia-visual]]. Verificar 375, 768 e 1280 px, campos longos, erro, carregamento e navegação por teclado após alterações.

## Documentação relacionada

- Entrada, rotas e permissão: [[cabecalho-e-navegacao]], [[perfis-e-modos-de-visao]] e [[estado-e-navegacao]].
- Contratos e interpretação: [[modelo-de-dados]], [[metricas-e-calculos]] e [[meta-graph-api]].
- Credencial, retenção e isolamento: [[persistencia-localstorage]] e [[seguranca]].
- Apresentação dos dados importados: [[visao-geral]], [[campanhas]], [[anuncios]], [[relatorio-diario]] e [[auditoria-transparencia]].
