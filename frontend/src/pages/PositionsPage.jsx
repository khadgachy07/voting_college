import { useEffect, useState } from 'react';
import { Card, Badge, Button, Select } from '../components/ui/index.js';
import { positionApi, electionApi } from '../utils/api.js';
import PositionForm from '../components/ui/PositionForm.jsx';

const STATUS_LABEL = {
  draft: 'Draft',
  upcoming: 'Upcoming',
  active: 'Active',
  closed: 'Closed',
  results_published: 'Results Published',
};

export default function PositionsPage() {
  const [positions, setPositions] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [targetElectionId, setTargetElectionId] = useState('');
  const [error, setError] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [positionToEdit, setPositionToEdit] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [posRes, elRes] = await Promise.all([
        positionApi.list(),
        electionApi.list(),
      ]);
      setPositions(posRes.data.positions || []);
      setElections(elRes.data.elections || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createPosition(data) {
    try {
      await positionApi.create(data);
      load();
      setCreateModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function updatePosition(id, data) {
    try {
      await positionApi.update(id, data);
      load();
      setEditModalOpen(false);
      setPositionToEdit(null);
    } catch (err) {
      setError(err.message);
    }
  }

  async function deletePosition(id) {
    if (!confirm('Delete this position?')) return;
    try {
      await positionApi.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const targetElection = elections.find(e => e.id === targetElectionId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Positions</h1>
          <p className="text-sm text-slate-500">Create and manage candidate positions for elections.</p>
        </div>
        {targetElection && (
          <Button variant="primary" onClick={() => setCreateModalOpen(true)}>
            + Add Position for {targetElection.name}
          </Button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <Card className="mb-6">
        <Select label="Filter by election" value={targetElectionId} onChange={(e) => setTargetElectionId(e.target.value)}>
          <option value="">All elections</option>
          {elections.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>
      </Card>

      {loading ? (
        <div className="py-8 text-center text-slate-400">Loading…</div>
      ) : positions.length === 0 ? (
        <Card>
          <div className="py-8 text-center text-slate-400">
            No positions found. Select an election above and click "Add Position" to get started.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {positions.map((p) => (
            <Card key={p.id} className={`!p-4 ${targetElectionId && p.election_id !== targetElectionId ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-800">{p.name}</h2>
                    {p.voting_rule && (
                      <Badge tone="info">{p.voting_rule.replace('_', ' ').toUpperCase()}</Badge>
                    )}
                  </div>
                  {p.description && <p className="text-sm text-slate-500 mt-1">{p.description}</p>}
                  <div className="flex gap-2 mt-3">
                    <Badge tone={targetElectionId ? (p.election_id === targetElectionId ? 'success' : 'danger') : 'secondary'}>
                      {targetElectionId ? `Election: ${targetElection.name}` : `Election: ${p.election_id || 'Unknown'}`}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="primary" onClick={() => { setPositionToEdit(p); setEditModalOpen(true); }}>Edit</Button>
                  <Button variant="danger" onClick={() => deletePosition(p.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {targetElectionId && (
        <PositionForm
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={createPosition}
          position={{ election_id: targetElectionId }}
        />
      )}

      {positionToEdit && (
        <PositionForm
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSubmit={(data) => updatePosition(positionToEdit.id, data)}
          position={positionToEdit}
        />
      )}
    </div>
  );
}
