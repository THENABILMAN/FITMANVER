import { useEffect, useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { Card, EmptyState, LoadingSpinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/documents').then((res) => setDocs(res.data.data as Record<string, unknown>[])).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Documents</h1>
        <Button disabled><Upload size={16} /> Upload (Coming Soon)</Button>
      </div>
      <div className="rounded-lg border border-yellow-600/30 bg-yellow-600/10 p-4 text-sm text-yellow-200">
        Document upload and RAG Q&A coming in Phase 2. Upload blood reports, diet plans, and coach programs for AI-grounded answers.
      </div>
      <Card>
        {docs.length === 0 ? (
          <EmptyState icon={<FileText size={48} />} title="No documents uploaded" description="Upload health documents to ask FITMAN questions with citations." />
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={String(d.id)} className="rounded-lg bg-fitman-navy px-4 py-3">
                <p className="text-white">{String(d.file_name)}</p>
                <p className="text-sm text-fitman-muted">{String(d.document_category)} · {String(d.processing_status)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
