---
tipo: arquitetura
atualizado: 2026-09-25
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
npm install          # instala pelo package-lock.json
npm run dev          # abre em http://localhost:3000 e escuta em 0.0.0.0 (rede local)
npm run lint         # tsc --noEmit: só checa os tipos, não gera arquivos
npm run build        # gera dist/
npm run preview      # serve o dist/; a API de e-mail também funciona aqui
npm run clean        # apaga dist/
npm run email:check  # testa o login no SMTP com o .env.local, sem enviar e-mail
```

- O e-mail é opcional. Para usá-lo, copie `.env.example` para `.env.local` e preencha as `SMTP_*`. Sem isso o painel funciona normalmente, e o modal de e-mail avisa que o envio não está configurado.
- O `email:check` roda `server/check-email.ts` direto no Node, com `--env-file-if-exists`. Por isso exige um Node que remova tipos de TypeScript sozinho (22.18+ ou 23.6+; a máquina tem o 24).
- `DISABLE_HMR=true` desliga o HMR e o watcher. É herança do AI Studio, que edita os arquivos por fora.

## Como o Vite está montado

O `vite.config.ts` chama `loadEnv(mode, cwd, '')` com prefixo vazio, para que o plugin de e-mail leia as `SMTP_*` no Node. Isso não vaza nada para o navegador, porque o código de `src/` não lê `import.meta.env`.

Os plugins são `react()`, `tailwindcss()` e `emailApi(env)`. O último, em `server/vitePlugin.ts`, registra `/api/email/status` e `/api/email/report` tanto no `dev` quanto no `preview`. **Consequência:** se o `dist/` for publicado em hospedagem estática, a API de e-mail deixa de existir.

## Árvore de pastas

```
├── index.html          # lang pt-BR, data-brand, fontes Plus Jakarta Sans e JetBrains Mono
├── vite.config.ts · tsconfig.json · package.json · package-lock.json
├── .env.example        # modelo das variáveis SMTP
├── metadata.json · README.md
├── public/raro-pilates-logo.svg
├── server/             # só Node: email.ts, vitePlugin.ts, check-email.ts
└── src/
    ├── main.tsx · App.tsx · index.css
    ├── components/
    │   ├── layout/     # AppHeader, BottomNav, AccountSwitcher, UserMenu, AppFooter
    │   ├── screens/    # LoginScreen, Overview, Campaigns, Creatives, DailyReports, Audit, ApiAccountNotice
    │   ├── modals/     # BrandSettings, MetaConnect, RoiCalculator, SendReportEmail
    │   └── ui/         # Modal, Card, KpiCard, Badge, Toast, ErrorBoundary, PageSkeleton, SegmentedControl…
    ├── data/mockData.ts
    ├── hooks/useDismiss.ts
    ├── lib/            # metrics, format, objectives, navigation, storage, clipboard
    ├── services/       # metaGraphApi, emailApi
    └── types/          # metaAds, auth
```

## Tamanho do build

Cada tela e cada modal vira um chunk próprio (`lazy()`). A Visão geral pesa ~386 kB (≈111 kB gzip), quase tudo recharts; o `index` ~269 kB, o CSS ~60 kB e as demais telas 9 a 15 kB. Trocar o gráfico por SVG próprio é o maior ganho disponível ([[pontos-de-melhoria]]).

## Armadilhas

- O `tsconfig` inclui `server/` e `vite.config.ts`. Um erro de tipo no servidor também quebra o `lint`.
- Com `--host=0.0.0.0`, o painel abre no celular pela rede, mas `/api/email` só aceita loopback. Pelo celular, o envio de e-mail falha, a menos que se ligue `EMAIL_ALLOW_REMOTE=true`.
- O `README.md` foi reescrito em 2026-09-25 (como rodar, e-mail, estrutura, wiki). Se o projeto for reaberto no AI Studio, ele pode sugerir `GEMINI_API_KEY` de novo; ver [[gemini-ai-studio]].
- O token da Meta nunca passa pelo servidor: fica só no navegador. Ver [[persistencia-localstorage]] e [[seguranca]].
