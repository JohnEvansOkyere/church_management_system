export default function TrendBars({ title, data, color = 'bg-brand-700' }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="panel p-4">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <div className="mt-4 grid grid-cols-6 gap-2">
        {data.map((item) => {
          const height = Math.max(8, Math.round((item.value / maxValue) * 120));
          return (
            <div key={item.month} className="flex flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end justify-center rounded-lg bg-slate-50 px-1">
                <div className={`w-full rounded-sm ${color}`} style={{ height: `${height}px` }} title={`${item.month}: ${item.value}`} />
              </div>
              <p className="text-[11px] font-semibold text-slate-500">{item.month}</p>
              <p className="text-xs font-bold text-slate-700">{item.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
