import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Brain } from 'lucide-react';
import { Card, EmptyState, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';

interface Memory { id: string; memory_type: string; memory_key: string; memory_value: string; importance_score: number; }

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/memories').then((res) => setMemories(res.data.data as Memory[])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    await api.delete(`/memories/${id}`);
    toast.success('Memory deleted');
    load();
  };

  const clearAll = async () => {
    if (!confirm('Clear all AI memories?')) return;
    await api.delete('/memories');
    toast.success('All memories cleared');
    load();
  };

  const toggleMemory = async () => {
    const next = !memoryEnabled;
    await api.put('/memories/settings', { memory_enabled: next });
    setMemoryEnabled(next);
    toast.success(next ? 'Memory enabled' : 'Memory disabled');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">AI Memories</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={toggleMemory}>{memoryEnabled ? 'Disable Memory' : 'Enable Memory'}</Button>
          {memories.length > 0 && <Button variant="danger" onClick={clearAll}>Clear All</Button>}
        </div>
      </div>
      <p className="text-sm text-fitman-muted">FITMAN stores useful coaching information learned from your conversations.</p>
      <Card>
        {memories.length === 0 ? (
          <EmptyState icon={<Brain size={48} />} title="No memories yet" description="Memories are created automatically from coaching conversations." />
        ) : (
          <div className="space-y-3">
            {memories.map((m) => (
              <div key={m.id} className="flex items-start justify-between rounded-lg bg-fitman-navy p-4">
                <div>
                  <span className="rounded-full bg-fitman-accent/20 px-2 py-0.5 text-xs text-fitman-accent">{m.memory_type}</span>
                  <p className="mt-2 text-white">{m.memory_value}</p>
                  <p className="text-xs text-fitman-muted">Importance: {m.importance_score}</p>
                </div>
                <button onClick={() => remove(m.id)} className="text-fitman-muted hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
