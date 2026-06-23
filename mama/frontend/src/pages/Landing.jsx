import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Utensils, 
  Baby, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Heart, 
  CheckCircle2, 
  Clock, 
  Eye 
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-textPrimary relative overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      {/* Decorative background grid and glowing blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg className="absolute top-0 left-0 w-full h-[600px] opacity-[0.06] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full blur-3xl opacity-20" 
          style={{ background: 'radial-gradient(circle, var(--pink), transparent)' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[45%] aspect-square rounded-full blur-3xl opacity-20" 
          style={{ background: 'radial-gradient(circle, var(--purple), transparent)' }}></div>
      </div>

      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-lg" 
            style={{ background: 'linear-gradient(135deg, var(--pink), var(--purple))' }}>
            M
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-accentPink to-secondaryPurple bg-clip-text text-transparent">
            MamaAI
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="px-5 py-2 rounded-xl text-sm font-semibold hover:text-accentPink transition-colors" style={{ color: 'var(--text-2)' }}>
            Login
          </Link>
          <Link to="/dashboard" className="btn-primary text-sm px-5 py-2.5 shadow-md">
            Try Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-6 space-y-8 fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accentPink/10 text-accentPink text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Maternal Support
          </div>
          <h2 className="text-5xl sm:text-6xl font-extrabold leading-[1.1] tracking-tight" style={{ color: 'var(--text-1)' }}>
            Every Mother Deserves <span className="gradient-text">Smart Care</span>
          </h2>
          <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--text-2)' }}>
            MamaAI is a maternal healthcare platform designed to provide early anemia screening, nutritional logging, fetal kick counting, symptom analysis, and instant emergency alerts.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link to="/dashboard" className="btn-primary px-8 py-4 text-base font-bold shadow-lg flex items-center gap-2">
              Start Free Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="btn-ghost px-6 py-4 text-base font-semibold border-2">
              Explore Features
            </a>
          </div>
        </div>
        
        {/* High-Fidelity Mock Dashboard Showcase */}
        <div className="lg:col-span-6 relative pt-6 lg:pt-0">
          <div className="absolute -inset-4 bg-gradient-to-r from-accentPink to-secondaryPurple opacity-15 blur-3xl rounded-full"></div>
          
          {/* Glass Dashboard mockup frame */}
          <div className="glass rounded-3xl p-6 relative aspect-[4/3] flex flex-col justify-between border shadow-lg border-white/10 dark:border-white/5">
            {/* Mock Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-successGreen animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-textSecondary" style={{ color: 'var(--text-3)' }}>MamaAI Simulated Vitals</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-successGreen/25 text-successGreen border border-successGreen/35">Anemia Low Risk</span>
            </div>

            {/* Mock Dashboard Grid */}
            <div className="grid grid-cols-2 gap-4 flex-1 py-4">
              {/* Eyelid Scan Card */}
              <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-textSecondary" style={{ color: 'var(--text-2)' }}>Eyelid Anemia Scan</span>
                  <Eye className="w-4 h-4 text-accentPink" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-1)' }}>11.2</span>
                  <span className="text-xs text-textSecondary ml-1" style={{ color: 'var(--text-2)' }}>g/dL</span>
                </div>
                <span className="text-[10px] text-successGreen font-medium">✨ Stable Hemoglobin</span>
              </div>

              {/* Fetal Activity Card */}
              <div className="bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-textSecondary" style={{ color: 'var(--text-2)' }}>Fetal Kick Counter</span>
                  <Baby className="w-4 h-4 text-secondaryPurple" />
                </div>
                <div className="my-2">
                  <span className="text-2xl font-black" style={{ color: 'var(--text-1)' }}>10</span>
                  <span className="text-xs text-textSecondary ml-1" style={{ color: 'var(--text-2)' }}>kicks/session</span>
                </div>
                <span className="text-[10px] text-successGreen font-medium">✨ Normal Activity</span>
              </div>

              {/* AI Chat Diagnosis Box */}
              <div className="col-span-2 bg-accentPink/5 border border-accentPink/15 rounded-2xl p-4 flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-accentPink/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-4 h-4 text-accentPink" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-accentPink">AI Health Assistant Alert</h4>
                  <p className="text-[11px] mt-1 leading-normal" style={{ color: 'var(--text-2)' }}>
                    "Dizziness can be normal. Keep hydrated and discuss with ASHA worker on your next check-up."
                  </p>
                </div>
              </div>
            </div>

            {/* Mock Graph Preview */}
            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
              <span style={{ color: 'var(--text-3)' }}>Hb Level Trend (Last 4 Scans)</span>
              <div className="flex items-end gap-1.5 h-6">
                <div className="w-3 bg-accentPink/20 rounded-t h-3"></div>
                <div className="w-3 bg-accentPink/35 rounded-t h-4"></div>
                <div className="w-3 bg-accentPink/50 rounded-t h-4.5"></div>
                <div className="w-3 bg-accentPink rounded-t h-5.5"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card py-12 relative z-10" style={{ background: 'var(--bg-2)', borderColor: 'var(--border-soft)' }}>
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <h4 className="text-4xl font-extrabold text-accentPink">30M+</h4>
            <p className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Mothers Supported</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-4xl font-extrabold text-cyanAccent">22+</h4>
            <p className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Indian Dialects</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-4xl font-extrabold text-secondaryPurple">900K+</h4>
            <p className="font-semibold text-sm uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>ASHA Workers Synced</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: 'var(--text-1)' }}>
            Every Tool Needed for a Safe Pregnancy
          </h3>
          <p className="text-lg" style={{ color: 'var(--text-2)' }}>
            An all-in-one suite of AI-driven tools helping mothers, doctors, and community health workers screen, track, and alert.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1: Symptom Checker */}
          <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border flex flex-col justify-between min-h-[300px]">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-accentPink/15 flex items-center justify-center text-accentPink">
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>AI Symptom Analyzer</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Enter pregnancy symptoms in your language. Our model evaluates severity and instantly classifies cases into SAFE, WARNING, or EMERGENCY flags.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-accentPink mt-4 inline-flex items-center gap-1">
              Groq Llama 3.3 Powered <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Feature 2: Eyelid Anemia Scan */}
          <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border flex flex-col justify-between min-h-[300px]">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-cyanAccent/15 flex items-center justify-center text-cyanAccent">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Eyelid Anemia Scanner</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  A non-invasive, instant hemoglobin estimation scan. Snap a photo of the inner eyelid, and computer vision estimates anemia risk levels.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-cyanAccent mt-4 inline-flex items-center gap-1">
              Computer Vision Model <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Feature 3: Meal Scanner */}
          <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border flex flex-col justify-between min-h-[300px]">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-successGreen/15 flex items-center justify-center text-successGreen">
                <Utensils className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Maternal Meal Scanner</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Scan meals from photos. Estimates key nutrition values (iron, calcium, protein, folate) and highlights daily nutritional gaps for pregnant mothers.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-successGreen mt-4 inline-flex items-center gap-1">
              AI Nutrition Assistant <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Feature 4: Kick Counter */}
          <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border flex flex-col justify-between min-h-[300px]">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-secondaryPurple/15 flex items-center justify-center text-secondaryPurple">
                <Baby className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Fetal Kick Counter</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Log baby kicks and movements. Detect deviations in normal weekly movement trends, alerting you when activity falls below average parameters.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-secondaryPurple mt-4 inline-flex items-center gap-1">
              Active Session Logging <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Feature 5: ASHA Sync */}
          <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border flex flex-col justify-between min-h-[300px]">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-warningOrange/15 flex items-center justify-center text-warningOrange">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Clinician & ASHA Worker Portal</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  A shared dashboard letting ASHA community health workers monitor high-risk pregnancy tags, coordinate checkups, and review medical history.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-warningOrange mt-4 inline-flex items-center gap-1">
              Healthcare Network Sync <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Feature 6: Report Generation */}
          <div className="glass p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300 border flex flex-col justify-between min-h-[300px]">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-accentPink/15 flex items-center justify-center text-accentPink">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Clinical Summary Generator</h4>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  Consolidate symptoms, kicks, nutrition, and eyelid scans into a professional PDF summary report ready to be emailed to doctors.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-accentPink mt-4 inline-flex items-center gap-1">
              Doc/ASHA PDF Export <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* Hero Call to Action Footer */}
      <section className="container mx-auto px-6 py-20 relative z-10">
        <div className="rounded-3xl p-12 text-center relative overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))', border: '1px solid var(--border)' }}>
          <div className="absolute -inset-4 bg-gradient-to-r from-accentPink to-secondaryPurple opacity-10 blur-2xl rounded-full"></div>
          
          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h3 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--text-1)' }}>
              Start Supporting Maternal Health Today
            </h3>
            <p className="text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Access the clinical dashboards, AI symptom checkers, eyelid scanners, and reporting tools. Run the free interactive demo immediately.
            </p>
            <div className="pt-4">
              <Link to="/dashboard" className="btn-primary px-8 py-4 text-base font-bold shadow-lg inline-flex items-center gap-2">
                Access Interactive Demo <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
