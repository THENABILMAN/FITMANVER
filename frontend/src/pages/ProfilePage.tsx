import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Card, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';

const GOALS = ['Bulk', 'Cut', 'Maintain', 'Recomposition', 'General fitness', 'Strength', 'Endurance'];
const ACTIVITY = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile as Record<string, unknown> | undefined;
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm(Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, v != null ? String(v) : ''])));
    }
  }, [profile]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setLoading(true);
    try {
      const data: Record<string, unknown> = {};
      ['display_name', 'email', 'age', 'gender', 'height_cm', 'current_weight_kg', 'target_weight_kg',
        'goal', 'activity_level', 'gym_experience', 'dietary_preferences', 'food_allergies', 'foods_disliked',
        'injuries', 'physical_limitations', 'typical_gym_schedule', 'preferred_workout_days',
        'preferred_workout_duration', 'preferred_units', 'timezone'].forEach((k) => {
        if (form[k] !== undefined && form[k] !== '') {
          data[k] = ['age', 'height_cm', 'current_weight_kg', 'target_weight_kg', 'preferred_workout_duration'].includes(k)
            ? Number(form[k]) : form[k];
        }
      });
      await api.put('/profile', data);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <Card title="Basic Info">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Username" value={String(form.username || '')} disabled />
          <Input label="Display Name" value={form.display_name || ''} onChange={(e) => update('display_name', e.target.value)} />
          <Input label="Email" type="email" value={form.email || ''} onChange={(e) => update('email', e.target.value)} />
          <Input label="Age" type="number" value={form.age || ''} onChange={(e) => update('age', e.target.value)} />
          <Select label="Gender" value={form.gender || 'male'} onChange={(e) => update('gender', e.target.value)} options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]} />
          <Input label="Height (cm)" type="number" value={form.height_cm || ''} onChange={(e) => update('height_cm', e.target.value)} />
          <Input label="Current Weight (kg)" type="number" value={form.current_weight_kg || ''} onChange={(e) => update('current_weight_kg', e.target.value)} />
          <Input label="Target Weight (kg)" type="number" value={form.target_weight_kg || ''} onChange={(e) => update('target_weight_kg', e.target.value)} />
        </div>
      </Card>
      <Card title="Fitness">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Goal" value={form.goal || 'General fitness'} onChange={(e) => update('goal', e.target.value)} options={GOALS.map((g) => ({ value: g, label: g }))} />
          <Select label="Activity Level" value={form.activity_level || 'Moderately active'} onChange={(e) => update('activity_level', e.target.value)} options={ACTIVITY.map((a) => ({ value: a, label: a }))} />
          <Select label="Experience" value={form.gym_experience || 'Intermediate'} onChange={(e) => update('gym_experience', e.target.value)} options={EXPERIENCE.map((e) => ({ value: e, label: e }))} />
          <Input label="Workout Days/Week" value={form.preferred_workout_days || ''} onChange={(e) => update('preferred_workout_days', e.target.value)} />
          <Input label="Session Duration (min)" type="number" value={form.preferred_workout_duration || ''} onChange={(e) => update('preferred_workout_duration', e.target.value)} />
          <Select label="Units" value={form.preferred_units || 'metric'} onChange={(e) => update('preferred_units', e.target.value)} options={[{ value: 'metric', label: 'Metric' }, { value: 'imperial', label: 'Imperial' }]} />
        </div>
      </Card>
      <Card title="Nutrition & Health">
        <div className="grid gap-4">
          <Textarea label="Dietary Preferences" value={form.dietary_preferences || ''} onChange={(e) => update('dietary_preferences', e.target.value)} />
          <Textarea label="Allergies" value={form.food_allergies || ''} onChange={(e) => update('food_allergies', e.target.value)} />
          <Textarea label="Disliked Foods" value={form.foods_disliked || ''} onChange={(e) => update('foods_disliked', e.target.value)} />
          <Textarea label="Injuries" value={form.injuries || ''} onChange={(e) => update('injuries', e.target.value)} />
          <Textarea label="Limitations" value={form.physical_limitations || ''} onChange={(e) => update('physical_limitations', e.target.value)} />
        </div>
      </Card>
      <Button onClick={save} loading={loading}>Save Profile</Button>
    </div>
  );
}
