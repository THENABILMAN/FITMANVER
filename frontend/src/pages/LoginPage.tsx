import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth, getErrorMessage } from '../lib/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
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
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-fitman-muted">Log in to continue your fitness journey</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required autoComplete="username" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            <Button type="submit" className="w-full" loading={loading}>Log In</Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/forgot-password" className="text-fitman-accent hover:underline">Forgot password?</Link>
          </div>
          <p className="mt-6 text-center text-sm text-fitman-muted">
            Don't have an account? <Link to="/register" className="text-fitman-accent hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
