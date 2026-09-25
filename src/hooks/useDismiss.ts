import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export type DismissReason = 'outside' | 'escape';

/**
 * Fecha um menu ou popover ao clicar fora dele ou apertar Esc.
 * O motivo vai junto: no Esc o foco estava dentro do menu e precisa voltar ao botão que o abriu.
 * O callback fica guardado em ref para não religar os ouvintes a cada render.
 */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: (reason: DismissReason) => void) {
  const callback = useRef(onDismiss);
  useLayoutEffect(() => {
    callback.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;

    const handlePointer = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) callback.current('outside');
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') callback.current('escape');
    };

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, ref]);
}
