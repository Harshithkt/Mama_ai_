import { useAuth } from '../context/AuthContext';
import { Baby, Heart, Brain, Zap, Eye, Ear } from 'lucide-react';

const WEEKS = [
  { week: 4,  fruit: '🫐', name: 'Blueberry',    size: '0.4 cm',  weight: '< 1g',    milestone: 'Neural tube forming' },
  { week: 6,  fruit: '🫛', name: 'Pea',          size: '0.6 cm',  weight: '< 1g',    milestone: 'Heart starts beating' },
  { week: 8,  fruit: '🫒', name: 'Olive',        size: '1.6 cm',  weight: '1g',      milestone: 'All major organs forming' },
  { week: 10, fruit: '🍓', name: 'Strawberry',   size: '3.1 cm',  weight: '4g',      milestone: 'Tiny fingernails appear' },
  { week: 12, fruit: '🍋', name: 'Lime',         size: '5.4 cm',  weight: '14g',     milestone: 'Reflexes developing' },
  { week: 14, fruit: '🍑', name: 'Peach',        size: '8.7 cm',  weight: '43g',     milestone: 'Can make facial expressions' },
  { week: 16, fruit: '🥑', name: 'Avocado',      size: '11.6 cm', weight: '100g',    milestone: 'Hearing begins' },
  { week: 18, fruit: '🥭', name: 'Mango',        size: '14.2 cm', weight: '190g',    milestone: 'Kicks felt for first time' },
  { week: 20, fruit: '🍌', name: 'Banana',       size: '16.4 cm', weight: '300g',    milestone: 'Halfway there! 🎉' },
  { week: 22, fruit: '🌽', name: 'Corn',         size: '27.8 cm', weight: '430g',    milestone: 'Eyebrows & eyelashes forming' },
  { week: 24, fruit: '🌽', name: 'Corn (full)',  size: '30 cm',   weight: '600g',    milestone: 'Lungs developing rapidly' },
  { week: 26, fruit: '🥬', name: 'Lettuce',      size: '35.6 cm', weight: '760g',    milestone: 'Eyes can open & close' },
  { week: 28, fruit: '🍆', name: 'Eggplant',     size: '37.6 cm', weight: '1kg',     milestone: 'Brain growing fast' },
  { week: 30, fruit: '🥥', name: 'Coconut',      size: '39.9 cm', weight: '1.3kg',   milestone: 'Can dream during sleep' },
  { week: 32, fruit: '🎃', name: 'Squash',       size: '42.4 cm', weight: '1.7kg',   milestone: 'Practicing breathing' },
  { week: 34, fruit: '🍈', name: 'Cantaloupe',   size: '45 cm',   weight: '2.1kg',   milestone: 'Immune system strengthening' },
  { week: 36, fruit: '🥗', name: 'Romaine Head', size: '47.4 cm', weight: '2.6kg',   milestone: 'Baby is full term soon!' },
  { week: 38, fruit: '🎋', name: 'Leek',         size: '49.8 cm', weight: '3.1kg',   milestone: 'Ready to meet the world' },
  { week: 40, fruit: '🍉', name: 'Watermelon',   size: '51.2 cm', weight: '3.4kg',   milestone: 'Full term! 🌟' },
];

const MILESTONE_ICONS = [Heart, Brain, Eye, Ear, Zap, Baby];

const BabyGrowth = () => {
  const { userProfile } = useAuth();
  const currentWeek = userProfile?.pregnancyWeek ?? 20;

  const currentData = WEEKS.reduce((prev, curr) =>
    Math.abs(curr.week - currentWeek) < Math.abs(prev.week - currentWeek) ? curr : prev
  );

  const progress = Math.min((currentWeek / 40) * 100, 100);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Baby className="text-secondaryPurple w-8 h-8"/> Baby Growth Timeline
        </h1>
        <p className="text-textSecondary">Your baby's development journey, week by week.</p>
      </div>

      {/* Current week hero */}
      <div className="glass rounded-3xl p-8 neon-border relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondaryPurple/10 rounded-full blur-3xl"></div>
        <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
          <div>
            <p className="text-textSecondary text-sm uppercase tracking-widest mb-2">Currently at</p>
            <h2 className="text-5xl font-black text-white mb-1">Week {currentWeek}</h2>
            <p className="text-textSecondary mb-6">{40 - currentWeek} weeks to go 🌸</p>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-textSecondary mb-2">
                <span>Week 1</span><span>Week 40</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accentPink to-secondaryPurple rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-textSecondary mt-1">{Math.round(progress)}% of pregnancy complete</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-xs text-textSecondary mb-1">Length</p>
                <p className="text-2xl font-bold text-white">{currentData.size}</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-xs text-textSecondary mb-1">Weight</p>
                <p className="text-2xl font-bold text-white">{currentData.weight}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-[120px] leading-none mb-4 drop-shadow-2xl">{currentData.fruit}</div>
            <p className="text-2xl font-bold text-white mb-1">Size of a {currentData.name}</p>
            <div className="mt-3 px-4 py-2 bg-accentPink/20 border border-accentPink/30 rounded-full">
              <p className="text-sm text-accentPink font-medium">✨ {currentData.milestone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trimester sections */}
      {[
        { label: '1st Trimester', range: [1, 13], color: 'border-cyanAccent', bg: 'bg-cyanAccent/10' },
        { label: '2nd Trimester', range: [14, 27], color: 'border-successGreen', bg: 'bg-successGreen/10' },
        { label: '3rd Trimester', range: [28, 40], color: 'border-secondaryPurple', bg: 'bg-secondaryPurple/10' },
      ].map(({ label, range, color, bg }) => (
        <div key={label}>
          <h3 className={`text-lg font-bold text-white mb-4 px-4 py-2 rounded-xl ${bg} border ${color} inline-block`}>{label}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {WEEKS.filter(w => w.week >= range[0] && w.week <= range[1]).map((w) => {
              const isCurrent = w.week === currentData.week;
              const isPast = w.week < currentWeek;
              return (
                <div key={w.week} className={`glass rounded-2xl p-4 transition-all duration-300 relative
                  ${isCurrent ? `border-2 ${color} shadow-lg scale-105` : isPast ? 'opacity-60' : 'opacity-80 hover:opacity-100'}`}>
                  {isCurrent && (
                    <span className="absolute -top-2 -right-2 bg-accentPink text-white text-xs px-2 py-0.5 rounded-full font-bold">NOW</span>
                  )}
                  <div className="text-3xl mb-2">{w.fruit}</div>
                  <p className="text-xs text-textSecondary">Week {w.week}</p>
                  <p className="text-sm font-semibold text-white">{w.name}</p>
                  <p className="text-xs text-textSecondary mt-1">{w.size} · {w.weight}</p>
                  <p className="text-xs text-accentPink mt-2 leading-tight">{w.milestone}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BabyGrowth;
