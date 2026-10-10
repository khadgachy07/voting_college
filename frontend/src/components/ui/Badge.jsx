const styles = {
  active: 'bg-emerald-100 text-emerald-700',
  upcoming: 'bg-blue-100 text-blue-700',
  draft: 'bg-slate-100 text-slate-600',
  closed: 'bg-amber-100 text-amber-700',
  results_published: 'bg-purple-100 text-purple-700',
  pending: 'bg-slate-100 text-slate-600',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  eligible: 'bg-emerald-100 text-emerald-700',
  ineligible: 'bg-red-100 text-red-700',
  admin: 'bg-primary/10 text-primary font-semibold',
  student: 'bg-sky-100 text-sky-700',
  candidate: 'bg-violet-100 text-violet-700',
};

export default function Badge({ children, tone = 'draft', className = '' }) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${styles[tone] || styles.draft} ${className}`}>{children}</span>;
}
