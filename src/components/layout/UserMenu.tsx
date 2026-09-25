import { useId, useRef, useState } from 'react';
import { Calculator, Link2, LogOut, Palette, type LucideIcon } from 'lucide-react';
import type { User } from '../../types/auth';
import { roleLabel } from '../../types/auth';
import type { ViewMode } from '../../types/metaAds';
import { useDismiss } from '../../hooks/useDismiss';
import { SegmentedControl } from '../ui/SegmentedControl';

interface UserMenuProps {
  user: User;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenBrand: () => void;
  onOpenConnect: () => void;
  onOpenRoi: () => void;
  onLogout: () => void;
}

function MenuItem({ icon: Icon, label, onClick, danger = false }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
        danger ? 'text-rose-700 hover:bg-rose-50' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      <Icon className={`size-4 ${danger ? '' : 'text-slate-400'}`} aria-hidden="true" />
      {label}
    </button>
  );
}

export function UserMenu({ user, viewMode, onViewModeChange, onOpenBrand, onOpenConnect, onOpenRoi, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const isManager = user.role === 'AGENCY_MANAGER';

  // O item clicado some junto com o menu. Devolver o foco ao botão antes evita que ele caia no
  // <body> e permite que a janela aberta em seguida volte para cá ao fechar.
  const close = () => {
    triggerRef.current?.focus();
    setOpen(false);
  };
  useDismiss(rootRef, open, (reason) => (reason === 'escape' ? close() : setOpen(false)));

  const run = (action: () => void) => () => {
    close();
    action();
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Menu de ${user.name}`}
        className="grid size-11 place-items-center rounded-full transition hover:bg-slate-100"
      >
        <span className="grid size-9 place-items-center rounded-full bg-slate-900 text-xs font-bold text-white">
          {user.avatarInitials}
        </span>
      </button>

      {open && (
        <div
          id={menuId}
          className="animate-pop-in absolute top-full right-0 z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <div className="px-3 pt-2 pb-3">
            <p className="truncate text-sm font-bold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
            <p className="text-brand-700 mt-1 text-xs font-semibold">{roleLabel[user.role]}</p>
          </div>

          {isManager && (
            <div className="border-t border-slate-100 px-2 pt-3 pb-2">
              <p className="mb-1.5 px-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">Ver painel como</p>
              <SegmentedControl
                ariaLabel="Modo de visão"
                stretch
                size="sm"
                value={viewMode}
                onChange={(mode) => {
                  onViewModeChange(mode);
                  close();
                }}
                options={[
                  { value: 'MANAGER', label: 'Gestor' },
                  { value: 'CLIENT', label: 'Cliente' },
                ]}
              />
            </div>
          )}

          <div className="border-t border-slate-100 py-1">
            {isManager && <MenuItem icon={Palette} label="Personalizar marca" onClick={run(onOpenBrand)} />}
            {isManager && <MenuItem icon={Link2} label="Conectar conta da Meta" onClick={run(onOpenConnect)} />}
            <MenuItem icon={Calculator} label="Simulador de retorno" onClick={run(onOpenRoi)} />
          </div>
          <div className="border-t border-slate-100 pt-1">
            <MenuItem icon={LogOut} label="Sair" onClick={run(onLogout)} danger />
          </div>
        </div>
      )}
    </div>
  );
}
