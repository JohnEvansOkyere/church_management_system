import { ArrowLeft, CheckCircle2, Home, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/shared/PageHeader';
import { useCreateMember } from '../../hooks/useMembers';
import { GENDERS, MARITAL_STATUS, MEMBERSHIP_STATUS } from '../../utils/constants';

const initialForm = {
  first_name: '', last_name: '', other_name: '',
  phone: '', email: '', gender: '',
  date_of_birth: '', address: '', occupation: '',
  marital_status: '', membership_status: 'active',
  date_joined: '', membership_class_completed: false,
  is_family_head: false, family_name: '', family_id: '',
};

function FormSection({ title, children }) {
  return (
    <div className="panel p-6">
      <p className="label-caps mb-4">{title}</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-accent-700">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function MemberRegistrationPage() {
  const navigate = useNavigate();
  const createMutation = useCreateMember();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');

  const set = (key) => (e) => setForm((p) => ({
    ...p,
    [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  async function onSubmit(event) {
    event.preventDefault();
    setMessage('');
    const payload = {
      ...form,
      other_name: form.other_name || null, phone: form.phone || null,
      email: form.email || null, gender: form.gender || null,
      date_of_birth: form.date_of_birth || null, address: form.address || null,
      occupation: form.occupation || null, marital_status: form.marital_status || null,
      date_joined: form.date_joined || null, family_name: form.family_name || null,
      family_id: form.family_id || null,
    };
    await createMutation.mutateAsync(payload);
    setForm(initialForm);
    setMessage('Member registered successfully! Redirecting…');
    setTimeout(() => navigate('/members'), 700);
  }

  return (
    <section className="space-y-5">
      <Link to="/members" className="btn-ghost inline-flex">
        <ArrowLeft size={15} /> Back to Members
      </Link>

      <PageHeader
        title="Register Member"
        subtitle="Create a full member record. Required fields are marked with *."
      />

      <form onSubmit={onSubmit} className="space-y-5">

        {/* Section 1 — Personal */}
        <FormSection title="Personal Information">
          <Field label="First Name" required>
            <input required className="field" placeholder="e.g. Kwame" value={form.first_name} onChange={set('first_name')} />
          </Field>
          <Field label="Last Name" required>
            <input required className="field" placeholder="e.g. Asante" value={form.last_name} onChange={set('last_name')} />
          </Field>
          <Field label="Other Name">
            <input className="field" placeholder="Optional" value={form.other_name} onChange={set('other_name')} />
          </Field>
          <Field label="Phone">
            <input className="field" placeholder="+233 24 000 0000" value={form.phone} onChange={set('phone')} />
          </Field>
          <Field label="Email">
            <input type="email" className="field" placeholder="name@example.com" value={form.email} onChange={set('email')} />
          </Field>
          <Field label="Gender">
            <select className="field" value={form.gender} onChange={set('gender')}>
              <option value="">Select gender</option>
              {GENDERS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="field" value={form.date_of_birth} onChange={set('date_of_birth')} />
          </Field>
          <Field label="Marital Status">
            <select className="field" value={form.marital_status} onChange={set('marital_status')}>
              <option value="">Select</option>
              {MARITAL_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Occupation">
            <input className="field" placeholder="e.g. Teacher" value={form.occupation} onChange={set('occupation')} />
          </Field>
          <div className="md:col-span-2 xl:col-span-3">
            <Field label="Home Address">
              <input className="field" placeholder="Street address, area, city" value={form.address} onChange={set('address')} />
            </Field>
          </div>
        </FormSection>

        {/* Section 2 — Church */}
        <FormSection title="Church Details">
          <Field label="Membership Status" required>
            <select className="field" value={form.membership_status} onChange={set('membership_status')}>
              {MEMBERSHIP_STATUS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Date Joined">
            <input type="date" className="field" value={form.date_joined} onChange={set('date_joined')} />
          </Field>
        </FormSection>

        {/* Section 3 — Family */}
        <FormSection title="Family Household">
          <Field label="Family Name (new family)">
            <input className="field" placeholder="e.g. Asante Family" value={form.family_name} onChange={set('family_name')} />
          </Field>
          <Field label="Family ID (existing family)">
            <input className="field" placeholder="UUID of existing family" value={form.family_id} onChange={set('family_id')} />
          </Field>
        </FormSection>

        {/* Checkboxes */}
        <div className="panel flex flex-wrap gap-6 px-6 py-5">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.membership_class_completed} onChange={set('membership_class_completed')} className="h-4 w-4 rounded border-slate-300 accent-brand-700" />
            <CheckCircle2 size={14} className="text-slate-400" />
            Membership class completed
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={form.is_family_head} onChange={set('is_family_head')} className="h-4 w-4 rounded border-slate-300 accent-brand-700" />
            <Home size={14} className="text-slate-400" />
            Is family head
          </label>
        </div>

        {message && (
          <p className="rounded-xl bg-success-50 px-4 py-3 text-sm font-medium text-success-700 ring-1 ring-success-100">
            {message}
          </p>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={createMutation.isPending}>
            <UserPlus size={15} />
            {createMutation.isPending ? 'Registering…' : 'Register Member'}
          </button>
          <Link to="/members" className="btn-outline">Cancel</Link>
        </div>
      </form>
    </section>
  );
}
