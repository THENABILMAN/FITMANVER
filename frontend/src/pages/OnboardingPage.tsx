import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';

const GOALS = ['Bulk', 'Cut', 'Maintain', 'Recomposition', 'General fitness', 'Strength', 'Endurance'];
const ACTIVITY = ['Sedentary', 'Lightly active', 'Moderately active', 'Very active', 'Extremely active'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced'];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const saveStep = async () => {
    setLoading(true);
    try {
      await api.post('/profile/onboarding', { step, data: form });
      if (step < 5) {
        setStep(step + 1);
      } else {
        await api.post('/workouts/generate', {
          goal: form.goal,
          experience_level: form.gym_experience,
          days_per_week: Number(form.preferred_workout_days) || 4,
          session_duration: Number(form.preferred_workout_duration) || 60,
          injuries: form.injuries,
          limitations: form.physical_limitations,
        });
        await refreshUser();
        toast.success('Your personalized plan is ready!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Basic Information', content: (
      <div className="space-y-4">
        <Input label="Display Name" value={String(form.display_name || '')} onChange={(e) => update('display_name', e.target.value)} />
        <Input label="Age" type="number" value={String(form.age || '')} onChange={(e) => update('age', Number(e.target.value))} />
        <Select label="Gender" value={String(form.gender || 'male')} onChange={(e) => update('gender', e.target.value)} options={[
          { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' },
        ]} />
        <Input label="Height (cm)" type="number" value={String(form.height_cm || '')} onChange={(e) => update('height_cm', Number(e.target.value))} />
        <Input label="Current Weight (kg)" type="number" value={String(form.current_weight_kg || '')} onChange={(e) => update('current_weight_kg', Number(e.target.value))} />
        <Input label="Target Weight (kg)" type="number" value={String(form.target_weight_kg || '')} onChange={(e) => update('target_weight_kg', Number(e.target.value))} />
        <Select label="Preferred Units" value={String(form.preferred_units || 'metric')} onChange={(e) => update('preferred_units', e.target.value)} options={[
          { value: 'metric', label: 'Metric (kg, cm)' }, { value: 'imperial', label: 'Imperial (lbs, in)' },
        ]} />
      </div>
    )},
    { title: 'Fitness Goals', content: (
      <div className="space-y-4">
        <Select label="Primary Goal" value={String(form.goal || 'General fitness')} onChange={(e) => update('goal', e.target.value)} options={GOALS.map((g) => ({ value: g, label: g }))} />
        <Select label="Activity Level" value={String(form.activity_level || 'Moderately active')} onChange={(e) => update('activity_level', e.target.value)} options={ACTIVITY.map((a) => ({ value: a, label: a }))} />
        <Select label="Gym Experience" value={String(form.gym_experience || 'Intermediate')} onChange={(e) => update('gym_experience', e.target.value)} options={EXPERIENCE.map((e) => ({ value: e, label: e }))} />
        <Input label="Workout Days Per Week" type="number" min={1} max={7} value={String(form.preferred_workout_days || 4)} onChange={(e) => update('preferred_workout_days', Number(e.target.value))} />
        <Input label="Preferred Session Duration (minutes)" type="number" value={String(form.preferred_workout_duration || 60)} onChange={(e) => update('preferred_workout_duration', Number(e.target.value))} />
        <Textarea label="Typical Gym Schedule" value={String(form.typical_gym_schedule || '')} onChange={(e) => update('typical_gym_schedule', e.target.value)} placeholder="e.g., Mon/Wed/Fri mornings" />
      </div>
    )},
    { title: 'Health & Limitations', content: (
      <div className="space-y-4">
        <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4 text-sm text-yellow-200">
          FITMAN is not a medical professional. Consult a qualified healthcare provider for medical concerns.
        </div>
        <Textarea label="Injuries" value={String(form.injuries || '')} onChange={(e) => update('injuries', e.target.value)} placeholder="Any current or past injuries" />
        <Textarea label="Physical Limitations" value={String(form.physical_limitations || '')} onChange={(e) => update('physical_limitations', e.target.value)} placeholder="Exercises to avoid, mobility issues" />
      </div>
    )},
    { title: 'Nutrition Preferences', content: (
      <div className="space-y-4">
        <Textarea label="Dietary Preferences" value={String(form.dietary_preferences || '')} onChange={(e) => update('dietary_preferences', e.target.value)} placeholder="e.g., high protein, vegetarian" />
        <Textarea label="Food Allergies" value={String(form.food_allergies || '')} onChange={(e) => update('food_allergies', e.target.value)} />
        <Textarea label="Foods You Dislike" value={String(form.foods_disliked || '')} onChange={(e) => update('foods_disliked', e.target.value)} />
      </div>
    )},
    { title: 'Generate Your Plan', content: (
      <div className="space-y-4 text-center">
        <p className="text-fitman-muted">Ready to generate your personalized workout plan and nutrition targets based on your profile.</p>
        <div className="rounded-lg border border-fitman-border bg-fitman-navy p-4 text-left text-sm">
          <p><strong>Goal:</strong> {form.goal || 'General fitness'}</p>
          <p><strong>Experience:</strong> {form.gym_experience || 'Intermediate'}</p>
          <p><strong>Days/week:</strong> {form.preferred_workout_days || 4}</p>
          <p><strong>Weight:</strong> {form.current_weight_kg || '—'} kg → {form.target_weight_kg || '—'} kg</p>
        </div>
      </div>
    )},
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-fitman-dark px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center"><Logo /></div>
        <div className="mb-4 flex justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 w-8 rounded-full ${i + 1 <= step ? 'bg-fitman-accent' : 'bg-fitman-border'}`} />
          ))}
        </div>
        <div className="rounded-xl border border-fitman-border bg-fitman-card p-8">
          <h1 className="text-xl font-bold text-white">Step {step}: {steps[step - 1].title}</h1>
          <div className="mt-6">{steps[step - 1].content}</div>
          <div className="mt-8 flex justify-between">
            {step > 1 ? <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button> : <div />}
            <Button onClick={saveStep} loading={loading}>
              {step === 5 ? 'Generate My Plan' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
