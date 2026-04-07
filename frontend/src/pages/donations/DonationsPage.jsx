import { useState } from 'react';

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
} from '../../hooks/useDonations';
import { useMembers } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';
import { ATTENDANCE_TYPES, DONATION_METHODS, STANDARD_FINANCE_FUNDS } from '../../utils/constants';


const currentYear = new Date().getFullYear();


export default function DonationsPage() {
  const [donationForm, setDonationForm] = useState({
    member_id: '',
    batch_id: '',
    fund_id: '',
    amount: '',
    currency: 'GHS',
    payment_method: 'cash',
    reference: '',
    donation_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [batchForm, setBatchForm] = useState({
    title: `Sunday Service Collection - ${new Date().toISOString().slice(0, 10)}`,
    service_date: new Date().toISOString().slice(0, 10),
    service_type: 'sunday_service',
    notes: '',
  });
  const [fundForm, setFundForm] = useState({ name: '', description: '' });
  const [expenseForm, setExpenseForm] = useState({
    category_id: '',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    currency: 'GHS',
    payment_method: 'cash',
    vendor_name: '',
    reference: '',
    notes: '',
  });
  const [expenseCategoryForm, setExpenseCategoryForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  const [selectedBatchId, setSelectedBatchId] = useState('');

  const donationsQuery = useDonations({ skip: 0, limit: 20, batch_id: selectedBatchId || undefined });
  const fundsQuery = useDonationFunds();
  const batchesQuery = useFinanceBatches({ include_closed: true });
  const expensesQuery = useExpenses({ skip: 0, limit: 20 });
  const expenseCategoriesQuery = useExpenseCategories();
  const membersQuery = useMembers({ skip: 0, limit: 100 });
  const annualReportQuery = useDonationAnnualReport(currentYear);
  const createDonationMutation = useCreateDonation();
  const createFundMutation = useCreateDonationFund();
  const createExpenseMutation = useCreateExpense();
  const createExpenseCategoryMutation = useCreateExpenseCategory();
  const createBatchMutation = useCreateFinanceBatch();
  const bootstrapFundsMutation = useBootstrapDonationFunds();
  const bootstrapExpenseCategoriesMutation = useBootstrapExpenseCategories();

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
    setDonationForm({
      member_id: '',
      batch_id: donationForm.batch_id,
      fund_id: '',
      amount: '',
      currency: 'GHS',
      payment_method: 'cash',
      reference: '',
      donation_date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setMessage('Donation recorded successfully.');
  }

  async function onCreateBatch(event) {
    event.preventDefault();
    setMessage('');
    const response = await createBatchMutation.mutateAsync(batchForm);
    const batchId = response.data.data.id;
    setSelectedBatchId(batchId);
    setDonationForm((prev) => ({ ...prev, batch_id: batchId, donation_date: batchForm.service_date }));
    setMessage('Finance batch created. You can now record all service collections into it.');
  }

  async function onCreateFund(event) {
    event.preventDefault();
    setMessage('');
    await createFundMutation.mutateAsync({
      name: fundForm.name,
      description: fundForm.description || null,
    });
    setFundForm({ name: '', description: '' });
    setMessage('Donation fund created successfully.');
  }

  async function onBootstrapFunds() {
    setMessage('');
    const response = await bootstrapFundsMutation.mutateAsync();
    const count = response.data.data.length;
    setMessage(count > 0 ? `Added ${count} standard church funds.` : 'Standard church funds already exist.');
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
    setExpenseForm((prev) => ({
      ...prev,
      amount: '',
      vendor_name: '',
      reference: '',
      notes: '',
    }));
    setMessage('Expense recorded successfully.');
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

  async function onBootstrapExpenseCategories() {
    setMessage('');
    const response = await bootstrapExpenseCategoriesMutation.mutateAsync();
    const count = response.data.data.length;
    setMessage(count > 0 ? `Added ${count} standard expense categories.` : 'Standard expense categories already exist.');
  }

  const donationRows = donationsQuery.data?.data ?? [];
  const funds = fundsQuery.data?.data ?? [];
  const batches = batchesQuery.data?.data ?? [];
  const members = membersQuery.data?.data ?? [];
  const annual = annualReportQuery.data?.data;
  const activeBatch = batches.find((batch) => batch.id === selectedBatchId) ?? null;
  const expenseRows = expensesQuery.data?.data ?? [];
  const expenseCategories = expenseCategoriesQuery.data?.data ?? [];
  const selectedFund = funds.find((fund) => fund.id === donationForm.fund_id) ?? null;
  const memberRequired = Boolean(selectedFund?.requires_member);

  const columns = [
    { key: 'donation_date', label: 'Date', render: (row) => formatDate(row.donation_date) },
    { key: 'batch_title', label: 'Batch', render: (row) => row.batch_title || 'Unbatched' },
    { key: 'fund_name', label: 'Fund' },
    { key: 'member_name', label: 'Member', render: (row) => row.member_name || 'Anonymous' },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: row.currency || 'GHS' }).format(row.amount),
    },
    { key: 'payment_method', label: 'Method' },
    { key: 'reference', label: 'Reference' },
  ];

  return (
    <section>
      <PageHeader title="Finance" subtitle="Manage church giving, funds, and finance summaries from one workspace." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Funds" value={funds.length} helper="Active donation funds" />
        <StatCard label="Giving Records" value={donationRows.length} helper="Current ledger page" />
        <StatCard label="Service Batches" value={batches.length} helper="Collections grouped by service/event" />
        <StatCard label="Annual Total" value={new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(annual?.total ?? 0)} tone="good" />
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={onCreateBatch} className="panel p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Service Batch</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Open a service collection batch</h3>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setBatchForm({
                  title: `Sunday Service Collection - ${today}`,
                  service_date: today,
                  service_type: 'sunday_service',
                  notes: '',
                });
              }}
            >
              Reset to Today
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Batch Title</label>
              <input className="field" value={batchForm.title} onChange={(e) => setBatchForm((prev) => ({ ...prev, title: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Service Date</label>
              <input className="field" type="date" value={batchForm.service_date} onChange={(e) => setBatchForm((prev) => ({ ...prev, service_date: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Service Type</label>
              <select className="field" value={batchForm.service_type} onChange={(e) => setBatchForm((prev) => ({ ...prev, service_type: e.target.value }))}>
                {ATTENDANCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
              <input className="field" placeholder="Optional notes" value={batchForm.notes} onChange={(e) => setBatchForm((prev) => ({ ...prev, notes: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">
            {createBatchMutation.isPending ? 'Opening Batch...' : 'Open Finance Batch'}
          </button>
        </form>

        <div className="panel p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Church Funds</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Standard giving setup</h3>
            </div>
            <button type="button" onClick={onBootstrapFunds} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              {bootstrapFundsMutation.isPending ? 'Adding...' : 'Load Standard Funds'}
            </button>
          </div>
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
          <form onSubmit={onCreateFund} className="mt-5 border-t border-slate-200 pt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Add Custom Fund</p>
            <div className="grid gap-3">
              <input className="field" placeholder="Fund name" value={fundForm.name} onChange={(e) => setFundForm((prev) => ({ ...prev, name: e.target.value }))} required />
              <input className="field" placeholder="Description" value={fundForm.description} onChange={(e) => setFundForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary mt-4">
              {createFundMutation.isPending ? 'Creating...' : 'Create Fund'}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={onCreateDonation} className="panel p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Record Finance Entry</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Finance Batch</label>
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
                <option value="">Record without a batch</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.title} - {formatDate(batch.service_date)}
                  </option>
                ))}
              </select>
            </div>
            <select className="field" value={donationForm.fund_id} onChange={(e) => setDonationForm((prev) => ({ ...prev, fund_id: e.target.value }))} required>
              <option value="">Select fund</option>
              {funds.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name}{fund.requires_member ? ' · member required' : ''}
                </option>
              ))}
            </select>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Member {memberRequired ? '(required for this fund)' : '(optional)'}
              </label>
              <select
                className="field"
                value={donationForm.member_id}
                onChange={(e) => setDonationForm((prev) => ({ ...prev, member_id: e.target.value }))}
                required={memberRequired}
                disabled={!selectedFund}
              >
                <option value="">{memberRequired ? 'Select member' : 'Anonymous / no member'}</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                  </option>
                ))}
              </select>
              {selectedFund ? (
                <p className="mt-1 text-xs text-slate-500">
                  {memberRequired
                    ? `${selectedFund.name} is recorded per member.`
                    : `${selectedFund.name} can be recorded as a general church collection without attaching a member.`}
                </p>
              ) : null}
            </div>
            <input className="field" type="number" min="0.01" step="0.01" placeholder="Amount" value={donationForm.amount} onChange={(e) => setDonationForm((prev) => ({ ...prev, amount: e.target.value }))} required />
            <input className="field" value={donationForm.currency} onChange={(e) => setDonationForm((prev) => ({ ...prev, currency: e.target.value }))} />
            <select className="field" value={donationForm.payment_method} onChange={(e) => setDonationForm((prev) => ({ ...prev, payment_method: e.target.value }))}>
              {DONATION_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <input className="field" placeholder="Reference" value={donationForm.reference} onChange={(e) => setDonationForm((prev) => ({ ...prev, reference: e.target.value }))} />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Entry Date</label>
              <input className="field" type="date" value={donationForm.donation_date} onChange={(e) => setDonationForm((prev) => ({ ...prev, donation_date: e.target.value }))} required />
            </div>
            <input className="field" placeholder="Notes" value={donationForm.notes} onChange={(e) => setDonationForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary mt-4">
            {createDonationMutation.isPending ? 'Recording...' : 'Record Donation'}
          </button>
        </form>

        <div className="panel p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Batch Snapshot</p>
          {batchesQuery.isLoading ? (
            <LoadingSpinner label="Loading finance batches..." />
          ) : activeBatch ? (
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{activeBatch.title}</p>
                <p className="mt-1 text-sm text-slate-600">{formatDate(activeBatch.service_date)} · {activeBatch.service_type || 'service'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Batch Total</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(activeBatch.total_amount ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Entries</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{activeBatch.transaction_count ?? 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-600">
              Open or select a service batch to group Sunday collections, harvest pledges, and other service-day finance entries.
            </div>
          )}
          <div className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Annual Summary</p>
            {annualReportQuery.isLoading ? (
              <LoadingSpinner label="Loading annual report..." />
            ) : (
              <div className="space-y-2">
                {(annual?.funds ?? []).length === 0 ? (
                  <p className="text-sm text-slate-600">No donation totals yet.</p>
                ) : (
                  (annual?.funds ?? []).map((item) => (
                    <div key={item.fund} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="font-medium text-slate-700">{item.fund}</span>
                      <span className="font-bold text-slate-900">
                        {new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(item.value)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-6">
        {donationsQuery.isLoading ? (
          <LoadingSpinner label="Loading finance ledger..." />
        ) : (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                {selectedBatchId ? 'Showing entries for the selected batch.' : 'Showing all finance entries.'}
              </p>
              <select className="field max-w-xs" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                <option value="">All batches</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.title}
                  </option>
                ))}
              </select>
            </div>
            <DataTable columns={columns} rows={donationRows} emptyLabel="No finance entries recorded yet" />
          </>
        )}
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={onCreateExpense} className="panel p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Record Expense</p>
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
            <input className="field" placeholder="Vendor / payee" value={expenseForm.vendor_name} onChange={(e) => setExpenseForm((prev) => ({ ...prev, vendor_name: e.target.value }))} />
            <input className="field" placeholder="Reference" value={expenseForm.reference} onChange={(e) => setExpenseForm((prev) => ({ ...prev, reference: e.target.value }))} />
            <input className="field md:col-span-2" placeholder="Notes" value={expenseForm.notes} onChange={(e) => setExpenseForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary mt-4">
            {createExpenseMutation.isPending ? 'Recording...' : 'Record Expense'}
          </button>
        </form>

        <div className="panel p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Expense Categories</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">Standard spending setup</h3>
            </div>
            <button type="button" onClick={onBootstrapExpenseCategories} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              {bootstrapExpenseCategoriesMutation.isPending ? 'Adding...' : 'Load Standard Categories'}
            </button>
          </div>
          <form onSubmit={onCreateExpenseCategory} className="grid gap-3 border-t border-slate-200 pt-5">
            <input className="field" placeholder="Category name" value={expenseCategoryForm.name} onChange={(e) => setExpenseCategoryForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <input className="field" placeholder="Description" value={expenseCategoryForm.description} onChange={(e) => setExpenseCategoryForm((prev) => ({ ...prev, description: e.target.value }))} />
            <button type="submit" className="btn-primary">
              {createExpenseCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        {expensesQuery.isLoading ? (
          <LoadingSpinner label="Loading expense ledger..." />
        ) : (
          <DataTable
            columns={[
              { key: 'expense_date', label: 'Date', render: (row) => formatDate(row.expense_date) },
              { key: 'category_name', label: 'Category' },
              { key: 'vendor_name', label: 'Vendor / Payee', render: (row) => row.vendor_name || '-' },
              { key: 'amount', label: 'Amount', render: (row) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: row.currency || 'GHS' }).format(row.amount) },
              { key: 'payment_method', label: 'Method' },
            ]}
            rows={expenseRows}
            emptyLabel="No expenses recorded yet"
          />
        )}
      </div>
    </section>
  );
}
