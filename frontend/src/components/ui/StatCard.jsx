const ACCENTS = {
  students: 'bg-primary/10 text-primary',
  elections: 'bg-sky-500/10 text-sky-600',
  candidates: 'bg-violet-500/10 text-violet-600',
  turnout: 'bg-emerald-500/10 text-emerald-600',
};

export default function StatCard({ label, value, icon }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${ACCENTS[label] || 'bg-primary/10 text-primary'} flex items-center justify-center text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
