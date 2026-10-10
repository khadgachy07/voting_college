import { useEffect, useState } from 'react';
import { Card, StatCard } from '../components/ui/index.js';
import { electionApi, studentApi, candidateApi, voteApi } from '../utils/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [students, elections, candidates] = await Promise.all([
          studentApi.list(),
          electionApi.list(),
          candidateApi.list(),
        ]);
        if (!active) return;
        const firstElectionId = elections.data.elections[0]?.id;
        const statsRes = firstElectionId
          ? await voteApi.stats(firstElectionId)
          : { data: { turnout: 0, totalVotes: 0, totalEligible: 0 } };
        if (!active) return;
        setStats({
          students: students.data.students.length,
          elections: elections.data.elections.length,
          candidates: candidates.data.candidates.length,
          turnout: statsRes.data?.turnout ?? 0,
          totalVotes: statsRes.data?.totalVotes ?? 0,
        });
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Overview of the election system.</p>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Students" value={stats?.students} icon="🎓" />
          <StatCard label="Elections" value={stats?.elections} icon="🗳️" />
          <StatCard label="Candidates" value={stats?.candidates} icon="👤" />
          <StatCard label="Turnout" value={`${stats?.turnout ?? 0}%`} icon="📈" />
        </div>
      )}
    </div>
  );
}
