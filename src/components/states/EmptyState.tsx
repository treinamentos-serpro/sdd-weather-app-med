interface EmptyStateProps {
  title: string;
  hint: string;
}

export default function EmptyState({ title, hint }: EmptyStateProps) {
  return (
    <section
      aria-labelledby="empty-state-title"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-glass backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold text-white" id="empty-state-title">
        {title}
      </h2>
      <p className="mt-2 text-sm text-white/80">{hint}</p>
    </section>
  );
}
