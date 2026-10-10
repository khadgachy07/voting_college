import { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function PositionForm({ isOpen, onClose, onSubmit, position = null }) {
  const [electionId, setElectionId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxCandidates, setMaxCandidates] = useState(1);
  const [votingRule, setVotingRule] = useState('one_candidate');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!electionId || !name) {
      setError('Election ID and name are required');
      return;
    }

    try {
      await onSubmit({ election_id: electionId, name, description, max_candidates: parseInt(maxCandidates), voting_rule });
      onClose();
      // Reset form
      setElectionId('');
      setName('');
      setDescription('');
      setMaxCandidates(1);
      setVotingRule('one_candidate');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save position');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={position ? `Edit Position` : 'Create New Position'} actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!electionId || !name}>Save</Button>
      </>
    }>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Election ID" value={electionId} onChange={(e) => setElectionId(e.target.value)} placeholder="Enter election ID" required />
        <Input label="Position Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Class President" required />
        <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the position" />
        <div className="flex gap-3">
          <div className="flex-1">
            <Input label="Max Candidates" type="number" min="1" max="5" value={maxCandidates} onChange={(e) => setMaxCandidates(e.target.value)} required />
          </div>
          <div className="flex-1">
            <select value={votingRule} onChange={(e) => setVotingRule(e.target.value)} className="input w-full rounded-lg border px-3 py-2 text-sm border-slate-300 focus:border-primary focus:ring-primary">
              <option value="one_candidate">One Candidate</option>
              <option value="two_candidates">Two Candidates</option>
              <option value="three_candidates">Three Candidates</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
