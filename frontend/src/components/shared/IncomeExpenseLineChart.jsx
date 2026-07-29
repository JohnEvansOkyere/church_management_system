import { formatCurrency } from '../../utils/formatters';

const CHART = {
  width: 760,
  height: 320,
  left: 72,
  right: 24,
  top: 24,
  bottom: 48,
};

const INCOME_COLOR = '#15803D';
const EXPENSE_COLOR = '#C02416';

function compactCurrency(value) {
  return `GH₵${new Intl.NumberFormat('en-GH', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)}`;
}

function linePath(points) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

export default function IncomeExpenseLineChart({ incomeData = [], expenseData = [] }) {
  const months = [...new Set([
    ...incomeData.map((item) => item.month),
    ...expenseData.map((item) => item.month),
  ])];
  const incomeByMonth = new Map(incomeData.map((item) => [item.month, Number(item.value) || 0]));
  const expenseByMonth = new Map(expenseData.map((item) => [item.month, Number(item.value) || 0]));
  const rows = months.map((month) => ({
    month,
    income: incomeByMonth.get(month) || 0,
    expense: expenseByMonth.get(month) || 0,
  }));

  if (!rows.length) {
    return (
      <section className="panel p-5">
        <h3 className="text-sm font-bold text-slate-800">Income vs Expenses</h3>
        <p className="mt-8 text-center text-sm text-slate-500">No finance trend data yet.</p>
      </section>
    );
  }

  const plotWidth = CHART.width - CHART.left - CHART.right;
  const plotHeight = CHART.height - CHART.top - CHART.bottom;
  const maxValue = Math.max(...rows.flatMap((row) => [row.income, row.expense]), 1);
  const xFor = (index) => CHART.left + (rows.length === 1 ? plotWidth / 2 : (index / (rows.length - 1)) * plotWidth);
  const yFor = (value) => CHART.top + plotHeight - (value / maxValue) * plotHeight;
  const incomePoints = rows.map((row, index) => ({ x: xFor(index), y: yFor(row.income), value: row.income, month: row.month }));
  const expensePoints = rows.map((row, index) => ({ x: xFor(index), y: yFor(row.expense), value: row.expense, month: row.month }));
  const ticks = Array.from({ length: 5 }, (_, index) => (maxValue / 4) * index);

  return (
    <section className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Income vs Expenses</h3>
          <p className="mt-1 text-xs text-slate-500">Monthly financial movement on one shared scale.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success-700" /> Income</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-accent-700" /> Expenses</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${CHART.width} ${CHART.height}`}
          className="min-w-[640px] w-full"
          role="img"
          aria-label="Line chart comparing monthly income in green and monthly expenses in red"
        >
          {ticks.map((tick) => {
            const y = yFor(tick);
            return (
              <g key={tick}>
                <line x1={CHART.left} x2={CHART.width - CHART.right} y1={y} y2={y} stroke="#E2E8F0" strokeDasharray="4 5" />
                <text x={CHART.left - 12} y={y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                  {compactCurrency(tick)}
                </text>
              </g>
            );
          })}

          <line
            x1={CHART.left}
            x2={CHART.width - CHART.right}
            y1={CHART.top + plotHeight}
            y2={CHART.top + plotHeight}
            stroke="#CBD5E1"
          />

          {rows.map((row, index) => (
            <text
              key={row.month}
              x={xFor(index)}
              y={CHART.height - 18}
              textAnchor="middle"
              className="fill-slate-500 text-[11px] font-semibold"
            >
              {row.month}
            </text>
          ))}

          <path d={linePath(incomePoints)} fill="none" stroke={INCOME_COLOR} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d={linePath(expensePoints)} fill="none" stroke={EXPENSE_COLOR} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {incomePoints.map((point) => (
            <circle key={`income-${point.month}`} cx={point.x} cy={point.y} r="5" fill="white" stroke={INCOME_COLOR} strokeWidth="3">
              <title>{`${point.month} income: ${formatCurrency(point.value)}`}</title>
            </circle>
          ))}
          {expensePoints.map((point) => (
            <circle key={`expense-${point.month}`} cx={point.x} cy={point.y} r="5" fill="white" stroke={EXPENSE_COLOR} strokeWidth="3">
              <title>{`${point.month} expenses: ${formatCurrency(point.value)}`}</title>
            </circle>
          ))}
        </svg>
      </div>
    </section>
  );
}
