import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { mockAccounts } from './data/mockData';
import type { ActiveTab, AdAccount, ObjectiveFilter, ViewMode } from './types/metaAds';
import { defaultBrandConfig, type BrandColor, type BrandConfig, type User } from './types/auth';
import { STORAGE_KEYS, readFromAny, readJSON, removeKey, writeJSON } from './lib/storage';
import { TABS, hashForTab, tabFromHash } from './lib/navigation';
import { buildConnectedAccount, fetchMetaAccount, getSavedMetaConfig } from './services/metaGraphApi';
import { AppHeader } from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';
import { AppFooter } from './components/layout/AppFooter';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { PageSkeleton } from './components/ui/PageSkeleton';
import { Toast } from './components/ui/Toast';

// Cada tela e cada janela só é baixada quando usada (o gráfico pesa bastante).
const LoginScreen = lazy(() => import('./components/screens/LoginScreen').then((m) => ({ default: m.LoginScreen })));
const Overview = lazy(() => import('./components/screens/Overview').then((m) => ({ default: m.Overview })));
const Campaigns = lazy(() => import('./components/screens/Campaigns').then((m) => ({ default: m.Campaigns })));
const Creatives = lazy(() => import('./components/screens/Creatives').then((m) => ({ default: m.Creatives })));
const DailyReports = lazy(() => import('./components/screens/DailyReports').then((m) => ({ default: m.DailyReports })));
const Audit = lazy(() => import('./components/screens/Audit').then((m) => ({ default: m.Audit })));
const loadBrandModal = () => import('./components/modals/BrandSettingsModal');
const loadConnectModal = () => import('./components/modals/MetaConnectModal');
const loadRoiModal = () => import('./components/modals/RoiCalculatorModal');
const BrandSettingsModal = lazy(() => loadBrandModal().then((m) => ({ default: m.BrandSettingsModal })));
const MetaConnectModal = lazy(() => loadConnectModal().then((m) => ({ default: m.MetaConnectModal })));
const RoiCalculatorModal = lazy(() => loadRoiModal().then((m) => ({ default: m.RoiCalculatorModal })));

type OpenModal = 'BRAND' | 'CONNECT' | 'ROI' | null;

const BRAND_COLORS: BrandColor[] = ['emerald', 'indigo', 'blue', 'violet', 'slate'];

function loadUser(): User | null {
  // ?view=login abre sempre a tela de entrada (útil para demonstrar o login).
  if (new URLSearchParams(window.location.search).get('view') === 'login') return null;
  const saved = readFromAny<User>(STORAGE_KEYS.authUser);
  return saved?.id && saved.role ? saved : null;
}

function loadBrand(): BrandConfig {
  const saved = readJSON<Partial<BrandConfig>>(STORAGE_KEYS.brandConfig);
  const merged = { ...defaultBrandConfig, ...saved };
  if (!BRAND_COLORS.includes(merged.primaryColor)) merged.primaryColor = defaultBrandConfig.primaryColor;
  return merged;
}

export default function App() {
  const [user, setUser] = useState<User | null>(loadUser);
  const [brand, setBrand] = useState<BrandConfig>(loadBrand);
  const [connectedAccount, setConnectedAccount] = useState<AdAccount | null>(() =>
    readJSON<AdAccount>(STORAGE_KEYS.connectedAccount),
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>(
    () => readJSON<string>(STORAGE_KEYS.selectedAccount) ?? mockAccounts[0].id,
  );
  const [managerViewMode, setManagerViewMode] = useState<ViewMode>('MANAGER');
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => tabFromHash(window.location.hash) ?? 'OVERVIEW');
  const [objectiveFilter, setObjectiveFilter] = useState<ObjectiveFilter>('ALL');
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<{ id: number; text: string } | null>(null);

  const notify = useCallback((text: string) => setNotice({ id: Date.now(), text }), []);

  const accounts = useMemo(
    () => (connectedAccount ? [connectedAccount, ...mockAccounts] : mockAccounts),
    [connectedAccount],
  );

  const isClient = user?.role === 'CLIENT_VIEWER';
  // O cliente fica preso à própria conta e à visão simplificada.
  const account =
    (isClient
      ? accounts.find((a) => a.id === user?.clientAccountId)
      : accounts.find((a) => a.id === selectedAccountId)) ?? accounts[0];
  const viewMode: ViewMode = isClient ? 'CLIENT' : managerViewMode;

  /* ------------------------------ Efeitos globais ------------------------------ */

  useEffect(() => {
    document.documentElement.dataset.brand = brand.primaryColor;
  }, [brand.primaryColor]);

  useEffect(() => {
    const tabLabel = TABS.find((t) => t.id === activeTab)?.label;
    document.title = user ? `${tabLabel} · ${account.name} · ${brand.appName}` : `Entrar · ${brand.appName}`;
  }, [user, activeTab, account.name, brand.appName]);

  // Baixa as janelas com o navegador ocioso, para abrirem sem atraso no primeiro clique.
  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      Promise.all([loadBrandModal(), loadConnectModal(), loadRoiModal()]).catch(() => {});
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [user]);

  // Botão voltar do navegador troca de aba. Voltar até a entrada sem hash leva à visão geral.
  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash(window.location.hash) ?? 'OVERVIEW');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  /* --------------------------------- Ações --------------------------------- */

  const selectTab = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    const hash = hashForTab(tab);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
    window.scrollTo({ top: 0 });
  }, []);

  const navigate = useCallback(
    (tab: ActiveTab, filter?: ObjectiveFilter) => {
      if (filter) setObjectiveFilter(filter);
      selectTab(tab);
    },
    [selectTab],
  );

  const selectAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setObjectiveFilter('ALL');
    writeJSON(STORAGE_KEYS.selectedAccount, accountId);
  };

  const handleLogin = (loggedUser: User, remember: boolean) => {
    removeKey(STORAGE_KEYS.authUser);
    writeJSON(STORAGE_KEYS.authUser, loggedUser, remember ? 'local' : 'session');
    setUser(loggedUser);
    setManagerViewMode('MANAGER');
    if (new URLSearchParams(window.location.search).has('view')) {
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  };

  const handleLogout = () => {
    removeKey(STORAGE_KEYS.authUser);
    setUser(null);
    setOpenModal(null);
  };

  const handleSaveBrand = (config: BrandConfig) => {
    setBrand(config);
    writeJSON(STORAGE_KEYS.brandConfig, config);
    notify('Marca atualizada.');
  };

  const handleConnected = (connected: AdAccount) => {
    setConnectedAccount(connected);
    writeJSON(STORAGE_KEYS.connectedAccount, connected);
    selectAccount(connected.id);
    notify(`Conta ${connected.name} conectada.`);
  };

  const handleDisconnect = () => {
    setConnectedAccount(null);
    removeKey(STORAGE_KEYS.connectedAccount);
    if (selectedAccountId === connectedAccount?.id) selectAccount(mockAccounts[0].id);
    notify('Conta da Meta desconectada.');
  };

  const handleRefresh = async () => {
    if (!account.isRealApi) return;
    const config = getSavedMetaConfig();
    if (!config) {
      // Só o gestor tem o token; o cliente não deve cair na janela de conexão.
      if (isClient) {
        notify('Não foi possível atualizar agora. A agência atualiza os dados desta conta.');
        return;
      }
      notify('A sessão da Meta expirou. Cole o token de novo para atualizar.');
      setOpenModal('CONNECT');
      return;
    }
    setRefreshing(true);
    try {
      const result = await fetchMetaAccount(config.accessToken, config.adAccountId);
      if (result.ok) {
        const updated = buildConnectedAccount(result.account);
        setConnectedAccount(updated);
        writeJSON(STORAGE_KEYS.connectedAccount, updated);
        notify('Dados da Meta atualizados.');
      } else {
        notify(`${result.title}. ${result.detail}`);
      }
    } finally {
      setRefreshing(false);
    }
  };

  /* --------------------------------- Telas --------------------------------- */

  if (!user) {
    return (
      <Suspense fallback={<div className="min-h-dvh bg-slate-100" />}>
        <LoginScreen brand={brand} onLogin={handleLogin} />
      </Suspense>
    );
  }

  const screenProps = { account, viewMode };

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Sem preventDefault o link trocaria #campanhas por #conteudo e a aba sairia da URL. */}
      <a
        href="#conteudo"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('conteudo')?.focus();
        }}
        className="bg-brand-600 sr-only z-50 rounded-lg px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Pular para o conteúdo
      </a>

      <AppHeader
        brand={brand}
        user={user}
        account={account}
        accounts={accounts}
        activeTab={activeTab}
        viewMode={viewMode}
        refreshing={refreshing}
        onSelectTab={selectTab}
        onSelectAccount={selectAccount}
        onViewModeChange={setManagerViewMode}
        onRefresh={handleRefresh}
        onOpenBrand={() => setOpenModal('BRAND')}
        onOpenConnect={() => setOpenModal('CONNECT')}
        onOpenRoi={() => setOpenModal('ROI')}
        onLogout={handleLogout}
      />

      <main id="conteudo" tabIndex={-1} className="mx-auto outline-none w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <ErrorBoundary resetKey={`${activeTab}:${account.id}`}>
          <Suspense fallback={<PageSkeleton />}>
            {activeTab === 'OVERVIEW' && (
              <Overview key={account.id} {...screenProps} onNavigate={navigate} onOpenConnect={() => setOpenModal('CONNECT')} />
            )}
            {activeTab === 'CAMPAIGNS' && (
              <Campaigns key={account.id} {...screenProps} objectiveFilter={objectiveFilter} onObjectiveFilterChange={setObjectiveFilter} />
            )}
            {activeTab === 'CREATIVES' && <Creatives key={account.id} {...screenProps} />}
            {activeTab === 'DAILY_REPORTS' && <DailyReports key={account.id} {...screenProps} brand={brand} />}
            {activeTab === 'AUDIT' && <Audit key={account.id} {...screenProps} onNavigate={navigate} />}
          </Suspense>
        </ErrorBoundary>
      </main>

      <AppFooter brand={brand} account={account} isClient={isClient} />
      <BottomNav activeTab={activeTab} onSelectTab={selectTab} />

      <Suspense fallback={null}>
        {openModal === 'BRAND' && (
          <BrandSettingsModal open onClose={() => setOpenModal(null)} config={brand} onSave={handleSaveBrand} />
        )}
        {openModal === 'CONNECT' && (
          <MetaConnectModal
            open
            onClose={() => setOpenModal(null)}
            connectedAccount={connectedAccount}
            demoAccounts={mockAccounts}
            onConnected={handleConnected}
            onDisconnect={handleDisconnect}
            onSelectDemo={selectAccount}
          />
        )}
        {openModal === 'ROI' && <RoiCalculatorModal open onClose={() => setOpenModal(null)} account={account} />}
      </Suspense>

      <Toast notice={notice} onDismiss={() => setNotice(null)} />
    </div>
  );
}
