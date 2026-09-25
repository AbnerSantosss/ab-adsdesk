import { useId, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Link2 } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import { useDismiss } from '../../hooks/useDismiss';
import { AccountAvatar } from '../ui/AccountAvatar';

interface AccountSwitcherProps {
  account: AdAccount;
  accounts: AdAccount[];
  /** Cliente só vê a própria conta: o seletor vira um rótulo fixo. */
  readOnly: boolean;
  onSelect: (accountId: string) => void;
  onConnect: () => void;
}

function SourceTag({ account }: { account: AdAccount }) {
  return account.isRealApi ? (
    <span className="text-[11px] font-medium text-blue-700">Meta API</span>
  ) : (
    <span className="text-[11px] font-medium text-slate-500">Demonstração</span>
  );
}

export function AccountSwitcher({ account, accounts, readOnly, onSelect, onConnect }: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Mesmo cuidado do UserMenu: o item clicado some com a lista, então o foco volta ao botão.
  const close = () => {
    triggerRef.current?.focus();
    setOpen(false);
  };
  useDismiss(rootRef, open, (reason) => (reason === 'escape' ? close() : setOpen(false)));

  const label = (
    <>
      <AccountAvatar account={account} size={32} />
      <span className="flex min-w-0 flex-col text-left leading-tight">
        <span className="truncate text-sm font-bold text-slate-900">{account.name}</span>
        <span className="truncate text-[11px] text-slate-500">{account.businessType}</span>
      </span>
    </>
  );

  if (readOnly) {
    return <div className="flex min-w-0 items-center gap-2.5">{label}</div>;
  }

  return (
    // No celular a lista se ancora no cabeçalho (sticky, portanto posicionado) e ocupa a largura
    // da tela menos as margens; ancorada no botão, ela passava da borda direita abaixo de ~376 px.
    <div ref={rootRef} className="min-w-0 sm:relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Conta: ${account.name}. Trocar conta`}
        className="flex h-11 max-w-full min-w-0 items-center gap-2.5 rounded-xl py-1 pr-2 pl-1 transition hover:bg-slate-100"
      >
        {label}
        <ChevronsUpDown className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listId}
          className="animate-pop-in absolute inset-x-3 top-full z-50 mt-1 rounded-2xl sm:inset-x-auto sm:left-0 sm:mt-2 sm:w-80 border border-slate-200 bg-white p-1.5 shadow-xl"
        >
          <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Contas de anúncio
          </p>
          <ul>
            {accounts.map((acc) => {
              const selected = acc.id === account.id;
              return (
                <li key={acc.id}>
                  <button
                    type="button"
                    aria-current={selected ? 'true' : undefined}
                    onClick={() => {
                      onSelect(acc.id);
                      close();
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                      selected ? 'bg-brand-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <AccountAvatar account={acc} size={36} />
                    <span className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-sm font-semibold text-slate-900">{acc.name}</span>
                      <SourceTag account={acc} />
                    </span>
                    {selected && <Check className="text-brand-600 size-4 shrink-0" aria-label="Conta atual" />}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-1 border-t border-slate-100 pt-1">
            <button
              type="button"
              onClick={() => {
                close();
                onConnect();
              }}
              className="text-brand-700 hover:bg-brand-50 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition"
            >
              <Link2 className="size-4" aria-hidden="true" />
              Conectar conta da Meta
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
