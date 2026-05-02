import { useState } from 'react';
import { Upload, Utensils, Droplet, Flame, Leaf, CheckCircle2, AlertCircle, TrendingDown, Heart, Brain, Zap } from 'lucide-react';
import SaveReportButton from '../components/SaveReportButton';
import { useReport } from '../context/ReportContext';

const NUTRIENT_CATEGORIES = {
  'bone_development': {
    name: 'Bone & Tooth Development',
    icon: Heart,
    nutrients: ['calcium', 'phosphorus', 'vitamin_d'],
    color: 'from-pink-500 to-rose-500'
  },
  'brain_development': {
    name: 'Brain & Nerve Development',
    icon: Brain,
    nutrients: ['folate', 'vitamin_b12', 'vitamin_b6', 'omega_3_dha', 'iodine'],
    color: 'from-purple-500 to-indigo-500'
  },
  'energy_growth': {
    name: 'Energy & Fetal Growth',
    icon: Zap,
    nutrients: ['protein', 'iron', 'zinc', 'magnesium', 'vitamin_c', 'fiber'],
    color: 'from-yellow-500 to-orange-500'
  }
};

const NUTRIENT_DESCRIPTIONS = {
  'protein': 'Building blocks for baby\'s muscle and tissue',
  'iron': 'Prevents anemia, oxygen transport to baby',
  'calcium': 'Baby\'s bone and tooth development',
  'folate': 'Prevents neural tube defects',
  'vitamin_d': 'Calcium absorption and immune function',
  'vitamin_b12': 'Nerve function and DNA synthesis',
  'vitamin_b6': 'Brain development and hormone regulation',
  'vitamin_c': 'Collagen formation, immune support',
  'fiber': 'Healthy digestion and blood sugar control',
  'zinc': 'Immune function and fetal growth',
  'iodine': 'Thyroid function and brain development',
  'magnesium': 'Muscle function and energy production',
  'phosphorus': 'Bone and tooth development with calcium',
  'omega_3_dha': 'Baby\'s brain and eye development'
};

const MealScanner = () => {
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('bone_development');

  const { saveMeal } = useReport();

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

    // Upload and analyze
    await uploadAndAnalyze(file);
  };

  const uploadAndAnalyze = async (file) => {
    setLoading(true);
    setError('');
    setAnalyzed(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5000/api/meals/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze meal');
      }

      if (data.success && data.analysis) {
        setAnalysisData(data.analysis);
        setAnalyzed(true);
      } else {
        setError(data.error || 'Failed to analyze meal');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Could not connect to analysis service');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const getNutrientColor = (status) => {
    switch(status) {
      case 'good': return 'text-successGreen';
      case 'adequate': return 'text-warningOrange';
      case 'low': return 'text-dangerRed';
      default: return 'text-textSecondary';
    }
  };

  const getNutrientBgColor = (status) => {
    switch(status) {
      case 'good': return 'bg-successGreen';
      case 'adequate': return 'bg-warningOrange';
      case 'low': return 'bg-dangerRed';
      default: return 'bg-textSecondary';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Utensils className="text-successGreen w-8 h-8"/> Meal Nutrition Scanner
        </h1>
        <p className="text-textSecondary">Upload a photo of your meal to instantly analyze its nutritional value and identify nutrient gaps.</p>
      </div>

      {analyzed && analysisData && (
        <div className="flex justify-end">
          <SaveReportButton onSave={() => saveMeal(analysisData)} label="Save Meal to Report" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-dangerRed/10 border border-dangerRed text-dangerRed flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`glass rounded-3xl p-8 border-2 border-dashed transition-all flex flex-col items-center justify-center min-h-[400px] ${
            dragActive ? 'border-successGreen bg-successGreen/5' : 'border-white/20'
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-successGreen border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-successGreen font-medium text-lg">Analyzing food items...</p>
            </div>
          ) : !analyzed && !previewImage ? (
            <>
              <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-textSecondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Drag & Drop Image</h3>
              <p className="text-textSecondary mb-8 text-center">or click to browse from your device</p>
              <label className="px-8 py-3 rounded-xl bg-gradient-to-r from-successGreen to-emerald-500 font-semibold text-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all cursor-pointer">
                Choose Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </>
          ) : (
            <div className="w-full h-full rounded-2xl overflow-hidden relative">
              {previewImage && (
                <img src={previewImage} alt="Meal" className="w-full h-full object-cover opacity-70" />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass px-6 py-3 rounded-full flex items-center gap-2">
                  <CheckCircle2 className="text-successGreen w-5 h-5"/>
                  <span className="font-medium">Scan Complete</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {analyzed && analysisData ? (
          <div className="glass rounded-3xl p-8 neon-border space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3 border-b border-white/10 pb-3">Detected Foods</h3>
              <div className="flex flex-wrap gap-2">
                {analysisData.foods_detected?.map((food, i) => (
                  <span key={i} className="px-3 py-1 rounded-full bg-successGreen/20 text-successGreen text-sm font-medium">
                    {food}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-3 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> Essential Nutrients (14 Critical for Baby)
              </h3>
              
              <div className="space-y-4">
                {Object.entries(NUTRIENT_CATEGORIES).map(([catKey, category]) => {
                  const CategoryIcon = category.icon;
                  const categoryNutrients = category.nutrients.filter(n => analysisData.nutrients?.[n]);
                  
                  return (
                    <div key={catKey} className="rounded-xl border border-white/10 overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === catKey ? null : catKey)}
                        className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${category.color} hover:shadow-lg transition-all`}
                      >
                        <div className="flex items-center gap-3">
                          <CategoryIcon className="w-5 h-5" />
                          <span className="font-semibold">{category.name}</span>
                        </div>
                        <span className="text-sm">
                          {expandedCategory === catKey ? '−' : '+'}
                        </span>
                      </button>
                      
                      {expandedCategory === catKey && (
                        <div className="p-4 bg-card space-y-3">
                          {categoryNutrients.map(nutrient => {
                            const data = analysisData.nutrients[nutrient];
                            return (
                              <div key={nutrient} title={NUTRIENT_DESCRIPTIONS[nutrient]}>
                                <div className="flex justify-between text-sm font-medium mb-1">
                                  <div>
                                    <span className="capitalize font-semibold">{nutrient.replace('_', ' ')}</span>
                                    <p className="text-xs text-textSecondary mt-0.5">{NUTRIENT_DESCRIPTIONS[nutrient]}</p>
                                  </div>
                                  <div className="flex items-center gap-2 text-right">
                                    <span className="font-bold">{data.value}%</span>
                                    <span className={`text-xs px-2 py-1 rounded ${getNutrientColor(data.status)} capitalize`}>
                                      {data.status}
                                    </span>
                                  </div>
                                </div>
                                <div className="h-2 w-full bg-card rounded-full overflow-hidden border border-white/5">
                                  <div 
                                    className={`h-full ${getNutrientBgColor(data.status)} rounded-full transition-all duration-1000`} 
                                    style={{ width: `${Math.min(data.value, 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {analysisData.nutrient_gaps && analysisData.nutrient_gaps.length > 0 && (
              <div className="p-4 bg-dangerRed/10 border border-dangerRed/30 rounded-xl">
                <p className="text-sm font-bold text-dangerRed mb-2">Nutrient Gaps Identified:</p>
                <ul className="text-sm text-textSecondary space-y-1">
                  {analysisData.nutrient_gaps.map((gap, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-dangerRed"></div>
                      {gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <div className="p-4 bg-successGreen/10 border border-successGreen/30 rounded-xl">
                <p className="text-sm font-bold text-successGreen mb-2">Recommendations:</p>
                <ul className="text-sm text-textSecondary space-y-1">
                  {analysisData.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-successGreen flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisData.overall_assessment && (
              <div className="p-4 bg-warningOrange/10 border border-warningOrange/30 rounded-xl">
                <p className="text-sm text-textSecondary">{analysisData.overall_assessment}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 opacity-50 flex flex-col items-center justify-center">
            <Utensils className="w-16 h-16 text-textSecondary mb-4" />
            <h3 className="text-lg font-medium text-textSecondary text-center">Upload a meal to see its nutritional breakdown.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealScanner;
