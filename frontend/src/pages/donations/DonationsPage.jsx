import { useMemo, useState } from 'react';

import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import {
  useBootstrapDonationFunds,
  useBootstrapExpenseCategories,
  useCreateDonation,
  useCreateDonationFund,
  useCreateExpense,
  useCreateExpenseCategory,
  useCreateFinanceBatch,
  useDonationAnnualReport,
  useDonationFunds,
  useDonations,
  useExpenseCategories,
  useExpenses,
  useFinanceBatches,
  useFinanceSummary,
} from '../../hooks/useDonations';
import { useDashboardReport } from '../../hooks/useReports';
import { useMembers } from '../../hooks/useMembers';
import { donationsService } from '../../services/donationsService';
import { ATTENDANCE_TYPES, DONATION_METHODS, STANDARD_FINANCE_FUNDS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';

const currentYear = new Date().getFullYear();

const actionCards = [
  {
    id: 'collection',
    icon: 'Collection',
    accent: 'from-emerald-50 to-white border-emerald-200',
    title: 'Record Church Collection',
    description: 'Use this for offertory, harvest, thanksgiving, and other general church collections.',
  },
  {
    id: 'tithe',
    icon: 'Tithe',
    accent: 'from-cyan-50 to-white border-cyan-200',
    title: 'Record Member Tithe',
    description: 'Use this when the giving must be attached to a specific member.',
  },
  {
    id: 'expense',
    icon: 'Expense',
    accent: 'from-amber-50 to-white border-amber-200',
    title: 'Record Expense',
    description: 'Use this for church spending such as welfare, utilities, maintenance, and programs.',
  },
];

function defaultBatchForm() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    title: `Sunday Service Collection - ${today}`,
    service_date: today,
    service_type: 'sunday_service',
    notes: '',
  };
}

function defaultDonationForm() {
  return {
    member_id: '',
    batch_id: '',
    fund_id: '',
    amount: '',
    currency: 'GHS',
    payment_method: 'cash',
    reference: '',
    donation_date: new Date().toISOString().slice(0, 10),
    notes: '',
  };
}

function defaultExpenseForm() {
  return {
    category_id: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    currency: 'GHS',
    payment_method: 'cash',
    vendor_name: '',
    reference: '',
    notes: '',
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function firstDayOfYearISO() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

function SectionHeader({ eyebrow, title, detail }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{eyebrow}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
      {detail ? <p className="mt-1 text-sm text-slate-600">{detail}</p> : null}
    </div>
  );
}

function ActionCard({ item, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-gradient-to-br p-5 text-left transition ${
        isActive
          ? `shadow-sm ring-2 ring-brand-200 ${item.accent} border-brand-600`
          : `${item.accent} hover:border-slate-300 hover:bg-slate-50`
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
          {item.icon}
        </span>
        {isActive ? (
          <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
            Active
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">{item.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
    </button>
  );
}

export default function DonationsPage() {
  const [activeAction, setActiveAction] = useState('collection');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [ledgerView, setLedgerView] = useState('income');
  const [message, setMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    fund_id: '',
    category_id: '',
  });

  const [donationForm, setDonationForm] = useState(defaultDonationForm());
  const [batchForm, setBatchForm] = useState(defaultBatchForm());
  const [fundForm, setFundForm] = useState({ name: '', description: '' });
  const [expenseForm, setExpenseForm] = useState(defaultExpenseForm());
  const [expenseCategoryForm, setExpenseCategoryForm] = useState({ name: '', description: '' });

  const donationsQuery = useDonations({
    skip: 0,
    limit: 20,
    batch_id: selectedBatchId || undefined,
    fund_id: filters.fund_id || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
  });
  const expensesQuery = useExpenses({
    skip: 0,
    limit: 20,
    category_id: filters.category_id || undefined,
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
  });
  const fundsQuery = useDonationFunds();
  const batchesQuery = useFinanceBatches({ include_closed: true });
  const expenseCategoriesQuery = useExpenseCategories();
  const membersQuery = useMembers({ skip: 0, limit: 100 });
  const annualReportQuery = useDonationAnnualReport(currentYear);
  const dashboardQuery = useDashboardReport();
  const summaryQuery = useFinanceSummary({
    start_date: filters.start_date || undefined,
    end_date: filters.end_date || undefined,
    batch_id: selectedBatchId || undefined,
    fund_id: filters.fund_id || undefined,
    category_id: filters.category_id || undefined,
  });

  const createDonationMutation = useCreateDonation();
  const createBatchMutation = useCreateFinanceBatch();
  const createExpenseMutation = useCreateExpense();
  const createFundMutation = useCreateDonationFund();
  const createExpenseCategoryMutation = useCreateExpenseCategory();
  const bootstrapFundsMutation = useBootstrapDonationFunds();
  const bootstrapExpenseCategoriesMutation = useBootstrapExpenseCategories();

  const funds = fundsQuery.data?.data ?? [];
  const batches = batchesQuery.data?.data ?? [];
  const members = membersQuery.data?.data ?? [];
  const donationRows = donationsQuery.data?.data ?? [];
  const expenseRows = expensesQuery.data?.data ?? [];
  const expenseCategories = expenseCategoriesQuery.data?.data ?? [];
  const annual = annualReportQuery.data?.data;
  const dashboard = dashboardQuery.data?.data ?? {};
  const summary = summaryQuery.data?.data ?? {};

  const activeBatch = batches.find((batch) => batch.id === (donationForm.batch_id || selectedBatchId)) ?? null;
  const selectedFund = funds.find((fund) => fund.id === donationForm.fund_id) ?? null;
  const memberRequired = Boolean(selectedFund?.requires_member);
  const titheFund = funds.find((fund) => String(fund.code).toLowerCase() === 'tithe') ?? null;
  const selectedCollectionFund = funds.find((fund) => fund.id === donationForm.fund_id);
  const selectedExpenseCategory = expenseCategories.find((category) => category.id === expenseForm.category_id);

  const incomeColumns = [
    { key: 'donation_date', label: 'Date', render: (row) => formatDate(row.donation_date) },
    { key: 'fund_name', label: 'Fund' },
    { key: 'member_name', label: 'Member', render: (row) => row.member_name || 'General collection' },
    { key: 'batch_title', label: 'Batch', render: (row) => row.batch_title || '-' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount, row.currency || 'GHS') },
  ];

  const expenseColumns = [
    { key: 'expense_date', label: 'Date', render: (row) => formatDate(row.expense_date) },
    { key: 'category_name', label: 'Category' },
    { key: 'vendor_name', label: 'Vendor / Payee', render: (row) => row.vendor_name || '-' },
    { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount, row.currency || 'GHS') },
    { key: 'payment_method', label: 'Method' },
  ];

  const setupReady = useMemo(
    () => ({
      fundsLoaded: funds.length > 0,
      categoriesLoaded: expenseCategories.length > 0,
      batchOpen: batches.length > 0,
    }),
    [funds.length, expenseCategories.length, batches.length]
  );

  const todayChecklist = [
    {
      label: 'Standard church funds loaded',
      done: setupReady.fundsLoaded,
    },
    {
      label: 'Expense categories ready',
      done: setupReady.categoriesLoaded,
    },
    {
      label: 'Collection batch open for today',
      done: Boolean(activeBatch),
    },
  ];

  const presetFilters = [
    { label: 'Today', apply: () => setFilters((prev) => ({ ...prev, start_date: todayISO(), end_date: todayISO() })) },
    { label: 'This Month', apply: () => setFilters((prev) => ({ ...prev, start_date: firstDayOfMonthISO(), end_date: todayISO() })) },
    { label: 'This Year', apply: () => setFilters((prev) => ({ ...prev, start_date: firstDayOfYearISO(), end_date: todayISO() })) },
    { label: 'Clear Dates', apply: () => setFilters((prev) => ({ ...prev, start_date: '', end_date: '' })) },
  ];

  function resetFilters() {
    setFilters({
      start_date: '',
      end_date: '',
      fund_id: '',
      category_id: '',
    });
    setSelectedBatchId('');
  }

  async function onExportSummary() {
    setExporting(true);
    try {
      const response = await donationsService.exportSummary({
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        batch_id: selectedBatchId || undefined,
        fund_id: filters.fund_id || undefined,
        category_id: filters.category_id || undefined,
      });
      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'finance-summary.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage('Filtered finance summary exported successfully.');
    } finally {
      setExporting(false);
    }
  }

  async function onCreateBatch(event) {
    event.preventDefault();
    setMessage('');
    const response = await createBatchMutation.mutateAsync(batchForm);
    const batchId = response.data.data.id;
    setSelectedBatchId(batchId);
    setDonationForm((prev) => ({ ...prev, batch_id: batchId, donation_date: batchForm.service_date }));
    setMessage('Collection batch opened successfully.');
  }

  async function onCreateDonation(event) {
    event.preventDefault();
    setMessage('');
    await createDonationMutation.mutateAsync({
      ...donationForm,
      member_id: donationForm.member_id || null,
      batch_id: donationForm.batch_id || null,
      amount: Number(donationForm.amount),
      payment_method: donationForm.payment_method || null,
      reference: donationForm.reference || null,
      notes: donationForm.notes || null,
    });
    const summaryLabel =
      activeAction === 'tithe'
        ? `Saved ${formatCurrency(donationForm.amount || 0)} as tithe for ${
            members.find((member) => member.id === donationForm.member_id)
              ? `${members.find((member) => member.id === donationForm.member_id).first_name} ${members.find((member) => member.id === donationForm.member_id).last_name}`
              : 'selected member'
          }.`
        : `Saved ${formatCurrency(donationForm.amount || 0)} as ${selectedCollectionFund?.name || 'church collection'}.`;
    setDonationForm((prev) => ({
      ...defaultDonationForm(),
      batch_id: prev.batch_id,
      donation_date: prev.donation_date,
      fund_id: activeAction === 'tithe' && titheFund ? titheFund.id : '',
    }));
    setMessage(summaryLabel);
  }

  async function onCreateExpense(event) {
    event.preventDefault();
    setMessage('');
    await createExpenseMutation.mutateAsync({
      ...expenseForm,
      amount: Number(expenseForm.amount),
      payment_method: expenseForm.payment_method || null,
      vendor_name: expenseForm.vendor_name || null,
      reference: expenseForm.reference || null,
      notes: expenseForm.notes || null,
    });
    setExpenseForm(defaultExpenseForm());
    setMessage(`Saved ${formatCurrency(expenseForm.amount || 0)} as ${selectedExpenseCategory?.name || 'expense'}${expenseForm.vendor_name ? ` for ${expenseForm.vendor_name}` : ''}.`);
  }

  async function onCreateFund(event) {
    event.preventDefault();
    setMessage('');
    await createFundMutation.mutateAsync({
      name: fundForm.name,
      description: fundForm.description || null,
    });
    setFundForm({ name: '', description: '' });
    setMessage('Finance fund created successfully.');
  }

  async function onCreateExpenseCategory(event) {
    event.preventDefault();
    setMessage('');
    await createExpenseCategoryMutation.mutateAsync({
      name: expenseCategoryForm.name,
      description: expenseCategoryForm.description || null,
    });
    setExpenseCategoryForm({ name: '', description: '' });
    setMessage('Expense category created successfully.');
  }

  async function onBootstrapFunds() {
    setMessage('');
    const response = await bootstrapFundsMutation.mutateAsync();
    const count = response.data.data.length;
    setMessage(count > 0 ? `Added ${count} standard church funds.` : 'Standard church funds already exist.');
  }

  async function onBootstrapExpenseCategories() {
    setMessage('');
    const response = await bootstrapExpenseCategoriesMutation.mutateAsync();
    const count = response.data.data.length;
    setMessage(count > 0 ? `Added ${count} standard expense categories.` : 'Standard expense categories already exist.');
  }

  function switchAction(nextAction) {
    setActiveAction(nextAction);
    if (nextAction === 'tithe' && titheFund) {
      setDonationForm((prev) => ({ ...prev, fund_id: titheFund.id }));
    }
    if (nextAction === 'collection' && titheFund && donationForm.fund_id === titheFund.id) {
      setDonationForm((prev) => ({ ...prev, fund_id: '' }));
    }
  }

  return (
    <section>
      <PageHeader
        title="Finance"
        subtitle="Choose one task, complete it, and move on. The page is now arranged for church office work, not technical setup."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income This Month" value={formatCurrency(dashboard.donations_this_month ?? 0)} helper="All giving received this month" tone="good" />
        <StatCard label="Expenses This Month" value={formatCurrency(dashboard.expenses_this_month ?? 0)} helper="All spending recorded this month" tone="warn" />
        <StatCard label="Net Flow" value={formatCurrency(dashboard.net_flow_this_month ?? 0)} helper="Income minus expenses this month" tone={(dashboard.net_flow_this_month ?? 0) >= 0 ? 'good' : 'warn'} />
        <StatCard label="Annual Giving" value={formatCurrency(annual?.total ?? 0)} helper="Recorded giving for the current year" />
      </div>

      <div className="panel mb-6 p-5">
        <SectionHeader
          eyebrow="Finance Dashboard"
          title="Filter totals and category breakdown"
          detail="Set a period or category filter to see totals for income, expenses, and each finance category."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Start Date</label>
            <input className="field" type="date" value={filters.start_date} onChange={(e) => setFilters((prev) => ({ ...prev, start_date: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">End Date</label>
            <input className="field" type="date" value={filters.end_date} onChange={(e) => setFilters((prev) => ({ ...prev, end_date: e.target.value }))} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Income Category</label>
            <select className="field" value={filters.fund_id} onChange={(e) => setFilters((prev) => ({ ...prev, fund_id: e.target.value }))}>
              <option value="">All income categories</option>
              {funds.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Expense Category</label>
            <select className="field" value={filters.category_id} onChange={(e) => setFilters((prev) => ({ ...prev, category_id: e.target.value }))}>
              <option value="">All expense categories</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button type="button" onClick={resetFilters} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reset Filters
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presetFilters.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.apply}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onExportSummary}
            disabled={exporting}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {exporting ? 'Exporting...' : 'Export Summary'}
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Filtered Income" value={formatCurrency(summary.income_total ?? 0)} helper="Total of filtered income records" tone="good" />
          <StatCard label="Filtered Expenses" value={formatCurrency(summary.expense_total ?? 0)} helper="Total of filtered expense records" tone="warn" />
          <StatCard label="Filtered Net" value={formatCurrency(summary.net_total ?? 0)} helper="Income minus expenses for current filters" tone={(summary.net_total ?? 0) >= 0 ? 'good' : 'warn'} />
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4">
            <SectionHeader eyebrow="Income Totals" title="By category" detail="Shows the total amount for each giving category under the current filters." />
            {summaryQuery.isLoading ? (
              <LoadingSpinner label="Loading income totals..." />
            ) : (summary.income_by_fund ?? []).length === 0 ? (
              <p className="text-sm text-slate-600">No income totals for the current filter.</p>
            ) : (
              <div className="space-y-2">
                {(summary.income_by_fund ?? []).map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <SectionHeader eyebrow="Expense Totals" title="By category" detail="Shows the total amount for each expense category under the current filters." />
            {summaryQuery.isLoading ? (
              <LoadingSpinner label="Loading expense totals..." />
            ) : (summary.expenses_by_category ?? []).length === 0 ? (
              <p className="text-sm text-slate-600">No expense totals for the current filter.</p>
            ) : (
              <div className="space-y-2">
                {(summary.expenses_by_category ?? []).map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel mb-6 p-5">
        <SectionHeader
          eyebrow="Today’s Task"
          title="What do you want to record?"
          detail="Pick one option below. The form will change to match the church activity you are recording."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {actionCards.map((item) => (
            <ActionCard key={item.id} item={item} isActive={activeAction === item.id} onClick={() => switchAction(item.id)} />
          ))}
        </div>
      </div>

      <div className="panel mb-6 p-5">
        <SectionHeader
          eyebrow="Today’s Checklist"
          title="Before finance work begins"
          detail="A quick visual check so a secretary or finance officer knows the page is ready."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {todayChecklist.map((item) => (
            <div
              key={item.label}
              className={`rounded-2xl border px-4 py-4 ${item.done ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}
            >
              <p className={`text-xs font-bold uppercase tracking-[0.16em] ${item.done ? 'text-emerald-700' : 'text-amber-700'}`}>
                {item.done ? 'Ready' : 'Needs Attention'}
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Funds Ready" value={setupReady.fundsLoaded ? 'Yes' : 'No'} helper="Finance funds available for recording" tone={setupReady.fundsLoaded ? 'good' : 'warn'} />
        <StatCard label="Expense Categories" value={setupReady.categoriesLoaded ? 'Ready' : 'Not Ready'} helper="Needed before recording expenses" tone={setupReady.categoriesLoaded ? 'good' : 'warn'} />
        <StatCard label="Collection Batch" value={activeBatch ? 'Open' : 'None'} helper="Useful for Sunday and event collections" tone={activeBatch ? 'good' : 'default'} />
      </div>

      {message ? (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-5">
          {activeAction === 'collection' ? (
            <>
              <SectionHeader
                eyebrow="General Collection"
                title="Record offertory or general church giving"
                detail="Best for Sunday offertory, harvest, thanksgiving, and other collections that are not tied to one member."
              />

              <form onSubmit={onCreateDonation} className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Collection Batch</label>
                    <select
                      className="field"
                      value={donationForm.batch_id}
                      onChange={(e) => {
                        const batchId = e.target.value;
                        const batch = batches.find((item) => item.id === batchId);
                        setSelectedBatchId(batchId);
                        setDonationForm((prev) => ({
                          ...prev,
                          batch_id: batchId,
                          donation_date: batch?.service_date || prev.donation_date,
                        }));
                      }}
                    >
                      <option value="">Select batch if this is from a service</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.title} - {formatDate(batch.service_date)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Collection Type</label>
                    <select className="field" value={donationForm.fund_id} onChange={(e) => setDonationForm((prev) => ({ ...prev, fund_id: e.target.value }))} required>
                      <option value="">Choose what you are recording</option>
                      {funds
                        .filter((fund) => !fund.requires_member)
                        .map((fund) => (
                          <option key={fund.id} value={fund.id}>
                            {fund.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <input className="field" type="number" min="0.01" step="0.01" placeholder="Amount" value={donationForm.amount} onChange={(e) => setDonationForm((prev) => ({ ...prev, amount: e.target.value }))} required />
                  <select className="field" value={donationForm.payment_method} onChange={(e) => setDonationForm((prev) => ({ ...prev, payment_method: e.target.value }))}>
                    {DONATION_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
                    <input className="field" type="date" value={donationForm.donation_date} onChange={(e) => setDonationForm((prev) => ({ ...prev, donation_date: e.target.value }))} required />
                  </div>
                  <input className="field" placeholder="Reference (optional)" value={donationForm.reference} onChange={(e) => setDonationForm((prev) => ({ ...prev, reference: e.target.value }))} />
                  <input className="field md:col-span-2" placeholder="Notes (optional)" value={donationForm.notes} onChange={(e) => setDonationForm((prev) => ({ ...prev, notes: e.target.value }))} />
                </div>
                <button type="submit" className="btn-primary">
                  {createDonationMutation.isPending ? 'Saving...' : 'Save Collection'}
                </button>
              </form>
            </>
          ) : null}

          {activeAction === 'tithe' ? (
            <>
              <SectionHeader
                eyebrow="Member Tithe"
                title="Record tithe for a specific member"
                detail="This always links the giving to one member so their profile and statements stay correct."
              />

              <form onSubmit={onCreateDonation} className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Member</label>
                    <select className="field" value={donationForm.member_id} onChange={(e) => setDonationForm((prev) => ({ ...prev, member_id: e.target.value, fund_id: titheFund?.id || prev.fund_id }))} required>
                      <option value="">Select member</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tithe Fund</label>
                    <input className="field bg-slate-50" value={titheFund?.name || 'Tithe fund not loaded'} disabled />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Batch (optional)</label>
                    <select
                      className="field"
                      value={donationForm.batch_id}
                      onChange={(e) => {
                        const batchId = e.target.value;
                        const batch = batches.find((item) => item.id === batchId);
                        setSelectedBatchId(batchId);
                        setDonationForm((prev) => ({
                          ...prev,
                          batch_id: batchId,
                          donation_date: batch?.service_date || prev.donation_date,
                          fund_id: titheFund?.id || prev.fund_id,
                        }));
                      }}
                    >
                      <option value="">No batch selected</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input className="field" type="number" min="0.01" step="0.01" placeholder="Amount" value={donationForm.amount} onChange={(e) => setDonationForm((prev) => ({ ...prev, amount: e.target.value, fund_id: titheFund?.id || prev.fund_id }))} required />
                  <select className="field" value={donationForm.payment_method} onChange={(e) => setDonationForm((prev) => ({ ...prev, payment_method: e.target.value, fund_id: titheFund?.id || prev.fund_id }))}>
                    {DONATION_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
                    <input className="field" type="date" value={donationForm.donation_date} onChange={(e) => setDonationForm((prev) => ({ ...prev, donation_date: e.target.value, fund_id: titheFund?.id || prev.fund_id }))} required />
                  </div>
                  <input className="field" placeholder="Reference (optional)" value={donationForm.reference} onChange={(e) => setDonationForm((prev) => ({ ...prev, reference: e.target.value, fund_id: titheFund?.id || prev.fund_id }))} />
                  <input className="field md:col-span-2" placeholder="Notes (optional)" value={donationForm.notes} onChange={(e) => setDonationForm((prev) => ({ ...prev, notes: e.target.value, fund_id: titheFund?.id || prev.fund_id }))} />
                </div>
                <button type="submit" className="btn-primary" disabled={!titheFund}>
                  {createDonationMutation.isPending ? 'Saving...' : 'Save Member Tithe'}
                </button>
              </form>
            </>
          ) : null}

          {activeAction === 'expense' ? (
            <>
              <SectionHeader
                eyebrow="Church Spending"
                title="Record an expense"
                detail="Use this for welfare support, utilities, maintenance, events, and any other church spending."
              />

              <form onSubmit={onCreateExpense} className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <select className="field" value={expenseForm.category_id} onChange={(e) => setExpenseForm((prev) => ({ ...prev, category_id: e.target.value }))} required>
                    <option value="">Select expense category</option>
                    {expenseCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <input className="field" type="number" min="0.01" step="0.01" placeholder="Amount" value={expenseForm.amount} onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: e.target.value }))} required />
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Expense Date</label>
                    <input className="field" type="date" value={expenseForm.expense_date} onChange={(e) => setExpenseForm((prev) => ({ ...prev, expense_date: e.target.value }))} required />
                  </div>
                  <select className="field" value={expenseForm.payment_method} onChange={(e) => setExpenseForm((prev) => ({ ...prev, payment_method: e.target.value }))}>
                    {DONATION_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <input className="field" placeholder="Vendor or payee" value={expenseForm.vendor_name} onChange={(e) => setExpenseForm((prev) => ({ ...prev, vendor_name: e.target.value }))} />
                  <input className="field" placeholder="Reference (optional)" value={expenseForm.reference} onChange={(e) => setExpenseForm((prev) => ({ ...prev, reference: e.target.value }))} />
                  <input className="field md:col-span-2" placeholder="Notes (optional)" value={expenseForm.notes} onChange={(e) => setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))} />
                </div>
                <button type="submit" className="btn-primary">
                  {createExpenseMutation.isPending ? 'Saving...' : 'Save Expense'}
                </button>
              </form>
            </>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="panel p-5">
            <SectionHeader
              eyebrow="Current Context"
              title="Quick status"
              detail="This side panel helps the user know whether the page is ready for today’s finance work."
            />
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{activeBatch ? activeBatch.title : 'No collection batch selected'}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {activeBatch ? `${formatDate(activeBatch.service_date)} · ${activeBatch.service_type || 'service'}` : 'Open a batch if you are recording Sunday or event collections.'}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Batch Total</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(activeBatch?.total_amount ?? 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Entries</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{activeBatch?.transaction_count ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="panel p-5">
            <SectionHeader
              eyebrow="Annual Giving"
              title="Current year summary"
              detail="A simple breakdown by fund so finance users can verify where income is going."
            />
            {annualReportQuery.isLoading ? (
              <LoadingSpinner label="Loading annual report..." />
            ) : (
              <div className="space-y-2">
                {(annual?.funds ?? []).length === 0 ? (
                  <p className="text-sm text-slate-600">No income totals yet.</p>
                ) : (
                  (annual?.funds ?? []).map((item) => (
                    <div key={item.fund} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{item.fund}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <details className="panel mt-6 p-5">
        <summary className="cursor-pointer list-none text-base font-semibold text-slate-900">
          Advanced Setup
          <span className="ml-2 text-sm font-normal text-slate-500">Load standard funds, open collection batches, and add custom setup items.</span>
        </summary>

        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <form onSubmit={onCreateBatch} className="rounded-2xl border border-slate-200 p-4">
            <SectionHeader eyebrow="Batch Setup" title="Open collection batch" detail="Use a batch when several offerings belong to one service or event." />
            <div className="grid gap-3 md:grid-cols-2">
              <input className="field" value={batchForm.title} onChange={(e) => setBatchForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Batch title" required />
              <input className="field" type="date" value={batchForm.service_date} onChange={(e) => setBatchForm((prev) => ({ ...prev, service_date: e.target.value }))} required />
              <select className="field" value={batchForm.service_type} onChange={(e) => setBatchForm((prev) => ({ ...prev, service_type: e.target.value }))}>
                {ATTENDANCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input className="field" value={batchForm.notes} onChange={(e) => setBatchForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" />
            </div>
            <button type="submit" className="btn-primary mt-4">
              {createBatchMutation.isPending ? 'Opening...' : 'Open Batch'}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-200 p-4">
            <SectionHeader eyebrow="Church Funds" title="Finance setup" detail="Load standard funds once, then only add custom ones when needed." />
            <div className="flex flex-wrap gap-2">
              {STANDARD_FINANCE_FUNDS.map((name) => {
                const exists = funds.some((fund) => fund.name === name);
                return (
                  <span key={name} className={`rounded-full px-3 py-1 text-xs font-semibold ${exists ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {name}
                  </span>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={onBootstrapFunds} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {bootstrapFundsMutation.isPending ? 'Adding...' : 'Load Standard Funds'}
              </button>
              <button type="button" onClick={onBootstrapExpenseCategories} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                {bootstrapExpenseCategoriesMutation.isPending ? 'Adding...' : 'Load Expense Categories'}
              </button>
            </div>
            <div className="mt-5 grid gap-6 md:grid-cols-2">
              <form onSubmit={onCreateFund} className="grid gap-3">
                <input className="field" placeholder="Custom fund name" value={fundForm.name} onChange={(e) => setFundForm((prev) => ({ ...prev, name: e.target.value }))} required />
                <input className="field" placeholder="Description" value={fundForm.description} onChange={(e) => setFundForm((prev) => ({ ...prev, description: e.target.value }))} />
                <button type="submit" className="btn-primary">
                  {createFundMutation.isPending ? 'Saving...' : 'Add Fund'}
                </button>
              </form>
              <form onSubmit={onCreateExpenseCategory} className="grid gap-3">
                <input className="field" placeholder="Custom expense category" value={expenseCategoryForm.name} onChange={(e) => setExpenseCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
                <input className="field" placeholder="Description" value={expenseCategoryForm.description} onChange={(e) => setExpenseCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
                <button type="submit" className="btn-primary">
                  {createExpenseCategoryMutation.isPending ? 'Saving...' : 'Add Category'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </details>

      <div className="panel mt-6 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <SectionHeader
            eyebrow="Recent Records"
            title="Ledger"
            detail="Switch between income and expense records without leaving the page."
          />
          <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setLedgerView('income')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${ledgerView === 'income' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setLedgerView('expense')}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${ledgerView === 'expense' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              Expenses
            </button>
          </div>
        </div>

        {ledgerView === 'income' ? (
          donationsQuery.isLoading ? (
            <LoadingSpinner label="Loading income ledger..." />
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {selectedBatchId ? 'Showing income for the selected batch.' : 'Showing recent income records.'}
                </p>
                <select
                  className="field max-w-xs"
                  value={selectedBatchId}
                  onChange={(e) => {
                    setSelectedBatchId(e.target.value);
                    setDonationForm((prev) => ({ ...prev, batch_id: e.target.value }));
                  }}
                >
                  <option value="">All batches</option>
                  {batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.title}
                    </option>
                  ))}
                </select>
              </div>
              <DataTable columns={incomeColumns} rows={donationRows} emptyLabel="No income records yet" />
            </>
          )
        ) : expensesQuery.isLoading ? (
          <LoadingSpinner label="Loading expense ledger..." />
        ) : (
          <DataTable columns={expenseColumns} rows={expenseRows} emptyLabel="No expenses recorded yet" />
        )}
      </div>
    </section>
  );
}
