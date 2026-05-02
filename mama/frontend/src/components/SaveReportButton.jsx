import { useState } from 'react';
import { BookmarkCheck, Loader2, AlertCircle } from 'lucide-react';

const SaveReportButton = ({ onSave, label = 'Save to Report' }) => {
  const [status, setStatus] = useState('idle'); // idle | saving | saved | error

  const handleSave = async () => {
    setStatus('saving');
    try {
      await onSave();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error('Save failed:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const styles = {
    idle: 'bg-white/5 hover:bg-white/10 text-white border-white/10',
    saving: 'bg-white/5 text-textSecondary border-white/10 cursor-not-allowed',
    saved: 'bg-successGreen/20 text-successGreen border-successGreen/40',
    error: 'bg-dangerRed/20 text-dangerRed border-dangerRed/40',
  };

  const content = {
    idle: <><BookmarkCheck className="w-4 h-4" />{label}</>,
    saving: <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>,
    saved: <><BookmarkCheck className="w-4 h-4" />Saved!</>,
    error: <><AlertCircle className="w-4 h-4" />Failed — Retry</>,
  };

  return (
    <button
      onClick={handleSave}
      disabled={status === 'saving'}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm border ${styles[status]}`}
    >
      {content[status]}
    </button>
  );
};

export default SaveReportButton;
