import { useState } from 'react';
import Input from './Input.jsx';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function EditStudentModal({ isOpen, onClose, onSubmit, student }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form from existing student when it's being edited
  if (student) {
    setFormData({
      name: student.name || '',
      studentId: student.student_id || '',
      faculty: student.faculty || '',
      department: student.department || '',
      semester: student.semester || '',
      batch: student.batch || '',
      password: '', // Empty means "keep current"
      eligibilityStatus: student.eligibility_status || 'eligible',
    });
  }

  function handleChange(field) {
    return (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.name || !formData.studentId) {
      setError('Name and Student ID are required');
      return;
    }

    setSaving(true);
    try {
      // If password is empty, don't include it in the payload (keep current)
      const payload = { ...formData };
      if (formData.password === '') {
        delete payload.password;
      }
      await onSubmit({ id: student?.id || 'new', ...payload });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update student');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student" actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!formData.name || !formData.studentId || saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </Button>
      </>
    }>
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 border border-red-200">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label="Full Name"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="John Doe"
          required
        />

        {/* Student ID */}
        <Input
          label="Student ID"
          value={formData.studentId}
          onChange={handleChange('studentId')}
          placeholder="STU001"
          required
        />

        {/* Faculty & Department */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Faculty (optional)"
            value={formData.faculty}
            onChange={handleChange('faculty')}
            placeholder="Science"
          />
          <Input
            label="Department"
            value={formData.department}
            onChange={handleChange('department')}
            placeholder="Computer Science"
            required
          />
        </div>

        {/* Semester & Batch */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Semester"
            type="number"
            min="1"
            max="8"
            value={formData.semester}
            onChange={handleChange('semester')}
            placeholder="1-8"
            required
          />
          <Input
            label="Batch (optional)"
            value={formData.batch}
            onChange={handleChange('batch')}
            placeholder="2024"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-600">
            Password
            {student && (
              <span className="block text-xs text-slate-400">
                Leave empty to keep current password
              </span>
            )}
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={handleChange('password')}
            placeholder="Leave blank to keep current"
          />
        </div>

        {/* Eligibility Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-600">Voting Eligibility</label>
          <select
            value={formData.eligibilityStatus}
            onChange={handleChange('eligibilityStatus')}
            className="input w-full rounded-lg border px-3 py-2 text-sm border-slate-300 focus:border-primary focus:ring-primary"
          >
            <option value="eligible">Eligible to Vote</option>
            <option value="ineligible">Not Eligible (e.g., expelled, disciplinary action)</option>
          </select>
        </div>
      </form>
    </Modal>
  );
}
