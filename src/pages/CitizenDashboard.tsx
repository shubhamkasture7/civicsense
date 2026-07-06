import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  FileText, CheckCircle, Clock, AlertTriangle, 
  MapPin, Calendar, Plus, ThumbsUp, ArrowRight, X, User
} from 'lucide-react';
import type { Complaint, User as UserType } from '../types';

interface CitizenDashboardProps {
  user: UserType;
  API_URL: string;
  onCreateNewClick: () => void;
}

export default function CitizenDashboard({ user, API_URL, onCreateNewClick }: CitizenDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/complaints`, {
        params: { userId: user.uid }
      });
      setComplaints(res.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch your complaints. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user.uid]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full font-bold">Pending</span>;
      case 'Investigating':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-bold">Investigating</span>;
      case 'In Progress':
        return <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs px-2.5 py-1 rounded-full font-bold">In Progress</span>;
      case 'Resolved':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold">Resolved</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-1 rounded-full font-semibold">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Low':
        return <span className="bg-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700 font-bold">Low</span>;
      case 'Medium':
        return <span className="bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-blue-500/20 font-bold">Medium</span>;
      case 'High':
        return <span className="bg-orange-500/10 text-orange-400 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-orange-500/20 font-bold">High</span>;
      case 'Critical':
        return <span className="bg-red-500/10 text-red-400 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-red-500/20 font-black animate-pulse">Critical</span>;
      default:
        return <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{priority}</span>;
    }
  };

  // Metrics
  const totalSubmitted = complaints.filter(c => c.userId === user.uid).length;
  const totalSupported = complaints.filter(c => c.subscribers.includes(user.uid)).length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const pending = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">Citizen Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track the status of issues you reported or supported in your city.
          </p>
        </div>
        <button
          onClick={onCreateNewClick}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-650 hover:from-violet-500 hover:to-pink-550 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-violet-600/10 hover:shadow-violet-600/20 transition-all cursor-pointer transform active:scale-98 text-sm"
        >
          <Plus className="w-4 h-4" />
          File a New Complaint
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-violet-500/10 border border-violet-500/20 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">My Reports</span>
            <span className="text-2xl font-extrabold text-white">{totalSubmitted}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-pink-500/10 border border-pink-500/20 p-3 rounded-xl">
            <ThumbsUp className="w-6 h-6 text-pink-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Supported Issues</span>
            <span className="text-2xl font-extrabold text-white">{totalSupported}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">In Progress / Pending</span>
            <span className="text-2xl font-extrabold text-white">{pending}</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Resolved Cases</span>
            <span className="text-2xl font-extrabold text-white">{resolved}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-medium">Fetching complaints from server...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center rounded-2xl border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-bold mb-2">Connection Error</p>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">{error}</p>
          <button
            onClick={fetchComplaints}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-2xl">
          <FileText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Complaints Filed Yet</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto mb-6">
            You haven't submitted any complaints or supported any reported duplicates in this sandbox.
          </p>
          <button
            onClick={onCreateNewClick}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer"
          >
            Report Your First Issue
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden border-zinc-800/80">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
            <h3 className="font-bold text-white text-base">Your Active & Supported Cases</h3>
          </div>
          <div className="divide-y divide-zinc-800/80">
            {complaints.map((c) => (
              <div 
                key={c.complaintId}
                onClick={() => setSelectedComplaint(c)}
                className="p-6 hover:bg-zinc-900/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-zinc-500 font-mono text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      ID: {c.complaintId}
                    </span>
                    {c.userId !== user.uid && (
                      <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ThumbsUp className="w-2.5 h-2.5" /> Supported
                      </span>
                    )}
                    {c.aiAnalysis?.category && (
                      <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-0.5 rounded-md font-medium border border-zinc-700">
                        {c.aiAnalysis.category}
                      </span>
                    )}
                    {c.aiAnalysis?.priority && getPriorityBadge(c.aiAnalysis.priority)}
                  </div>
                  
                  <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors text-base line-clamp-1">
                    {c.aiAnalysis?.summary || c.complaintText}
                  </h4>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{c.location.road}, {c.location.area}, {c.location.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    {c.upvotes > 0 && (
                      <div className="flex items-center gap-1 text-zinc-500">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{c.upvotes} {c.upvotes === 1 ? 'vote' : 'votes'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(c.status)}
                  <ArrowRight className="w-4 h-4 text-zinc-650 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complaint Detail Dialog Backdrop */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Dialog Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                    ID: {selectedComplaint.complaintId}
                  </span>
                  {getStatusBadge(selectedComplaint.status)}
                </div>
                <h3 className="font-extrabold text-lg text-white mt-2">
                  Complaint Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              
              {/* Image & Summary Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl aspect-video md:aspect-auto md:h-full min-h-[160px] overflow-hidden flex items-center justify-center relative">
                  {selectedComplaint.imageUrl ? (
                    <img
                      src={selectedComplaint.imageUrl.startsWith('/uploads') ? `${API_URL}${selectedComplaint.imageUrl}` : selectedComplaint.imageUrl}
                      alt="Complaint snapshot"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-zinc-500">
                      <AlertTriangle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-xs font-semibold">No photograph uploaded</p>
                    </div>
                  )}
                </div>

                {/* Core Info */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Description</span>
                    <p className="text-zinc-200 leading-relaxed font-medium mt-1">"{selectedComplaint.complaintText}"</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Location Address</span>
                    <p className="text-zinc-300 font-semibold mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-violet-500" />
                      {selectedComplaint.location.road && `${selectedComplaint.location.road}, `}
                      {selectedComplaint.location.landmark && `Near ${selectedComplaint.location.landmark}, `}
                      {selectedComplaint.location.area}, {selectedComplaint.location.city}
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Reported By</span>
                      <span className="text-zinc-300 font-semibold flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedComplaint.userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Created On</span>
                      <span className="text-zinc-300 font-semibold mt-0.5 block">
                        {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* AI Analysis Diagnosis */}
              {selectedComplaint.aiAnalysis && (
                <div className="glass-panel p-5 rounded-2xl relative border-violet-500/20 bg-violet-950/5">
                  <div className="absolute top-4 right-4 text-right">
                    <span className="text-[10px] font-bold text-violet-400/80 block uppercase tracking-wider">AI Confidence</span>
                    <span className="text-lg font-extrabold text-violet-400">{selectedComplaint.aiAnalysis.confidence}%</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-violet-400 uppercase tracking-wider mb-3">AI Diagnosis Reports</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Suggested Category</span>
                      <span className="text-zinc-200 font-bold text-xs mt-1 block">{selectedComplaint.aiAnalysis.category}</span>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Referred Department</span>
                      <span className="text-zinc-200 font-bold text-xs mt-1 block">{selectedComplaint.aiAnalysis.department}</span>
                    </div>
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Assessed Priority</span>
                      <div className="mt-1">{getPriorityBadge(selectedComplaint.aiAnalysis.priority)}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">AI Executive Summary</span>
                      <p className="text-zinc-200 font-medium text-xs mt-0.5">"{selectedComplaint.aiAnalysis.summary}"</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Recommended Resolution Action</span>
                      <p className="text-zinc-300 text-xs mt-0.5">{selectedComplaint.aiAnalysis.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Follow up Q&A */}
              {selectedComplaint.answers && Object.keys(selectedComplaint.answers).length > 0 && (
                <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl">
                  <h4 className="font-extrabold text-sm text-zinc-400 uppercase tracking-wider mb-3">AI Follow-up Interview Answers</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedComplaint.answers).map(([question, answer], idx) => (
                      <div key={idx} className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
                        <p className="text-zinc-400 font-semibold text-xs">Q: {question}</p>
                        <p className="text-zinc-200 font-bold text-xs mt-1">A: {answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Operator Action logs / Progress logs */}
              <div className="border-t border-zinc-850 pt-5 space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Government Response Updates</span>
                {selectedComplaint.adminNotes ? (
                  <div className="bg-emerald-950/10 border border-emerald-500/20 p-4 rounded-2xl flex gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Official Status Updates</span>
                      <p className="text-zinc-200 font-medium text-xs mt-1 leading-relaxed">
                        {selectedComplaint.adminNotes}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-900/20 border border-zinc-850 p-4 rounded-2xl text-zinc-500 text-center text-xs">
                    Issue is successfully queued for assessment. Operator will update response logs once inspection starts.
                  </div>
                )}
              </div>

            </div>

            {/* Dialog Footer */}
            <div className="px-6 py-4 border-t border-zinc-850 bg-zinc-900/20 flex justify-end">
              <button
                onClick={() => setSelectedComplaint(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
