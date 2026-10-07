import type { ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { SocialTone } from '../../lib/socialTheme';
import { SocialChannels } from './SocialChannels';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  tone?: SocialTone;
  eyebrow?: string;
  image?: { src: string; alt: string };
}

export function PageHeader({ title, description, actions, tone = 'neutral', eyebrow = 'Instagram & Facebook', image }: PageHeaderProps) {
  return (
    <div className={`social-page-header social-surface ${image ? 'social-page-header-with-image' : ''}`} data-tone={tone}>
      <div className="social-page-copy">
        <div className="social-section-label"><span className="social-eyebrow-line" aria-hidden="true" />{eyebrow}</div>
        <h1 className="mt-3 text-[1.65rem] font-extrabold tracking-tight text-slate-900 sm:text-[2rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <SocialChannels />
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
      {image && (
        <div className="social-page-photo" aria-hidden="true">
          <img src={image.src} alt="" width={280} height={210} className="size-full object-cover object-top" />
          <span className="social-photo-arrow"><ArrowUpRight /></span>
        </div>
      )}
    </div>
  );
}
