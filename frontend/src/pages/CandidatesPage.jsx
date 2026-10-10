import { useEffect, useState } from 'react';
import { Card, Badge, Button, Select } from '../components/ui/index.js';
import { candidateApi, electionApi, positionApi } from '../utils/api.js';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const [cand, el, pos] = await Promise.all([candidateApi.list(), electionApi.list(), positionApi.list()]);
        setCandidates(cand.data.candidates);
        setElections(el.data.elections);
        setPositions(pos.data.positions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeoutId);
  }

  async function approve(id) {
    try { await candidateApi.approve(id); load(); } catch (e) { setError(e.message); }
  }
  async function reject(id) {
    try { await candidateApi.reject(id); load(); } catch (e) { setError(e.message); }
  }
  async function remove(id) {
    if (!confirm('Remove this candidate?')) return;
    try { await candidateApi.delete(id); load(); } catch (e) { setError(e.message); }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Candidates</h1>
      <p className="text-sm text-slate-500 mb-6">Approve, reject, and manage candidates.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <Card className="mb-6">
        <Select label="Filter by status" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </Card>

      <Card>
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading…</div>
        ) : candidates.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No candidates found.</div>
        ) : (
          <div className="space-y-3">
            {candidates.map((c) => (
              <Card key={c.id} className="!p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">{(c.student_id || '?').slice(0, 2).toUpperCase()}</div>
                  <div>
                    <p className="font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {positions.find((p) => p.id === c.position_id)?.name || '—'} · {elections.find((e) => e.id === c.election_id)?.name || 'No election'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={c.approval_status}>{c.approval_status}</Badge>
                  {c.approval_status === 'pending' && (
                    <>
                      <Button variant="success" onClick={() => approve(c.id)}>Approve</Button>
                      <Button variant="danger" onClick={() => reject(c.id)}>Reject</Button>
                    </>
                  )}
                  <Button variant="secondary" onClick={() => remove(c.id)}>Remove</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
