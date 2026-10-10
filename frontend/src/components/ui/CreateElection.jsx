import { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function CreateElection({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      setError('All fields are required');
      return;
    }

    try {
      await onSubmit({ name, description, academic_year: academicYear, start_datetime: startDate, end_datetime: endDate });
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setAcademicYear('2024-2025');
      setStartDate('');
      setEndDate('');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create election');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Election" actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!name || !startDate || !endDate}>Create</Button>
      </>
    }>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Election Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Fall 2024 Student Council" required />
        <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the election" />
        <Input label="Academic Year" type="text" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} placeholder="2024-2025" required />
        <Input label="Start Date & Time" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        <Input label="End Date & Time" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </form>
    </Modal>
  );
}
