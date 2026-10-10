import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, StatCard, Badge } from '../components/ui/index.js';
import { electionApi, voteApi } from '../utils/api.js';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        const elRes = await electionApi.list();
        if (!active) return;
        setElections(elRes.data.elections || []);
        // Only fetch stats if there's an active election
        const activeElection = elRes.data.elections.find((e) => e.status === 'active');
        if (activeElection) {
          const statsRes = await voteApi.stats(activeElection.id);
          if (active) {
            setStats({
              activeElections: elRes.data.elections.filter((e) => e.status === 'active').length,
              myVotes: statsRes.data.totalVotes,
              totalEligible: statsRes.data.totalEligible,
            });
          }
        }
      } catch (e) {
        if (active) setError(e.message || 'Failed to load dashboard data');
      } finally {
        if (active) setLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-6">Your voting dashboard.</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          <p>{error}</p>
          <p className="mt-1 text-xs opacity-80">Make sure the backend server is running on port 5000</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Elections" value={stats?.activeElections} icon="🗳️" />
        <StatCard label="Voters Cast" value={stats?.myVotes} icon="👥" />
        <StatCard label="Eligible" value={`${stats?.totalEligible ?? 0}`} icon="✅" />
      </div>

      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Cast Your Vote</h3>
        <p className="text-sm text-slate-500 mb-4">Vote in any active election.</p>
        <Link to="/student/vote" className="inline-block text-sm text-primary hover:underline">Cast Vote →</Link>
      </Card>

      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Elections</h3>
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading…</div>
        ) : elections.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No active elections right now.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {elections.map((e) => (
              <li key={e.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{e.name}</p>
                  <p className="text-xs text-slate-500">{new Date(e.start_datetime).toLocaleDateString()}</p>
                </div>
                <Link to={`/student/vote?election=${e.id}`} className="text-sm text-primary hover:underline">Cast Vote →</Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
