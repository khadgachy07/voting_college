import { useEffect, useState } from 'react';
import { Card, Badge } from '../components/ui/index.js';
import { candidateApi, positionApi, electionApi } from '../utils/api.js';

export default function CandidateProfile() {
  const [candidate, setCandidate] = useState(null);
  const [positions, setPositions] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        const [cand, pos, el] = await Promise.all([candidateApi.list(), positionApi.list(), electionApi.list()]);
        if (!active) return;
        setPositions(pos.data.positions);
        setElections(el.data.elections);
        const userIdStr = localStorage.getItem('user_id');
      const userId = userIdStr ? Number(userIdStr) : null;
      const me = cand.data.candidates.find((c) => c.student_id === userId);
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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">My Profile</h1>
      <p className="text-sm text-slate-500 mb-6">Your candidacy details.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : candidate ? (
        <Card>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-semibold">{(candidate.student_id || '?').slice(0, 2).toUpperCase()}</div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{candidate.name}</h2>
              <Badge tone={candidate.approval_status}>{candidate.approval_status}</Badge>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            <div><dt className="text-xs uppercase text-slate-400">Student ID</dt><dd className="font-medium text-slate-800">{candidate.student_id}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Department</dt><dd className="font-medium text-slate-800">{candidate.department || '—'}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Semester</dt><dd className="font-medium text-slate-800">{candidate.semester || '—'}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Symbol</dt><dd className="font-medium text-slate-800">{candidate.symbol || '—'}</dd></div>
          </dl>

          {candidate.manifesto && (
            <div className="mt-6">
              <h3 className="text-sm uppercase text-slate-400 mb-2">Manifesto</h3>
              <p className="text-slate-700">{candidate.manifesto}</p>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm uppercase text-slate-400 mb-2">Assigned To</h3>
            <div className="flex flex-wrap gap-2">
              {positions.map((p) => (
                <Badge key={p.id} tone={candidate.position_id === p.id ? 'approved' : 'draft'}>{p.name}</Badge>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="py-8 text-center text-slate-400">No candidate profile found.</div>
        </Card>
      )}
    </div>
  );
}
