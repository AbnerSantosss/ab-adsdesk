import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { mockAccounts } from './data/mockData';
import type { ActiveTab, AdAccount, ObjectiveFilter, ViewMode } from './types/metaAds';
import { defaultBrandConfig, type BrandColor, type BrandConfig, type User } from './types/auth';
import { STORAGE_KEYS, readFromAny, readJSON, removeKey, writeJSON } from './lib/storage';
import { TABS, hashForTab, tabFromHash } from './lib/navigation';
import { fetchMetaDashboard, getSavedMetaConfig, removeMetaConfig } from './services/metaGraphApi';
import type { MetaReportRange } from './types/metaReport';
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
const Settings = lazy(() => import('./components/screens/Settings').then((m) => ({ default: m.Settings })));
const MetaReports = lazy(() => import('./components/screens/MetaReports').then((m) => ({ default: m.MetaReports })));
const loadBrandModal = () => import('./components/modals/BrandSettingsModal');
const loadRoiModal = () => import('./components/modals/RoiCalculatorModal');
const BrandSettingsModal = lazy(() => loadBrandModal().then((m) => ({ default: m.BrandSettingsModal })));
const RoiCalculatorModal = lazy(() => loadRoiModal().then((m) => ({ default: m.RoiCalculatorModal })));

type OpenModal = 'BRAND' | 'ROI' | null;

const BRAND_COLORS: BrandColor[] = ['social', 'emerald', 'indigo', 'blue', 'violet', 'slate'];

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
  const refreshController = useRef<AbortController | null>(null);

  const notify = useCallback((text: string) => setNotice({ id: Date.now(), text }), []);

  const accounts = useMemo(
    () => (connectedAccount ? [connectedAccount, ...mockAccounts] : mockAccounts),
    [connectedAccount],
  );

  const isClient = user?.role === 'CLIENT_VIEWER';
  // O cliente fica preso à própria conta e à visão simplificada.
  const selectedAccount =
    (isClient
      ? accounts.find((a) => a.id === user?.clientAccountId)
      : accounts.find((a) => a.id === selectedAccountId));
  // A conta de outro cliente nunca pode ser o fallback de uma conta ausente.
  const account = selectedAccount ?? (isClient ? mockAccounts[0] : accounts[0]);
  const viewMode: ViewMode = isClient ? 'CLIENT' : managerViewMode;
  const canConfigure = user?.role === 'AGENCY_MANAGER' && viewMode === 'MANAGER';

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
      Promise.all([loadBrandModal(), loadRoiModal()]).catch(() => {});
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

  useEffect(() => {
    if (user && activeTab === 'SETTINGS' && !canConfigure) selectTab('OVERVIEW');
  }, [user, activeTab, canConfigure, selectTab]);

  useEffect(() => () => refreshController.current?.abort(), []);

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
    refreshController.current?.abort();
    removeMetaConfig();
    removeKey(STORAGE_KEYS.connectedAccount);
    setConnectedAccount(null);
    setRefreshing(false);
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
    refreshController.current?.abort();
    setRefreshing(false);
    setConnectedAccount(connected);
    writeJSON(STORAGE_KEYS.connectedAccount, connected);
    selectAccount(connected.id);
    notify(`Conta ${connected.name} conectada e relatórios importados.`);
  };

  const handleDisconnect = () => {
    refreshController.current?.abort();
    removeMetaConfig();
    setRefreshing(false);
    setConnectedAccount(null);
    removeKey(STORAGE_KEYS.connectedAccount);
    if (selectedAccountId === connectedAccount?.id) selectAccount(mockAccounts[0].id);
    notify('Conta da Meta desconectada.');
  };

  const handleRefresh = async (range?: MetaReportRange) => {
    if (!account.isRealApi) return;
    if (!canConfigure) { notify('A agência gerencia a atualização desta conta.'); return; }
    const config = getSavedMetaConfig();
    if (!config || config.adAccountId !== account.id) {
      // Só o gestor tem o token; o cliente não deve cair na janela de conexão.
      if (isClient) {
        notify('Não foi possível atualizar agora. A agência atualiza os dados desta conta.');
        return;
      }
      notify('A sessão da Meta expirou. Cole o token de novo para atualizar.');
      selectTab('SETTINGS');
      return;
    }
    setRefreshing(true);
    refreshController.current?.abort();
    const controller = new AbortController();
    refreshController.current = controller;
    try {
      const result = await fetchMetaDashboard(config.accessToken, config.adAccountId, range ?? account.apiReport?.range, controller.signal);
      if (controller.signal.aborted) return;
      if (result.ok) {
        const updated = {...result.account, apiReport: result.report};
        setConnectedAccount(updated);
        writeJSON(STORAGE_KEYS.connectedAccount, updated);
        notify('Dados da Meta atualizados.');
      } else {
        notify(`${result.title}. ${result.detail}`);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') notify('A atualização não concluiu. Os últimos dados importados foram preservados.');
    } finally {
      if (refreshController.current === controller) { setRefreshing(false); refreshController.current = null; }
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

  if (isClient && !selectedAccount) {
    return <main className="social-app grid min-h-dvh place-items-center p-5"><section className="max-w-md rounded-2xl border border-slate-200 bg-white p-6"><h1 className="text-xl font-bold">Conta indisponível</h1><p className="mt-3 text-sm text-slate-600">A conta vinculada ao seu acesso não está disponível neste navegador. Peça à agência para configurar o acesso correto.</p><button type="button" onClick={handleLogout} className="mt-5 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Sair</button></section></main>;
  }

  const screenProps = { account, viewMode };

  return (
    <div className="social-app flex min-h-dvh flex-col">
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
        onRefresh={() => { void handleRefresh(); }}
        onOpenBrand={() => setOpenModal('BRAND')}
        onOpenConnect={() => selectTab('SETTINGS')}
        onOpenRoi={() => setOpenModal('ROI')}
        onLogout={handleLogout}
      />

      <main id="conteudo" tabIndex={-1} className="mx-auto outline-none w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <ErrorBoundary resetKey={`${activeTab}:${account.id}`}>
          <Suspense fallback={<PageSkeleton />}>
            {activeTab === 'SETTINGS' && canConfigure && <Settings connectedAccount={connectedAccount} onConnected={handleConnected} onDisconnect={handleDisconnect} onOpenBrand={() => setOpenModal('BRAND')} />}
            {account.isRealApi && activeTab !== 'SETTINGS' && <MetaReports key={account.id} account={account} tab={activeTab} canConfigure={canConfigure} refreshing={refreshing} onRefresh={handleRefresh} onOpenSettings={() => selectTab('SETTINGS')} />}
            {!account.isRealApi && activeTab === 'OVERVIEW' && (
              <Overview key={account.id} {...screenProps} onNavigate={navigate} onOpenConnect={() => selectTab('SETTINGS')} />
            )}
            {!account.isRealApi && activeTab === 'CAMPAIGNS' && (
              <Campaigns key={account.id} {...screenProps} objectiveFilter={objectiveFilter} onObjectiveFilterChange={setObjectiveFilter} />
            )}
            {!account.isRealApi && activeTab === 'CREATIVES' && <Creatives key={account.id} {...screenProps} />}
            {!account.isRealApi && activeTab === 'DAILY_REPORTS' && <DailyReports key={account.id} {...screenProps} brand={brand} />}
            {!account.isRealApi && activeTab === 'AUDIT' && <Audit key={account.id} {...screenProps} onNavigate={navigate} />}
          </Suspense>
        </ErrorBoundary>
      </main>

      <AppFooter brand={brand} account={account} isClient={isClient} />
      <BottomNav activeTab={activeTab} onSelectTab={selectTab} canConfigure={canConfigure} />

      <Suspense fallback={null}>
        {openModal === 'BRAND' && (
          <BrandSettingsModal open onClose={() => setOpenModal(null)} config={brand} onSave={handleSaveBrand} />
        )}
        {openModal === 'ROI' && <RoiCalculatorModal open onClose={() => setOpenModal(null)} account={account} />}
      </Suspense>

      <Toast notice={notice} onDismiss={() => setNotice(null)} />
    </div>
  );
}
