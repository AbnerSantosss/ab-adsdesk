/**
 * Acesso seguro ao localStorage/sessionStorage: em aba anônima, com cota cheia ou
 * com o armazenamento bloqueado, as funções falham em silêncio em vez de quebrar a tela.
 */
export type StorageArea = 'local' | 'session';

function area(kind: StorageArea): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, kind: StorageArea = 'local'): T | null {
  try {
    const raw = area(kind)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown, kind: StorageArea = 'local'): void {
  try {
    area(kind)?.setItem(key, JSON.stringify(value));
  } catch {
    // Sem armazenamento disponível: o dado vale só nesta sessão.
  }
}

export function removeKey(key: string, kind?: StorageArea): void {
  const kinds: StorageArea[] = kind ? [kind] : ['local', 'session'];
  for (const k of kinds) {
    try {
      area(k)?.removeItem(key);
    } catch {
      // Ignorado de propósito.
    }
  }
}

/** Lê primeiro do localStorage e depois do sessionStorage. */
export function readFromAny<T>(key: string): T | null {
  return readJSON<T>(key, 'local') ?? readJSON<T>(key, 'session');
}

export const STORAGE_KEYS = {
  authUser: 'ab_adsdesk_auth_user',
  brandConfig: 'ab_adsdesk_brand_config',
  metaApi: 'clareza_meta_api_config',
  connectedAccount: 'ab_adsdesk_connected_account',
  selectedAccount: 'ab_adsdesk_selected_account',
  /** E-mail de destino do relatório diário, por conta. */
  reportRecipients: 'ab_adsdesk_report_recipients',
} as const;
