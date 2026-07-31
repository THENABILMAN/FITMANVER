import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-fitman-muted">{label}</label>}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-fitman-border bg-fitman-navy px-4 py-2.5 text-white placeholder:text-fitman-muted focus:border-fitman-accent focus:outline-none focus:ring-1 focus:ring-fitman-accent',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-fitman-muted">{label}</label>}
      <textarea
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-fitman-border bg-fitman-navy px-4 py-2.5 text-white placeholder:text-fitman-muted focus:border-fitman-accent focus:outline-none focus:ring-1 focus:ring-fitman-accent min-h-[100px]',
          error && 'border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className="space-y-1">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-fitman-muted">{label}</label>}
      <select
        id={inputId}
        className={cn(
          'w-full rounded-lg border border-fitman-border bg-fitman-navy px-4 py-2.5 text-white focus:border-fitman-accent focus:outline-none',
          className
        )}
        {...props}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
