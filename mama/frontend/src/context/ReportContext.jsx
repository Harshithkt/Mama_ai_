import { createContext, useContext } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const ReportContext = createContext(null);

export const ReportProvider = ({ children }) => {
  const { user } = useAuth();

  const saveToFirestore = async (subcollection, data) => {
    if (!user) throw new Error('Not authenticated');
    const ref = collection(db, 'users', user.uid, 'reports', subcollection, 'entries');
    await addDoc(ref, { ...data, savedAt: serverTimestamp() });
  };

  const saveEyelid = (data) => saveToFirestore('eyelid_scans', {
    hb: data.hb ?? null,
    risk: data.risk ?? null,
    disclaimer: data.disclaimer ?? null,
    recommendations: data.recommendations ?? [],
    safety_notes: data.safety_notes ?? null,
    color: data.color ?? null,
  });

  const saveSymptoms = (messages) => saveToFirestore('symptom_chats', {
    messages: messages.map(m => ({
      type: m.type,
      text: m.text,
      statusCard: m.statusCard ?? null,
    })),
    messageCount: messages.length,
  });

  const saveMeal = async (data) => {
    if (!user) throw new Error('Not authenticated');
    
    // Save to nested structure for backward compatibility
    await saveToFirestore('meal_scans', {
      foods_detected: data.foods_detected ?? [],
      nutrients: data.nutrients ?? {},
      nutrient_gaps: data.nutrient_gaps ?? [],
      recommendations: data.recommendations ?? [],
      overall_assessment: data.overall_assessment ?? null,
      safety_notes: data.safety_notes ?? null,
    });

    // Also save to top-level meals collection for easy chatbot access
    const mealsRef = collection(db, 'meals');
    await addDoc(mealsRef, {
      userId: user.uid,
      foods_detected: data.foods_detected ?? [],
      nutrients: data.nutrients ?? {},
      nutrient_gaps: data.nutrient_gaps ?? [],
      recommendations: data.recommendations ?? [],
      overall_assessment: data.overall_assessment ?? null,
      safety_notes: data.safety_notes ?? null,
      timestamp: serverTimestamp(),
    });
  };

  const saveKicks = (data) => saveToFirestore('kick_sessions', {
    today: data.today ?? 0,
    weekly_avg: data.weekly_avg ?? 0,
  });

  return (
    <ReportContext.Provider value={{ saveEyelid, saveSymptoms, saveMeal, saveKicks }}>
      {children}
    </ReportContext.Provider>
  );
};

export const useReport = () => useContext(ReportContext);
