import { useState, useEffect } from 'react';
import { AlertCircle, PhoneCall, MapPin, Navigation, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import API_URL from '../config/api';

const Emergency = () => {
  const { userProfile, user } = useAuth();
  const { addNotification } = useNotifications();
  const [isSOSPressed, setIsSOSPressed] = useState(false);
  const [sosLoading, setSOSLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [ashaContacts, setAshaContacts] = useState([]);
  const [emergencyHistory, setEmergencyHistory] = useState([]);

  // Fetch ASHA contacts
  useEffect(() => {
    const fetchAshaContacts = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'asha'));
        const querySnapshot = await getDocs(q);
        
        const contacts = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          contacts.push({
            id: doc.id,
            name: data.name || 'ASHA Worker',
            phone: data.phone || '',
            email: data.email || ''
          });
        });
        
        setAshaContacts(contacts);
      } catch (err) {
        console.error('Error fetching ASHA contacts:', err);
      }
    };

    fetchAshaContacts();
  }, []);

  const handleSOS = async () => {
    setSOSLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/emergency/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          userName: userProfile?.name || 'Mother',
          location: 'Current Location',
          symptoms: 'Critical Emergency - SOS Button Pressed'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const firstFailure = data.emailResults?.find(result => result.status === 'failed' || result.status === 'skipped');
        throw new Error(firstFailure?.error || data.error || 'Failed to send emergency alert');
      }

      if (data.success) {
        setShowSuccess(true);
        setIsSOSPressed(true);
        
        // Add notification
        addNotification({
          type: 'danger',
          title: 'Emergency Alert Sent',
          message: `Alert sent to ${data.sentCount ?? data.emailResults.filter(r => r.status === 'sent').length} ASHA workers`
        });

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }
    } catch (err) {
      console.error('Error sending SOS:', err);
      addNotification({
        type: 'danger',
        title: 'Alert Error',
        message: `${err.message || 'Failed to send emergency alert'}. Please call 108 directly.`
      });
    } finally {
      setSOSLoading(false);
    }
  };

  const handlePhoneCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-dangerRed flex items-center justify-center gap-3 mb-4">
          <AlertCircle className="w-10 h-10"/> Emergency SOS
        </h1>
        <p className="text-xl text-textSecondary">Press the button below to immediately alert your ASHA worker, ambulance, and family.</p>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-successGreen text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Emergency alert sent successfully!</span>
        </div>
      )}

      <div className="flex justify-center mb-16">
        <button 
          onClick={handleSOS}
          disabled={sosLoading}
          className="relative group"
        >
          <div className="absolute inset-0 bg-dangerRed rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-300 animate-pulse"></div>
          <div className="w-64 h-64 rounded-full bg-gradient-to-b from-red-500 to-red-700 p-4 relative z-10 shadow-[0_20px_50px_rgba(239,68,68,0.5)] flex items-center justify-center border-8 border-white/10 group-active:scale-95 transition-transform duration-200 cursor-pointer disabled:opacity-50">
             <span className="text-5xl font-black text-white tracking-wider">{sosLoading ? '...' : 'SOS'}</span>
          </div>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-3xl border-l-4 border-accentPink">
          <h3 className="text-xl font-bold mb-4 text-white">ASHA Worker Contacts</h3>
          <div className="space-y-4">
            {ashaContacts.length > 0 ? (
              ashaContacts.map((asha) => (
                <div key={asha.id} className="flex items-center justify-between p-4 bg-card rounded-xl">
                  <div>
                    <p className="font-semibold text-white">{asha.name}</p>
                    <p className="text-sm text-textSecondary">{asha.phone || 'No phone'}</p>
                  </div>
                  <button 
                    onClick={() => handlePhoneCall(asha.phone)}
                    className="w-12 h-12 rounded-full bg-successGreen/20 text-successGreen flex items-center justify-center hover:bg-successGreen hover:text-white transition-colors"
                  >
                    <PhoneCall className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-textSecondary">
                <p>No ASHA workers assigned yet</p>
              </div>
            )}
            <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-successGreen/30">
              <div>
                <p className="font-semibold text-white">Ambulance</p>
                <p className="text-sm text-textSecondary">Emergency Services - 108</p>
              </div>
              <button 
                onClick={() => handlePhoneCall('108')}
                className="w-12 h-12 rounded-full bg-dangerRed/20 text-dangerRed flex items-center justify-center hover:bg-dangerRed hover:text-white transition-colors"
              >
                <PhoneCall className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border-l-4 border-cyanAccent">
          <h3 className="text-xl font-bold mb-4 text-white">Emergency Information</h3>
          <div className="space-y-4">
            <div className="bg-dangerRed/10 border border-dangerRed/20 rounded-xl p-4">
              <p className="text-sm text-textSecondary mb-2">Status</p>
              <p className="text-lg font-bold text-dangerRed">{isSOSPressed ? '🔴 ALERT ACTIVE' : '⚪ No Active Alerts'}</p>
            </div>
            
            <div className="bg-accentPink/10 border border-accentPink/20 rounded-xl p-4">
              <p className="text-sm text-textSecondary mb-2">Your Name</p>
              <p className="text-lg font-bold text-accentPink">{userProfile?.name || 'Mother'}</p>
            </div>

            <div className="bg-cyanAccent/10 border border-cyanAccent/20 rounded-xl p-4">
              <p className="text-sm text-textSecondary mb-2">Alert Recipients</p>
              <p className="text-lg font-bold text-cyanAccent">{ashaContacts.length} ASHA Worker(s)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alert History */}
      {emergencyHistory.length > 0 && (
        <div className="glass p-6 rounded-3xl border-l-4 border-warningOrange">
          <h3 className="text-xl font-bold mb-4 text-white">Recent Alerts</h3>
          <div className="space-y-3">
            {emergencyHistory.map((alert, idx) => (
              <div key={idx} className="p-4 bg-card rounded-xl border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{alert.symptoms}</p>
                    <p className="text-sm text-textSecondary">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    alert.status === 'resolved' 
                      ? 'bg-successGreen/20 text-successGreen' 
                      : 'bg-dangerRed/20 text-dangerRed'
                  }`}>
                    {alert.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-accentPink/10 border border-accentPink rounded-3xl p-6">
        <h3 className="text-lg font-bold text-accentPink mb-3">⚠️ Important Notes</h3>
        <ul className="space-y-2 text-textSecondary">
          <li>✓ SOS will send email alerts to all registered ASHA workers</li>
          <li>✓ All ASHA workers will be notified immediately with your location and symptoms</li>
          <li>✓ For faster response, also call ambulance (108) or your ASHA worker directly</li>
          <li>✓ Emergency alerts are tracked in your medical records</li>
        </ul>
      </div>
    </div>
  );
};

export default Emergency;
