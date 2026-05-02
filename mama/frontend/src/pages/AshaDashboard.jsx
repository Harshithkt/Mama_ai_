import { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, Search, Filter, Phone, MapPin, X, Calendar } from 'lucide-react';
import { collection, query, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const AshaDashboard = () => {
  const [filter, setFilter] = useState('all');
  const [mothers, setMothers] = useState([]);
  const [filteredMothers, setFilteredMothers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    pending: 0
  });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedMother, setSelectedMother] = useState(null);
  const [newCheckupDate, setNewCheckupDate] = useState('');

  useEffect(() => {
    const fetchMothers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef);
        const querySnapshot = await getDocs(q);
        
        const mothersList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.role === 'mother') {
            mothersList.push({
              id: doc.id,
              name: data.name || 'Unknown',
              email: data.email || '',
              village: data.village || 'Not specified',
              week: data.pregnancyWeek || 20,
              risk: data.riskLevel || 'low',
              lastCheck: data.lastCheckup || '1 week ago',
              issue: data.healthIssues || '',
              phone: data.phone || '+91',
              nextCheckup: data.nextCheckup || '2026-10-15'
            });
          }
        });

        setMothers(mothersList);
        setFilteredMothers(mothersList);
        
        // Calculate stats
        setStats({
          total: mothersList.length,
          highRisk: mothersList.filter(m => m.risk === 'high').length,
          pending: mothersList.filter(m => m.risk === 'moderate').length
        });
      } catch (err) {
        console.error('Error fetching mothers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMothers();
  }, []);

  useEffect(() => {
    let filtered = mothers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(m => m.risk === filter);
    }

    setFilteredMothers(filtered);
  }, [searchQuery, filter, mothers]);

  const handleReschedule = async () => {
    if (selectedMother && newCheckupDate) {
      try {
        await updateDoc(doc(db, 'users', selectedMother.id), {
          nextCheckup: newCheckupDate,
          updatedAt: new Date().toISOString()
        });
        
        // Update local state
        setMothers(prev =>
          prev.map(m =>
            m.id === selectedMother.id
              ? { ...m, nextCheckup: newCheckupDate }
              : m
          )
        );
        
        setShowRescheduleModal(false);
        setSelectedMother(null);
        setNewCheckupDate('');
      } catch (err) {
        console.error('Error rescheduling checkup:', err);
      }
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Users className="text-warningOrange w-8 h-8"/> ASHA Dashboard
        </h1>
        <p className="text-textSecondary">Manage and monitor expecting mothers in your assigned villages.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-3xl neon-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyanAccent/20 flex items-center justify-center">
              <Users className="w-7 h-7 text-cyanAccent" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">Total Mothers</p>
              <h3 className="text-3xl font-bold text-white">{stats.total}</h3>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl border border-dangerRed/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-dangerRed/20 flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-dangerRed" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">High Risk Cases</p>
              <h3 className="text-3xl font-bold text-dangerRed">{stats.highRisk}</h3>
            </div>
          </div>
        </div>
        <div className="glass p-6 rounded-3xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-successGreen/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-successGreen" />
            </div>
            <div>
              <p className="text-sm text-textSecondary font-medium">Pending Follow-ups</p>
              <h3 className="text-3xl font-bold text-white">{stats.pending}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textSecondary" />
            <input 
              type="text" 
              placeholder="Search mother by name or village..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-accentPink transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 bg-card border border-white/10 rounded-xl text-white focus:outline-none focus:border-accentPink transition-colors cursor-pointer"
            >
              <option value="all" className="bg-card text-white">All Status</option>
              <option value="low" className="bg-card text-white">Low Risk</option>
              <option value="moderate" className="bg-card text-white">Moderate Risk</option>
              <option value="high" className="bg-card text-white">High Risk</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-textSecondary">Loading mothers data...</p>
          </div>
        ) : filteredMothers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-textSecondary">No mothers found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-textSecondary text-sm">
                  <th className="pb-4 font-medium pl-4">Name</th>
                  <th className="pb-4 font-medium">Location & Week</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMothers.map(mother => (
                  <tr key={mother.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pl-4">
                      <p className="font-semibold text-white">{mother.name}</p>
                      <p className="text-xs text-textSecondary">Last check: {mother.lastCheck}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1 text-sm text-textSecondary mb-1">
                        <MapPin className="w-3 h-3" /> {mother.village}
                      </div>
                      <p className="text-sm font-medium text-white">Week {mother.week}</p>
                    </td>
                    <td className="py-4">
                      {mother.risk === 'high' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-dangerRed/10 text-dangerRed text-xs font-bold border border-dangerRed/20">
                          <AlertTriangle className="w-3 h-3"/> Critical{mother.issue ? ': ' + mother.issue : ''}
                        </span>
                      )}
                      {mother.risk === 'moderate' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warningOrange/10 text-warningOrange text-xs font-bold border border-warningOrange/20">
                          Monitor{mother.issue ? ': ' + mother.issue : ''}
                        </span>
                      )}
                      {mother.risk === 'low' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-successGreen/10 text-successGreen text-xs font-bold border border-successGreen/20">
                          <CheckCircle className="w-3 h-3"/> Safe
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2 flex-wrap">
                        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors" title="Call mother">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedMother(mother);
                            setNewCheckupDate(mother.nextCheckup);
                            setShowRescheduleModal(true);
                          }}
                          className="px-3 py-2 rounded-lg bg-cyanAccent/20 hover:bg-cyanAccent/30 text-cyanAccent text-xs font-medium transition-colors flex items-center gap-1"
                          title="Reschedule checkup"
                        >
                          <Calendar className="w-3 h-3" /> Reschedule
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-accentPink hover:bg-opacity-90 text-white text-sm font-medium transition-colors">
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedMother && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Reschedule {selectedMother.name}'s Checkup</h3>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedMother(null);
                }}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-textSecondary mb-2">Select New Date</label>
                <input
                  type="date"
                  value={newCheckupDate}
                  onChange={(e) => setNewCheckupDate(e.target.value)}
                  className="w-full bg-card border-2 border-accentPink rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accentPink/50"
                  style={{
                    colorScheme: 'dark'
                  }}
                />
              </div>

              <div className="bg-accentPink/10 border border-accentPink/20 rounded-lg p-4">
                <p className="text-sm text-textSecondary">
                  <span className="font-semibold text-white">New Date:</span>
                </p>
                <p className="text-lg font-bold text-accentPink mt-1">{formatDate(newCheckupDate)}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReschedule}
                  className="flex-1 py-3 bg-accentPink hover:bg-opacity-90 rounded-lg text-white font-medium transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedMother(null);
                  }}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AshaDashboard;
