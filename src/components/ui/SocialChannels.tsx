import { Facebook, Instagram } from 'lucide-react';

/** Contexto das plataformas; não representa uma divisão de métricas por canal. */
export function SocialChannels({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  return (
    <div className={`social-channels ${compact ? 'social-channels-compact' : ''} ${className}`} aria-label="Instagram e Facebook">
      <span className="social-channel social-channel-instagram">
        <Instagram aria-hidden="true" />
        <span className={compact ? 'sr-only' : ''}>Instagram</span>
      </span>
      <span className="social-channel social-channel-facebook">
        <Facebook aria-hidden="true" />
        <span className={compact ? 'sr-only' : ''}>Facebook</span>
      </span>
    </div>
  );
}
