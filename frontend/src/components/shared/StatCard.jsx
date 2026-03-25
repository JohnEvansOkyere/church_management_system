export default function StatCard({ label, value, helper, tone = 'default' }) {
  const toneClass =
    tone === 'good'
      ? 'from-emerald-50 to-white ring-emerald-200'
      : tone === 'warn'
        ? 'from-amber-50 to-white ring-amber-200'
        : 'from-sky-50 to-white ring-sky-200';

  return (
    <article className={`rounded-2xl bg-gradient-to-br ${toneClass} p-4 shadow-sm ring-1`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate-600">{helper}</p> : null}
    </article>
  );
}
