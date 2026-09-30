interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section
      aria-labelledby="weather-error-title"
      className="rounded-2xl border border-red-300/20 bg-red-950/30 p-6 shadow-glass backdrop-blur-md"
      role="alert"
    >
      <h2 className="text-lg font-semibold text-white" id="weather-error-title">
        Não foi possível carregar a previsão
      </h2>
      <p className="mt-2 text-sm text-white/80">{message}</p>
      <button
        className="mt-5 rounded-xl bg-accent-500 px-4 py-2.5 font-semibold text-white transition hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-night-900"
        onClick={onRetry}
        type="button"
      >
        Tentar novamente
      </button>
    </section>
  );
}
