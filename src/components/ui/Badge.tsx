import type { ReactNode } from 'react';
import { tone as getTone, type ToneName } from '../../lib/objectives';

interface BadgeProps {
  tone?: ToneName;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Badge({ tone = 'slate', children, className = '', title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset ${getTone(tone).soft} ${className}`}
    >
      {children}
    </span>
  );
}
