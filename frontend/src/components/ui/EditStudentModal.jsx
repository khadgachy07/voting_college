import { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function EditStudentModal({ isOpen, onClose, onSubmit, student }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [batch, setBatch] = useState('');
  const [password, setPassword] = useState('');
  const [eligibilityStatus, setEligibilityStatus] = useState('eligible');
  const [error, setError] = useState('');

  // Initialize form from existing student
  if (student && !name) {
    setName(student.name || '');
    setStudentId(student.student_id || '');
    setFaculty(student.faculty || '');
    setDepartment(student.department || '');
    setSemester(student.semester || '');
    setBatch(student.batch || '');
    setEligibilityStatus(student.eligibility_status || 'eligible');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !studentId) {
      setError('Name and Student ID are required');
      return;
    }

    try {
      await onSubmit({ name, student_id: studentId, faculty, department, semester, batch, password, eligibility_status: eligibilityStatus });
      onClose();
      // Reset form
      setName('');
      setStudentId('');
      setFaculty('');
      setDepartment('');
      setSemester('');
      setBatch('');
      setPassword('');
      setEligibilityStatus('eligible');
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to update student');
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student" actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!name || !studentId}>Save Changes</Button>
      </>
    }>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
        <Input label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="STU001" required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Faculty (optional)" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="Science" />
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Computer Science" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Semester" type="number" min="1" max="8" value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="1-8" required />
          <Input label="Batch (optional)" value={batch} onChange={(e) => setBatch(e.target.value)} placeholder="2024" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-600">Password (leave empty to keep current)</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <select value={eligibilityStatus} onChange={(e) => setEligibilityStatus(e.target.value)} className="input w-full rounded-lg border px-3 py-2 text-sm border-slate-300 focus:border-primary focus:ring-primary">
          <option value="eligible">Eligible to Vote</option>
          <option value="ineligible">Not Eligible</option>
        </select>
      </form>
    </Modal>
  );
}
