import { Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-4xl' };
  const iconSizes = { sm: 20, md: 28, lg: 40 };
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-white">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-fitman-accent">
        <Dumbbell size={iconSizes[size]} className="text-white" />
      </div>
      <span className={sizes[size]}>FITMAN</span>
    </Link>
  );
}
