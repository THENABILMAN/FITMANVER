import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { Send, Plus, Trash2, Copy } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Card';
import { api, getErrorMessage } from '../lib/api';

interface Conversation { id: string; title: string; }
interface Message { id: string; role: string; content: string; }

const SUGGESTED = [
  'I missed the last three workouts. Adjust my program.',
  'Can I hit my protein goal with today\'s meals?',
  'Give me a replacement for barbell squats.',
  'Summarize my fitness progress this month.',
  'I\'m traveling for a week. Give me a hotel-room workout.',
];

export default function CoachPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/coach/conversations').then((res) => {
      const convs = res.data.data as Conversation[];
      setConversations(convs);
      if (convs.length > 0) setActiveId(convs[0].id);
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoading(true);
    api.get(`/coach/conversations/${activeId}`).then((res) => {
      setMessages((res.data.data as { messages: Message[] }).messages || []);
    }).finally(() => setLoading(false));
  }, [activeId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const newConversation = async () => {
    const res = await api.post('/coach/conversations', { title: 'New Conversation' });
    const conv = res.data.data as Conversation;
    setConversations((c) => [conv, ...c]);
    setActiveId(conv.id);
    setMessages([]);
  };

  const sendMessage = async (text?: string) => {
    const content = text || input;
    if (!content.trim() || !activeId) return;
    setSending(true);
    setInput('');
    setMessages((m) => [...m, { id: 'temp', role: 'User', content }]);
    try {
      const res = await api.post(`/coach/conversations/${activeId}/messages`, { content });
      const response = (res.data.data as { response: string }).response;
      setMessages((m) => [...m.filter((x) => x.id !== 'temp'), { id: 'temp', role: 'User', content }, { id: 'resp', role: 'Assistant', content: response }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((m) => m.filter((x) => x.id !== 'temp'));
    } finally {
      setSending(false);
    }
  };

  const deleteConversation = async (id: string) => {
    await api.delete(`/coach/conversations/${id}`);
    setConversations((c) => c.filter((x) => x.id !== id));
    if (activeId === id) { setActiveId(null); setMessages([]); }
  };

  if (!activeId && conversations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">AI Coach</h1>
        <Card>
          <p className="mb-4 text-fitman-muted">Start a conversation with your personal AI fitness coach.</p>
          <Button onClick={newConversation}><Plus size={16} /> New Conversation</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <div className="lg:w-64">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">AI Coach</h1>
          <Button size="sm" onClick={newConversation}><Plus size={16} /></Button>
        </div>
        <div className="space-y-1 overflow-y-auto">
          {conversations.map((c) => (
            <div key={c.id} className={`flex items-center justify-between rounded-lg px-3 py-2 cursor-pointer ${activeId === c.id ? 'bg-fitman-accent/20 text-fitman-accent' : 'hover:bg-fitman-card text-fitman-muted'}`}>
              <span className="truncate text-sm" onClick={() => setActiveId(c.id)}>{c.title}</span>
              <button onClick={() => deleteConversation(c.id)} className="text-fitman-muted hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      <Card className="flex flex-1 flex-col !p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? <LoadingSpinner /> : messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'User' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${m.role === 'User' ? 'bg-fitman-accent text-white' : 'bg-fitman-navy text-white'}`}>
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                {m.role === 'Assistant' && (
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(m.content); toast.success('Copied!'); }} className="text-fitman-muted hover:text-white"><Copy size={14} /></button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && <div className="text-fitman-muted text-sm animate-pulse">FITMAN is thinking...</div>}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-fitman-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => sendMessage(s)} className="rounded-full border border-fitman-border px-3 py-1 text-xs text-fitman-muted hover:border-fitman-accent hover:text-fitman-accent">
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask your coach anything..."
              className="flex-1 rounded-lg border border-fitman-border bg-fitman-navy px-4 py-2.5 text-white placeholder:text-fitman-muted focus:border-fitman-accent focus:outline-none"
            />
            <Button onClick={() => sendMessage()} loading={sending} disabled={!input.trim()}><Send size={18} /></Button>
          </div>
          <p className="mt-2 text-xs text-fitman-muted">FITMAN provides informational guidance only. Not medical advice.</p>
        </div>
      </Card>
    </div>
  );
}
