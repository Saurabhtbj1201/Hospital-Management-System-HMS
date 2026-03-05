import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Bone,
  Eye,
  Baby,
  Stethoscope,
  Wind,
  Flame,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Thermometer,
  Clock,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import SectionWrapper, { containerVariants, itemVariant } from '../ui/SectionWrapper';

/* ─────────────────────────────────────────────
   Body Regions & symptom data (mock)
   ───────────────────────────────────────────── */
const BODY_REGIONS = [
  {
    id: 'head',
    label: 'Head & Brain',
    icon: Brain,
    color: 'bg-purple-100 text-purple-600 ring-purple-200',
    activeColor: 'bg-purple-600 text-white ring-purple-600',
    symptoms: ['Headache', 'Dizziness', 'Blurred vision', 'Memory issues', 'Migraine', 'Fainting'],
  },
  {
    id: 'chest',
    label: 'Chest & Heart',
    icon: Heart,
    color: 'bg-red-100 text-red-600 ring-red-200',
    activeColor: 'bg-red-600 text-white ring-red-600',
    symptoms: ['Chest pain', 'Shortness of breath', 'Palpitations', 'Cough', 'Wheezing', 'Chest tightness'],
  },
  {
    id: 'abdomen',
    label: 'Abdomen & Stomach',
    icon: Stethoscope,
    color: 'bg-amber-100 text-amber-600 ring-amber-200',
    activeColor: 'bg-amber-600 text-white ring-amber-600',
    symptoms: ['Stomach pain', 'Nausea', 'Vomiting', 'Bloating', 'Diarrhea', 'Loss of appetite'],
  },
  {
    id: 'bones',
    label: 'Bones & Joints',
    icon: Bone,
    color: 'bg-blue-100 text-blue-600 ring-blue-200',
    activeColor: 'bg-blue-600 text-white ring-blue-600',
    symptoms: ['Joint pain', 'Back pain', 'Swelling', 'Stiffness', 'Muscle weakness', 'Numbness / Tingling'],
  },
  {
    id: 'respiratory',
    label: 'Respiratory',
    icon: Wind,
    color: 'bg-sky-100 text-sky-600 ring-sky-200',
    activeColor: 'bg-sky-600 text-white ring-sky-600',
    symptoms: ['Persistent cough', 'Sore throat', 'Runny nose', 'Sneezing', 'Difficulty breathing', 'Nasal congestion'],
  },
  {
    id: 'eyes',
    label: 'Eyes & Vision',
    icon: Eye,
    color: 'bg-emerald-100 text-emerald-600 ring-emerald-200',
    activeColor: 'bg-emerald-600 text-white ring-emerald-600',
    symptoms: ['Blurry vision', 'Eye pain', 'Redness', 'Watery eyes', 'Sensitivity to light', 'Double vision'],
  },
  {
    id: 'skin',
    label: 'Skin',
    icon: Flame,
    color: 'bg-orange-100 text-orange-600 ring-orange-200',
    activeColor: 'bg-orange-600 text-white ring-orange-600',
    symptoms: ['Rash', 'Itching', 'Skin discoloration', 'Swelling', 'Dryness', 'Burning sensation'],
  },
  {
    id: 'general',
    label: 'General / Pediatric',
    icon: Baby,
    color: 'bg-pink-100 text-pink-600 ring-pink-200',
    activeColor: 'bg-pink-600 text-white ring-pink-600',
    symptoms: ['Fever', 'Fatigue', 'Weight loss', 'Night sweats', 'Loss of appetite', 'General weakness'],
  },
];

const SEVERITY_OPTIONS = [
  { value: 'mild', label: 'Mild', desc: 'Noticeable but not affecting daily activities', color: 'bg-green-100 text-green-700 ring-green-200', activeColor: 'bg-green-600 text-white ring-green-600', icon: Activity },
  { value: 'moderate', label: 'Moderate', desc: 'Somewhat affecting daily activities', color: 'bg-amber-100 text-amber-700 ring-amber-200', activeColor: 'bg-amber-600 text-white ring-amber-600', icon: Thermometer },
  { value: 'severe', label: 'Severe', desc: 'Significantly affecting daily activities', color: 'bg-red-100 text-red-700 ring-red-200', activeColor: 'bg-red-600 text-white ring-red-600', icon: ShieldAlert },
];

const DURATION_OPTIONS = [
  'Less than 24 hours',
  '1–3 days',
  '4–7 days',
  '1–2 weeks',
  'More than 2 weeks',
];

/* Mock AI assessment generator */
function generateAssessment(region, symptoms, severity, duration) {
  const regionData = BODY_REGIONS.find((r) => r.id === region);
  const regionName = regionData?.label || 'Selected area';

  const urgencyMap = {
    mild: { level: 'Low', color: 'text-green-600 bg-green-50', advice: 'Monitor your symptoms. If they persist beyond a week, consider scheduling an appointment.' },
    moderate: { level: 'Moderate', color: 'text-amber-600 bg-amber-50', advice: 'We recommend scheduling an appointment with a specialist within the next few days.' },
    severe: { level: 'High', color: 'text-red-600 bg-red-50', advice: 'Please seek medical attention soon. Consider visiting our emergency department if symptoms worsen.' },
  };

  const urgency = urgencyMap[severity];

  const departmentMap = {
    head: 'Neurology',
    chest: 'Cardiology',
    abdomen: 'Gastroenterology',
    bones: 'Orthopedics',
    respiratory: 'Pulmonology',
    eyes: 'Ophthalmology',
    skin: 'Dermatology',
    general: 'General Medicine',
  };

  const department = departmentMap[region] || 'General Medicine';

  return {
    region: regionName,
    symptoms,
    severity,
    duration,
    urgency,
    department,
    recommendations: [
      `Based on your symptoms in the ${regionName.toLowerCase()} area, we recommend consulting our ${department} department.`,
      urgency.advice,
      severity === 'severe'
        ? 'If you experience sudden worsening, call our emergency line at 108 immediately.'
        : 'Keep track of your symptoms and note any changes.',
      'Avoid self-medication without professional guidance.',
      'Ensure adequate rest, hydration, and a balanced diet.',
    ],
  };
}

/* ─────────────────────────────────────────────
   Step Components
   ───────────────────────────────────────────── */

function StepRegion({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {BODY_REGIONS.map((region) => {
        const isActive = selected === region.id;
        return (
          <motion.button
            key={region.id}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(region.id)}
            className={`flex flex-col items-center gap-3 p-5 rounded-2xl ring-1 transition-all duration-200 ${
              isActive ? region.activeColor + ' shadow-lg' : region.color + ' hover:shadow-md'
            }`}
          >
            <region.icon size={28} />
            <span className="text-sm font-semibold text-center leading-tight">{region.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function StepSymptoms({ regionId, selected, onToggle }) {
  const region = BODY_REGIONS.find((r) => r.id === regionId);
  if (!region) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-dark-500">Select all symptoms you are experiencing:</p>
      <div className="flex flex-wrap gap-3">
        {region.symptoms.map((sym) => {
          const isActive = selected.includes(sym);
          return (
            <button
              key={sym}
              onClick={() => onToggle(sym)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white ring-primary-600 shadow-md'
                  : 'bg-white text-dark-700 ring-gray-200 hover:ring-primary-300 hover:bg-primary-50'
              }`}
            >
              {isActive && <CheckCircle2 size={14} className="inline mr-1.5 -mt-0.5" />}
              {sym}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepSeverity({ selected, onSelect }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {SEVERITY_OPTIONS.map((opt) => {
        const isActive = selected === opt.value;
        return (
          <motion.button
            key={opt.value}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(opt.value)}
            className={`flex flex-col items-center gap-3 p-6 rounded-2xl ring-1 transition-all duration-200 ${
              isActive ? opt.activeColor + ' shadow-lg' : opt.color + ' hover:shadow-md'
            }`}
          >
            <opt.icon size={28} />
            <span className="text-base font-bold">{opt.label}</span>
            <span className={`text-xs text-center leading-relaxed ${isActive ? 'text-white/80' : ''}`}>
              {opt.desc}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

function StepDuration({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-3">
      {DURATION_OPTIONS.map((dur) => {
        const isActive = selected === dur;
        return (
          <button
            key={dur}
            onClick={() => onSelect(dur)}
            className={`px-5 py-3 rounded-xl text-sm font-medium ring-1 transition-all duration-200 ${
              isActive
                ? 'bg-primary-600 text-white ring-primary-600 shadow-md'
                : 'bg-white text-dark-700 ring-gray-200 hover:ring-primary-300 hover:bg-primary-50'
            }`}
          >
            <Clock size={14} className="inline mr-1.5 -mt-0.5" />
            {dur}
          </button>
        );
      })}
    </div>
  );
}

function StepResults({ result, onReset }) {
  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Urgency banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl ${result.urgency.color} ring-1 ring-current/20`}>
        <ShieldAlert size={22} />
        <div>
          <p className="font-bold text-sm">Urgency Level: {result.urgency.level}</p>
          <p className="text-xs mt-0.5 opacity-80">{result.urgency.advice}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-bold text-dark-900 flex items-center gap-2">
          <Sparkles size={18} className="text-primary-500" />
          AI Assessment Summary
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-dark-500 mb-1">Body Region</p>
            <p className="text-sm font-semibold text-dark-900">{result.region}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-dark-500 mb-1">Recommended Dept.</p>
            <p className="text-sm font-semibold text-primary-700">{result.department}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-dark-500 mb-1">Symptoms</p>
            <p className="text-sm font-semibold text-dark-900">{result.symptoms.join(', ')}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-xs text-dark-500 mb-1">Duration</p>
            <p className="text-sm font-semibold text-dark-900">{result.duration}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl bg-primary-50 ring-1 ring-primary-200 p-6">
        <h4 className="text-base font-bold text-dark-900 mb-3">Recommendations</h4>
        <ol className="space-y-2.5">
          {result.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-dark-700">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-200 text-primary-800 text-xs font-bold flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          to="/book-appointment"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors shadow-md"
        >
          Book Appointment
          <ArrowRight size={16} />
        </Link>
        <Link
          to={`/doctors`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm ring-1 ring-primary-200 hover:bg-primary-50 transition-colors"
        >
          Find {result.department} Doctors
        </Link>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 text-dark-600 font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          <RotateCcw size={15} />
          Start Over
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 ring-1 ring-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>Important:</strong> This AI-powered symptom assessment is for informational purposes only and does not constitute medical diagnosis. Always consult a qualified healthcare professional for accurate diagnosis and treatment.
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Symptom Checker Page
   ───────────────────────────────────────────── */
const STEPS = [
  { label: 'Body Region', short: 'Region' },
  { label: 'Symptoms', short: 'Symptoms' },
  { label: 'Severity', short: 'Severity' },
  { label: 'Duration', short: 'Duration' },
  { label: 'Results', short: 'Results' },
];

export default function SymptomChecker() {
  const [step, setStep] = useState(0);
  const [region, setRegion] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [severity, setSeverity] = useState('');
  const [duration, setDuration] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const canNext = useMemo(() => {
    switch (step) {
      case 0: return !!region;
      case 1: return symptoms.length > 0;
      case 2: return !!severity;
      case 3: return !!duration;
      default: return false;
    }
  }, [step, region, symptoms, severity, duration]);

  const handleNext = () => {
    if (step === 3) {
      // Analyze
      setStep(4);
      setAnalyzing(true);
      setTimeout(() => {
        const assessment = generateAssessment(region, symptoms, severity, duration);
        setResult(assessment);
        setAnalyzing(false);
      }, 2000);
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleReset = () => {
    setStep(0);
    setRegion('');
    setSymptoms([]);
    setSeverity('');
    setDuration('');
    setResult(null);
    setAnalyzing(false);
  };

  const toggleSymptom = (sym) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  return (
    <>
      <PageHeader
        title="AI Symptom Checker"
        subtitle="Get a preliminary AI-powered assessment based on your symptoms. Quick, private, and informative."
        breadcrumbs={[{ label: 'Symptom Checker' }]}
      />

      <SectionWrapper background="gray">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-3xl mx-auto"
        >
          {/* Progress bar */}
          <motion.div variants={itemVariant} className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {STEPS.map((s, i) => (
                <div key={s.short} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? 'bg-primary-600 text-white'
                        : i === step
                        ? 'bg-primary-600 text-white ring-4 ring-primary-200'
                        : 'bg-gray-200 text-dark-400'
                    }`}
                  >
                    {i < step ? <CheckCircle2 size={16} /> : i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-medium ${i <= step ? 'text-primary-700' : 'text-dark-400'}`}>
                    {s.short}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`hidden sm:block w-12 lg:w-20 h-0.5 ${i < step ? 'bg-primary-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step content */}
          <motion.div variants={itemVariant} className="rounded-2xl bg-white ring-1 ring-gray-200 p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">Select Body Region</h3>
                  <p className="text-sm text-dark-500 mb-6">Where are you experiencing discomfort?</p>
                  <StepRegion selected={region} onSelect={setRegion} />
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">Select Your Symptoms</h3>
                  <StepSymptoms regionId={region} selected={symptoms} onToggle={toggleSymptom} />
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">How Severe Are Your Symptoms?</h3>
                  <p className="text-sm text-dark-500 mb-6">This helps us gauge urgency.</p>
                  <StepSeverity selected={severity} onSelect={setSeverity} />
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-xl font-bold text-dark-900 mb-2">How Long Have You Had These Symptoms?</h3>
                  <p className="text-sm text-dark-500 mb-6">Select the closest duration.</p>
                  <StepDuration selected={duration} onSelect={setDuration} />
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                      <h3 className="text-lg font-bold text-dark-900 mb-1">Analyzing Your Symptoms…</h3>
                      <p className="text-sm text-dark-500">Our AI is processing your information.</p>
                    </div>
                  ) : (
                    <StepResults result={result} onReset={handleReset} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            {step < 4 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-dark-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canNext}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {step === 3 ? 'Analyze Symptoms' : 'Next'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </SectionWrapper>
    </>
  );
}
