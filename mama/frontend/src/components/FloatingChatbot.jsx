import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, ShieldCheck, Activity, MessageCircle, X } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useReport } from '../context/ReportContext';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I am Dr. MamaAI, your AI health companion. I have access to your complete health history - all your reports, meal scans, symptoms, eyelid scans, and kick counter data. This helps me provide you with personalized, comprehensive health guidance. Ask me anything about your health and I will help you understand your symptoms better!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [realtimeContext, setRealtimeContext] = useState("No data available.");
  const [mealData, setMealData] = useState("No meal scans available.");
  const [symptomData, setSymptomData] = useState("No symptom records available.");
  const [eyelidData, setEyelidData] = useState("No eyelid scans available.");
  const [kickData, setKickData] = useState("No kick counter data available.");
  const [allContextData, setAllContextData] = useState("");
  const messagesEndRef = useRef(null);

  const { saveSymptoms } = useReport();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let unsubscribeReports = () => {};
    let unsubscribeMeals = () => {};
    let unsubscribeSymptoms = () => {};
    let unsubscribeEyelid = () => {};
    let unsubscribeKicks = () => {};
    
    const setupRealtimeListeners = () => {
      const user = auth.currentUser;
      if (user) {
        // Setup reports listener
        const reportsRef = collection(db, 'reports');
        const reportsQuery = query(reportsRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5));
        
        unsubscribeReports = onSnapshot(reportsQuery, (querySnapshot) => {
          let reportsData = [];
          querySnapshot.forEach((doc) => {
            reportsData.push({ id: doc.id, ...doc.data() });
          });
          
          if (reportsData.length > 0) {
            setRealtimeContext("Recent Reports: " + JSON.stringify(reportsData, null, 2));
          } else {
            setRealtimeContext("No recent reports available.");
          }
        }, (err) => {
          console.error("Error with reports listener:", err);
        });

        // Setup meals listener
        const mealsRef = collection(db, 'meals');
        const mealsQuery = query(mealsRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10));
        
        unsubscribeMeals = onSnapshot(mealsQuery, (querySnapshot) => {
          let mealsData = [];
          querySnapshot.forEach((doc) => {
            mealsData.push({ id: doc.id, ...doc.data() });
          });
          
          if (mealsData.length > 0) {
            setMealData("Recent Meal Scans:\n" + JSON.stringify(mealsData, null, 2));
          } else {
            setMealData("No recent meal scans available.");
          }
        }, (err) => {
          console.error("Error with meals listener:", err);
        });

        // Setup symptoms listener
        const symptomsRef = collection(db, 'symptoms');
        const symptomsQuery = query(symptomsRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10));
        
        unsubscribeSymptoms = onSnapshot(symptomsQuery, (querySnapshot) => {
          let symptomsData = [];
          querySnapshot.forEach((doc) => {
            symptomsData.push({ id: doc.id, ...doc.data() });
          });
          
          if (symptomsData.length > 0) {
            setSymptomData("Recent Symptom Records:\n" + JSON.stringify(symptomsData, null, 2));
          } else {
            setSymptomData("No recent symptom records available.");
          }
        }, (err) => {
          console.error("Error with symptoms listener:", err);
        });

        // Setup eyelid scans listener
        const eyelidRef = collection(db, 'eyelid_scans');
        const eyelidQuery = query(eyelidRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(5));
        
        unsubscribeEyelid = onSnapshot(eyelidQuery, (querySnapshot) => {
          let eyelidData = [];
          querySnapshot.forEach((doc) => {
            eyelidData.push({ id: doc.id, ...doc.data() });
          });
          
          if (eyelidData.length > 0) {
            setEyelidData("Recent Eyelid Scans:\n" + JSON.stringify(eyelidData, null, 2));
          } else {
            setEyelidData("No recent eyelid scans available.");
          }
        }, (err) => {
          console.error("Error with eyelid listener:", err);
        });

        // Setup kick counter listener
        const kicksRef = collection(db, 'kick_counter');
        const kicksQuery = query(kicksRef, where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10));
        
        unsubscribeKicks = onSnapshot(kicksQuery, (querySnapshot) => {
          let kicksData = [];
          querySnapshot.forEach((doc) => {
            kicksData.push({ id: doc.id, ...doc.data() });
          });
          
          if (kicksData.length > 0) {
            setKickData("Recent Kick Counter Data:\n" + JSON.stringify(kicksData, null, 2));
          } else {
            setKickData("No recent kick counter data available.");
          }
        }, (err) => {
          console.error("Error with kicks listener:", err);
        });
      }
    };

    // Subscribing to auth state changes to ensure we get real-time info 
    // as soon as the user logs in
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setupRealtimeListeners();
      }
    });

    return () => {
      unsubscribeReports();
      unsubscribeMeals();
      unsubscribeSymptoms();
      unsubscribeEyelid();
      unsubscribeKicks();
      authUnsubscribe();
    };
  }, []);

  // Combine all context data
  useEffect(() => {
    const combined = `
=== PATIENT HEALTH DATA ===

${realtimeContext}

${mealData}

${symptomData}

${eyelidData}

${kickData}

=== END DATA ===
`;
    setAllContextData(combined);
  }, [realtimeContext, mealData, symptomData, eyelidData, kickData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError('');
    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const systemPrompt = `You are MamaAI, an empathetic and knowledgeable pregnancy health assistant.

You have access to ALL the patient's health data including:
- Recent medical reports and assessments
- Complete meal nutrition scans with food items and nutrient breakdowns
- Symptom history and health concerns
- Eyelid scan results (hemoglobin levels, risk assessments)
- Fetal kick counter data

Here is the complete patient data context:
${allContextData}

Based on this COMPREHENSIVE data and the user's current input:
1. Provide detailed personalized responses using their actual health data
2. Reference specific meals, symptoms, or measurements when relevant
3. Identify patterns and trends across their data
4. Give targeted recommendations based on their nutrient gaps and health status
5. Assess symptom risk levels and output [STATUS:SAFE], [STATUS:WARNING], or [STATUS:EMERGENCY] at the start when appropriate

Always be empathetic, specific, and use their actual data to provide meaningful insights.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.type !== 'error').map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: input }
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.href, // Optional
          'X-Title': 'MamaAI' // Optional
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: apiMessages
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      let botResponse = data.choices?.[0]?.message?.content || "I couldn't process that.";
      
      let riskLevel = 'safe';
      if (botResponse.includes('[STATUS:WARNING]')) {
        riskLevel = 'warning';
        botResponse = botResponse.replace('[STATUS:WARNING]', '').trim();
      } else if (botResponse.includes('[STATUS:EMERGENCY]')) {
        riskLevel = 'emergency';
        botResponse = botResponse.replace('[STATUS:EMERGENCY]', '').trim();
      } else if (botResponse.includes('[STATUS:SAFE]')) {
        botResponse = botResponse.replace('[STATUS:SAFE]', '').trim();
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: botResponse,
        statusCard: riskLevel
      }]);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'error',
        text: 'I apologize, I could not connect to the service.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-secondaryPurple to-accentPink rounded-full shadow-xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50 neon-border"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[32rem] glass rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden border border-white/20 animate-in fade-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-black/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-accentPink" />
              <h3 className="font-bold text-white">MamaAI Assistant</h3>
            </div>
            <button onClick={() => saveSymptoms(messages)} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full text-white transition-colors">
              Save Chat
            </button>
          </div>

          {/* Chat Messages directly modeled after SymptomChecker */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
             {error && (
                <div className="mb-2 p-3 rounded-xl bg-dangerRed/10 border border-dangerRed text-dangerRed text-sm">
                {error}
                </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-gradient-to-br from-secondaryPurple to-accentPink' : 'bg-card border border-white/10'}`}>
                    {msg.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-accentPink" />}
                  </div>
                  <div className="flex flex-col gap-2 relative top-1">
                    <div className={`p-3 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-accentPink text-white rounded-tr-sm' : 'bg-card border border-white/5 text-textSecondary rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                    {msg.statusCard === 'safe' && (
                      <div className="glass border-l-4 border-successGreen p-3 rounded-xl flex items-center gap-2 mt-1">
                        <ShieldCheck className="text-successGreen w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-bold text-successGreen text-xs">Safe</p>
                          <p className="text-[10px] text-textSecondary">Monitor at home</p>
                        </div>
                      </div>
                    )}
                    {msg.statusCard === 'warning' && (
                      <div className="glass border-l-4 border-warningOrange p-3 rounded-xl flex items-center gap-2 mt-1">
                        <Activity className="text-warningOrange w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-bold text-warningOrange text-xs">Monitor</p>
                          <p className="text-[10px] text-textSecondary">Consult ASHA worker soon</p>
                        </div>
                      </div>
                    )}
                    {msg.statusCard === 'emergency' && (
                      <div className="glass border-l-4 border-dangerRed p-3 rounded-xl flex items-center gap-2 mt-1 neon-border">
                        <AlertTriangle className="text-dangerRed w-5 h-5 shrink-0" />
                        <div>
                          <p className="font-bold text-dangerRed text-xs">Emergency</p>
                          <p className="text-[10px] text-textSecondary">Seek medical help immediately</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-accentPink" />
                  </div>
                  <div className="p-3 rounded-2xl bg-card border border-white/5 rounded-tl-sm flex items-center gap-1.5 relative top-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accentPink animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accentPink animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-accentPink animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..." 
              className="flex-1 bg-white/5 border border-white/10 focus:border-accentPink rounded-full px-4 py-2 text-sm text-white focus:outline-none transition-colors"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              disabled={isTyping}
              className="w-10 h-10 rounded-full bg-accentPink flex items-center justify-center hover:bg-opacity-90 transition-all hover:scale-105 disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatbot;