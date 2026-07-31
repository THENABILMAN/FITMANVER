import { Calendar, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const WEARABLES = ['Fitbit', 'Garmin', 'Apple Health', 'Google Fit'];

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Integrations</h1>
      <Card title="Google Calendar">
        <p className="text-fitman-muted mb-4">Schedule workouts and reminders in your calendar.</p>
        <Button disabled><Calendar size={16} /> Connect Google Calendar (Coming Soon)</Button>
      </Card>
      <Card title="Gmail">
        <p className="text-fitman-muted mb-4">Import gym receipts and fitness subscriptions.</p>
        <Button disabled variant="secondary"><Clock size={16} /> Coming Soon</Button>
      </Card>
      <Card title="Wearables">
        <div className="grid gap-3 sm:grid-cols-2">
          {WEARABLES.map((w) => (
            <div key={w} className="flex items-center justify-between rounded-lg bg-fitman-navy px-4 py-3">
              <span className="text-white">{w}</span>
              <span className="text-xs text-fitman-muted">Coming Soon</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
