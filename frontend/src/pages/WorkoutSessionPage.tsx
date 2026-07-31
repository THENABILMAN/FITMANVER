import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle } from 'lucide-react';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';

interface ExerciseItem {
  id?: string;
  name?: string;
  sets?: number;
  target_reps?: string;
  rest_seconds?: number;
  muscle_group?: string;
  completed: boolean;
}

interface WorkoutPayload {
  plan_name?: string;
  day_name?: string;
  focus_area?: string;
  date?: string;
  exercises: ExerciseItem[];
}

export default function WorkoutSessionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/workouts/today').then((res) => {
      setWorkout(res.data.data?.workout as WorkoutPayload | null);
    }).catch((err) => {
      toast.error(getErrorMessage(err));
    }).finally(() => setLoading(false));
  }, [user?.id, user?.profile]);

  const toggleExercise = (index: number) => {
    setWorkout((current) => {
      if (!current) return current;
      const next = [...current.exercises];
      next[index] = { ...next[index], completed: !next[index].completed };
      return { ...current, exercises: next };
    });
  };

  const complete = async () => {
    try {
      toast.success('Workout completed! Great job!');
      navigate('/workouts');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!workout) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Today's Workout</h1>
        <Card>
          <p className="text-fitman-muted">No workout is available yet. Generate an AI workout plan to start.</p>
        </Card>
      </div>
    );
  }

  const completedCount = workout.exercises.filter((ex) => ex.completed).length;
  const progressText = `${completedCount} / ${workout.exercises.length} Exercises Completed`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Today's Workout</h1>
          <p className="text-fitman-muted">{workout.day_name || 'Training Day'} • {workout.focus_area || 'AI-generated session'}</p>
        </div>
        <Button onClick={complete}>Complete Workout</Button>
      </div>

      <Card title="Workout Progress">
        <p className="text-white">{progressText}</p>
        <div className="mt-3 h-2 rounded-full bg-fitman-navy">
          <div
            className="h-2 rounded-full bg-fitman-accent transition-all"
            style={{ width: `${(completedCount / Math.max(workout.exercises.length, 1)) * 100}%` }}
          />
        </div>
      </Card>

      <Card title="Checklist">
        <div className="space-y-3">
          {workout.exercises.map((exercise, index) => (
            <button
              key={exercise.id || `${exercise.name}-${index}`}
              type="button"
              onClick={() => toggleExercise(index)}
              className="flex w-full items-start justify-between rounded-lg border border-fitman-border bg-fitman-navy px-4 py-3 text-left"
            >
              <div>
                <div className="flex items-center gap-2">
                  {exercise.completed ? <CheckCircle2 className="h-5 w-5 text-green-400" /> : <Circle className="h-5 w-5 text-fitman-muted" />}
                  <span className="font-semibold text-white">{exercise.name}</span>
                </div>
                <div className="mt-1 text-sm text-fitman-muted">
                  {exercise.sets ? `${exercise.sets} sets` : 'Sets pending'} • {exercise.target_reps || 'Target reps pending'}
                  {exercise.rest_seconds ? ` • ${exercise.rest_seconds}s rest` : ''}
                </div>
              </div>
              <div className="text-right text-sm text-fitman-muted">
                {exercise.muscle_group || 'General'}
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
