import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-workout', 'Post-workout'];

export default function FoodLogPage() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ meal_type: 'Lunch', food_name: '', quantity: 1, unit: 'serving', calories: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0 });

  const load = () => {
    api.get('/nutrition/logs').then((res) => {
      const data = res.data.data as { logs: Record<string, unknown>[]; totals: Record<string, number> };
      setLogs(data.logs);
      setTotals(data.totals);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/nutrition/logs', form);
      toast.success('Food logged!');
      setForm({ ...form, food_name: '', calories: 0, protein_g: 0, carbohydrates_g: 0, fat_g: 0 });
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const remove = async (id: string) => {
    await api.delete(`/nutrition/logs/${id}`);
    toast.success('Removed');
    load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div><Link to="/nutrition" className="text-sm text-fitman-accent hover:underline">← Nutrition</Link>
        <h1 className="mt-2 text-2xl font-bold text-white">Food Log</h1></div>

      <Card title="Add Food">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Select label="Meal" value={form.meal_type} onChange={(e) => setForm({ ...form, meal_type: e.target.value })} options={MEALS.map((m) => ({ value: m, label: m }))} />
          <Input label="Food Name" value={form.food_name} onChange={(e) => setForm({ ...form, food_name: e.target.value })} required />
          <Input label="Calories" type="number" value={String(form.calories)} onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })} />
          <Input label="Protein (g)" type="number" value={String(form.protein_g)} onChange={(e) => setForm({ ...form, protein_g: Number(e.target.value) })} />
          <Input label="Carbs (g)" type="number" value={String(form.carbohydrates_g)} onChange={(e) => setForm({ ...form, carbohydrates_g: Number(e.target.value) })} />
          <Input label="Fat (g)" type="number" value={String(form.fat_g)} onChange={(e) => setForm({ ...form, fat_g: Number(e.target.value) })} />
          <div className="sm:col-span-2 lg:col-span-3"><Button type="submit">Log Food</Button></div>
        </form>
      </Card>

      <Card title={`Today's Log — ${Math.round(totals.calories || 0)} kcal`}>
        {logs.length === 0 ? <p className="text-fitman-muted">No food logged today.</p> : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={String(log.id)} className="flex items-center justify-between rounded-lg bg-fitman-navy px-4 py-3">
                <div>
                  <p className="font-medium text-white">{String(log.food_name)}</p>
                  <p className="text-xs text-fitman-muted">{String(log.meal_type)} · {String(log.calories)} kcal · {String(log.protein_g)}g protein</p>
                </div>
                <button onClick={() => remove(String(log.id))} className="text-fitman-muted hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
