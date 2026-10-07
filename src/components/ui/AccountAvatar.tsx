import type { AdAccount } from '../../types/metaAds';
import { brandInitials } from './BrandLogo';
import { RaroPilatesIcon } from './RaroPilatesIcon';

interface AccountAvatarProps {
  account: Pick<AdAccount, 'name' | 'logoKey' | 'isRealApi'>;
  size?: number;
}

/** Ícone da conta do cliente: logotipo próprio quando existe, senão as iniciais. */
export function AccountAvatar({ account, size = 36 }: AccountAvatarProps) {
  if (account.logoKey === 'raro-pilates') {
    return (
      <span
        className="social-account-avatar grid shrink-0 place-items-center rounded-full bg-white"
        style={{ width: size, height: size }}
      >
        <RaroPilatesIcon size={Math.round(size * 0.86)} />
      </span>
    );
  }

  return (
    <span
      className={`social-account-avatar grid shrink-0 place-items-center rounded-full font-bold ${
        account.isRealApi ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-white'
      }`}
      style={{ width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.34)) }}
      aria-hidden="true"
    >
      {brandInitials(account.name)}
    </span>
  );
}
