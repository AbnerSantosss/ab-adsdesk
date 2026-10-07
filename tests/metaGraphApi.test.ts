import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import {
  defaultMetaReportRange, fetchMetaAccount, fetchMetaDashboard,
  getSavedMetaConfig, removeMetaConfig, saveMetaConfig,
} from '../src/services/metaGraphApi.ts';

// Synthetic fixtures use the Graph API JSON shape; no credentials or account data.
const token = 'fixture-token';
const accountId = 'act_123456789';
const range = { since: '2026-09-01', until: '2026-09-30' };
const metadata = { id: accountId, name: 'Conta de teste', currency: 'BRL', timezone_name: 'America/Fortaleza', account_status: 1, amount_spent: '12345' };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const requests: URL[] = [];

function setup(overrides: (url: URL) => Response | undefined = () => undefined) {
  mock.method(globalThis, 'fetch', async (input: string, init: RequestInit) => {
    const url = new URL(input);
    requests.push(url);
    assert.equal(url.origin, 'https://graph.facebook.com');
    assert.ok(url.pathname.startsWith('/v26.0/'));
    assert.equal(url.searchParams.has('access_token'), false);
    assert.equal(url.toString().includes(token), false);
    assert.equal(new Headers(init.headers).get('Authorization'), `Bearer ${token}`);
    assert.equal(init.method, 'GET');
    assert.equal(init.redirect, 'error');
    return overrides(url) ?? response(url.pathname.endsWith(accountId) ? metadata : { data: [] });
  });
}

afterEach(() => { mock.restoreAll(); mock.timers.reset(); requests.length = 0; removeMetaConfig(); });

test('parses direct account totals, daily metrics and original creative; never sums alias actions', async () => {
  const row = {
    date_start: range.since, date_stop: range.until, spend: '123.45', impressions: '1000', clicks: '35', reach: '650',
    actions: [
      { action_type: 'lead', value: '9' }, { action_type: 'offsite_conversion.fb_pixel_lead', value: '6' },
      { action_type: 'onsite_conversion.messaging_conversation_started_7d', value: '4' },
      { action_type: 'onsite_conversion.messaging_conversation_started', value: '3' },
      { action_type: 'omni_purchase', value: '2' }, { action_type: 'purchase', value: '2' },
      { action_type: 'link_click', value: '20' },
    ],
  };
  setup((url) => {
    if (url.pathname.endsWith('/campaigns')) return response({ data: [{ id: '11', name: 'Campanha', objective: 'OUTCOME_LEADS', effective_status: 'ACTIVE' }] });
    if (url.pathname.endsWith('/ads')) return response({ data: [{ id: '22', name: 'Anúncio', campaign_id: '11', effective_status: 'PAUSED', creative: { id: '33', title: 'Imagem real', thumbnail_url: 'https://example.com/original.jpg' } }] });
    if (!url.pathname.endsWith('/insights')) return undefined;
    assert.deepEqual(JSON.parse(url.searchParams.get('time_range')!), range);
    if (url.searchParams.get('level') === 'campaign') return response({ data: [{ ...row, campaign_id: '11', campaign_name: 'Campanha' }] });
    if (url.searchParams.get('level') === 'ad') return response({ data: [{ ...row, ad_id: '22', ad_name: 'Anúncio', campaign_id: '11' }] });
    if (url.searchParams.get('time_increment') === '1') return response({ data: [{ ...row, date_start: '2026-09-02', reach: '500' }, { ...row, reach: '450' }] });
    return response({ data: [row] });
  });
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.ok(result.ok);
  assert.equal(result.report.totals.spend, 123.45);
  assert.equal(result.report.totals.reach, 650); // not 500 + 450
  assert.equal(result.report.totals.leads, 9); // not 9 + 6
  assert.equal(result.report.totals.messagingConversations, 4);
  assert.equal(result.report.totals.purchases, 2);
  assert.equal(result.report.totals.clicks, 35);
  assert.equal(result.report.daily[0].date, '2026-09-02');
  assert.equal(result.report.campaigns[0].objective, 'OUTCOME_LEADS');
  assert.equal(result.report.ads[0].creative?.thumbnailUrl, 'https://example.com/original.jpg');
  assert.equal(result.report.ads[0].campaignName, 'Campanha');
  assert.deepEqual(result.account.campaigns, []);
  assert.deepEqual(result.account.dailyHistory, []);
  assert.equal(result.account.apiSnapshot?.amountSpent, 123.45);
});

test('empty insights remain unknown and metadata does not fabricate results', async () => {
  setup((url) => url.pathname.endsWith('/campaigns') ? response({ data: [{ id: '11', name: 'Sem veiculação', objective: 'OUTCOME_TRAFFIC' }] }) : undefined);
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.ok(result.ok);
  assert.equal(result.report.isEmpty, true);
  assert.equal(result.report.totals.spend, null);
  assert.equal(result.report.totals.clicks, null);
  assert.equal(result.report.totals.actions, null);
  assert.equal(result.report.campaigns[0].spend, null);
  assert.equal(result.report.campaigns[0].status, null);
  assert.deepEqual(result.report.daily, []);
});

test('missing, invalid and explicitly zero metrics stay distinct', async () => {
  setup((url) => url.pathname.endsWith('/insights') && url.searchParams.get('level') === 'account' && url.searchParams.get('time_increment') === 'all_days'
    ? response({ data: [{ spend: '0', clicks: '', impressions: 'not-a-number', actions: [{ action_type: 'lead', value: '0' }] }] }) : undefined);
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.ok(result.ok);
  assert.equal(result.report.totals.spend, 0);
  assert.equal(result.report.totals.clicks, null);
  assert.equal(result.report.totals.impressions, null);
  assert.equal(result.report.totals.leads, 0);
  assert.equal(result.report.totals.messagingConversations, null);
});

test('paginates by cursor without following next URL or forwarding its token', async () => {
  setup((url) => {
    if (!url.pathname.endsWith('/ads')) return undefined;
    if (url.searchParams.get('after') === 'page-two') return response({ data: [{ id: '23', name: 'Dois' }] });
    return response({ data: [{ id: '22', name: 'Um' }], paging: { cursors: { after: 'page-two' }, next: 'https://untrusted.example/steal?access_token=remote-secret' } });
  });
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.ok(result.ok);
  assert.equal(result.report.ads.length, 2);
  assert.ok(requests.some((url) => url.searchParams.get('after') === 'page-two'));
});

test('rejects a repeated pagination cursor instead of showing partial data', async () => {
  setup((url) => url.pathname.endsWith('/ads') ? response({ data: [], paging: { next: 'https://graph.facebook.com/next', cursors: { after: 'repeat' } } }) : undefined);
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.detail, /paginação/);
});

test('fails explicitly at the pagination limit, without truncating', async () => {
  let page = 0;
  setup((url) => url.pathname.endsWith('/ads') ? response({ data: [], paging: { next: 'https://graph.facebook.com/next', cursors: { after: `page-${++page}` } } }) : undefined);
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.detail, /100 páginas/);
});

test('handles HTTP 401 and Graph permissions without exposing remote messages', async () => {
  setup(() => response({ error: { code: 190, message: `Do not display ${token}` } }, 401));
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, 190);
    assert.match(result.title, /Token/);
    assert.equal(result.detail.includes(token), false);
  }
});

test('a failed last edge rejects the whole report and uses a permissions message', async () => {
  setup((url) => url.pathname.endsWith('/ads') ? response({ error: { code: 200 } }, 403) : undefined);
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.title, /Permissão/);
  assert.equal('report' in result, false);
});

test('rejects duplicate insights without double counting', async () => {
  setup((url) => url.pathname.endsWith('/insights') && url.searchParams.get('level') === 'campaign'
    ? response({ data: [{ campaign_id: '11', spend: '12' }, { campaign_id: '11', spend: '12' }] }) : undefined);
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.detail, /duplicados/);
});

test('network and malformed replies return errors rather than zero metrics', async () => {
  const network = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Network failed'); });
  const result = await fetchMetaDashboard(token, accountId, range);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.title, /Sem resposta/);
  network.mock.restore();
  setup((url) => url.pathname.endsWith('/insights') ? response({ data: 'unexpected' }) : undefined);
  const malformed = await fetchMetaDashboard(token, accountId, range);
  assert.equal(malformed.ok, false);
  if (!malformed.ok) assert.match(malformed.title, /inesperada/);
});

test('aborts active requests and never applies a partial report', async () => {
  const controller = new AbortController();
  mock.method(globalThis, 'fetch', (_input: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }));
  const request = fetchMetaDashboard(token, accountId, range, controller.signal);
  controller.abort();
  await assert.rejects(request, { name: 'AbortError' });
});

test('times out stalled requests coherently', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  mock.method(globalThis, 'fetch', (_input: string, init: RequestInit) => new Promise((_resolve, reject) => {
    init.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  }));
  const request = fetchMetaAccount(token, accountId);
  mock.timers.tick(30_001);
  const result = await request;
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.title, /demorou/);
});

test('default range follows account timezone around midnight and includes thirty days', () => {
  assert.deepEqual(defaultMetaReportRange('America/Fortaleza', new Date('2026-10-01T01:00:00Z')), { since: '2026-09-01', until: '2026-09-30' });
  assert.deepEqual(defaultMetaReportRange('Asia/Tokyo', new Date('2026-09-30T16:00:00Z')), { since: '2026-09-02', until: '2026-10-01' });
});

test('rejects impossible dates and ranges over 366 days', async () => {
  setup();
  const impossible = await fetchMetaDashboard(token, accountId, { since: '2026-02-30', until: '2026-03-01' });
  assert.equal(impossible.ok, false);
  const tooLong = await fetchMetaDashboard(token, accountId, { since: '2024-01-01', until: '2026-03-01' });
  assert.equal(tooLong.ok, false);
  if (!tooLong.ok) assert.match(tooLong.detail, /366/);
});

test('credentials persist only in session and legacy local config is removed unread', () => {
  const local = new Map([['clareza_meta_api_config', 'legacy-must-not-be-read']]);
  const session = new Map<string, string>();
  const storage = (values: Map<string, string>) => ({ getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
  const oldWindow = globalThis.window;
  const localStorage = { ...storage(local), getItem: () => { throw new Error('Local credential was read'); } };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage, sessionStorage: storage(session) } });
  try {
    saveMetaConfig({ accessToken: token, adAccountId: accountId }, true);
    assert.equal(local.size, 0);
    assert.equal(session.size, 1);
    assert.equal(getSavedMetaConfig()?.adAccountId, accountId);
    removeMetaConfig();
    assert.equal(session.size, 0);
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: oldWindow });
  }
});
