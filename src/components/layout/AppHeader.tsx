import { Calculator, Eye, RefreshCw } from 'lucide-react';
import type { BrandConfig, User } from '../../types/auth';
import type { ActiveTab, AdAccount, ViewMode } from '../../types/metaAds';
import { TABS, hashForTab } from '../../lib/navigation';
import { formatTime } from '../../lib/format';
import { BrandLogo } from '../ui/BrandLogo';
import { Badge } from '../ui/Badge';
import { AccountSwitcher } from './AccountSwitcher';
import { UserMenu } from './UserMenu';

interface AppHeaderProps {
  brand: BrandConfig;
  user: User;
  account: AdAccount;
  accounts: AdAccount[];
  activeTab: ActiveTab;
  viewMode: ViewMode;
  refreshing: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectAccount: (accountId: string) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  onOpenBrand: () => void;
  onOpenConnect: () => void;
  onOpenRoi: () => void;
  onLogout: () => void;
}

export function AppHeader({
  brand,
  user,
  account,
  accounts,
  activeTab,
  viewMode,
  refreshing,
  onSelectTab,
  onSelectAccount,
  onViewModeChange,
  onRefresh,
  onOpenBrand,
  onOpenConnect,
  onOpenRoi,
  onLogout,
}: AppHeaderProps) {
  const isManager = user.role === 'AGENCY_MANAGER';
  const previewingAsClient = isManager && viewMode === 'CLIENT';
  const fetchedAt = account.apiSnapshot?.fetchedAt;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur print:static print:border-0">
      {previewingAsClient && (
        <div className="bg-slate-900 text-white print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
            <span className="flex min-w-0 items-center gap-2">
              <Eye className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Você está vendo o painel como o cliente vê</span>
            </span>
            <button
              type="button"
              onClick={() => onViewModeChange('MANAGER')}
              className="shrink-0 rounded-md px-2 py-1 font-semibold text-white underline-offset-2 hover:underline"
            >
              Voltar à visão do gestor
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <a
          href={hashForTab('OVERVIEW')}
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('OVERVIEW');
          }}
          className="shrink-0 rounded-xl"
          aria-label={`${brand.appName}: ir para a visão geral`}
        >
          <span className="sm:hidden">
            <BrandLogo brand={brand} showName={false} size="md" />
          </span>
          <span className="hidden sm:inline-flex">
            <BrandLogo brand={brand} size="md" />
          </span>
        </a>

        <span className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" aria-hidden="true" />

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <AccountSwitcher
            account={account}
            accounts={accounts}
            readOnly={!isManager}
            onSelect={onSelectAccount}
            onConnect={onOpenConnect}
          />
          <span className="hidden lg:inline-flex">
            {account.isRealApi ? (
              <Badge tone="blue">Meta API conectada</Badge>
            ) : (
              <Badge tone="amber" title="Números de exemplo para apresentação">
                Dados de demonstração
              </Badge>
            )}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 print:hidden">
          {account.isRealApi && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={refreshing}
              className="flex h-11 items-center gap-2 rounded-xl px-2.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
              aria-label="Atualizar dados da Meta"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
              {fetchedAt && (
                <span className="hidden text-xs xl:inline">Atualizado às {formatTime(fetchedAt)}</span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onOpenRoi}
            className="hidden h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:flex"
          >
            <Calculator className="size-4" aria-hidden="true" />
            <span className="hidden lg:inline">Simulador</span>
            <span className="sr-only lg:hidden">Simulador de retorno</span>
          </button>
          <UserMenu
            user={user}
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            onOpenBrand={onOpenBrand}
            onOpenConnect={onOpenConnect}
            onOpenRoi={onOpenRoi}
            onLogout={onLogout}
          />
        </div>
      </div>

      <nav aria-label="Seções do painel" className="hidden border-t border-slate-100 md:block print:hidden">
        <ul className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6 lg:px-8">
          {TABS.map((tab) => {
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
                  className={`relative flex h-12 items-center gap-2 rounded-t-lg px-3 text-sm font-semibold transition ${
                    selected ? 'text-brand-700' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {tab.label}
                  {selected && <span className="bg-brand-600 absolute inset-x-2 -bottom-px h-0.5 rounded-full" aria-hidden="true" />}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
