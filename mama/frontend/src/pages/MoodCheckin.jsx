import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, orderBy, query, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Heart, Loader2 } from 'lucide-react';

const MOODS = [
  { emoji: '😊', label: 'Great',   value: 3, color: '#22C55E', bg: 'bg-successGreen/20 border-successGreen/40 hover:bg-successGreen/30' },
  { emoji: '😐', label: 'Okay',    value: 2, color: '#F59E0B', bg: 'bg-warningOrange/20 border-warningOrange/40 hover:bg-warningOrange/30' },
  { emoji: '😟', label: 'Not Well',value: 1, color: '#EF4444', bg: 'bg-dangerRed/20 border-dangerRed/40 hover:bg-dangerRed/30' },
];

const NOTES_PROMPTS = [
  'Feeling nauseous today',
  'Back pain',
  'Tired but happy',
  'Baby is very active',
  'Anxious about checkup',
  'Feeling energetic',
];

const parseDate = (savedAt) => {
  if (!savedAt) return new Date();
  if (typeof savedAt.toDate === 'function') return savedAt.toDate();
  return new Date(savedAt);
};

const MoodCheckin = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [todayLogged, setTodayLogged] = useState(false);

  const moodRef = () => collection(db, 'users', user.uid, 'moods');

  useEffect(() => {
    const load = async () => {
      // 1. Load from localStorage
      let entries = [];
      try {
        entries = JSON.parse(localStorage.getItem('mama_moods') || '[]');
        entries.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
      } catch (e) {}

      // 2. Try loading from Firestore
      try {
        if (user && db) {
          const snap = await getDocs(query(moodRef(), orderBy('savedAt', 'desc'), limit(14)));
          const firestoreEntries = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (firestoreEntries.length > 0) {
            entries = firestoreEntries;
          }
        }
      } catch (err) {
        console.warn("Could not fetch moods from Firestore, using local storage:", err);
      }

      setHistory(entries);

      // Check if already logged today
      const today = new Date().toDateString();
      const alreadyLogged = entries.some(e => parseDate(e.savedAt).toDateString() === today);
      setTodayLogged(alreadyLogged);
    };
    load();
  }, [user, saved]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const newEntry = {
      mood: selected.value,
      label: selected.label,
      emoji: selected.emoji,
      note,
      savedAt: new Date().toISOString(),
      day: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
    };

    // 1. Save to local storage
    try {
      const existing = JSON.parse(localStorage.getItem('mama_moods') || '[]');
      existing.push(newEntry);
      localStorage.setItem('mama_moods', JSON.stringify(existing));
    } catch (e) {}

    // 2. Try Firestore
    try {
      if (user && db) {
        await addDoc(moodRef(), {
          ...newEntry,
          savedAt: serverTimestamp(), // use server timestamp for firestore
        });
      }
    } catch (err) {
      console.warn("Could not save mood to Firestore, using local storage:", err);
    } finally {
      setSaved(true);
      setSelected(null);
      setNote('');
      setTimeout(() => setSaved(false), 3000);
      setSaving(false);
    }
  };

  // Build last 7 days chart data
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
    const entry = history.find(e => {
      const parsed = parseDate(e.savedAt);
      return parsed.toLocaleDateString('en-US', { weekday: 'short' }) === dayStr
        && parsed.toDateString() === d.toDateString();
    });
    return { day: dayStr, mood: entry?.mood ?? 0, emoji: entry?.emoji ?? '—', color: entry ? MOODS.find(m => m.value === entry.mood)?.color : '#334155' };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Heart className="text-accentPink w-8 h-8"/> Daily Mood Check-in
        </h1>
        <p className="text-textSecondary">Track how you feel every day. Your wellbeing matters.</p>
      </div>

      {/* Today's check-in */}
      <div className="glass rounded-3xl p-8 neon-border">
        {todayLogged && !saved ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-xl font-bold text-white">Already checked in today!</p>
            <p className="text-textSecondary mt-1">Come back tomorrow 🌸</p>
          </div>
        ) : saved ? (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">💖</p>
            <p className="text-xl font-bold text-successGreen">Mood saved!</p>
            <p className="text-textSecondary mt-1">Take care of yourself today.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-6 text-center">How are you feeling today?</h3>
            <div className="flex justify-center gap-6 mb-8">
              {MOODS.map(mood => (
                <button
                  key={mood.value}
                  onClick={() => setSelected(mood)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200
                    ${selected?.value === mood.value ? `${mood.bg} scale-110 shadow-lg` : 'border-white/10 hover:border-white/20 bg-white/5'}`}
                >
                  <span className="text-5xl">{mood.emoji}</span>
                  <span className="text-sm font-medium text-white">{mood.label}</span>
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div className="mb-4">
                  <p className="text-sm text-textSecondary mb-3">Quick notes (optional):</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {NOTES_PROMPTS.map(p => (
                      <button key={p} onClick={() => setNote(p)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-all
                          ${note === p ? 'bg-accentPink/20 border-accentPink text-accentPink' : 'border-white/10 text-textSecondary hover:border-white/30'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text" value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Or type your own note..."
                    className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accentPink"
                  />
                </div>
                <button onClick={handleSave} disabled={saving}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-accentPink to-secondaryPurple font-semibold text-white hover:shadow-[0_0_20px_rgba(255,79,163,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : '💾 Save Mood'}
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Weekly chart */}
      <div className="glass rounded-3xl p-8">
        <h3 className="text-xl font-bold text-white mb-6">Weekly Mood Trend</h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false}/>
              <YAxis domain={[0, 3]} ticks={[1, 2, 3]} tickFormatter={v => ['', '😟', '😐', '😊'][v]} stroke="#CBD5E1" fontSize={14} tickLine={false} axisLine={false}/>
              <Tooltip
                contentStyle={{ backgroundColor: '#111633', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                formatter={(v, _, props) => [props.payload.emoji, 'Mood']}
              />
              <Bar dataKey="mood" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div className="glass rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white mb-4">Recent Check-ins</h3>
          <div className="space-y-3">
            {history.slice(0, 7).map(entry => (
              <div key={entry.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                <span className="text-2xl">{entry.emoji}</span>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{entry.label} {entry.note ? `— ${entry.note}` : ''}</p>
                  <p className="text-xs text-textSecondary">
                    {entry.savedAt?.toDate ? new Date(entry.savedAt.toDate()).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodCheckin;
