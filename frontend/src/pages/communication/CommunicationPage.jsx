import { Mail, Megaphone, MessageSquare, Send, Smartphone, Users } from 'lucide-react';
import { useState } from 'react';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';

const CHANNEL_TABS = [
  { id: 'sms', label: 'SMS', icon: Smartphone },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
];

const PLACEHOLDER_HISTORY = [
  { id: 1, channel: 'sms', message: 'Sunday service reminder for 20 April 2026.', recipients: 248, date: 'Sun, 13 Apr 2026', sentBy: 'secretary@church.org' },
  { id: 2, channel: 'email', message: 'Monthly newsletter — April 2026 edition.', recipients: 200, date: 'Fri, 4 Apr 2026', sentBy: 'secretary@church.org' },
  { id: 3, channel: 'announcement', message: 'Youth retreat registration is now open. Visit the office to register.', recipients: null, date: 'Mon, 7 Apr 2026', sentBy: 'admin@church.org' },
];

const CHANNEL_COLORS = {
  sms: 'bg-brand-50 text-brand-700',
  email: 'bg-success-50 text-success-700',
  announcement: 'bg-church-50 text-church-700',
};

export default function CommunicationPage() {
  const [activeChannel, setActiveChannel] = useState('sms');
  const [recipient, setRecipient] = useState('all');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  function onSend(e) {
    e.preventDefault();
    // Placeholder: real send via API when backend module is implemented
    alert(`${activeChannel.toUpperCase()} queued for sending.\n\nMessage: ${message}`);
    setMessage('');
    setSubject('');
  }

  return (
    <section className="space-y-5">
      <PageHeader
        title="Communication"
        subtitle="Send bulk SMS, email, and post in-app announcements to your congregation."
      />

      {/* Coming soon notice */}
      <div className="panel border-l-4 border-church-700 p-5">
        <p className="text-sm font-bold text-church-700">Backend module coming soon</p>
        <p className="mt-1 text-sm text-slate-600">
          The Communication API is under development. The compose form below is a UI preview.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">

        {/* Left — compose panel */}
        <div className="panel p-6">
          <p className="label-caps mb-4">Compose Message</p>

          {/* Channel tabs */}
          <div className="mb-5 flex gap-1 rounded-xl bg-slate-100 p-1">
            {CHANNEL_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveChannel(id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${activeChannel === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={onSend} className="space-y-4">
            {/* Recipient selector */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Send To</label>
              <div className="flex gap-3">
                {[
                  { value: 'all', label: 'All Members' },
                  { value: 'group', label: 'A Group' },
                  { value: 'custom', label: 'Custom' },
                ].map(({ value, label }) => (
                  <label key={value} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                    <input type="radio" name="recipient" value={value} checked={recipient === value} onChange={() => setRecipient(value)} className="accent-brand-700" />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Subject — email only */}
            {activeChannel === 'email' && (
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Subject *</label>
                <input
                  className="field"
                  placeholder="Email subject line"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Message body */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                {activeChannel === 'announcement' ? 'Announcement Text' : 'Message'} *
              </label>
              <textarea
                className="field min-h-28 resize-none"
                placeholder={
                  activeChannel === 'sms'
                    ? 'Keep SMS messages under 160 characters for one-credit delivery…'
                    : activeChannel === 'email'
                    ? 'Write your email message here…'
                    : 'Write your in-app announcement here…'
                }
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              {activeChannel === 'sms' && (
                <p className={`mt-1 text-xs ${message.length > 160 ? 'text-accent-700' : 'text-slate-400'}`}>
                  {message.length} / 160 characters
                </p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full justify-center">
              <Send size={14} />
              Send {activeChannel === 'sms' ? 'SMS' : activeChannel === 'email' ? 'Email' : 'Announcement'}
            </button>
          </form>
        </div>

        {/* Right — history panel */}
        <div className="panel p-5">
          <p className="label-caps mb-4">Send History</p>

          {PLACEHOLDER_HISTORY.length === 0 ? (
            <EmptyState icon={MessageSquare} label="No messages sent yet" />
          ) : (
            <div className="space-y-3">
              {PLACEHOLDER_HISTORY.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${CHANNEL_COLORS[item.channel]}`}>
                      {item.channel}
                    </span>
                    <span className="text-xs text-slate-400">{item.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-800">{item.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                    {item.recipients !== null && (
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {item.recipients} recipients
                      </span>
                    )}
                    <span>{item.sentBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
