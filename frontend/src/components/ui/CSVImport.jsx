import { useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function CSVImport({ isOpen, onClose, onImport }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFileSelect(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);

    // Read and preview first 10 rows
    try {
      const text = await selectedFile.text();
      const lines = text.split('\n').slice(0, 11);
      const header = lines[0].split(',').map(h => h.trim());
      const previewData = lines.slice(1).map(line => {
        const cols = line.split(',');
        return header.map((h, i) => ({ [h]: cols[i]?.trim() || '' }));
      }).filter(row => row.name && row.student_id);

      setPreview(previewData);
      setError('');
    } catch (err) {
      setError('Failed to read CSV file');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    try {
      await onImport(file);
      onClose();
      setFile(null);
      setPreview([]);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to import students');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Students via CSV" actions={
      <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!file || loading}>
          {loading ? 'Importing...' : `Import ${preview.length} Students`}
        </Button>
      </>
    }>
      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {!file ? (
        <div className="text-center py-8">
          <p className="text-slate-500 mb-4">Upload a CSV file to import students in bulk</p>
          <input type="file" accept=".csv" onChange={handleFileSelect} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
          <p className="text-xs text-slate-400 mt-4">Expected columns: name, student_id, faculty, department, semester, batch, password</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium">✓ {file.name} selected</p>
            <p className="text-xs text-green-600 mt-1">{preview.length} rows ready to import</p>
          </div>

          {preview.length > 0 && (
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    {Object.keys(preview[0] || {}).map(k => (
                      <th key={k} className="py-2 px-3 font-medium text-slate-600">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      {Object.values(row).map((v, j) => (
                        <td key={j} className="py-1 px-3 text-slate-600 truncate max-w-[100px]">{v || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Preview shows first {preview.length} rows. Duplicate student IDs will be skipped.
          </p>
        </div>
      )}
    </Modal>
  );
}
