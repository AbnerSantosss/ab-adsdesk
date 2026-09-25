import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { buttonClass } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Quando muda (ex.: aba ou conta), o erro é limpo e a tela tenta de novo. */
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Impede que um erro numa tela derrube o app inteiro. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AdsDesk] Erro ao desenhar a tela:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <AlertTriangle className="mx-auto size-8 text-rose-600" aria-hidden="true" />
        <h2 className="mt-2 text-base font-bold text-rose-900">Não foi possível mostrar esta tela</h2>
        <p className="mt-1 text-sm text-rose-800">
          Tente de novo. Se o problema continuar, recarregue a página.
        </p>
        <button type="button" className={buttonClass('secondary', 'md', 'mt-4')} onClick={() => this.setState({ error: null })}>
          Tentar de novo
        </button>
      </div>
    );
  }
}
