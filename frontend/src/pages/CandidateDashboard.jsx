import { useEffect, useState } from 'react';
import { Card, StatCard } from '../components/ui/index.js';
import { candidateApi, electionApi, positionApi } from '../utils/api.js';

export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        const [cand, el, pos] = await Promise.all([candidateApi.list(), electionApi.list(), positionApi.list()]);
        if (!active) return;
        setElections(el.data.elections);
        setPositions(pos.data.positions);
        const me = cand.data.candidates.find((c) => c.student_id === Number(localStorage.getItem('user_id')));
        // Fall back to the first candidate row for a logged-in user.
        setCandidate(me || cand.data.candidates[0] || null);
      } catch (e) {
        if (active) setError(e.message);
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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Candidate Dashboard</h1>
      <p className="text-sm text-slate-500 mb-6">Track your election participation.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : candidate ? (
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-semibold">{(candidate.student_id || '?').slice(0, 2).toUpperCase()}</div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{candidate.name}</h2>
              <Badge tone={candidate.approval_status}>{candidate.approval_status}</Badge>
              <p className="text-sm text-slate-500 mt-1">{positions.find((p) => p.id === candidate.position_id)?.name || 'No position'}</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="py-8 text-center text-slate-400">You are not registered as a candidate.</div>
        </Card>
      )}
    </div>
  );
}
