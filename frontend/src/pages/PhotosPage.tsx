import { Camera, Video } from 'lucide-react';
import { Card, EmptyState } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function PhotosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Photos & Form Analysis</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Progress Photos">
          <EmptyState icon={<Camera size={48} />} title="Coming Soon" description="Upload front, side, and back photos to compare progress over time with AI analysis." />
          <Button disabled className="mt-4">Upload Photo (Phase 2)</Button>
        </Card>
        <Card title="Form Video Analysis">
          <EmptyState icon={<Video size={48} />} title="Coming Soon" description="Upload exercise videos for basic form feedback with safety disclaimers." />
          <Button disabled className="mt-4">Upload Video (Phase 2)</Button>
        </Card>
      </div>
      <div className="rounded-lg border border-fitman-border bg-fitman-card p-4 text-sm text-fitman-muted">
        Visual analysis results are approximate. FITMAN does not diagnose medical conditions or infer sensitive health information.
      </div>
    </div>
  );
}
