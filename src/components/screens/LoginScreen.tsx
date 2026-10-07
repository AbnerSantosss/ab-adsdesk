import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, FileText, LogIn, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { demoUsers, roleLabel, type BrandConfig, type User } from '../../types/auth';
import { BrandLogo } from '../ui/BrandLogo';
import { buttonClass } from '../ui/button';
import { SocialChannels } from '../ui/SocialChannels';

interface LoginScreenProps {
  brand: BrandConfig;
  onLogin: (user: User, remember: boolean) => void;
}

const HIGHLIGHTS = [
  { icon: MessageCircle, text: 'Quantos contatos chegaram pelo WhatsApp e quanto custou cada um.' },
  { icon: ShieldCheck, text: 'Auditoria que mostra se a verba está em campanhas estruturadas ou em posts turbinados.' },
  { icon: FileText, text: 'Relatório diário pronto para enviar ao cliente em um toque.' },
];

// Entrada rápida da demonstração: só o gestor, que vê tudo e pode abrir a visão do cliente pelo menu.
const QUICK_LOGIN_USER = demoUsers.find((u) => u.role === 'AGENCY_MANAGER') ?? demoUsers[0];

const inputClass =
  'h-12 w-full rounded-xl border border-slate-400 bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-500 focus:border-brand-700 focus:ring-2 focus:ring-brand-700 focus:outline-none sm:text-sm';

export function LoginScreen({ brand, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const whatsapp = brand.supportWhatsapp.replace(/\D/g, '');
  const whatsappLink = (text: string) => `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!normalized || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }
    const user = demoUsers.find((u) => u.email === normalized);
    if (!user) {
      setError(
        'Não encontramos esse e-mail. Nesta versão de demonstração, use a entrada rápida logo abaixo.',
      );
      return;
    }
    setError(null);
    onLogin(user, remember);
  };

  return (
    <div className="social-app grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <aside className="relative hidden min-w-0 overflow-hidden bg-[#253044] p-8 text-white lg:flex lg:flex-col xl:p-12">
        <div className="relative flex items-center justify-between gap-4">
          <BrandLogo brand={brand} size="lg" inverted />
          <span className="rounded-full border border-white/20 px-3 py-1.5 text-[10px] font-bold tracking-[0.14em] text-white/70 uppercase">Social ads</span>
        </div>

        <div className="relative mx-auto my-auto w-full max-w-xl py-10">
          <p className="text-xs font-bold tracking-[0.16em] text-slate-300 uppercase">Instagram & Facebook</p>
          <h2 className="mt-4 max-w-lg text-4xl leading-[1.08] font-bold tracking-tight xl:text-5xl">
            Suas campanhas.<br />
            <span className="text-white">Uma visão clara.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300">Cada real investido em anúncios, explicado para o cliente.</p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-400">{brand.tagline}</p>

          <figure className="relative mt-7 overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-800">
            <img
              src="/images/brand/social-studio.webp"
              alt="Estúdio criativo com celular, câmera e computador para produção de conteúdo"
              width={1024}
              height={683}
              className="h-52 w-full object-cover object-[75%_50%] xl:h-60"
            />
            <figcaption className="flex items-center gap-3 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-slate-200">
                <MessageCircle className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Do anúncio ao resultado.</p>
                <p className="mt-0.5 text-xs text-slate-300">Criativos, investimento e contatos no mesmo painel.</p>
              </div>
            </figcaption>
          </figure>

          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-xs leading-relaxed text-slate-300">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/10 text-slate-200">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {brand.showPoweredBy && (
          <p className="relative text-xs text-slate-400">Desenvolvido por {brand.parentBrand}</p>
        )}
      </aside>

      <main className="flex min-w-0 items-center justify-center px-4 py-8 sm:px-8 lg:py-12">
        <div className="w-full max-w-[27rem]">
          <div className="mb-8 lg:hidden">
            <BrandLogo brand={brand} size="lg" />
          </div>

          <SocialChannels className="mb-7" />
          <p className="social-section-label mb-2 text-xs font-bold tracking-widest uppercase">Seu espaço de resultados</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Entrar no painel</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Acompanhe campanhas, contatos gerados e a auditoria da conta.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <div>
              <label htmlFor={emailId} className="text-sm font-semibold text-slate-700">
                E-mail
              </label>
              <input
                id={emailId}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className={`${inputClass} mt-1.5`}
                placeholder="voce@empresa.com.br"
              />
            </div>

            <div>
              <label htmlFor={passwordId} className="text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="relative mt-1.5">
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="accent-brand-600 size-4"
                />
                Manter conectado
              </label>
              <a
                href={whatsappLink(`Olá! Esqueci a senha do ${brand.appName}.`)}
                target="_blank"
                rel="noreferrer"
                className="text-brand-700 text-sm font-semibold hover:underline"
              >
                Esqueci a senha
              </a>
            </div>

            {error && (
              <p id={errorId} role="alert" className="rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
                {error}
              </p>
            )}

            <button type="submit" className={buttonClass('primary', 'lg', 'w-full')}>
              <LogIn className="size-5" aria-hidden="true" />
              Entrar
            </button>
          </form>

          <section aria-labelledby="entrada-rapida" className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
              <h2 id="entrada-rapida" className="text-xs font-semibold text-slate-500">
                Ou use a entrada rápida
              </h2>
              <span className="h-px flex-1 bg-slate-200" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={() => onLogin(QUICK_LOGIN_USER, remember)}
              className="social-surface group mt-4 flex min-h-16 w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-left shadow-sm transition hover:border-slate-400"
              data-tone="neutral"
            >
              <span className="social-icon shrink-0">
                <Zap className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  Entrar como {roleLabel[QUICK_LOGIN_USER.role].toLowerCase()}
                </span>
                <span className="block truncate text-xs text-slate-500">{QUICK_LOGIN_USER.name} · demonstração, sem senha</span>
              </span>
              <ArrowRight
                className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                aria-hidden="true"
              />
            </button>
          </section>

          <p className="mt-7 text-center text-sm text-slate-500">
            Ainda não tem acesso?{' '}
            <a
              href={whatsappLink(`Olá! Quero conhecer o ${brand.appName}.`)}
              target="_blank"
              rel="noreferrer"
              className="text-brand-700 font-semibold hover:underline"
            >
              Fale com a {brand.parentBrand}
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
