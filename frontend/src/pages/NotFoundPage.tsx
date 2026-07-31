import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-fitman-dark px-4 text-center">
      <h1 className="text-6xl font-bold text-fitman-accent">404</h1>
      <p className="mt-4 text-xl text-white">Page not found</p>
      <p className="mt-2 text-fitman-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-8"><Button>Go Home</Button></Link>
    </div>
  );
}
