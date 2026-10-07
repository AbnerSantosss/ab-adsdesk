import { useState } from 'react';
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
  creative: Pick<AdCreative, 'format' | 'headline' | 'tagline' | 'previewGradient' | 'previewImage' | 'callToAction'>;
  /** Altura fixa (listas) ou proporção real do anúncio (detalhe). */
  fit?: 'cover' | 'ratio';
  aspectRatio?: AdCreative['aspectRatio'];
  className?: string;
  compact?: boolean;
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
export function CreativePreview({
  creative,
  fit = 'cover',
  aspectRatio = '1:1',
  className = '',
  compact = false,
}: CreativePreviewProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const Icon = FORMAT_ICON[creative.format];
  const size = compact ? 'size-16 shrink-0' : fit === 'ratio' ? RATIO_CLASS[aspectRatio] : 'h-56';
  const image = creative.previewImage;
  const showImage = image && image.src !== failedSrc;

  return (
    <div
      className={`@container relative isolate flex flex-col justify-between overflow-hidden bg-linear-to-br text-white ${compact ? '' : 'p-4'} ${creative.previewGradient} ${size} ${className}`}
      role="img"
      aria-label={`Prévia ilustrativa: ${CREATIVE_FORMAT[creative.format]}, “${creative.headline}”${showImage ? `. ${image.description}` : ''}`}
    >
      {showImage && (
        <img
          src={image.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={1024}
          height={1024}
          className="pointer-events-none absolute inset-0 -z-20 size-full object-cover"
          style={{ objectPosition: image.position ?? '50% 42%' }}
          onError={() => setFailedSrc(image.src)}
        />
      )}
      {!compact && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-slate-950/95 via-slate-950/40 to-slate-950/5"
          />
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/60 px-2 py-1 text-[11px] font-semibold backdrop-blur-sm">
            <Icon className="size-3.5" aria-hidden="true" />
            {CREATIVE_FORMAT[creative.format]}
          </span>
          {/* Em prévias estreitas o botão desce para não espremer o título. */}
          <div className="flex flex-col items-start gap-2 @[22rem]:flex-row @[22rem]:items-end @[22rem]:justify-between @[22rem]:gap-3">
            <div className="w-full min-w-0 @[22rem]:w-auto">
              <p className="line-clamp-2 text-sm leading-snug font-bold drop-shadow-sm sm:text-base">{creative.headline}</p>
              <p className="mt-1 truncate text-[11px] text-white/90">{creative.tagline}</p>
            </div>
            <span className="shrink-0 rounded-md bg-white/90 px-2 py-1 text-[11px] font-bold whitespace-nowrap text-slate-900">
              {creative.callToAction}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
