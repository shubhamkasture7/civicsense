import { useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, ArrowRight, Upload, AlertCircle, 
  MapPin, Brain, Sparkles, HelpCircle, ShieldCheck, ThumbsUp, ChevronRight
} from 'lucide-react';
import type { User, AIAnalysis } from '../types';

interface CreateComplaintProps {
  user: User;
  API_URL: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateComplaint({ user, API_URL, onSuccess, onCancel }: CreateComplaintProps) {
  const [step, setStep] = useState(1); // 1: Form, 2: Duplicate check, 3: Follow-up, 4: Final Submit
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form inputs
  const [complaintText, setComplaintText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [location, setLocation] = useState({
    road: '',
    landmark: '',
    area: '',
    city: ''
  });

  // AI responses
  const [duplicateCheck, setDuplicateCheck] = useState<{
    isDuplicate: boolean;
    duplicateId?: string;
    similarityScore: number;
    reason?: string;
  } | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});

  // Base64 helper for image submission
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Step 1: Submit to pre-check
  const handlePreCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText || !location.city || !location.area) {
      setError('Please fill in complaint details, city, and area.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      let imageBase64 = '';
      let mimeType = '';
      let uploadedUrl = '';

      // Upload image to backend first (if any)
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        uploadedUrl = uploadRes.data.imageUrl;
        setImageUrl(uploadedUrl);

        // Read base64 for Gemini vision analysis
        imageBase64 = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      }

      // Call precheck
      const preCheckRes = await axios.post(`${API_URL}/ai/pre-check`, {
        complaintText,
        location,
        imageBase64,
        mimeType
      });

      setDuplicateCheck(preCheckRes.data.duplicateCheck);
      setAiAnalysis(preCheckRes.data.analysis);

      // If duplicate found, show duplicate resolution page (Step 2)
      if (preCheckRes.data.duplicateCheck.isDuplicate) {
        setStep(2);
      } else {
        // Initialize followUpAnswers
        const initialAnswers: Record<string, string> = {};
        preCheckRes.data.analysis.followUpQuestions.forEach((q: string) => {
          initialAnswers[q] = '';
        });
        setFollowUpAnswers(initialAnswers);
        setStep(3);
      }
    } catch (err: any) {
      console.error(err);
      setError('AI Analysis failed. Please check backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle Support Duplicate selection
  const handleSupportDuplicate = async () => {
    if (!duplicateCheck?.duplicateId) return;

    try {
      setLoading(true);
      await axios.post(`${API_URL}/complaints`, {
        action: 'support',
        duplicateId: duplicateCheck.duplicateId,
        userId: user.uid
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Failed to upvote the existing complaint.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Skip duplicate and file anyway
  const handleSkipDuplicate = () => {
    if (aiAnalysis) {
      const initialAnswers: Record<string, string> = {};
      aiAnalysis.followUpQuestions.forEach((q: string) => {
        initialAnswers[q] = '';
      });
      setFollowUpAnswers(initialAnswers);
    }
    setStep(3);
  };

  // Step 3: Save answers, proceed to final preview
  const handleAnswersSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  // Step 4: Submit new complaint
  const handleFinalSubmit = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_URL}/complaints`, {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        complaintText,
        imageUrl,
        location,
        aiAnalysis,
        answers: followUpAnswers
      });
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError('Failed to submit new complaint to database.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 relative">
      
      {/* Wizard Header Progress */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={step === 1 ? onCancel : () => setStep(step === 3 && duplicateCheck?.isDuplicate ? 2 : step - 1)}
          disabled={loading}
          className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => {
            // Skip step 2 in bullet numbering if no duplicate was found
            if (s === 2 && duplicateCheck && !duplicateCheck.isDuplicate) return null;
            
            let color = 'bg-zinc-800 text-zinc-500';
            if (step === s) color = 'bg-violet-600 text-white font-bold scale-110';
            else if (step > s) color = 'bg-zinc-700 text-zinc-300';
            
            return (
              <div 
                key={s}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all duration-300 ${color}`}
              >
                {s}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: FORM INPUTS */}
      {step === 1 && (
        <form onSubmit={handlePreCheck} className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-extrabold text-white mt-0 mb-1 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400 animate-pulse-slow" />
              Describe the Issue
            </h2>
            <p className="text-zinc-400 text-xs mt-0">
              State what is wrong in your natural language (e.g. English, Hindi). Our AI will categorize it and assign it to the proper department.
            </p>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Complaint Details</label>
              <textarea
                required
                rows={4}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="e.g. There is a huge pothole at Kothrud corner near the Bank. Yesterday a motorcyclist fell down due to it. It needs immediate filling."
                className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-xl p-4 text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none"
              />
            </div>

            {/* Photo upload */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Attach Photograph (Optional)</label>
              <div className="flex items-center gap-4">
                <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-violet-500/50 hover:bg-zinc-900/20 rounded-xl p-6 cursor-pointer transition-all text-center">
                  <Upload className="w-6 h-6 text-zinc-500 mb-2" />
                  <span className="text-xs font-bold text-zinc-300">Click to select photo</span>
                  <span className="text-[10px] text-zinc-500 mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }}
                    className="hidden"
                  />
                </label>
                {imageFile && (
                  <div className="w-24 h-24 border border-zinc-800 rounded-xl overflow-hidden relative shrink-0">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Selected preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1 rounded-full text-white text-[10px] cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Location form */}
            <div className="border-t border-zinc-850 pt-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-violet-400" />
                Incident Location Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Road / Lane Name</label>
                  <input
                    type="text"
                    placeholder="e.g. 5th Main Road"
                    value={location.road}
                    onChange={(e) => setLocation({ ...location, road: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Nearest Landmark (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite CCD"
                    value={location.landmark}
                    onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Area / Locality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jayanagar Sector 4"
                    value={location.area}
                    onChange={(e) => setLocation({ ...location, area: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">City Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="w-full bg-zinc-900/50 border border-zinc-800 focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-5 py-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-650 hover:from-violet-500 hover:to-pink-550 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-violet-600/10 cursor-pointer text-xs transform active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing Details...
                </>
              ) : (
                <>
                  Analyze with AI
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: DUPLICATE PREVENTION PANEL */}
      {step === 2 && duplicateCheck && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className="text-center">
            <div className="inline-flex p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl mb-4 text-pink-400">
              <AlertCircle className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0 mb-1">
              Existing Similar Issue Found!
            </h2>
            <p className="text-zinc-400 text-xs max-w-md mx-auto">
              Our AI matched your description with an existing complaint already filed in {location.area}.
            </p>
          </div>

          {/* Duplicate card detail */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-500 font-mono">Reference ID: {duplicateCheck.duplicateId}</span>
              <span className="text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full font-bold">
                {duplicateCheck.similarityScore}% AI Match
              </span>
            </div>
            <p className="text-zinc-300 font-semibold leading-relaxed">
              "{duplicateCheck.reason || 'Existing description is highly correlated to your report.'}"
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl text-xs leading-relaxed text-zinc-400 space-y-2">
            <span className="text-white font-bold block">Why support existing instead of filing new?</span>
            <p>1. **Higher Priority**: Complaints with multiple supporters are highlighted to municipal commissioners.</p>
            <p>2. **Consolidated Response**: You will receive notifications and official notes directly in your dashboard.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSupportDuplicate}
              disabled={loading}
              className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-650 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg cursor-pointer text-xs transform active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4" />
              )}
              Yes, Support Existing Issue
            </button>
            <button
              onClick={handleSkipDuplicate}
              className="px-6 py-3.5 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              No, File New Complaint Anyway
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CONTEXTUAL FOLLOW-UP QUESTIONS */}
      {step === 3 && aiAnalysis && (
        <form onSubmit={handleAnswersSubmit} className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-extrabold text-white mt-0 mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
              AI Follow-up Interview
            </h2>
            <p className="text-zinc-400 text-xs mt-0">
              Our AI generates these questions based on your description to capture key variables and avoid delay in municipal scheduling.
            </p>

            <div className="space-y-4">
              {aiAnalysis.followUpQuestions.map((q, idx) => (
                <div key={idx} className="space-y-2 bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl">
                  <label className="text-zinc-200 font-bold text-xs flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-violet-400 shrink-0" />
                    {q}
                  </label>
                  <input
                    type="text"
                    required
                    value={followUpAnswers[q] || ''}
                    onChange={(e) => setFollowUpAnswers({ ...followUpAnswers, [q]: e.target.value })}
                    placeholder="Provide your answer..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-500 rounded-lg px-4 py-2.5 text-xs text-white placeholder-zinc-600 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-650 text-white font-bold px-6 py-3 rounded-xl shadow-lg cursor-pointer text-xs transform active:scale-98 transition-all"
            >
              Preview AI Diagnosis
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: PREVIEW AI DIAGNOSIS & SUBMIT */}
      {step === 4 && aiAnalysis && (
        <div className="space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <h2 className="text-xl font-extrabold text-white mt-0 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400 animate-pulse-slow" />
              AI Analysis Diagnosis Preview
            </h2>
            <p className="text-zinc-400 text-xs mt-0">
              Verify the AI diagnosis of your ticket. If satisfied, click submit to publish.
            </p>

            {/* AI Diagnosis Details Card */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Suggested Category</span>
                  <span className="text-white font-extrabold text-sm">{aiAnalysis.category}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Assessed Urgency</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                    aiAnalysis.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    aiAnalysis.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    aiAnalysis.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {aiAnalysis.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Referred Department</span>
                  <span className="text-zinc-300 font-bold text-xs mt-0.5 block">{aiAnalysis.department}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Confidence Score</span>
                  <span className="text-violet-400 font-bold text-xs mt-0.5 block">{aiAnalysis.confidence}% Match confidence</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">AI Generated Summary</span>
                <p className="text-zinc-200 font-semibold text-xs mt-1">"{aiAnalysis.summary}"</p>
              </div>

              <div>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Operator Recommended Actions</span>
                <p className="text-zinc-300 text-xs mt-1 leading-relaxed">{aiAnalysis.recommendedAction}</p>
              </div>
            </div>

            {/* Questions list preview */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Follow-up Interview Summary</span>
              <div className="space-y-2">
                {Object.entries(followUpAnswers).map(([q, a], idx) => (
                  <div key={idx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 text-xs">
                    <p className="text-zinc-500 font-semibold">Q: {q}</p>
                    <p className="text-zinc-200 font-bold mt-1">A: {a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-3 border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Amend Answers
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-pink-650 text-white font-bold px-6 py-3 rounded-xl shadow-lg cursor-pointer text-xs transform active:scale-98 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  Submit Complaint
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
