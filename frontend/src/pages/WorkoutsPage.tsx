import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Trash2, Dumbbell } from 'lucide-react';
import { Card, EmptyState, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';

interface Plan { id: string; name: string; description: string; days_per_week: number; goal: string; is_active: boolean; split_name?: string; generated_for_date?: string; }
interface ExerciseItem { id?: string; name?: string; sets?: number; target_reps?: string; rest_seconds?: number; muscle_group?: string; suggested_weight?: number; notes?: string; completed: boolean; custom?: boolean; }
interface WorkoutPayload { plan_id?: string; plan_name?: string; day_name?: string; focus_area?: string; split?: string; date?: string; exercises: ExerciseItem[]; }

const SPLITS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower'];

export default function WorkoutsPage() {
  const [, setPlans] = useState<Plan[]>([]);
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState('Push');
  const [workout, setWorkout] = useState<WorkoutPayload | null>(null);
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState('3');
  const [customReps, setCustomReps] = useState('10');

  useEffect(() => {
    Promise.all([api.get('/workouts/plans'), api.get('/workouts/sessions')])
      .then(([p, s]) => {
        setPlans(p.data.data as Plan[]);
        setSessions(s.data.data as Record<string, unknown>[]);
      }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadWorkout(selectedSplit);
  }, [selectedSplit]);

  const loadWorkout = async (split: string) => {
    setGenerating(true);
    try {
      await api.post('/workouts/generate-split', { split });
      const workoutRes = await api.get('/workouts/today');
      setWorkout(workoutRes.data.data?.workout as WorkoutPayload | null);
      toast.success(`${split} workout ready`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const toggleExercise = (index: number) => {
    setWorkout((current) => {
      if (!current) return current;
      const next = [...current.exercises];
      next[index] = { ...next[index], completed: !next[index].completed };
      return { ...current, exercises: next };
    });
  };

  const addCustomExercise = async () => {
    if (!customName.trim()) return;
    try {
      const res = await api.post('/workouts/today/exercises', {
        exercise_name: customName.trim(),
        sets: Number(customSets) || 3,
        target_reps: customReps.trim() || '10',
      });
      setWorkout((current) => current ? { ...current, exercises: [...current.exercises, { ...res.data.data, completed: false, custom: true }] } : current);
      setCustomName('');
      setCustomSets('3');
      setCustomReps('10');
      toast.success('Custom exercise added');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeExercise = async (exerciseId?: string, index?: number) => {
    if (!exerciseId) return;
    try {
      await api.delete(`/workouts/today/exercises/${exerciseId}`);
      setWorkout((current) => current ? { ...current, exercises: current.exercises.filter((_, idx) => idx !== index) } : current);
      toast.success('Exercise removed');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const completedCount = workout?.exercises.filter((ex) => ex.completed).length ?? 0;
  const progressText = workout ? `${completedCount} / ${workout.exercises.length} Exercises Completed` : 'No workout loaded';
  const progressPercent = workout ? Math.round((completedCount / Math.max(workout.exercises.length, 1)) * 100) : 0;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Workout Builder</h1>
      </div>

      <Card title="Choose a Split">
        <div className="flex flex-wrap gap-2">
          {SPLITS.map((split) => (
            <button
              key={split}
              type="button"
              onClick={() => setSelectedSplit(split)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedSplit === split ? 'bg-fitman-accent text-white' : 'bg-fitman-navy text-fitman-muted'}`}
            >
              {split}
            </button>
          ))}
        </div>
      </Card>

      <Card title={`${selectedSplit} Day`}> 
        {generating ? (
          <LoadingSpinner />
        ) : workout ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-fitman-border bg-fitman-navy p-4">
              <p className="text-sm text-fitman-muted">{workout.day_name || `${selectedSplit} focused training`}</p>
              <p className="mt-1 font-semibold text-white">{progressText}</p>
              <div className="mt-3 h-2 rounded-full bg-fitman-dark">
                <div className="h-2 rounded-full bg-fitman-accent transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div key={exercise.id || `${exercise.name}-${index}`} className="rounded-lg border border-fitman-border bg-fitman-navy p-4">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => toggleExercise(index)} className="flex flex-1 items-start gap-3 text-left">
                      {exercise.completed ? <CheckCircle2 className="mt-1 h-5 w-5 text-green-400" /> : <Circle className="mt-1 h-5 w-5 text-fitman-muted" />}
                      <div>
                        <p className="font-semibold text-white">{exercise.name}</p>
                        <p className="text-sm text-fitman-muted">{exercise.sets ? `${exercise.sets} sets` : 'Sets pending'} • {exercise.target_reps || 'Target reps pending'}</p>
                        {exercise.suggested_weight ? <p className="text-sm text-fitman-muted">Suggested Weight: {exercise.suggested_weight} kg</p> : null}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      {exercise.custom ? <span className="rounded-full bg-purple-600/20 px-2 py-0.5 text-xs text-purple-300">Custom Exercise</span> : null}
                      <button type="button" onClick={() => removeExercise(exercise.id, index)} className="rounded p-1 text-fitman-muted hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-fitman-border bg-fitman-navy p-4">
              <p className="font-semibold text-white">Add Exercise</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <Input label="Exercise" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g. Chest Fly" />
                <Input label="Sets" type="number" value={customSets} onChange={(e) => setCustomSets(e.target.value)} />
                <Input label="Reps" value={customReps} onChange={(e) => setCustomReps(e.target.value)} />
              </div>
              <div className="mt-3">
                <Button onClick={addCustomExercise}>Add to Workout</Button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon={<Dumbbell size={48} />} title="No workout loaded" description="Select a split to generate an AI workout for today." />
        )}
      </Card>

      <Card title="Recent Sessions">
        {sessions.length === 0 ? (
          <p className="text-fitman-muted">No workout sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 10).map((s) => (
              <div key={String(s.id)} className="flex items-center justify-between rounded-lg bg-fitman-navy px-4 py-3">
                <div>
                  <p className="text-white">{String(s.session_date)}</p>
                  <p className="text-sm text-fitman-muted">{String(s.status)}</p>
                </div>
                {s.status === 'In progress' && (
                  <Link to={`/workouts/session/${s.id}`}><Button size="sm">Continue</Button></Link>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
