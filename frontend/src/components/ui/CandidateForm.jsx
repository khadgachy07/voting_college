import { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function CandidateForm({ isOpen, onClose, onSubmit, candidate = null }) {
  const [studentId, setStudentId] = useState('');
  const [electionId, setElectionId] = useState('');
  const [positionId, setPositionId] = useState('');
  const [symbol, setSymbol] = useState('');
  const [biography, setBiography] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!studentId || !electionId || !positionId) {
      setError('Student ID, Election ID, and Position ID are required');
      return;
    }

    try {
      await onSubmit({ student_id: studentId, election_id: electionId, position_id: positionId, symbol, biography, manifesto, campaign_message });
      onClose();
      // Reset form
      setStudentId('');
      setElectionId('');
      setPositionId('');
      setSymbol('');
      setBiography('');
      setManifesto('');
      setCampaignMessage('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create candidate');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={candidate ? `Edit Candidate` : 'Create New Candidate'} actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!studentId || !electionId || !positionId}>Save</Button>
      </>
    }>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="STU001" required />
        <Input label="Election ID" value={electionId} onChange={(e) => setElectionId(e.target.value)} placeholder="Enter election ID" required />
        <Input label="Position ID" value={positionId} onChange={(e) => setPositionId(e.target.value)} placeholder="Enter position ID" required />
        <Input label="Symbol (optional)" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="A, B, C or 🐯" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-600">Biography</label>
          <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} placeholder="Brief biography of the candidate" className="input w-full rounded-lg border px-3 py-2 text-sm border-slate-300 focus:border-primary focus:ring-primary" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-600">Manifesto (optional)</label>
          <textarea value={manifesto} onChange={(e) => setManifesto(e.target.value)} rows={3} placeholder="Key policy positions" className="input w-full rounded-lg border px-3 py-2 text-sm border-slate-300 focus:border-primary focus:ring-primary" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-600">Campaign Message (optional)</label>
          <textarea value={campaignMessage} onChange={(e) => setCampaignMessage(e.target.value)} rows={2} placeholder="Short campaign slogan" className="input w-full rounded-lg border px-3 py-2 text-sm border-slate-300 focus:border-primary focus:ring-primary" />
        </div>
      </form>
    </Modal>
  );
}
