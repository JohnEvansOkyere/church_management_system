import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import { useCreateMember } from '../../hooks/useMembers';
import { GENDERS, MARITAL_STATUS, MEMBERSHIP_STATUS } from '../../utils/constants';
import { useState } from 'react';

const initialForm = {
  first_name: '',
  last_name: '',
  other_name: '',
  phone: '',
  email: '',
  gender: '',
  date_of_birth: '',
  address: '',
  occupation: '',
  marital_status: '',
  membership_status: 'active',
  date_joined: '',
  membership_class_completed: false,
  is_family_head: false,
  family_name: '',
  family_id: '',
};

export default function MemberRegistrationPage() {
  const navigate = useNavigate();
  const createMutation = useCreateMember();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  async function onCreateMember(event) {
    event.preventDefault();
    setMessage('');

    const payload = {
      ...form,
      other_name: form.other_name || null,
      phone: form.phone || null,
      email: form.email || null,
      gender: form.gender || null,
      date_of_birth: form.date_of_birth || null,
      address: form.address || null,
      occupation: form.occupation || null,
      marital_status: form.marital_status || null,
      date_joined: form.date_joined || null,
      family_name: form.family_name || null,
      family_id: form.family_id || null,
    };

    await createMutation.mutateAsync(payload);
    setForm(initialForm);
    setMessage('Member created successfully. Redirecting...');
    setTimeout(() => navigate('/members'), 700);
  }

  return (
    <section>
      <PageHeader
        title="Register Member"
        subtitle="Create a full member record with family and profile details."
        action={
          <Link to="/members" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to members
          </Link>
        }
      />

      <form onSubmit={onCreateMember} className="panel mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <input required placeholder="First name" value={form.first_name} onChange={(e) => setForm((p) => ({ ...p, first_name: e.target.value }))} className="field" />
          <input required placeholder="Last name" value={form.last_name} onChange={(e) => setForm((p) => ({ ...p, last_name: e.target.value }))} className="field" />
          <input placeholder="Other name" value={form.other_name} onChange={(e) => setForm((p) => ({ ...p, other_name: e.target.value }))} className="field" />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} className="field" />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="field" />

          <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} className="field">
            <option value="">Gender</option>
            {GENDERS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input type="date" value={form.date_of_birth} onChange={(e) => setForm((p) => ({ ...p, date_of_birth: e.target.value }))} className="field" />
          <input placeholder="Occupation" value={form.occupation} onChange={(e) => setForm((p) => ({ ...p, occupation: e.target.value }))} className="field" />

          <select value={form.marital_status} onChange={(e) => setForm((p) => ({ ...p, marital_status: e.target.value }))} className="field">
            <option value="">Marital status</option>
            {MARITAL_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select value={form.membership_status} onChange={(e) => setForm((p) => ({ ...p, membership_status: e.target.value }))} className="field">
            {MEMBERSHIP_STATUS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <input type="date" value={form.date_joined} onChange={(e) => setForm((p) => ({ ...p, date_joined: e.target.value }))} className="field" />

          <input placeholder="Family name (for new family head)" value={form.family_name} onChange={(e) => setForm((p) => ({ ...p, family_name: e.target.value }))} className="field" />
          <input placeholder="Family ID (existing family UUID)" value={form.family_id} onChange={(e) => setForm((p) => ({ ...p, family_id: e.target.value }))} className="field" />

          <input placeholder="Address" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} className="field md:col-span-2 xl:col-span-4" />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.membership_class_completed}
              onChange={(e) => setForm((p) => ({ ...p, membership_class_completed: e.target.checked }))}
            />
            Membership class completed
          </label>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_family_head}
              onChange={(e) => setForm((p) => ({ ...p, is_family_head: e.target.checked }))}
            />
            Is family head
          </label>

          <button type="submit" className="btn-primary">
            {createMutation.isPending ? 'Creating...' : 'Create Member'}
          </button>
        </div>

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      </form>
    </section>
  );
}
