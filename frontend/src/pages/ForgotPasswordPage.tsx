import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Logo } from '../components/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { username });
      setSent(true);
      toast.success('If the account exists, reset instructions have been sent.');
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
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="mt-1 text-fitman-muted">Enter your username to receive reset instructions</p>
          {sent ? (
            <div className="mt-6 text-center">
              <p className="text-fitman-muted">Check your email for reset instructions.</p>
              <Link to="/login" className="mt-4 inline-block text-fitman-accent hover:underline">Back to login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
