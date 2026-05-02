import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, ShieldCheck, Activity, Mic, MicOff, Volume2, Globe } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SaveReportButton from '../components/SaveReportButton';
import { useReport } from '../context/ReportContext';

const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'hi': 'Hindi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'kn': 'Kannada',
  'ml': 'Malayalam',
  'bn': 'Bengali',
  'gu': 'Gujarati',
  'mr': 'Marathi'
};

const SymptomChecker = () => {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! I am Dr. MamaAI 👋 Describe your symptoms and I will guide you.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);

  const { saveSymptoms } = useReport();

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setInput(prev => prev + transcript);
          } else {
            interimTranscript += transcript;
          }
        }
        if (interimTranscript) {
          setInput(interimTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        setError(`Voice error: ${event.error}`);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = `${selectedLanguage}-IN`;
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const translateText = async (text, targetLang) => {
    if (targetLang === 'en') return text;
    
    try {
      const response = await fetch('https://api.mymemory.translated.net/get', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(r => r.json()).catch(() => null);
      
      // Fallback to Google Translate API via backend
      const backendResponse = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          targetLanguage: targetLang
        })
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return data.translatedText || text;
      }
      return text;
    } catch (err) {
      console.error('Translation error:', err);
      return text;
    }
  };

  const speakText = async (text) => {
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis not supported on this browser');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = `${selectedLanguage}-IN`;
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError('');
    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/symptoms/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.map(msg => ({
            type: msg.type === 'user' ? 'user' : 'assistant',
            text: msg.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from server');
      }

      const data = await response.json();

      if (data.success) {
        const botMessage = data.message;
        
        // Translate response to selected language
        let translatedMessage = botMessage;
        if (selectedLanguage !== 'en') {
          translatedMessage = await translateText(botMessage, selectedLanguage);
        }

        const newBotMsg = {
          id: Date.now() + 1,
          type: 'bot',
          text: translatedMessage,
          originalText: botMessage,
          statusCard: data.riskLevel.toLowerCase()
        };

        setMessages(prev => [...prev, newBotMsg]);

        // Speak the translated response
        speakText(translatedMessage);
      } else {
        setError(data.error || 'Failed to analyze symptoms');
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Sorry, I encountered an error. Please try again or contact your ASHA worker.'
        }]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: 'I apologize, I could not connect to the service. Please check your connection and try again.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="text-accentPink"/> Dr. MamaAI - Pregnancy Health Consultation</h1>
          <p className="text-textSecondary text-sm">🎤 Speak in your regional language • 🤖 Get expert guidance • 📋 Real-time analysis • ⚠️ Risk detection</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <Globe className="w-5 h-5 text-accentPink" />
            <select 
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                window.speechSynthesis.cancel();
              }}
              className="bg-transparent border-none text-white focus:outline-none text-sm"
              title="Select your preferred language for consultation"
            >
              <option value="" disabled className="bg-card text-textSecondary">Choose Language</option>
              {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code} className="bg-card text-white">{name}</option>
              ))}
            </select>
          </div>
          <SaveReportButton onSave={() => saveSymptoms(messages)} label="Save Chat to Report" />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-dangerRed/10 border border-dangerRed text-dangerRed text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 glass rounded-3xl mb-6 p-6 overflow-y-auto flex flex-col space-y-6 doctor-consultation">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-4 max-w-[80%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'user' ? 'bg-gradient-to-br from-secondaryPurple to-accentPink' : 'bg-card border border-white/10'}`}>
                {msg.type === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-accentPink" />}
              </div>
              <div className="flex flex-col gap-2">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-accentPink text-white rounded-tr-sm'
                      : 'bg-card border border-white/5 text-textSecondary rounded-tl-sm'
                  }`}>
                  {msg.type === 'bot' ? (
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-p:my-0.5 prose-p:text-textSecondary
                      prose-li:my-0 prose-li:text-textSecondary
                      prose-ul:my-1 prose-ol:my-1
                      prose-strong:text-white prose-strong:font-semibold
                      prose-headings:text-white prose-headings:text-sm">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : msg.text}
                </div>
                {msg.type === 'bot' && (
                  <button
                    onClick={() => speakText(msg.text)}
                    disabled={isSpeaking}
                    className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-accentPink/20 hover:bg-accentPink/30 text-accentPink transition-colors disabled:opacity-50 w-fit"
                  >
                    <Volume2 className="w-4 h-4" />
                    {isSpeaking ? 'Playing...' : 'Listen'}
                  </button>
                )}
                {msg.statusCard === 'safe' && (
                  <div className="glass border-l-4 border-successGreen p-4 rounded-xl flex items-center gap-3">
                    <ShieldCheck className="text-successGreen w-6 h-6" />
                    <div>
                      <p className="font-bold text-successGreen">Safe</p>
                      <p className="text-sm text-textSecondary">Monitor at home</p>
                    </div>
                  </div>
                )}
                {msg.statusCard === 'warning' && (
                  <div className="glass border-l-4 border-warningOrange p-4 rounded-xl flex items-center gap-3">
                    <Activity className="text-warningOrange w-6 h-6" />
                    <div>
                      <p className="font-bold text-warningOrange">Monitor</p>
                      <p className="text-sm text-textSecondary">Consult ASHA worker soon</p>
                    </div>
                  </div>
                )}
                {msg.statusCard === 'emergency' && (
                  <div className="glass border-l-4 border-dangerRed p-4 rounded-xl flex items-center gap-3 neon-border">
                    <AlertTriangle className="text-dangerRed w-6 h-6" />
                    <div>
                      <p className="font-bold text-dangerRed">Emergency</p>
                      <p className="text-sm text-textSecondary">Seek medical help immediately</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-full bg-card border border-white/10 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-accentPink" />
              </div>
              <div className="p-4 rounded-2xl bg-card border border-white/5 rounded-tl-sm flex items-center gap-2 text-sm">
                <span className="text-textSecondary">Dr. MamaAI is listening</span>
                <div className="w-2 h-2 rounded-full bg-accentPink animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-accentPink animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-accentPink animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="glass rounded-full p-2 flex items-center gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or use voice..." 
          className="flex-1 bg-transparent border-none focus:outline-none px-6 py-3 text-white placeholder-textSecondary"
          disabled={isTyping || isListening}
        />
        <button 
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={isTyping}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 ${
            isListening 
              ? 'bg-dangerRed animate-pulse' 
              : 'bg-warningOrange hover:bg-opacity-90'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </button>
        <button 
          type="submit" 
          disabled={isTyping}
          className="w-12 h-12 rounded-full bg-accentPink flex items-center justify-center hover:bg-opacity-90 transition-all hover:scale-105 disabled:opacity-50"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
};

export default SymptomChecker;
