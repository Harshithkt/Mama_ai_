import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Utensils, TrendingUp } from 'lucide-react';

const NUTRIENTS = [
  { key: 'protein',     label: 'Protein',      color: '#FF4FA3', desc: 'Muscle & fetal growth' },
  { key: 'iron',        label: 'Iron',          color: '#EF4444', desc: 'Prevents anemia' },
  { key: 'calcium',     label: 'Calcium',       color: '#00D9FF', desc: 'Bone development' },
  { key: 'folate',      label: 'Folate',        color: '#22C55E', desc: 'Neural tube health' },
  { key: 'vitamin_d',   label: 'Vitamin D',     color: '#F59E0B', desc: 'Calcium absorption' },
  { key: 'vitamin_b12', label: 'B12',           color: '#9D4EDD', desc: 'Nerve function' },
  { key: 'vitamin_b6',  label: 'B6',            color: '#06B6D4', desc: 'Brain development' },
  { key: 'vitamin_c',   label: 'Vitamin C',     color: '#F97316', desc: 'Immune support' },
  { key: 'fiber',       label: 'Fiber',         color: '#84CC16', desc: 'Digestion' },
  { key: 'zinc',        label: 'Zinc',          color: '#8B5CF6', desc: 'Fetal growth' },
  { key: 'iodine',      label: 'Iodine',        color: '#EC4899', desc: 'Thyroid function' },
  { key: 'magnesium',   label: 'Magnesium',     color: '#14B8A6', desc: 'Muscle function' },
  { key: 'phosphorus',  label: 'Phosphorus',    color: '#F59E0B', desc: 'Bone & teeth' },
  { key: 'omega_3_dha', label: 'Omega-3 DHA',   color: '#3B82F6', desc: 'Brain & eye dev.' },
];

const Ring = ({ value, color, size = 80 }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value, 100);
  const dash = (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}/>
    </svg>
  );
};

const NutritionRings = () => {
  const { user } = useAuth();
  const [totals, setTotals] = useState({});
  const [mealCount, setMealCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDocs(collection(db, 'users', user.uid, 'reports', 'meal_scans', 'entries'));
      setMealCount(snap.size);
      const agg = {};
      NUTRIENTS.forEach(n => agg[n.key] = 0);
      snap.docs.forEach(d => {
        const nutrients = d.data().nutrients ?? {};
        NUTRIENTS.forEach(n => {
          agg[n.key] += nutrients[n.key]?.value ?? 0;
        });
      });
      // Average across meals, cap at 100
      if (snap.size > 0) {
        NUTRIENTS.forEach(n => { agg[n.key] = Math.min(Math.round(agg[n.key] / snap.size), 100); });
      }
      setTotals(agg);
      setLoading(false);
    };
    load();
  }, [user]);

  const avgScore = mealCount > 0
    ? Math.round(NUTRIENTS.reduce((s, n) => s + (totals[n.key] ?? 0), 0) / NUTRIENTS.length)
    : 0;

  const getStatus = (v) => v >= 60 ? { label: 'Good', color: 'text-successGreen' } : v >= 30 ? { label: 'Adequate', color: 'text-warningOrange' } : { label: 'Low', color: 'text-dangerRed' };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Utensils className="text-successGreen w-8 h-8"/> Nutrition Progress
        </h1>
        <p className="text-textSecondary">Average nutrient intake across {mealCount} saved meal{mealCount !== 1 ? 's' : ''}.</p>
      </div>

      {/* Overall score */}
      <div className="glass rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 neon-border">
        <div className="relative flex items-center justify-center">
          <Ring value={avgScore} color="#FF4FA3" size={160}/>
          <div className="absolute text-center">
            <p className="text-4xl font-black text-white">{avgScore}</p>
            <p className="text-xs text-textSecondary">/ 100</p>
          </div>
        </div>
        <div>
          <p className="text-textSecondary text-sm uppercase tracking-widest mb-1">Overall Nutrition Score</p>
          <h2 className="text-3xl font-bold text-white mb-2">
            {avgScore >= 60 ? '🌟 Great job!' : avgScore >= 30 ? '⚠️ Needs improvement' : '❗ Low nutrition'}
          </h2>
          <p className="text-textSecondary max-w-sm">
            {mealCount === 0
              ? 'No meals saved yet. Scan your meals to see your nutrition progress.'
              : `Based on ${mealCount} meal scan${mealCount > 1 ? 's' : ''}. Keep logging meals for better accuracy.`}
          </p>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-successGreen"/><span className="text-xs text-textSecondary">Good ≥60%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warningOrange"/><span className="text-xs text-textSecondary">Adequate 30-59%</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-dangerRed"/><span className="text-xs text-textSecondary">Low &lt;30%</span></div>
          </div>
        </div>
      </div>

      {/* 14 nutrient rings */}
      {loading ? (
        <div className="text-center py-12 text-textSecondary">Loading nutrition data...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {NUTRIENTS.map(n => {
            const val = totals[n.key] ?? 0;
            const status = getStatus(val);
            return (
              <div key={n.key} className="glass rounded-2xl p-4 flex flex-col items-center text-center hover:scale-105 transition-transform">
                <div className="relative flex items-center justify-center mb-2">
                  <Ring value={val} color={n.color} size={72}/>
                  <span className="absolute text-sm font-bold text-white">{val}%</span>
                </div>
                <p className="text-xs font-semibold text-white leading-tight">{n.label}</p>
                <p className={`text-xs font-medium mt-0.5 ${status.color}`}>{status.label}</p>
                <p className="text-xs text-textSecondary mt-1 leading-tight">{n.desc}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Gaps alert */}
      {mealCount > 0 && (
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-warningOrange"/> Nutrients Needing Attention
          </h3>
          <div className="flex flex-wrap gap-3">
            {NUTRIENTS.filter(n => (totals[n.key] ?? 0) < 30).length === 0 ? (
              <p className="text-successGreen text-sm">✅ All nutrients are at adequate levels!</p>
            ) : (
              NUTRIENTS.filter(n => (totals[n.key] ?? 0) < 30).map(n => (
                <div key={n.key} className="flex items-center gap-2 px-3 py-2 bg-dangerRed/10 border border-dangerRed/30 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-dangerRed"/>
                  <span className="text-sm text-white font-medium">{n.label}</span>
                  <span className="text-xs text-dangerRed">{totals[n.key] ?? 0}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionRings;
