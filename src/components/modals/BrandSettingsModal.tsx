import { useId, useState, type ReactNode } from 'react';
import { Check, Copy, Palette, RotateCcw } from 'lucide-react';
import { defaultBrandConfig, type BrandColor, type BrandConfig, type LogoType } from '../../types/auth';
import { copyText } from '../../lib/clipboard';
import { BrandLogo } from '../ui/BrandLogo';
import { Modal } from '../ui/Modal';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Switch } from '../ui/Switch';
import { buttonClass } from '../ui/button';

interface BrandSettingsModalProps {
  open: boolean;
  onClose: () => void;
  config: BrandConfig;
  onSave: (config: BrandConfig) => void;
}

const COLORS: { value: BrandColor; label: string }[] = [
  { value: 'social', label: 'Social' },
  { value: 'emerald', label: 'Verde' },
  { value: 'indigo', label: 'Índigo' },
  { value: 'blue', label: 'Azul' },
  { value: 'violet', label: 'Violeta' },
  { value: 'slate', label: 'Grafite' },
];

const LOGO_TYPES: { value: LogoType; label: string }[] = [
  { value: 'ICON_AB', label: 'Símbolo + nome' },
  { value: 'CUSTOM_TEXT', label: 'Só texto' },
  { value: 'MINIMAL', label: 'Mínimo' },
];

const inputClass =
  'focus:border-brand-500 focus:ring-brand-100 mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:outline-none sm:text-sm';

/** Personalização white-label: nome, logotipo, cor e contato exibidos ao cliente. */
export function BrandSettingsModal({ open, onClose, config, onSave }: BrandSettingsModalProps) {
  // O App só monta este modal quando ele abre, então o rascunho sempre parte da marca salva.
  const [draft, setDraft] = useState<BrandConfig>(config);
  const [copied, setCopied] = useState(false);
  const formId = useId();

  const set = <K extends keyof BrandConfig>(key: K, value: BrandConfig[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const canSave = draft.appName.trim().length > 0 && draft.parentBrand.trim().length > 0;
  const whatsappDigits = draft.supportWhatsapp.replace(/\D/g, '');
  const whatsappValid = whatsappDigits.length >= 12 && whatsappDigits.length <= 13;

  const handleSubmit = () => {
    if (!canSave) return;
    onSave({
      ...draft,
      appName: draft.appName.trim(),
      parentBrand: draft.parentBrand.trim(),
      tagline: draft.tagline.trim(),
      customLogoText: draft.customLogoText.trim(),
      supportWhatsapp: whatsappDigits,
      clientCustomDomain: draft.clientCustomDomain.trim().replace(/^https?:\/\//, ''),
    });
    onClose();
  };

  const handleCopyLink = async () => {
    const ok = await copyText(`https://${draft.clientCustomDomain.replace(/^https?:\/\//, '')}`);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Marca do painel"
      description="Nome, logotipo e cor que seus clientes veem ao entrar."
      icon={Palette}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={() => setDraft(defaultBrandConfig)}
            className={buttonClass('ghost', 'md', 'sm:mr-auto')}
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Restaurar padrão
          </button>
          <button type="button" onClick={onClose} className={buttonClass('secondary')}>
            Cancelar
          </button>
          <button type="submit" form={formId} disabled={!canSave} className={buttonClass('primary')}>
            Salvar marca
          </button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_15rem]"
      >
        <div className="space-y-5">
          <fieldset className="space-y-4">
            <legend className="text-xs font-bold tracking-wide text-slate-500 uppercase">Identidade</legend>
            <Field label="Nome do painel" required>
              <input
                data-autofocus
                value={draft.appName}
                onChange={(e) => set('appName', e.target.value)}
                className={inputClass}
                maxLength={40}
                required
              />
            </Field>
            <Field label="Nome da agência" hint="Aparece no rodapé e como remetente do relatório diário." required>
              <input
                value={draft.parentBrand}
                onChange={(e) => set('parentBrand', e.target.value)}
                className={inputClass}
                maxLength={40}
                required
              />
            </Field>
            <Field label="Frase de apresentação" hint="Mostrada na tela de entrada.">
              <input
                value={draft.tagline}
                onChange={(e) => set('tagline', e.target.value)}
                className={inputClass}
                maxLength={90}
              />
            </Field>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-bold tracking-wide text-slate-500 uppercase">Logotipo e cor</legend>
            <div>
              <p className="text-sm font-semibold text-slate-700" id={`${formId}-logo`}>
                Estilo do logotipo
              </p>
              <SegmentedControl
                className="mt-1.5"
                options={LOGO_TYPES}
                value={draft.logoType}
                onChange={(value) => set('logoType', value)}
                ariaLabel="Estilo do logotipo"
                stretch
              />
            </div>
            {draft.logoType !== 'MINIMAL' && (
              <Field
                label="Texto do logotipo"
                hint={draft.logoType === 'ICON_AB' ? 'As iniciais do símbolo saem deste texto.' : undefined}
              >
                <input
                  value={draft.customLogoText}
                  onChange={(e) => set('customLogoText', e.target.value)}
                  className={inputClass}
                  maxLength={30}
                  placeholder={draft.appName}
                />
              </Field>
            )}

            <div>
              <p className="text-sm font-semibold text-slate-700" id={`${formId}-cor`}>
                Cor principal
              </p>
              <div role="radiogroup" aria-labelledby={`${formId}-cor`} className="mt-2 flex flex-wrap gap-2">
                {COLORS.map((color) => {
                  const selected = draft.primaryColor === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => set('primaryColor', color.value)}
                      data-brand={color.value}
                      className={`flex h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${
                        selected
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="bg-brand-600 grid size-5 place-items-center rounded-full ring-2 ring-white/80">
                        {selected && <Check className="size-3 text-white" aria-hidden="true" />}
                      </span>
                      {color.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-xs font-bold tracking-wide text-slate-500 uppercase">Contato e acesso do cliente</legend>
            <Field
              label="WhatsApp de atendimento"
              hint={
                whatsappValid || !whatsappDigits
                  ? 'Com DDI e DDD, só números. Ex.: 5511999999999.'
                  : 'Confira o número: use DDI + DDD + telefone (12 ou 13 dígitos).'
              }
              invalid={!whatsappValid && whatsappDigits.length > 0}
            >
              <input
                value={draft.supportWhatsapp}
                onChange={(e) => set('supportWhatsapp', e.target.value.replace(/[^\d]/g, ''))}
                className={inputClass}
                inputMode="numeric"
                autoComplete="tel"
                maxLength={13}
              />
            </Field>
            <Field label="Link do painel do cliente" hint="Endereço que você envia ao cliente para acompanhar a conta.">
              <div className="flex gap-2">
                <input
                  value={draft.clientCustomDomain}
                  onChange={(e) => set('clientCustomDomain', e.target.value)}
                  className={inputClass}
                  inputMode="url"
                  placeholder="painel.suaagencia.com.br/cliente"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  disabled={!draft.clientCustomDomain.trim()}
                  className={buttonClass('secondary', 'md', 'mt-1.5 shrink-0')}
                  aria-label="Copiar link"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Copy className="size-4" aria-hidden="true" />
                  )}
                  <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
            </Field>
            <Switch
              checked={draft.showPoweredBy}
              onChange={(value) => set('showPoweredBy', value)}
              label="Mostrar “Desenvolvido por”"
              description="Exibe o nome da agência no rodapé e na tela de entrada."
            />
          </fieldset>
        </div>

        <aside className="md:sticky md:top-0 md:self-start" aria-label="Pré-visualização">
          <p className="text-xs font-bold tracking-wide text-slate-500 uppercase">Pré-visualização</p>
          <div data-brand={draft.primaryColor} className="mt-2 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center border-b border-slate-100 bg-white px-3 py-3">
              <BrandLogo brand={draft} size="sm" />
            </div>
            <div className="space-y-2.5 bg-slate-50 p-3">
              <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                <p className="text-[11px] text-slate-500">Custo por contato</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums">R$ 6,40</p>
                <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                  <div className="bg-brand-500 h-full w-2/3 rounded-full" />
                </div>
              </div>
              <span className="bg-brand-600 flex h-9 items-center justify-center rounded-lg text-xs font-semibold text-white">
                Botão principal
              </span>
              {draft.showPoweredBy && (
                <p className="text-center text-[10px] text-slate-400">Desenvolvido por {draft.parentBrand || '…'}</p>
              )}
            </div>
          </div>
        </aside>
      </form>
    </Modal>
  );
}

function Field({
  label,
  hint,
  required,
  invalid,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  invalid?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="text-rose-600" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </span>
      {children}
      {hint && <span className={`mt-1 block text-xs ${invalid ? 'text-rose-700' : 'text-slate-500'}`}>{hint}</span>}
    </label>
  );
}
