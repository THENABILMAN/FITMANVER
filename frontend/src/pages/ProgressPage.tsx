import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, Trophy } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';

export default function ProgressPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [weights, setWeights] = useState<{ logged_at: string; weight_kg: number }[]>([]);
  const [prs, setPrs] = useState<Record<string, unknown>[]>([]);
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/progress/summary'),
      api.get('/progress/weight'),
      api.get('/progress/personal-records'),
      api.get('/progress/prediction'),
    ]).then(([s, w, p, pred]) => {
      setSummary(s.data.data as Record<string, unknown>);
      setWeights(w.data.data as typeof weights);
      setPrs(p.data.data as Record<string, unknown>[]);
      setPrediction((pred.data.data as { prediction: Record<string, unknown> }).prediction);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const chartData = weights.map((w) => ({
    date: new Date(w.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weight_kg,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Progress</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Current Weight</p>
          <p className="text-2xl font-bold text-white">{String(summary?.current_weight || '—')} kg</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Workouts Completed</p>
          <p className="text-2xl font-bold text-white">{String(summary?.workouts_completed || 0)}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Goal Prediction</p>
          <p className="text-lg font-bold text-white">{prediction ? `${prediction.estimated_weeks} weeks` : '—'}</p>
          {prediction && <p className="text-xs text-fitman-muted">{String(prediction.disclaimer)}</p>}
        </Card>
      </div>

      <Card title="Weight Trend">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="py-8 text-center text-fitman-muted">Log weight to see your trend</p>
        )}
        <Link to="/progress/weight"><Button size="sm" className="mt-4"><Scale size={16} /> Log Weight</Button></Link>
      </Card>

      <Card title="Personal Records">
        {prs.length === 0 ? <p className="text-fitman-muted">Complete workouts to set PRs.</p> : (
          <div className="space-y-2">
            {prs.slice(0, 5).map((pr) => (
              <div key={String(pr.id)} className="flex items-center gap-3 rounded-lg bg-fitman-navy px-4 py-3">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-white">{String(pr.exercise_name)}</p>
                  <p className="text-sm text-fitman-muted">{String(pr.record_value)} {String(pr.unit)} — {String(pr.record_type)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
