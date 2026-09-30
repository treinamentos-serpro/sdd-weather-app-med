export default function LoadingState() {
  return (
    <div
      aria-label="Carregando previsão do tempo"
      className="flex min-h-32 items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur-md"
      role="status"
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-accent-400"
        />
        <span>Carregando...</span>
      </span>
    </div>
  );
}
