import { useState } from 'react';

import DataTable from '../../components/shared/DataTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageHeader from '../../components/shared/PageHeader';
import StatCard from '../../components/shared/StatCard';
import { useDonations, useDonationAnnualReport, useDonationFunds, useCreateDonation, useCreateDonationFund } from '../../hooks/useDonations';
import { useMembers } from '../../hooks/useMembers';
import { formatDate } from '../../utils/formatters';


const currentYear = new Date().getFullYear();


export default function DonationsPage() {
  const [donationForm, setDonationForm] = useState({
    member_id: '',
    fund_id: '',
    amount: '',
    currency: 'GHS',
    payment_method: 'cash',
    reference: '',
    donation_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [fundForm, setFundForm] = useState({ name: '', description: '' });
  const [message, setMessage] = useState('');

  const donationsQuery = useDonations({ skip: 0, limit: 20 });
  const fundsQuery = useDonationFunds();
  const membersQuery = useMembers({ skip: 0, limit: 100 });
  const annualReportQuery = useDonationAnnualReport(currentYear);
  const createDonationMutation = useCreateDonation();
  const createFundMutation = useCreateDonationFund();

  async function onCreateDonation(event) {
    event.preventDefault();
    setMessage('');
    await createDonationMutation.mutateAsync({
      ...donationForm,
      member_id: donationForm.member_id || null,
      amount: Number(donationForm.amount),
      payment_method: donationForm.payment_method || null,
      reference: donationForm.reference || null,
      notes: donationForm.notes || null,
    });
    setDonationForm({
      member_id: '',
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

  const donationRows = donationsQuery.data?.data ?? [];
  const funds = fundsQuery.data?.data ?? [];
  const members = membersQuery.data?.data ?? [];
  const annual = annualReportQuery.data?.data;

  const columns = [
    { key: 'donation_date', label: 'Date', render: (row) => formatDate(row.donation_date) },
    { key: 'fund_name', label: 'Fund' },
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
      <PageHeader title="Donations" subtitle="Record giving, manage funds, and review annual finance summaries." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Funds" value={funds.length} helper="Active donation funds" />
        <StatCard label="Donations Logged" value={donationRows.length} helper="Current ledger page" />
        <StatCard label="Annual Total" value={new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(annual?.total ?? 0)} tone="good" />
        <StatCard label="Year" value={annual?.year ?? currentYear} helper="Current annual statement" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={onCreateDonation} className="panel p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Record Donation</p>
          <div className="grid gap-3 md:grid-cols-2">
            <select className="field" value={donationForm.member_id} onChange={(e) => setDonationForm((prev) => ({ ...prev, member_id: e.target.value }))}>
              <option value="">Anonymous / no member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
            <select className="field" value={donationForm.fund_id} onChange={(e) => setDonationForm((prev) => ({ ...prev, fund_id: e.target.value }))} required>
              <option value="">Select fund</option>
              {funds.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.name}
                </option>
              ))}
            </select>
            <input className="field" type="number" min="0.01" step="0.01" placeholder="Amount" value={donationForm.amount} onChange={(e) => setDonationForm((prev) => ({ ...prev, amount: e.target.value }))} required />
            <input className="field" value={donationForm.currency} onChange={(e) => setDonationForm((prev) => ({ ...prev, currency: e.target.value }))} />
            <select className="field" value={donationForm.payment_method} onChange={(e) => setDonationForm((prev) => ({ ...prev, payment_method: e.target.value }))}>
              <option value="cash">cash</option>
              <option value="mobile_money">mobile_money</option>
              <option value="cheque">cheque</option>
              <option value="online">online</option>
            </select>
            <input className="field" placeholder="Reference" value={donationForm.reference} onChange={(e) => setDonationForm((prev) => ({ ...prev, reference: e.target.value }))} />
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Donation Date</label>
              <input className="field" type="date" value={donationForm.donation_date} onChange={(e) => setDonationForm((prev) => ({ ...prev, donation_date: e.target.value }))} required />
            </div>
            <input className="field" placeholder="Notes" value={donationForm.notes} onChange={(e) => setDonationForm((prev) => ({ ...prev, notes: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary mt-4">
            {createDonationMutation.isPending ? 'Recording...' : 'Record Donation'}
          </button>
        </form>

        <form onSubmit={onCreateFund} className="panel p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Create Donation Fund</p>
          <div className="grid gap-3">
            <input className="field" placeholder="Fund name" value={fundForm.name} onChange={(e) => setFundForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <input className="field" placeholder="Description" value={fundForm.description} onChange={(e) => setFundForm((prev) => ({ ...prev, description: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary mt-4">
            {createFundMutation.isPending ? 'Creating...' : 'Create Fund'}
          </button>

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
        </form>
      </div>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-6">
        {donationsQuery.isLoading ? (
          <LoadingSpinner label="Loading donations..." />
        ) : (
          <DataTable columns={columns} rows={donationRows} emptyLabel="No donations recorded yet" />
        )}
      </div>
    </section>
  );
}
