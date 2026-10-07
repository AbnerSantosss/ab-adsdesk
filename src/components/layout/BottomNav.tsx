import type { ActiveTab } from '../../types/metaAds';
import { TABS, hashForTab } from '../../lib/navigation';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  canConfigure?: boolean;
}

/** Barra de abas fixa na base da tela, só no celular. */
export function BottomNav({ activeTab, onSelectTab, canConfigure = false }: BottomNavProps) {
  const tabs = TABS.filter((tab) => !tab.managerOnly || canConfigure);
  return (
    <nav
      aria-label="Seções do painel"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden print:hidden"
    >
      <ul className={`grid ${canConfigure ? 'grid-cols-6' : 'grid-cols-5'}`}>
        {tabs.map((tab) => {
          const selected = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <li key={tab.id}>
              <a
                href={hashForTab(tab.id)}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab(tab.id);
                }}
                aria-current={selected ? 'page' : undefined}
                className={`social-bottom-tab flex h-16 min-w-0 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition ${
                  selected ? 'text-brand-700' : 'text-slate-500'
                }`}
              >
                <span
                  className={`grid h-7 w-12 place-items-center rounded-full transition ${selected ? 'bg-brand-100' : ''}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {tab.shortLabel}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
