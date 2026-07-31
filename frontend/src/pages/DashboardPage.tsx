import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Dumbbell, Apple, Scale, MessageSquare, TrendingUp, Trophy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Card';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [weights, setWeights] = useState<{ logged_at: string; weight_kg: number }[]>([]);
  const [targets, setTargets] = useState<Record<string, number> | null>(null);
  const [plans, setPlans] = useState<Record<string, unknown>[]>([]);
  const [todayWorkout, setTodayWorkout] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/progress/summary'),
      api.get('/progress/weight'),
      api.get('/nutrition/targets'),
      api.get('/workouts/plans'),
      api.get('/workouts/today'),
    ]).then(([sum, w, t, p, tw]) => {
      setSummary(sum.data.data as Record<string, unknown>);
      setWeights(w.data.data as typeof weights);
      setTargets(t.data.data as Record<string, number>);
      setPlans(p.data.data as Record<string, unknown>[]);
      setTodayWorkout(tw.data.data?.workout as Record<string, unknown> | null);
    }).finally(() => setLoading(false));
  }, [user?.id, user?.profile]);

  if (loading) return <LoadingSpinner />;

  const chartData = weights.slice(-8).map((w) => ({
    date: new Date(w.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: w.weight_kg,
  }));

  const workoutData = [
    { day: 'Mon', done: 1 }, { day: 'Tue', done: 0 }, { day: 'Wed', done: 1 },
    { day: 'Thu', done: 0 }, { day: 'Fri', done: 1 }, { day: 'Sat', done: 0 }, { day: 'Sun', done: 0 },
  ];

  const profile = user?.profile as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {user?.display_name || user?.username}! 💪
        </h1>
        <p className="text-fitman-muted">Goal: {String(profile?.goal || 'General fitness')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Current Weight</p>
          <p className="text-2xl font-bold text-white">{String(summary?.current_weight || profile?.current_weight_kg || '—')} kg</p>
          {summary?.weight_change_weekly != null && (
            <p className={`text-sm ${Number(summary.weight_change_weekly) < 0 ? 'text-green-400' : 'text-yellow-400'}`}>
              {Number(summary.weight_change_weekly) > 0 ? '+' : ''}{String(summary.weight_change_weekly)} kg this week
            </p>
          )}
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Calories Today</p>
          <p className="text-2xl font-bold text-white">{String(summary?.today_calories || 0)}</p>
          <p className="text-sm text-fitman-muted">/ {targets?.calorie_target || '—'} target</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Protein Today</p>
          <p className="text-2xl font-bold text-white">{String(summary?.today_protein || 0)}g</p>
          <p className="text-sm text-fitman-muted">/ {targets?.protein_target_g || '—'}g target</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-fitman-muted">Workouts</p>
          <p className="text-2xl font-bold text-white">{String(summary?.workouts_completed || 0)} completed</p>
          <p className="text-sm text-fitman-muted">{String(summary?.workouts_missed || 0)} missed</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Weight Trend">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
                <Line type="monotone" dataKey="weight" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-fitman-muted">Log your weight to see trends</p>
          )}
        </Card>
        <Card title="Weekly Workouts">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workoutData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155' }} />
              <Bar dataKey="done" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {summary && summary.latest_pr ? (
        <Card title="Latest Personal Record">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="font-semibold text-white">{String((summary.latest_pr as Record<string, unknown>).exercise_name)}</p>
              <p className="text-fitman-muted">
                {String((summary.latest_pr as Record<string, unknown>).record_value)} {String((summary.latest_pr as Record<string, unknown>).unit)}
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      {todayWorkout && (
        <Card title="Today's Workout">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{String(todayWorkout.day_name || 'Training Day')}</p>
              <p className="text-sm text-fitman-muted">{String(todayWorkout.focus_area || 'AI-generated workout')}</p>
            </div>
            <Link to="/workouts/session/today">
              <Button size="sm">Continue Workout</Button>
            </Link>
          </div>
        </Card>
      )}

      <Card title="Quick Actions">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link to="/workouts"><Button variant="secondary" className="w-full"><Dumbbell size={16} /> Start Workout</Button></Link>
          <Link to="/nutrition/log"><Button variant="secondary" className="w-full"><Apple size={16} /> Log Food</Button></Link>
          <Link to="/progress/weight"><Button variant="secondary" className="w-full"><Scale size={16} /> Add Weight</Button></Link>
          <Link to="/coach"><Button variant="secondary" className="w-full"><MessageSquare size={16} /> Ask Coach</Button></Link>
          <Link to="/progress"><Button variant="secondary" className="w-full"><TrendingUp size={16} /> Progress</Button></Link>
          <Link to="/nutrition/meal-plans"><Button variant="secondary" className="w-full"><Apple size={16} /> Meal Plan</Button></Link>
        </div>
      </Card>

      {plans.length > 0 && (
        <Card title="Active Workout Plan">
          <p className="font-semibold text-white">{String(plans[0].name)}</p>
          <p className="text-sm text-fitman-muted">{String(plans[0].description)}</p>
          <Link to={`/workouts/${plans[0].id}`} className="mt-3 inline-block">
            <Button size="sm">View Plan</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}
