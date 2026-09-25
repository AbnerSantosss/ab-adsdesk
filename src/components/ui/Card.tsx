import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: ReactNode;
  /** Conteúdo à direita do título (botões, filtros). */
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Remove o espaçamento interno do corpo (tabelas e listas que vão de borda a borda). */
  flush?: boolean;
  as?: 'section' | 'article' | 'div';
}

export function Card({ title, description, action, children, className = '', flush = false, as: Tag = 'section' }: CardProps) {
  return (
    <Tag className={`min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-4 pt-4 sm:px-5 sm:pt-5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={flush ? 'pt-3' : 'p-4 sm:p-5'}>{children}</div>
    </Tag>
  );
}
