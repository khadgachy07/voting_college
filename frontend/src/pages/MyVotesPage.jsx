import { useEffect, useState } from 'react';
import { Card, Badge } from '../components/ui/index.js';
import { voteApi } from '../utils/api.js';

export default function MyVotesPage() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await voteApi.myVotes();
        if (active) setVotes(data.votes || []);
      } catch (e) {
        if (active) setError(e.message || 'Failed to load your votes');
      } finally {
        if (active) setLoading(false);
      }
    }, 3000);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">My Votes</h1>
      <p className="text-sm text-slate-500 mb-6">View your voting history for this election.</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
          <p>{error}</p>
          <p className="mt-1 text-xs opacity-80">Make sure the backend server is running on port 5000</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : votes.length === 0 ? (
        <Card>
          <div className="py-8 text-center text-slate-400">
            <p>You haven't voted yet.</p>
            <p className="text-sm mt-2">Go to the dashboard to cast your vote when an election is active.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {votes.map((vote) => (
            <Card key={vote.candidate_id}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-lg">
                  {vote.symbol || '👤'}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-800">{vote.name}</h3>
                  <p className="text-sm text-slate-500">
                    {vote.department} · {vote.semester}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Badge tone={vote.election_status || 'active'}>{vote.election_name || 'Election'}</Badge>
                    <Badge tone="approved">{vote.approval_status}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
