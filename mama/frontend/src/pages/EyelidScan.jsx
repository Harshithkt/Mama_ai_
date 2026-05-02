import { useState } from 'react';
import { Camera, ScanFace, Activity, CheckCircle, AlertTriangle, Upload } from 'lucide-react';
import SaveReportButton from '../components/SaveReportButton';
import { useReport } from '../context/ReportContext';

const EyelidScan = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    // Upload and scan
    await uploadAndScan(file);
  };

  const uploadAndScan = async (file) => {
    setScanning(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/eyelid/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setResult(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze scan');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Could not connect to scan service');
    } finally {
      setScanning(false);
    }
  };

  const { saveEyelid } = useReport();

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <ScanFace className="text-cyanAccent w-8 h-8"/> Eyelid Anemia Scan
        </h1>
        <p className="text-textSecondary">Use your camera to scan the conjunctiva (inner lower eyelid) for a quick hemoglobin estimate.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-dangerRed/10 border border-dangerRed text-dangerRed flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="glass rounded-3xl p-6 relative aspect-video flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-white/20">
            {scanning ? (
              <>
                <div className="absolute inset-0 bg-cyanAccent/10 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-cyanAccent shadow-[0_0_15px_#00D9FF] animate-[scan_2s_ease-in-out_infinite]"></div>
                <ScanFace className="w-24 h-24 text-cyanAccent animate-pulse mb-4" />
                <p className="text-cyanAccent font-medium text-lg">Analyzing pallor level...</p>
              </>
            ) : result ? (
              <div className="w-full h-full flex items-center justify-center">
                {previewImage && (
                  <img src={previewImage} alt="Eyelid" className="w-full h-full object-cover rounded-xl opacity-60" />
                )}
              </div>
            ) : (
              <>
                <div className="w-24 h-24 rounded-full bg-card flex items-center justify-center mb-4">
                  <Upload className="w-10 h-10 text-textSecondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Eyelid Photo</h3>
                <p className="text-textSecondary text-center max-w-sm mb-6">Take a clear photo of your inner lower eyelid with good lighting.</p>
                <label className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyanAccent to-blue-500 font-semibold text-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.4)] transition-all cursor-pointer flex items-center gap-2">
                  <Camera className="w-5 h-5"/> Choose Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </>
            )}
            
            <style>{`
              @keyframes scan {
                0%, 100% { top: 0; }
                50% { top: 100%; }
              }
            `}</style>
          </div>
        </div>

        <div className="lg:col-span-2">
          {result ? (
            <div className={`glass p-8 rounded-3xl border-t-4 ${result.border_color} h-full flex flex-col`}>
              <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                <Activity className={result.color} /> Scan Results
              </h3>
              
              <div className="text-center mb-8">
                <p className="text-textSecondary font-medium mb-2">Estimated Hemoglobin</p>
                <div className="flex items-end justify-center gap-2">
                  <span className={`text-6xl font-bold ${result.color}`}>{result.hb}</span>
                  <span className="text-xl text-textSecondary mb-2">g/dL</span>
                </div>
              </div>

              {/* Risk Status Card with Improved Warnings */}
              <div className={`p-4 rounded-xl ${
                result.risk_category === 'safe' 
                  ? 'bg-successGreen/10 border border-successGreen/30' 
                  : result.risk_category === 'warning'
                  ? 'bg-warningOrange/10 border border-warningOrange/30'
                  : 'bg-dangerRed/10 border border-dangerRed/30'
              } flex items-start gap-4 mb-6`}>
                <AlertTriangle className={`w-6 h-6 mt-1 ${result.color}`} />
                <div>
                  <p className={`font-bold text-lg ${result.color}`}>{result.risk}</p>
                  <p className="text-sm text-textSecondary mt-2">{result.recommendation_note || result.disclaimer}</p>
                </div>
              </div>

              {/* Risk Level Indicator */}
              <div className="mb-6 p-4 bg-card rounded-xl">
                <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-3">Hemoglobin Status</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Severe Anemia</span>
                    <span className="text-xs text-textSecondary">0-8 g/dL</span>
                  </div>
                  <div className="w-full h-2 bg-card rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-gradient-to-r from-dangerRed via-warningOrange to-successGreen" 
                         style={{width: `${Math.min((result.hb / 14) * 100, 100)}%`}}></div>
                  </div>
                  <div className="flex justify-between text-xs text-textSecondary mt-2">
                    <span>Safe (≥11.5)</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto">
                <p className="font-medium text-white mb-3">Recommendations</p>
                <ul className="space-y-2 text-sm text-textSecondary mb-6">
                  {result.recommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-cyanAccent flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-textSecondary italic mb-4">{result.safety_notes}</p>
                <SaveReportButton onSave={() => saveEyelid(result)} label="Save to Report" />
              </div>
            </div>
          ) : (
             <div className="glass p-8 rounded-3xl h-full flex flex-col items-center justify-center text-center opacity-50">
               <Activity className="w-16 h-16 text-textSecondary mb-4" />
               <h3 className="text-lg font-medium text-textSecondary">Results will appear here after scanning.</h3>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EyelidScan;
