import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, HeartPulse, Stethoscope, User, Loader2, MapPin, Globe, Baby } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { id: 'mother', label: 'Mother',      icon: HeartPulse },
  { id: 'asha',   label: 'ASHA Worker', icon: Stethoscope },
  { id: 'admin',  label: 'Admin',       icon: User },
];

const LANGUAGES = ['English','Hindi','Tamil','Telugu','Kannada','Malayalam','Bengali','Marathi','Gujarati','Punjabi'];

const Login = () => {
  const [activeTab, setActiveTab] = useState('mother');
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pregnancyWeek, setPregnancyWeek] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const reset = () => { setStep(1); setName(''); setEmail(''); setPassword(''); setPregnancyWeek(''); setLocation(''); setLanguage('English'); setError(''); };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (isSignup && activeTab === 'mother') setStep(2);
    else handleFinalSubmit();
  };

  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isSignup) await signup(email, password, name, activeTab, { pregnancyWeek: parseInt(pregnancyWeek) || null, location, language });
      else await login(email, password);
      navigate(activeTab === 'asha' ? '/asha' : '/dashboard');
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').replace(/\(auth.*\)\.?/, '').trim());
      setStep(1);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}>

      {/* Soft background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, #F43F7F33, transparent)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #C084FC33, transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl font-extrabold gradient-text mb-2">MamaAI</Link>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Smart care for every mother</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>

          {/* Tabs */}
          {step === 1 && (
            <div className="flex p-1 rounded-2xl mb-7 gap-1" style={{ background: 'var(--bg-3)' }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setError(''); }}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                  style={activeTab === tab.id
                    ? { background: 'linear-gradient(135deg,#F43F7F,#C084FC)', color: '#fff', boxShadow: '0 4px 12px rgba(244,63,127,0.3)' }
                    : { color: 'var(--text-2)' }}>
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step indicator */}
          {isSignup && activeTab === 'mother' && (
            <div className="flex items-center gap-2 mb-6">
              {[1, 2].map(s => (
                <div key={s} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: step >= s ? 'linear-gradient(90deg,#F43F7F,#C084FC)' : 'var(--bg-3)' }} />
              ))}
              <span className="text-xs ml-1" style={{ color: 'var(--text-3)' }}>{step}/2</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#DC2626' }}>
              {error}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              {isSignup && (
                <div>
                  <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>Full Name</label>
                  <input className="input-base" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>Email</label>
                <input className="input-base" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>Password</label>
                <input className="input-base" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isSignup && activeTab === 'mother' ? 'Next' : isSignup ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <span className="text-4xl">🌸</span>
                <p className="font-bold mt-2" style={{ color: 'var(--text-1)' }}>Tell us about your pregnancy</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>Helps us personalise your experience</p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>
                  <Baby className="w-3 h-3 inline mr-1" />Weeks Pregnant
                </label>
                <input className="input-base" type="number" min="1" max="42" value={pregnancyWeek} onChange={e => setPregnancyWeek(e.target.value)} placeholder="e.g. 28" required />
                {pregnancyWeek && <p className="text-xs mt-1" style={{ color: 'var(--pink)' }}>Week {pregnancyWeek} — {42 - pregnancyWeek} weeks to go 🌸</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>
                  <MapPin className="w-3 h-3 inline mr-1" />Location
                </label>
                <input className="input-base" type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Mumbai, Maharashtra" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text-2)' }}>
                  <Globe className="w-3 h-3 inline mr-1" />Preferred Language
                </label>
                <select className="input-base cursor-pointer" value={language} onChange={e => setLanguage(e.target.value)}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </form>
          )}

          <p className="text-center mt-6 text-sm" style={{ color: 'var(--text-3)' }}>
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => { setIsSignup(!isSignup); reset(); }} className="font-semibold" style={{ color: 'var(--pink)' }}>
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
