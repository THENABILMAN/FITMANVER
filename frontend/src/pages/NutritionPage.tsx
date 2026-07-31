import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Apple, Plus } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';

export default function NutritionPage() {
  const [targets, setTargets] = useState<Record<string, number> | null>(null);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/nutrition/targets'), api.get('/nutrition/logs')])
      .then(([t, l]) => {
        setTargets(t.data.data as Record<string, number>);
        setTotals((l.data.data as { totals: Record<string, number> }).totals);
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const macros = [
    { label: 'Calories', current: totals.calories || 0, target: targets?.calorie_target || 0, unit: 'kcal' },
    { label: 'Protein', current: totals.protein_g || 0, target: targets?.protein_target_g || 0, unit: 'g' },
    { label: 'Carbs', current: totals.carbohydrates_g || 0, target: targets?.carbohydrate_target_g || 0, unit: 'g' },
    { label: 'Fat', current: totals.fat_g || 0, target: targets?.fat_target_g || 0, unit: 'g' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Nutrition</h1>
        <Link to="/nutrition/log"><Button><Plus size={16} /> Log Food</Button></Link>
      </div>
      <p className="text-sm text-fitman-muted">All calorie and macro values are estimates.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {macros.map((m) => (
          <Card key={m.label} className="!p-4">
            <p className="text-sm text-fitman-muted">{m.label}</p>
            <p className="text-2xl font-bold text-white">{Math.round(m.current)}{m.unit === 'kcal' ? '' : 'g'}</p>
            <div className="mt-2 h-2 rounded-full bg-fitman-navy">
              <div className="h-2 rounded-full bg-fitman-accent" style={{ width: `${Math.min(100, m.target ? (m.current / m.target) * 100 : 0)}%` }} />
            </div>
            <p className="mt-1 text-xs text-fitman-muted">/ {m.target}{m.unit === 'kcal' ? ' kcal' : 'g'} target</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/nutrition/meal-plans"><Card className="hover:border-fitman-accent cursor-pointer"><Apple className="mb-2 text-fitman-accent" /><h3 className="font-bold text-white">Meal Plans</h3><p className="text-sm text-fitman-muted">AI-generated meal plans</p></Card></Link>
        <Link to="/nutrition/recipes"><Card className="hover:border-fitman-accent cursor-pointer"><h3 className="font-bold text-white">Recipes</h3><p className="text-sm text-fitman-muted">Generate custom recipes</p></Card></Link>
        <Link to="/nutrition/grocery"><Card className="hover:border-fitman-accent cursor-pointer"><h3 className="font-bold text-white">Grocery Lists</h3><p className="text-sm text-fitman-muted">From your meal plans</p></Card></Link>
      </div>
    </div>
  );
}
