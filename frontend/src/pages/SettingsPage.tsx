import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { api, getErrorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        current_password: passwords.current,
        new_password: passwords.new,
        confirm_password: passwords.confirm,
      });
      toast.success('Password changed!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Delete your account and all data permanently?')) return;
    await api.delete('/auth/account');
    await logout();
    navigate('/');
    toast.success('Account deleted');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <Card title="Change Password">
        <div className="grid gap-4 max-w-md">
          <Input label="Current Password" type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          <Input label="New Password" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
          <Input label="Confirm Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
          <Button onClick={changePassword} loading={loading}>Update Password</Button>
        </div>
      </Card>
      <Card title="Privacy">
        <p className="text-fitman-muted mb-4">Manage your AI memories and data privacy.</p>
        <Button variant="secondary" onClick={() => navigate('/memory')}>Manage AI Memories</Button>
      </Card>
      <Card title="Account">
        <Button variant="secondary" onClick={() => { logout(); navigate('/login'); }}>Log Out</Button>
        <Button variant="danger" className="mt-4" onClick={deleteAccount}>Delete Account</Button>
      </Card>
    </div>
  );
}
