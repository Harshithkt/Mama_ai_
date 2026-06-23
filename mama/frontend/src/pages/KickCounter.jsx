import { useState } from 'react';
import { Baby, Activity, Clock, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SaveReportButton from '../components/SaveReportButton';
import { useReport } from '../context/ReportContext';

const KickCounter = () => {
  const [kicks, setKicks] = useState(4);
  
  const { saveKicks } = useReport();

  const data = [
    { day: 'Mon', kicks: 12 },
    { day: 'Tue', kicks: 15 },
    { day: 'Wed', kicks: 10 },
    { day: 'Thu', kicks: 14 },
    { day: 'Fri', kicks: 8 },
    { day: 'Sat', kicks: 11 },
    { day: 'Sun', kicks: kicks },
  ];

  const handleKick = () => {
    setKicks(prev => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Baby className="text-secondaryPurple w-8 h-8"/> Kick Counter
          </h1>
          <p className="text-textSecondary">Monitor fetal movements. You should feel at least 10 kicks in a 2-hour window.</p>
        </div>
        <SaveReportButton
          onSave={() => saveKicks({ today: kicks, weekly_avg: Math.round(data.slice(0,-1).reduce((s,d)=>s+d.kicks,0)/6) })}
          label="Save to Report"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass rounded-3xl p-10 flex flex-col items-center justify-center text-center neon-border">
          <p className="text-lg font-medium text-textSecondary mb-8">Today's Session</p>
          
          <button 
            onClick={handleKick}
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-secondaryPurple to-accentPink flex flex-col items-center justify-center shadow-[0_0_40px_rgba(157,78,221,0.5)] hover:scale-105 active:scale-95 transition-all mb-8 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-150 rounded-full transition-transform duration-500 ease-out opacity-0 group-active:opacity-100"></div>
            <Baby className="w-12 h-12 text-white mb-2" />
            <span className="text-xl font-bold text-white">Tap for Kick</span>
          </button>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-sm text-textSecondary mb-1 flex items-center justify-center gap-1"><Activity className="w-4 h-4"/> Kicks</p>
              <p className="text-4xl font-bold text-white">{kicks}</p>
            </div>
            <div className="w-px h-12 bg-white/10"></div>
            <div className="text-center">
              <p className="text-sm text-textSecondary mb-1 flex items-center justify-center gap-1"><Clock className="w-4 h-4"/> Time Left</p>
              <p className="text-4xl font-bold text-white">01:45</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-8 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-secondaryPurple w-5 h-5"/> Weekly Trend</h3>
            <span className="px-3 py-1 bg-white/5 rounded-lg text-sm text-textSecondary">Last 7 Days</span>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#CBD5E1" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--border-soft)'}}
                  contentStyle={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-1)' }}
                />
                <Bar dataKey="kicks" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === data.length - 1 ? '#D97757' : '#F3AE8C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-sm text-textSecondary leading-relaxed">
              Your baby is active and meeting the recommended kick targets. If you notice a sudden decrease in movement, please start a symptom chat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KickCounter;
