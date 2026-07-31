import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function ComingSoonPage({ title, feature }: { title: string; feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 max-w-md text-fitman-muted">{feature} is coming in Phase 2.</p>
      <Link to="/dashboard" className="mt-6"><Button variant="secondary">Back to Dashboard</Button></Link>
    </div>
  );
}
