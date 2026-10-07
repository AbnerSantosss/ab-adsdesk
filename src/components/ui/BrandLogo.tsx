import type { BrandConfig } from '../../types/auth';

/** "AB Software" → "AB"; "Studio Leve" → "SL". */
export function brandInitials(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const [first] = words;
  if (first.length <= 3 && first === first.toUpperCase()) return first;
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

interface BrandLogoProps {
  brand: BrandConfig;
  /** Mostra o nome ao lado do símbolo. */
  showName?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Para fundos escuros. */
  inverted?: boolean;
}

const markSizes = { sm: 'size-8 text-xs rounded-lg', md: 'size-9 text-sm rounded-xl', lg: 'size-12 text-base rounded-2xl' };
const nameSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };

export function BrandLogo({ brand, showName = true, size = 'md', inverted = false }: BrandLogoProps) {
  const nameColor = inverted ? 'text-white' : 'text-slate-900';
  const subColor = inverted ? 'text-white/60' : 'text-slate-500';
  const initials = brandInitials(brand.customLogoText || brand.appName);

  if (brand.logoType === 'CUSTOM_TEXT') {
    return (
      <span className={`font-extrabold tracking-tight ${nameSizes[size]} ${nameColor}`}>
        {brand.customLogoText || brand.appName}
        <span className="text-brand-500">.</span>
      </span>
    );
  }

  if (brand.logoType === 'MINIMAL') {
    return (
      <span className={`inline-flex items-center gap-2 font-bold ${nameSizes[size]} ${nameColor}`}>
        <span className="bg-brand-500 size-2.5 rounded-full" aria-hidden="true" />
        {showName ? brand.appName : <span className="sr-only">{brand.appName}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2.5">
      {initials === 'AB' ? (
        <img src="/brand/ab-adsdesk-mark.svg" alt={showName ? '' : brand.appName} width={64} height={64} className={`shrink-0 social-brand-mark ${markSizes[size]}`} />
      ) : (
        <span className={`bg-brand-600 grid shrink-0 place-items-center font-extrabold tracking-tight text-white shadow-sm ${markSizes[size]}`} aria-hidden={showName}>
          {initials}
        </span>
      )}
      {showName && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className={`truncate font-bold ${nameSizes[size]} ${nameColor}`}>{brand.appName}</span>
          {size !== 'sm' && <span className={`truncate text-[11px] font-medium ${subColor}`}>{brand.parentBrand}</span>}
        </span>
      )}
    </span>
  );
}
