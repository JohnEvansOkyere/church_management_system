import { Inbox } from 'lucide-react';

export default function EmptyState({ label = 'Nothing here yet', sublabel, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <Icon size={40} className="text-slate-300" strokeWidth={1.5} />
      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        {sublabel ? <p className="mt-1 text-xs text-slate-400">{sublabel}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
