import { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { api } from '../lib/api';

export default function ReportsPage() {
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/weekly-report').then((res) => setReport(res.data.data as Record<string, unknown>)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Weekly Report</h1>
      <p className="text-fitman-muted">{String(report?.week_start)} — {String(report?.week_end)}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-4"><p className="text-sm text-fitman-muted">Workouts Completed</p><p className="text-2xl font-bold text-white">{String(report?.workouts_completed)}</p></Card>
        <Card className="!p-4"><p className="text-sm text-fitman-muted">Workouts Missed</p><p className="text-2xl font-bold text-white">{String(report?.workouts_missed)}</p></Card>
        <Card className="!p-4"><p className="text-sm text-fitman-muted">Avg Calories</p><p className="text-2xl font-bold text-white">{String(report?.average_calories)}</p></Card>
        <Card className="!p-4"><p className="text-sm text-fitman-muted">Weight Change</p><p className="text-2xl font-bold text-white">{report?.weight_change_kg != null ? `${report.weight_change_kg} kg` : '—'}</p></Card>
      </div>
      <Card title="Summary"><p className="text-white">{String(report?.report_summary)}</p></Card>
      <Card title="Recommendations"><p className="text-fitman-muted">{String(report?.recommendations)}</p></Card>
    </div>
  );
}
