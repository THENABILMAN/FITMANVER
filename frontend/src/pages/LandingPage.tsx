import { Link } from 'react-router-dom';
import { Dumbbell, Brain, TrendingUp, Camera, FileText, BarChart3, Shield } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';

const features = [
  { icon: Dumbbell, title: 'Personalized Workout Plans', desc: 'AI-generated programs tailored to your goals, experience, and schedule.' },
  { icon: TrendingUp, title: 'Progressive Overload Coaching', desc: 'Smart suggestions to keep you progressing safely and effectively.' },
  { icon: Brain, title: 'Long-Term Memory', desc: 'FITMAN remembers your preferences, injuries, and habits over time.' },
  { icon: Camera, title: 'Progress Photo Comparison', desc: 'Track visual changes with AI-powered physique analysis.' },
  { icon: FileText, title: 'Document Q&A', desc: 'Upload blood reports and coach programs for grounded answers.' },
  { icon: BarChart3, title: 'Weekly Progress Reports', desc: 'Automated summaries of your training and nutrition consistency.' },
];

const steps = [
  'Create your profile',
  'Set fitness and nutrition goals',
  'Receive your personalized plan',
  'Track workouts, meals, and progress',
  'Get ongoing AI coaching',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fitman-dark">
      <header className="border-b border-fitman-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Logo />
          <div className="flex gap-3">
            <Link to="/login"><Button variant="ghost">Log In</Button></Link>
            <Link to="/register"><Button>Create Free Account</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
          Train Smarter. Eat Better.<br />
          <span className="text-fitman-accent">Progress Faster.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-fitman-muted">
          FITMAN is your AI fitness and nutrition coach, built around your goals, habits, progress, preferences, and lifestyle.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/register"><Button size="lg">Create Free Account</Button></Link>
          <Link to="/login"><Button size="lg" variant="secondary">Log In</Button></Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">Everything You Need to Transform</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-fitman-border bg-fitman-card p-6">
              <Icon className="mb-4 h-8 w-8 text-fitman-accent" />
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-fitman-muted">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">How It Works</h2>
        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fitman-accent font-bold text-white">{i + 1}</div>
              <p className="text-white">{step}</p>
              {i < steps.length - 1 && <div className="hidden h-px w-8 bg-fitman-border md:block" />}
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-fitman-border bg-fitman-navy">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-start gap-3 rounded-lg border border-fitman-border bg-fitman-card p-4">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-fitman-accent" />
            <p className="text-sm text-fitman-muted">
              <strong className="text-white">Medical Disclaimer:</strong> FITMAN is not a medical professional and does not provide medical diagnoses.
              Nutrition and calorie values are estimates. Consult qualified healthcare providers for injuries, medical conditions, supplements, or dietary deficiencies.
              Stop exercising if you experience serious pain, dizziness, or chest pain.
            </p>
          </div>
          <p className="mt-8 text-center text-sm text-fitman-muted">&copy; {new Date().getFullYear()} FITMAN. Your AI Fitness and Nutrition Coach.</p>
        </div>
      </footer>
    </div>
  );
}
