/** Esqueleto mostrado enquanto o código de uma tela carrega. */
export function PageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="h-7 w-48 rounded-lg bg-slate-200" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/80" />
        ))}
      </div>
      <div className="h-72 rounded-2xl bg-slate-200/70" />
    </div>
  );
}
