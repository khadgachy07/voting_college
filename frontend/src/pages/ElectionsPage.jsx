import { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/ui/index.js';
import { electionApi, positionApi, candidateApi } from '../utils/api.js';

const STATUS_LABEL = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  active: 'Active',
  closed: 'Closed',
  results_published: 'Results Published',
};

export default function ElectionsPage() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await electionApi.list();
      setElections(data.elections);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    try {
      await electionApi.changeStatus(id, status);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  // Valid status transitions: draft→upcoming, upcoming→active, active→closed/upcoming, closed→results_published/active, results_published→(none)
  const validTransitions = {
    draft: ['upcoming'],
    upcoming: ['active'],
    active: ['closed', 'upcoming'],
    closed: ['results_published', 'active'],
    results_published: [],
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Elections</h1>
      <p className="text-sm text-slate-500 mb-6">Create and manage the election lifecycle.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <Card>
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading…</div>
        ) : elections.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No elections yet.</div>
        ) : (
          <div className="space-y-4">
            {elections.map((e) => (
              <Card key={e.id} className="!p-0 overflow-hidden">
                <div className="flex items-center justify-between p-5 bg-white">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{e.name}</h2>
                    <p className="text-sm text-slate-500">{e.description || 'No description'}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge tone={e.status}>{STATUS_LABEL[e.status] || e.status}</Badge>
                      <span className="text-xs text-slate-400">{e.academic_year}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {e.status === 'upcoming' && (
                      <Button variant="success" onClick={() => changeStatus(e.id, 'active')}>Start</Button>
                    )}
                    {e.status === 'active' && (
                      <>
                        <Button variant="secondary" onClick={() => changeStatus(e.id, 'upcoming')}>Pause</Button>
                        <Button variant="danger" onClick={() => changeStatus(e.id, 'closed')}>Close</Button>
                      </>
                    )}
                    {e.status === 'closed' && (
                      <Button variant="primary" onClick={() => changeStatus(e.id, 'results_published')}>Publish Results</Button>
                    )}
                    {e.status === 'results_published' && (
                      <Button variant="secondary" onClick={() => changeStatus(e.id, 'active')}>Reactivate</Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
