import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';

export default function WeightPage() {
  const [weights, setWeights] = useState<Record<string, unknown>[]>([]);
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/progress/weight').then((res) => setWeights(res.data.data as Record<string, unknown>[])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/progress/weight', { weight_kg: Number(weight), notes: notes || undefined });
      toast.success('Weight logged!');
      setWeight('');
      setNotes('');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div><Link to="/progress" className="text-sm text-fitman-accent hover:underline">← Progress</Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Weight Tracking</h1></div>
      <Card title="Log Weight">
        <form onSubmit={submit} className="flex flex-wrap gap-4 items-end">
          <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required className="w-40" />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="flex-1 min-w-[200px]" />
          <Button type="submit">Log</Button>
        </form>
      </Card>
      <Card title="History">
        {weights.length === 0 ? <p className="text-fitman-muted">No weight entries yet.</p> : (
          <div className="space-y-2">
            {[...weights].reverse().map((w) => (
              <div key={String(w.id)} className="flex justify-between rounded-lg bg-fitman-navy px-4 py-3">
                <span className="text-white font-medium">{String(w.weight_kg)} kg</span>
                <span className="text-fitman-muted text-sm">{new Date(String(w.logged_at)).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
