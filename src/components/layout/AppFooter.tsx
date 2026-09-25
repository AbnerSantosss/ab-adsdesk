import { MessageCircle } from 'lucide-react';
import type { BrandConfig } from '../../types/auth';
import type { AdAccount } from '../../types/metaAds';
import { META_GRAPH_API_VERSION } from '../../services/metaGraphApi';

interface AppFooterProps {
  brand: BrandConfig;
  account: AdAccount;
  isClient: boolean;
}

export function AppFooter({ brand, account, isClient }: AppFooterProps) {
  const whatsapp = brand.supportWhatsapp.replace(/\D/g, '');
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white pb-24 md:pb-0 print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          <span className="font-semibold text-slate-700">{brand.appName}</span>
          {brand.showPoweredBy && <> · Desenvolvido por {brand.parentBrand}</>}
          <span className="mx-1.5 text-slate-300" aria-hidden="true">
            ·
          </span>
          {account.isRealApi ? `Fonte: Meta Graph API ${META_GRAPH_API_VERSION}` : 'Fonte: dados de demonstração'}
        </p>
        {isClient && whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre o painel de anúncios de ${account.businessName}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="text-brand-700 inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Falar com {brand.parentBrand}
          </a>
        )}
      </div>
    </footer>
  );
}
