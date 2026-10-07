import { Link2 } from 'lucide-react';
import type { AdAccount } from '../../types/metaAds';
import { MetaConnectionPanel } from '../ui/MetaConnectionPanel';
import { Modal } from '../ui/Modal';

/** Compatibilidade: a entrada principal agora e a aba Configuracoes. */
export function MetaConnectModal({open,onClose,connectedAccount,onConnected,onDisconnect}: {
  open: boolean;
  onClose: () => void;
  connectedAccount: AdAccount | null;
  onConnected: (account: AdAccount) => void;
  onDisconnect: () => void;
}) {
  return <Modal open={open} onClose={onClose} title="Conectar conta da Meta" icon={Link2}>
    <MetaConnectionPanel connectedAccount={connectedAccount} onConnected={onConnected} onDisconnect={onDisconnect}/>
  </Modal>;
}
