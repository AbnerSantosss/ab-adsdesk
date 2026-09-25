import { useEffect } from 'react';
import { Info, X } from 'lucide-react';

interface ToastProps {
  notice: { id: number; text: string } | null;
  onDismiss: () => void;
  /** Tempo em milissegundos até sumir sozinho. */
  duration?: number;
}

/** Aviso curto no rodapé da tela; leitores de tela anunciam o texto. */
export function Toast({ notice, onDismiss, duration = 4500 }: ToastProps) {
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
    // Reinicia a contagem a cada aviso novo.
  }, [notice?.id, duration]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 md:bottom-6 print:hidden"
    >
      {notice && (
        <div
          key={notice.id}
          role="status"
          className="animate-pop-in pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl bg-slate-900 py-3 pr-2 pl-4 text-sm text-white shadow-xl"
        >
          <Info className="text-brand-300 mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p className="min-w-0 flex-1">{notice.text}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="-my-1 grid size-8 shrink-0 place-items-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Fechar aviso"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
