import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Users, Utensils, Baby, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-white overflow-y-auto">
      {/* Header */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-accentPink to-secondaryPurple bg-clip-text text-transparent">
          MamaAI
        </h1>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 rounded-full font-medium text-white hover:text-accentPink transition-colors">
            Login
          </Link>
          <Link to="/dashboard" className="px-6 py-2 rounded-full bg-accentPink hover:bg-opacity-90 font-medium shadow-[0_0_15px_rgba(255,79,163,0.5)] transition-all">
            Try Demo
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Every Mother Deserves <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyanAccent to-secondaryPurple">Smart Care</span>
          </h2>
          <p className="text-xl text-textSecondary max-w-lg leading-relaxed">
            AI-powered maternal healthcare platform for early detection, nutrition, symptom support, and emergency alerts.
          </p>
          <div className="flex gap-4">
            <Link to="/dashboard" className="px-8 py-4 rounded-full bg-gradient-to-r from-accentPink to-secondaryPurple font-semibold text-lg hover:shadow-[0_0_30px_rgba(255,79,163,0.4)] transition-all flex items-center gap-2">
              Start Free Demo <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-accentPink to-cyanAccent opacity-20 blur-3xl rounded-full"></div>
          <div className="glass rounded-3xl p-8 relative neon-border aspect-[4/3] flex items-center justify-center">
             <div className="text-center">
               <Activity className="w-20 h-20 text-cyanAccent mx-auto mb-4 animate-pulse" />
               <h3 className="text-2xl font-semibold"></h3>
    
             </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/5 py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h4 className="text-4xl font-bold text-accentPink mb-2">30M+</h4>
            <p className="text-textSecondary font-medium text-lg">Mothers Supported</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-cyanAccent mb-2">22</h4>
            <p className="text-textSecondary font-medium text-lg">Languages Available</p>
          </div>
          <div>
            <h4 className="text-4xl font-bold text-secondaryPurple mb-2">900K+</h4>
            <p className="text-textSecondary font-medium text-lg">ASHA Workers</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-24">
        <h3 className="text-3xl font-bold text-center mb-16">Smart Features for Safer Pregnancies</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Activity, title: 'Symptom Checker', desc: 'AI-powered chat to identify safe vs risky symptoms.', color: 'text-accentPink' },
            { icon: ShieldCheck, title: 'Eyelid Anemia Scan', desc: 'Computer vision to detect anemia risk via smartphone.', color: 'text-cyanAccent' },
            { icon: Utensils, title: 'Meal Scanner', desc: 'Analyze nutrition from food photos instantly.', color: 'text-successGreen' },
            { icon: Baby, title: 'Kick Counter', desc: 'Track fetal movements and identify anomalies.', color: 'text-secondaryPurple' },
            { icon: Users, title: 'ASHA Dashboard', desc: 'Tools for health workers to manage high-risk cases.', color: 'text-warningOrange' }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="glass p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group cursor-pointer">
                <div className={`w-14 h-14 rounded-xl bg-card flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                <p className="text-textSecondary leading-relaxed">{feature.desc}</p>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  );
};

export default Landing;
