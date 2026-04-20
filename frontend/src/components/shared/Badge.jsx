/**
 * Unified status badge component.
 *
 * variant: 'active' | 'inactive' | 'visitor' | 'new_convert' |
 *          'followup' | 'stable' | 'present' | 'absent' | 'excused' |
 *          'default' (fallback)
 */

const VARIANTS = {
  active:      'bg-success-50 text-success-700 ring-success-100',
  stable:      'bg-success-50 text-success-700 ring-success-100',
  present:     'bg-success-50 text-success-700 ring-success-100',
  inactive:    'bg-slate-100 text-slate-600 ring-slate-200',
  absent:      'bg-slate-100 text-slate-600 ring-slate-200',
  visitor:     'bg-brand-50 text-brand-700 ring-brand-100',
  new_convert: 'bg-church-50 text-church-700 ring-church-100',
  followup:    'bg-accent-50 text-accent-700 ring-accent-100',
  excused:     'bg-church-50 text-church-700 ring-church-100',
  default:     'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function Badge({ children, variant = 'default' }) {
  const classes = VARIANTS[variant] ?? VARIANTS.default;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${classes}`}>
      {children}
    </span>
  );
}
