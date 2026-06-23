import { createContext, useContext } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

const ReportContext = createContext(null);

export const ReportProvider = ({ children }) => {
  const { user } = useAuth();

  const saveToFirestore = async (subcollection, data) => {
    // 1. Save to local storage as fallback
    try {
      const localKey = `mama_report_${subcollection}`;
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.push({ ...data, savedAt: new Date().toISOString() });
      localStorage.setItem(localKey, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // 2. Try Firestore but catch errors so they don't break the UI
    try {
      if (user && db) {
        const ref = collection(db, 'users', user.uid, 'reports', subcollection, 'entries');
        await addDoc(ref, { ...data, savedAt: serverTimestamp() });
      }
    } catch (err) {
      console.warn(`Firestore save to ${subcollection} failed (falling back to local storage):`, err);
    }
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
    // Save to nested structure
    await saveToFirestore('meal_scans', {
      foods_detected: data.foods_detected ?? [],
      nutrients: data.nutrients ?? {},
      nutrient_gaps: data.nutrient_gaps ?? [],
      recommendations: data.recommendations ?? [],
      overall_assessment: data.overall_assessment ?? null,
      safety_notes: data.safety_notes ?? null,
    });

    // Save to top-level meals locally
    try {
      const existing = JSON.parse(localStorage.getItem('mama_meals') || '[]');
      existing.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem('mama_meals', JSON.stringify(existing));
    } catch (e) {}

    // Try Firestore
    try {
      if (user && db) {
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
      }
    } catch (err) {
      console.warn('Firestore saveMeal failed:', err);
    }
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
