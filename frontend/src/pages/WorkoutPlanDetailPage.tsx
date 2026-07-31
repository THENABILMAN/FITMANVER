import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api, getErrorMessage } from '../lib/api';

interface Exercise { id: string; exercise_name: string; sets: number; target_reps: string; muscle_group: string; }
interface Day { id: string; day_name: string; focus_area: string; exercises: Exercise[]; }

export default function WorkoutPlanDetailPage() {
  const { planId } = useParams();
  const [plan, setPlan] = useState<{ name: string; description: string; days: Day[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/workouts/plans/${planId}`).then((res) => {
      setPlan(res.data.data as typeof plan);
    }).finally(() => setLoading(false));
  }, [planId]);

  const startDay = async (dayId: string) => {
    try {
      const res = await api.post('/workouts/sessions', { workout_plan_id: planId, workout_day_id: dayId });
      window.location.href = `/workouts/session/${(res.data.data as { id: string }).id}`;
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!plan) return <p className="text-fitman-muted">Plan not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/workouts" className="text-sm text-fitman-accent hover:underline">← Back to Workouts</Link>
        <h1 className="mt-2 text-2xl font-bold text-white">{plan.name}</h1>
        <p className="text-fitman-muted">{plan.description}</p>
      </div>
      {plan.days?.map((day) => (
        <Card key={day.id} title={day.day_name} action={<Button size="sm" onClick={() => startDay(day.id)}>Start</Button>}>
          <p className="mb-4 text-sm text-fitman-accent">{day.focus_area}</p>
          <div className="space-y-2">
            {day.exercises?.map((ex) => (
              <div key={ex.id} className="flex items-center justify-between rounded-lg bg-fitman-navy px-4 py-3">
                <div>
                  <p className="font-medium text-white">{ex.exercise_name}</p>
                  <p className="text-xs text-fitman-muted">{ex.muscle_group}</p>
                </div>
                <p className="text-sm text-fitman-muted">{ex.sets} × {ex.target_reps}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
