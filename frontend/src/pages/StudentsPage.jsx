import { useEffect, useState } from 'react';
import { Card, Badge, Button, Input, Select } from '../components/ui/index.js';
import { studentApi } from '../utils/api.js';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (department) params.department = department;
      if (semester) params.semester = semester;
      const { data } = await studentApi.list(params);
      setStudents(data.students);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggle(id) {
    try {
      await studentApi.toggleEligibility(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function resetPassword(id) {
    if (!confirm('Reset this student password to "Password123!"?')) return;
    try {
      await studentApi.resetPassword(id, 'Password123!');
      alert('Password reset successfully');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this student?')) return;
    try {
      await studentApi.delete(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Students</h1>
      <p className="text-sm text-slate-500 mb-6">Add, search, filter, and manage voter eligibility.</p>

      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input placeholder="Search by ID or name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All departments</option>
            <option>Engineering</option>
            <option>Science</option>
            <option>Commerce</option>
            <option>Arts</option>
          </Select>
          <Button variant="primary" onClick={load}>Apply Filters</Button>
        </div>
      </Card>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3">Student ID</th>
                <th className="py-3">Name</th>
                <th className="py-3">Department</th>
                <th className="py-3">Semester</th>
                <th className="py-3">Eligibility</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Loading…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">No students found.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 font-medium">{s.student_id}</td>
                    <td className="py-3">{s.name}</td>
                    <td className="py-3 text-slate-500">{s.department}</td>
                    <td className="py-3 text-slate-500">{s.semester}</td>
                    <td className="py-3"><Badge tone={s.eligibility_status}>{s.eligibility_status}</Badge></td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant={s.eligibility_status === 'eligible' ? 'success' : 'danger'} onClick={() => toggle(s.id)}>
                          {s.eligibility_status === 'eligible' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="secondary" onClick={() => resetPassword(s.id)}>Reset PW</Button>
                        <Button variant="danger" onClick={() => remove(s.id)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
