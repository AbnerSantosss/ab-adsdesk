---
tipo: decisao
atualizado: 2026-09-25
tags: [negocio, saas, white-label, precificacao, go-to-market]
---

# Modelo SaaS e white-label

## O que o código sugere
O app foi desenhado como **SaaS vendido a gestores de tráfego e agências**, que o repassam aos clientes com a própria marca. Os sinais estão no modal "Marca do painel" ([[personalizar-marca]]):
- nome do painel, frase de apresentação, estilo e texto do logotipo e cor do tema, que a agência troca sozinha;
- `parentBrand` (padrão "AB Software"): o nome da agência aparece no rodapé e **assina o relatório diário**, inclusive como remetente do e-mail ([[envio-de-email-smtp]]);
- rodapé "Desenvolvido por", agora com interruptor para esconder. É marketing embutido que a agência pode desligar;
- WhatsApp de atendimento da agência, usado no link "Falar com" do cliente e no "Esqueci a senha" da [[tela-login]];
- "Link do painel do cliente" com botão de copiar (padrão `app.absoftware.io/cliente/raropilates`, ilustrativo).

O selo "Agência PRO" e o cadastro com escolha "Gestor/Agência ou Dono de Negócio" **não existem mais**. A tela de entrada só aceita os perfis de demonstração (com um botão de entrada rápida do gestor) e manda quem não tem acesso falar com a agência, o que reforça o caminho A: quem distribui o acesso é o gestor.

## Dois caminhos possíveis (decisão em aberto)
| | **A. Vender ao gestor (B2B2C)** | **B. Vender ao dono do negócio (B2C)** |
|---|---|---|
| Quem paga | Gestor/agência, por cliente ativo | Dono do negócio, mensalidade |
| Quem conecta a Meta | O gestor, uma vez, via OAuth ou System User | O dono precisa dar acesso: difícil para leigo |
| Discurso | "Pare de responder status, pareça mais profissional, fidelize" | "Fiscalize seu gestor" |
| Atrito | Gestor ruim não compra ferramenta que o expõe | Gestor pode resistir a dar acesso; o tom de "fiscalização" gera conflito |
| White-label | Essencial | Irrelevante |
| Escala de venda | Um gestor traz de 10 a 50 clientes | Venda um a um, CAC alto |

**Leitura do código:** o caminho A está mais implementado e é o de menor atrito técnico, porque o leigo nunca lida com token. O modal de conexão ensina o **gestor** a gerar um token de Usuário do sistema no Business Manager ([[modal-conectar-meta]]), e só o gestor envia o relatório. O pedido original ("vender para pessoas leigas") pode significar que o **usuário final** é leigo, enquanto quem paga é o gestor. Vale confirmar essa decisão antes de construir o backend: ela define o modelo de tenants ([[perfis-e-modos-de-visao]]).

Um modelo **híbrido** também é possível: o gestor paga pelo plano e o dono do negócio pode ser convidado de graça. Ou ainda um "selo de gestor transparente" que o gestor usa para vender os próprios serviços.

## Planos possíveis (rascunho)
- **Starter:** 1 gestor, até N clientes, marca da plataforma com "Desenvolvido por" ligado.
- **Agência:** white-label completo (logo enviado, cor, domínio, sem "Desenvolvido por"), relatório diário por WhatsApp e e-mail com o remetente da agência, vários gestores.
- **IA (ideia futura):** resumos em texto livre e "pergunte ao painel". Hoje não há dependência de IA: o Gemini saiu do projeto e o "Em poucas palavras" é montado por regra. Histórico em [[gemini-ai-studio]].

## O que o white-label exige tecnicamente
Parte já existe, mas **só no navegador de quem configurou** (localStorage): outro aparelho ou o cliente não veem a marca ([[persistencia-localstorage]]).

| Já existe (local) | Falta |
|---|---|
| Nome do painel e da agência, frase, cor entre 5 opções | Configuração da marca no backend, por agência |
| Logotipo em texto (três estilos) | Upload de logo em imagem |
| Link do cliente para copiar | Rota real por cliente, subdomínio ou domínio próprio |
| Agência como remetente do e-mail | SMTP por agência; hoje é um único SMTP do servidor local |
| Interruptor do "Desenvolvido por" | Regra de plano decidindo quem pode desligar |

Textos fixos de marca já quase sumiram; o que resta está em [[inconsistencias-de-marca]]. O resto do caminho está em [[pontos-de-melhoria]].

## Relacionados
[[visao-do-produto]] · [[personas]] · [[proposta-de-valor]]
