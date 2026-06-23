import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ScanFace, Utensils, Baby, MessageCircle, FileText, Calendar, Heart, X, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

const BABY_SIZES = [
  { week: 4, fruit: '🫐', name: 'Blueberry' }, { week: 8, fruit: '🫒', name: 'Olive' },
  { week: 12, fruit: '🍋', name: 'Lime' },     { week: 16, fruit: '🥑', name: 'Avocado' },
  { week: 20, fruit: '🍌', name: 'Banana' },   { week: 24, fruit: '🌽', name: 'Corn' },
  { week: 28, fruit: '🍆', name: 'Eggplant' }, { week: 32, fruit: '🎃', name: 'Squash' },
  { week: 36, fruit: '🥗', name: 'Lettuce' },  { week: 40, fruit: '🍉', name: 'Watermelon' },
];

const RiskGauge = ({ score }) => {
  const r = 70, circ = Math.PI * r; // half circle
  const pct = Math.min(score, 100);
  const dash = (pct / 100) * circ;
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#22C55E';
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Moderate' : 'Low Risk';

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="90" viewBox="0 0 160 90">
        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke="var(--border)" strokeWidth="14" strokeLinecap="round"/>
        <path d="M 10 80 A 70 70 0 0 1 150 80" fill="none" stroke={color} strokeWidth="14"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 1.2s ease, stroke 0.5s ease' }}/>
      </svg>
      <div className="-mt-6 text-center">
        <p className="text-3xl font-black" style={{ color: 'var(--text-1)' }}>{score}</p>
        <p className="text-xs font-bold mt-0.5" style={{ color }}>{label}</p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { userProfile, user } = useAuth();
  const [nextCheckup, setNextCheckup] = useState('2026-10-15');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [tempCheckup, setTempCheckup] = useState('2026-10-15');
  const [riskScore, setRiskScore] = useState(0);
  const [todayMood, setTodayMood] = useState(null);
  const [riskFactors, setRiskFactors] = useState([]);

  const week = userProfile?.pregnancyWeek ?? 20;
  const babySize = BABY_SIZES.reduce((p, c) => Math.abs(c.week - week) < Math.abs(p.week - week) ? c : p);

  useEffect(() => {
    if (userProfile?.nextCheckup) { setNextCheckup(userProfile.nextCheckup); setTempCheckup(userProfile.nextCheckup); }
  }, [userProfile]);

  useEffect(() => {
    if (!user) return;
    const calcRisk = async () => {
      // 1. Load baseline from localStorage
      const getLocalData = (sub) => {
        try {
          const list = JSON.parse(localStorage.getItem(`mama_report_${sub}`) || '[]');
          list.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
          return list[0] || null;
        } catch (e) {
          return null;
        }
      };

      const getLocalMood = () => {
        try {
          const list = JSON.parse(localStorage.getItem('mama_moods') || '[]');
          list.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
          return list[0] || null;
        } catch (e) {
          return null;
        }
      };

      let latestEyelid = getLocalData('eyelid_scans');
      let latestKick = getLocalData('kick_sessions');
      let latestSymptom = getLocalData('symptom_chats');
      let latestMood = getLocalMood();

      // 2. Try fetching from Firestore
      try {
        const base = (sub) => collection(db, 'users', user.uid, 'reports', sub, 'entries');
        const [eyelidSnap, kickSnap, symptomSnap, moodSnap] = await Promise.all([
          getDocs(query(base('eyelid_scans'), orderBy('savedAt', 'desc'), limit(1))),
          getDocs(query(base('kick_sessions'), orderBy('savedAt', 'desc'), limit(1))),
          getDocs(query(base('symptom_chats'), orderBy('savedAt', 'desc'), limit(1))),
          getDocs(query(collection(db, 'users', user.uid, 'moods'), orderBy('savedAt', 'desc'), limit(1))),
        ]);

        if (!eyelidSnap.empty) latestEyelid = eyelidSnap.docs[0].data();
        if (!kickSnap.empty) latestKick = kickSnap.docs[0].data();
        if (!symptomSnap.empty) latestSymptom = symptomSnap.docs[0].data();
        if (!moodSnap.empty) latestMood = moodSnap.docs[0].data();
      } catch (err) {
        console.warn("Could not calculate risk from Firestore, using local storage:", err);
      }

      let score = 10; // baseline
      const factors = [];

      // Eyelid Hb
      if (latestEyelid) {
        const hb = latestEyelid.hb ?? 11;
        if (hb < 9) { score += 35; factors.push({ label: 'Severe anemia risk', color: 'text-dangerRed' }); }
        else if (hb < 11) { score += 20; factors.push({ label: 'Mild anemia detected', color: 'text-warningOrange' }); }
      }

      // Kicks
      if (latestKick) {
        const kicks = latestKick.today ?? 10;
        if (kicks < 6) { score += 25; factors.push({ label: 'Low fetal movement', color: 'text-dangerRed' }); }
        else if (kicks < 10) { score += 10; factors.push({ label: 'Below avg kicks', color: 'text-warningOrange' }); }
      }

      // Symptoms emergency flag
      if (latestSymptom) {
        const msgs = latestSymptom.messages ?? [];
        const hasEmergency = msgs.some(m => m.statusCard === 'emergency');
        const hasWarning = msgs.some(m => m.statusCard === 'warning');
        if (hasEmergency) { score += 30; factors.push({ label: 'Emergency symptom flagged', color: 'text-dangerRed' }); }
        else if (hasWarning) { score += 15; factors.push({ label: 'Warning symptom logged', color: 'text-warningOrange' }); }
      }

      // Mood
      if (latestMood) {
        const mood = latestMood.mood ?? 3;
        if (mood === 1) { score += 10; factors.push({ label: 'Low mood reported', color: 'text-warningOrange' }); }
        setTodayMood(latestMood);
      }

      if (factors.length === 0) factors.push({ label: 'All vitals look good', color: 'text-successGreen' });
      setRiskScore(Math.min(score, 100));
      setRiskFactors(factors);
    };
    calcRisk();
  }, [user]);

  const handleReschedule = async () => {
    setNextCheckup(tempCheckup);
    if (user) await updateDoc(doc(db, 'users', user.uid), { nextCheckup: tempCheckup });
    setShowCalendarModal(false);
  };

  const formatDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {userProfile?.name?.split(' ')[0] || 'Mama'} 👋</h1>
          <p className="text-textSecondary">Here is your daily pregnancy health summary.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-4 border-l-4 border-accentPink">
          <Calendar className="text-accentPink w-6 h-6" />
          <div>
            <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Pregnancy Week</p>
            <p className="text-xl font-bold text-white">Week {week} <span className="text-sm font-normal text-textSecondary">of 40</span></p>
            {userProfile?.location && <p className="text-xs text-textSecondary mt-0.5">📍 {userProfile.location}</p>}
          </div>
        </div>
      </div>

      {/* Top 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Risk Score Gauge */}
        <div className="glass p-6 rounded-3xl relative overflow-hidden group lg:col-span-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accentPink/10 rounded-full blur-3xl group-hover:bg-accentPink/20 transition-all"/>
          <p className="text-sm font-medium text-textSecondary mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> Risk Score</p>
          <RiskGauge score={riskScore}/>
          <div className="mt-2 space-y-1">
            {riskFactors.slice(0, 2).map((f, i) => (
              <p key={i} className={`text-xs ${f.color} flex items-center gap-1`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current inline-block"/>{f.label}
              </p>
            ))}
          </div>
        </div>

        {/* Baby Size */}
        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondaryPurple/10 rounded-full blur-3xl group-hover:bg-secondaryPurple/20 transition-all"/>
          <p className="text-sm font-medium text-textSecondary mb-2">Baby Size</p>
          <div className="text-5xl mb-2">{babySize.fruit}</div>
          <p className="text-2xl font-bold text-white">{babySize.name}</p>
          <p className="text-sm text-textSecondary mt-1">Week {week} · {40 - week} weeks left</p>
          <Link to="/baby-growth" className="mt-3 inline-block text-xs text-secondaryPurple hover:underline">View full timeline →</Link>
        </div>

        {/* Mood */}
        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-warningOrange/10 rounded-full blur-3xl group-hover:bg-warningOrange/20 transition-all"/>
          <p className="text-sm font-medium text-textSecondary mb-2">Today's Mood</p>
          {todayMood ? (
            <>
              <div className="text-5xl mb-2">{todayMood.emoji}</div>
              <p className="text-2xl font-bold text-white">{todayMood.label}</p>
              {todayMood.note && <p className="text-sm text-textSecondary mt-1 italic">"{todayMood.note}"</p>}
            </>
          ) : (
            <>
              <div className="text-5xl mb-2">💭</div>
              <p className="text-lg font-bold text-white">Not logged yet</p>
              <Link to="/mood" className="mt-3 inline-block text-xs text-accentPink hover:underline">Check in now →</Link>
            </>
          )}
        </div>

        {/* Next Checkup */}
        <div className="glass p-6 rounded-3xl relative overflow-hidden group neon-border">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyanAccent/10 rounded-full blur-3xl group-hover:bg-cyanAccent/20 transition-all"/>
          <p className="text-sm font-medium text-textSecondary mb-2">Next Checkup</p>
          <h3 className="text-xl font-bold text-cyanAccent mb-1">{formatDate(nextCheckup)}</h3>
          <p className="text-base text-white mb-4">Dr. Sarah (ASHA)</p>
          <button onClick={() => setShowCalendarModal(true)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors">
            Reschedule
          </button>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-3xl p-8 max-w-sm w-full shadow-2xl" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Reschedule Checkup</h3>
              <button onClick={() => setShowCalendarModal(false)} className="p-1 rounded-lg transition-colors" style={{ color: 'var(--text-2)' }}>
                <X className="w-5 h-5"/>
              </button>
            </div>
            <div className="space-y-4">
              <input type="date" value={tempCheckup} onChange={e => setTempCheckup(e.target.value)}
                className="input-base" style={{ colorScheme: 'auto' }}/>
              <p className="text-lg font-bold" style={{ color: 'var(--pink)' }}>{formatDate(tempCheckup)}</p>
              <div className="flex gap-3">
                <button onClick={handleReschedule} className="btn-primary flex-1">Confirm</button>
                <button onClick={() => setShowCalendarModal(false)} className="btn-ghost flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-accentPink"/> Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[
            { to: '/symptoms',    icon: MessageCircle, label: 'Symptom Chat',  color: 'from-pink-500 to-rose-500' },
            { to: '/eyelid',      icon: ScanFace,      label: 'Eyelid Scan',   color: 'from-cyan-500 to-blue-500' },
            { to: '/meal',        icon: Utensils,      label: 'Meal Scan',     color: 'from-green-500 to-emerald-500' },
            { to: '/kicks',       icon: Baby,          label: 'Kick Counter',  color: 'from-purple-500 to-indigo-500' },
            { to: '/mood',        icon: Heart,         label: 'Mood Check',    color: 'from-yellow-500 to-orange-500' },
            { to: '/baby-growth', icon: Baby,          label: 'Baby Growth',   color: 'from-secondaryPurple to-accentPink' },
            { to: '/reports',     icon: FileText,      label: 'My Reports',    color: 'from-slate-500 to-gray-500' },
          ].map((action, i) => (
            <Link key={i} to={action.to} className="glass p-4 rounded-3xl flex flex-col items-center justify-center text-center hover:scale-105 transition-transform duration-300 group cursor-pointer border border-transparent hover:border-white/10">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 shadow-lg`}>
                <action.icon className="w-6 h-6 text-white"/>
              </div>
              <span className="font-medium text-xs text-textSecondary group-hover:text-white transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
