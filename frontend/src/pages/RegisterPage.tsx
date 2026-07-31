import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth, getErrorMessage } from '../lib/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
      toast.error('Username must be between 3 and 30 characters');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      toast.error('Password must include uppercase, lowercase, and a number');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await register(trimmedUsername, password, confirmPassword, trimmedEmail || undefined);
      toast.success('Account created! Let\'s set up your profile.');
      navigate('/onboarding');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-fitman-dark px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center"><Logo size="lg" /></div>
        <div className="rounded-xl border border-fitman-border bg-fitman-card p-8">
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-1 text-fitman-muted">Start your personalized fitness journey</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="3-30 characters" autoComplete="username" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 8 chars, upper, lower, number" autoComplete="new-password" />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            <Input label="Email (optional)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For password recovery" autoComplete="email" />
            <Button type="submit" className="w-full" loading={loading}>Create Account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-fitman-muted">
            Already have an account? <Link to="/login" className="text-fitman-accent hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
