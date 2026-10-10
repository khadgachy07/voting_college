import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Badge, Button } from '../components/ui/index.js';
import { electionApi, positionApi, candidateApi, voteApi } from '../utils/api.js';

export default function VotePage() {
  const [searchParams] = useSearchParams();
  const electionId = Number(searchParams.get('election'));
  const [election, setElection] = useState(null);
  const [positions, setPositions] = useState([]);
  const [votes, setVotes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        const [el, pos, cand] = await Promise.all([electionApi.list(), positionApi.list(), candidateApi.list()]);
        if (!active) return;
        const activeElection = el.data.elections.find((e) => e.status === 'active');
        setElection(activeElection);
        const electionPositions = pos.data.positions.filter((p) => p.election_id === activeElection?.id);
        setPositions(electionPositions);
        const positionCandidates = {};
        for (const c of cand.data.candidates) {
          if (!positionCandidates[c.position_id]) positionCandidates[c.position_id] = [];
          positionCandidates[c.position_id].push(c);
        }
        // Only approved candidates are eligible to vote for.
        setPositions(electionPositions.map((p) => ({ ...p, candidates: (positionCandidates[p.id] || []).filter((c) => c.approval_status === 'approved') })));
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

  async function submit(positionId, candidateId) {
    if (submitting) return;
    setSubmitting(true);
    setSuccess('');
    try {
      await voteApi.cast(election.id, positionId, candidateId);
      setVotes((prev) => ({ ...prev, [positionId]: candidateId }));
      setSuccess(`You have voted for ${positions.find((p) => p.id === positionId)?.name}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Cast Your Vote</h1>
      <p className="text-sm text-slate-500 mb-6">One vote per position. Choose one candidate for each.</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          <p>{error}</p>
          <p className="mt-1 text-xs opacity-80">Make sure the backend server is running on port 5000</p>
        </div>
      )}
      {success && <div className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-lg mb-4">{success}</div>}

      {loading ? (
        <Card>
          <div className="py-8 text-center text-slate-400">Loading elections…</div>
        </Card>
      ) : !election ? (
        <Card>
          <div className="py-8 text-center text-slate-400">
            {error || 'No active election is available to vote in right now.'}
          </div>
        </Card>
      ) : positions.length === 0 ? (
        <Card>
          <div className="py-8 text-center text-slate-400">No candidates are eligible for voting yet.</div>
        </Card>
      ) : (
        <div className="space-y-6">
          {positions.map((p) => (
            <Card key={p.id}>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">{p.name}</h2>
              <p className="text-sm text-slate-500 mb-4">{p.description || 'Select a candidate'}</p>

              {p.candidates.length === 0 ? (
                <p className="text-sm text-slate-400">No approved candidates.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {p.candidates.map((c) => (
                    <Button
                      key={c.id}
                      variant={votes[p.id] === c.id ? 'primary' : 'secondary'}
                      className="justify-start text-left"
                      disabled={submitting}
                      onClick={() => submit(p.id, c.id)}
                    >
                      <span className="text-xl mr-3">{c.symbol || '👤'}</span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-500 truncate">{c.department} · {c.semester}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
