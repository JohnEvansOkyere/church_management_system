export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl bg-white/80 px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
