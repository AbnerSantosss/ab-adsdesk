import { useId, useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, FileText, LogIn, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { demoUsers, roleLabel, type BrandConfig, type User } from '../../types/auth';
import { BrandLogo } from '../ui/BrandLogo';
import { buttonClass } from '../ui/button';

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

// Barras do exemplo do painel lateral (valores ilustrativos).
const SAMPLE_BARS = [38, 52, 44, 61, 57, 72, 66];

const inputClass =
  'focus:border-brand-500 focus:ring-brand-100 h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:outline-none sm:text-sm';

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
    <div className="grid min-h-dvh grid-cols-1 bg-slate-50 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div
          className="bg-brand-600/25 pointer-events-none absolute -top-40 -left-32 size-[32rem] rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <BrandLogo brand={brand} size="lg" inverted />
        </div>

        <div className="relative my-auto max-w-lg py-10">
          <h2 className="text-3xl leading-tight font-bold tracking-tight xl:text-4xl">
            Cada real investido em anúncios, explicado para o cliente.
          </h2>
          <p className="mt-4 text-base text-slate-300">{brand.tagline}</p>

          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex gap-3 text-sm text-slate-200">
                <span className="bg-brand-500/15 text-brand-300 grid size-8 shrink-0 place-items-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5">{text}</span>
              </li>
            ))}
          </ul>

          <figure className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-400">Contatos na semana</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">390</p>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                Exemplo
              </span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-2" aria-hidden="true">
              {SAMPLE_BARS.map((h, i) => (
                <span
                  key={i}
                  className={`flex-1 rounded-t-md ${i === SAMPLE_BARS.length - 1 ? 'bg-brand-400' : 'bg-white/15'}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <figcaption className="mt-3 text-[11px] text-slate-500">Ilustração com dados de demonstração.</figcaption>
          </figure>
        </div>

        {brand.showPoweredBy && (
          <p className="relative text-xs text-slate-500">Desenvolvido por {brand.parentBrand}</p>
        )}
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <BrandLogo brand={brand} size="lg" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Entrar no painel</h1>
          <p className="mt-1 text-sm text-slate-500">Acompanhe campanhas, contatos gerados e a auditoria da conta.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-4">
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

            <div className="flex items-center justify-between gap-3">
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
              className="group mt-4 flex min-h-14 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="bg-brand-50 text-brand-700 grid size-9 shrink-0 place-items-center rounded-lg">
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

          <p className="mt-8 text-center text-sm text-slate-500">
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
