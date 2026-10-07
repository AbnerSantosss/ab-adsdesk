---
tipo: arquitetura
atualizado: 2026-10-07
tags: [arquitetura, stack, vite, react, tailwind, npm]
---

# Stack e execução

É um painel React de página única, sem backend próprio. Os dados vêm de `src/data/mockData.ts` ou da Meta, que o navegador consulta diretamente. O único código de servidor é o envio de e-mail, que roda como middleware do próprio Vite.

| Camada | Tecnologia | Observação |
|---|---|---|
| UI | React 19 + TypeScript 7 | modo strict com `noUnusedLocals`/`noUnusedParameters` |
| Build e dev | Vite 8 + `@vitejs/plugin-react` 6 | não há alias `@`; todos os imports são relativos |
| Estilo | Tailwind v4 via `@tailwindcss/vite` | não há `tailwind.config`; o tema e as cores `brand-*` ficam em `src/index.css` |
| Gráfico | recharts 3 | só a [[visao-geral]] usa, e é o maior pedaço do build |
| Ícones | lucide-react | |
| E-mail | nodemailer 10 | só no Node, em `server/`; ver [[envio-de-email-smtp]] |

O gerenciador de pacotes é o **npm** (`package-lock.json`). O pacote se chama `ab-adsdesk`, está na versão 0.2.0 e usa `type: module`.

Mudou em 2026-09-25: saíram `@google/genai`, `express`, `dotenv`, `motion`, `tsx`, o `bun.lock` e o alias `@`. Não há mais Gemini no código; o histórico está em [[gemini-ai-studio]].

## Como rodar

```bash
npm ci               # instala exatamente o package-lock.json
npm run dev          # abre em http://localhost:3000 e escuta em 0.0.0.0 (rede local)
npm run lint         # tsc --noEmit: só checa os tipos, não gera arquivos
npm test             # contratos Meta e intervalos, sem token real
npm run wiki:check    # links internos, frontmatter e alcance do mapa da wiki
npm run build        # gera dist/
npm run preview      # serve o dist/; a API de e-mail também funciona aqui
npm run clean        # apaga dist/
npm run email:check  # testa o login no SMTP com o .env.local, sem enviar e-mail
```

- O e-mail é opcional. Para usá-lo, copie `.env.example` para `.env.local` e preencha as `SMTP_*`. Sem isso o painel funciona normalmente, e o modal de e-mail avisa que o envio não está configurado.
- O `email:check` e os testes TypeScript rodam diretamente no Node. Use a versão atual suportada pelo Docker/CI (Node 22 com suporte a type stripping) ou Node 24. `email:check` acessa as variáveis locais do SMTP; não é necessário para validar a interface ou a conexão Meta.
- `DISABLE_HMR=true` desliga o HMR e o watcher. É herança do AI Studio, que edita os arquivos por fora.

## Como o Vite está montado

O `vite.config.ts` chama `loadEnv(mode, cwd, '')` com prefixo vazio, para que o plugin de e-mail leia as `SMTP_*` no Node. Isso não vaza nada para o navegador, porque o código de `src/` não lê `import.meta.env`.

Os plugins são `react()`, `tailwindcss()` e `emailApi(env)`. O último, em `server/vitePlugin.ts`, registra `/api/email/status` e `/api/email/report` tanto no `dev` quanto no `preview`. **Consequência:** se o `dist/` for publicado em hospedagem estática, a API de e-mail deixa de existir. É o caso da imagem Docker (nginx), de propósito: ver [[deploy-vps-portainer]].

## Árvore de pastas

```
├── index.html          # lang pt-BR, data-brand, fontes Plus Jakarta Sans e JetBrains Mono
├── vite.config.ts · tsconfig.json · package.json · package-lock.json
├── .env.example        # modelo das variáveis SMTP
├── metadata.json · README.md
├── public/             # brand/ab-adsdesk-mark.svg, images/ads, images/brand
├── scripts/check-wiki.mjs
├── tests/              # contratos de importação Meta e datas
├── server/             # só Node: email.ts, vitePlugin.ts, check-email.ts
└── src/
    ├── main.tsx · App.tsx · index.css
    ├── components/
    │   ├── layout/     # AppHeader, BottomNav, AccountSwitcher, UserMenu, AppFooter
    │   ├── screens/    # LoginScreen, Overview, Campaigns, Creatives, DailyReports, Audit, Settings, MetaReports
    │   ├── modals/     # BrandSettings, MetaConnect, RoiCalculator, SendReportEmail
    │   └── ui/         # componentes base, DateRangeFilter, MetaConnectionPanel, CreativePreview…
    ├── data/mockData.ts
    ├── hooks/useDismiss.ts
    ├── lib/            # metrics, dateRange, socialTheme, format, objectives, navigation, storage, clipboard
    ├── services/       # metaGraphApi, emailApi
    └── types/          # metaAds, metaReport, auth
```

## Tamanho do build

Telas e modais são carregados sob demanda (`lazy()`), incluindo Configurações e o relatório real. Recharts é parte importante do chunk da Visão geral. Os tamanhos mudam com cada build; usar a saída atual de `npm run build`, não os números do protótipo de setembro, para comparar regressões ([[pontos-de-melhoria]]).

## Verificação da wiki

`npm run wiki:check` executa `scripts/check-wiki.mjs`, sem dependências externas nem acesso à rede. Confere frontmatter obrigatório, slugs duplicados, destinos de wikilinks e âncoras de títulos, links Markdown locais, páginas sem entrada e alcance a partir de [[index]]. O mapa para navegação no GitHub fica em [[README]]; a fonte editorial continua usando `[[slug]]`. Mudanças devem atualizar a página correspondente e [[log]].

Conexão, credenciais e dados reais: [[configuracoes]], [[meta-graph-api]] e [[modelo-de-dados]]. Critérios de UI: [[interface-e-responsividade]] e [[cores-e-hierarquia-visual]].

## Armadilhas

- O `tsconfig` inclui `server/` e `vite.config.ts`. Um erro de tipo no servidor também quebra o `lint`.
- Com `--host=0.0.0.0`, o painel abre no celular pela rede, mas `/api/email` só aceita loopback. Pelo celular, o envio de e-mail falha, a menos que se ligue `EMAIL_ALLOW_REMOTE=true`.
- O `README.md` foi reescrito em 2026-09-25 (como rodar, e-mail, estrutura, wiki). Se o projeto for reaberto no AI Studio, ele pode sugerir `GEMINI_API_KEY` de novo; ver [[gemini-ai-studio]].
- O token da Meta nunca passa pelo servidor: fica só no navegador. Ver [[persistencia-localstorage]] e [[seguranca]].
