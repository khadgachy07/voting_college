import { useEffect, useState } from 'react';
import { Card, Badge } from '../components/ui/index.js';
import { auditApi } from '../utils/api.js';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await auditApi.list();
        if (active) setLogs(data.logs);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Audit Log</h1>
      <p className="text-sm text-slate-500 mb-6">Every admin action is recorded here.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <Card>
        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="py-8 text-center text-slate-400">No actions recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</span>
                <Badge tone="admin">{log.action}</Badge>
                <span className="text-sm text-slate-600 flex-1">{log.details}</span>
                <span className="text-xs text-slate-400">{log.user_name || 'system'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
