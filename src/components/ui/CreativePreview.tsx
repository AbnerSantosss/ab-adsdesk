import { Film, Image as ImageIcon, Layers, Smartphone, type LucideIcon } from 'lucide-react';
import type { AdCreative, CreativeFormat } from '../../types/metaAds';
import { CREATIVE_FORMAT } from '../../lib/objectives';

const FORMAT_ICON: Record<CreativeFormat, LucideIcon> = {
  IMAGE: ImageIcon,
  VIDEO: Film,
  CAROUSEL: Layers,
  STORY_REEL: Smartphone,
};

interface CreativePreviewProps {
  creative: Pick<AdCreative, 'format' | 'headline' | 'tagline' | 'previewGradient' | 'callToAction'>;
  /** Altura fixa (listas) ou proporção real do anúncio (detalhe). */
  fit?: 'cover' | 'ratio';
  aspectRatio?: AdCreative['aspectRatio'];
  className?: string;
}

const RATIO_CLASS: Record<AdCreative['aspectRatio'], string> = {
  '1:1': 'aspect-square',
  '4:5': 'aspect-[4/5]',
  '9:16': 'aspect-[9/16]',
};

/**
 * Prévia ilustrativa do anúncio. Não é a arte real: a Meta só entrega a imagem
 * pela API de criativos, que ainda não é consultada.
 */
export function CreativePreview({ creative, fit = 'cover', aspectRatio = '1:1', className = '' }: CreativePreviewProps) {
  const Icon = FORMAT_ICON[creative.format];
  const size = fit === 'ratio' ? RATIO_CLASS[aspectRatio] : 'h-36';

  return (
    <div
      className={`@container relative flex flex-col justify-between overflow-hidden bg-linear-to-br p-4 text-white ${creative.previewGradient} ${size} ${className}`}
      role="img"
      aria-label={`Prévia ilustrativa: ${CREATIVE_FORMAT[creative.format]}, “${creative.headline}”`}
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-black/30 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm">
        <Icon className="size-3.5" aria-hidden="true" />
        {CREATIVE_FORMAT[creative.format]}
      </span>
      {/* Em prévias estreitas (formato vertical) o botão desce para não espremer o título. */}
      <div className="flex flex-col items-start gap-2 @[16rem]:flex-row @[16rem]:items-end @[16rem]:justify-between @[16rem]:gap-3">
        <div className="w-full min-w-0 @[16rem]:w-auto">
          <p className="line-clamp-2 text-sm leading-snug font-bold drop-shadow-sm sm:text-base">{creative.headline}</p>
          <p className="mt-1 truncate text-[11px] text-white/70">{creative.tagline}</p>
        </div>
        <span className="shrink-0 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold whitespace-nowrap text-slate-900">
          {creative.callToAction}
        </span>
      </div>
    </div>
  );
}
