import { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, BarController } from 'chart.js';
import { Card } from '../components/ui/index.js';
import { electionApi, voteApi } from '../utils/api.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, BarController);

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ResultsPage() {
  const [electionId, setElectionId] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await electionApi.list();
        if (active) setElectionId(data.elections[0]?.id || null);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(async () => {
      if (!electionId) return;
      try {
        const { data } = await voteApi.stats(electionId);
        if (active) setResults(data);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        // No setLoading here since it's already handled by the first effect
      }
    }, 10000); // 10 second timeout

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [electionId]);

  const hasPositions = results?.positions && results.positions.length > 0;
  const doughnutData = hasPositions
    ? {
        labels: results.positions[0].candidates.map((c) => c.symbol || `C${c.id}`),
        datasets: [{ data: results.positions[0].candidates.map((c) => c.votes), backgroundColor: COLORS }],
      }
    : null;

  const barData = hasPositions
    ? {
        labels: results.positions.map((p) => p.name),
        datasets: [
          { label: 'Votes', data: results.positions.map((p) => p.totalVotes), backgroundColor: '#2563eb' },
        ],
      }
    : null;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Results</h1>
      <p className="text-sm text-slate-500 mb-6">Turnout and per-position breakdown.</p>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      <Card className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBlock label="Total Votes" value={results?.totalVotes ?? '—'} />
          <StatBlock label="Eligible Voters" value={results?.totalEligible ?? '—'} />
          <StatBlock label="Turnout" value={`${results?.turnout ?? 0}%`} />
          <StatBlock label="Positions" value={(results?.positions?.length || 0).toString()} />
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading…</div>
      ) : results && results.positions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Overall Distribution</h3>
            <div className="flex items-center">
              <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Per Position</h3>
            <Bar data={barData(results)} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </Card>
        </div>
      ) : (
        <div className="bg-slate-100 border border-dashed rounded-xl p-8 text-center text-slate-400">
          No results available yet. Cast some votes first.
        </div>
      )}
    </div>
  );
}

function StatBlock({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 text-center border border-slate-100">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function barData(results) {
  return {
    labels: results.positions.map((p) => p.name),
    datasets: [
      { label: 'Votes', data: results.positions.map((p) => p.totalVotes), backgroundColor: '#2563eb' },
    ],
  };
}
