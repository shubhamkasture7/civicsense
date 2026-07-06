import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { 
  AlertTriangle, MapPin, Search, Filter, Trash2, X, Eye, 
  User, Check, RefreshCw
} from 'lucide-react';
import type { Complaint, AnalyticsData } from '../types';

interface AdminDashboardProps {
  API_URL: string;
  currentTab: string;
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#64748b', '#a855f7'];

export default function AdminDashboard({ API_URL, currentTab }: AdminDashboardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Table filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Details Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [adminStatus, setAdminStatus] = useState<string>('Pending');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [adminDept, setAdminDept] = useState<string>('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [compRes, analyticRes] = await Promise.all([
        axios.get(`${API_URL}/complaints`),
        axios.get(`${API_URL}/analytics`)
      ]);
      setComplaints(compRes.data);
      setAnalytics(analyticRes.data);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch admin dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openComplaintModal = (comp: Complaint) => {
    setSelectedComplaint(comp);
    setAdminStatus(comp.status);
    setAdminNotes(comp.adminNotes || '');
    setAdminDept(comp.aiAnalysis?.department || '');
  };

  const handleUpdateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    
    try {
      setModalLoading(true);
      const res = await axios.put(`${API_URL}/complaints/${selectedComplaint.complaintId}`, {
        status: adminStatus,
        adminNotes: adminNotes,
        department: adminDept
      });
      
      // Update local lists
      setSelectedComplaint(res.data.complaint);
      
      // Reload everything
      await fetchAllData();
      
      // close modal or show success feedback
      setSelectedComplaint(null);
    } catch (err: any) {
      console.error(err);
      alert('Failed to update complaint.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint permanently from the server?')) return;
    
    try {
      setModalLoading(true);
      await axios.delete(`${API_URL}/complaints/${id}`);
      setSelectedComplaint(null);
      await fetchAllData();
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete complaint.');
    } finally {
      setModalLoading(false);
    }
  };

  // Status elements
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

  // Filter Logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.complaintText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.aiAnalysis?.summary && c.aiAnalysis.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || c.status === statusFilter;
    const matchesPriority = !priorityFilter || c.aiAnalysis?.priority === priorityFilter;
    const matchesCategory = !categoryFilter || c.aiAnalysis?.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Get categories for filter dropdown
  const categoriesList = Array.from(new Set(complaints.map(c => c.aiAnalysis?.category).filter(Boolean)));

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight m-0">Admin Analytics Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Real-time urban diagnosis and automated triage dispatch metrics.
          </p>
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24">
          <div className="inline-block w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
          <p className="text-zinc-400 font-medium">Computing live metrics database...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center rounded-2xl border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-bold mb-2">Operational Sync Failure</p>
          <p className="text-zinc-400 text-sm max-w-md mx-auto mb-4">{error}</p>
          <button
            onClick={fetchAllData}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Reconnect
          </button>
        </div>
      ) : (
        <>
          {/* Summary metrics cards */}
          {currentTab === 'admin-dashboard' && analytics && (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Total Filed</span>
                <span className="text-xl font-extrabold text-white">{analytics.metrics.total}</span>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Pending</span>
                <span className="text-xl font-extrabold text-amber-400">{analytics.metrics.pending}</span>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">In Progress</span>
                <span className="text-xl font-extrabold text-violet-400">{analytics.metrics.inProgress}</span>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Resolved</span>
                <span className="text-xl font-extrabold text-emerald-400">{analytics.metrics.resolved}</span>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Critical Issues</span>
                <span className="text-xl font-extrabold text-red-400">{analytics.metrics.highPriority}</span>
              </div>
              <div className="glass-panel p-4 rounded-xl">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block font-black text-violet-400">Resolution %</span>
                <span className="text-xl font-extrabold text-white">{analytics.metrics.resolutionRate}%</span>
              </div>
            </div>
          )}

          {/* Recharts Graphical Visuals */}
          {currentTab === 'admin-dashboard' && analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Pie: Complaints by category */}
              <div className="glass-panel p-6 rounded-2xl border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Complaints by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.categoryBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        iconSize={8}
                        wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart: Monthly Trends */}
              <div className="glass-panel p-6 rounded-2xl border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Submission & Resolution Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyTrends}>
                      <defs>
                        <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
                      <YAxis stroke="#a1a1aa" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="complaints" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorComplaints)" name="Submitted" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Resolved" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar: Priority distribution */}
              <div className="glass-panel p-6 rounded-2xl border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Urgency Priority Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.priorityBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} />
                      <YAxis stroke="#a1a1aa" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                      <Bar dataKey="value" name="Tickets" radius={[4, 4, 0, 0]}>
                        {analytics.priorityBreakdown.map((entry, index) => {
                          let color = '#a1a1aa'; // default
                          if (entry.name === 'Critical') color = '#ef4444';
                          else if (entry.name === 'High') color = '#f97316';
                          else if (entry.name === 'Medium') color = '#3b82f6';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar: Department Allocation */}
              <div className="glass-panel p-6 rounded-2xl border-zinc-800/80">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Responsible Department Referrals</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.departmentBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis type="number" stroke="#a1a1aa" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#a1a1aa" fontSize={8} width={100} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} />
                      <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} name="Assigned Issues" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* Filters Panel & Table List */}
          {currentTab === 'admin-management' && (
            <div className="glass-panel rounded-2xl border-zinc-800/80 overflow-hidden space-y-4 p-6">
            
            {/* Filter toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, citizen name, text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition-all"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-zinc-500">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </div>
                
                {/* Status selector */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Investigating">Investigating</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>

                {/* Priority selector */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>

                {/* Category selector */}
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-zinc-900 border border-zinc-850 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-900/10">
                    <th className="py-3 px-4 font-bold">Ticket ID</th>
                    <th className="py-3 px-4 font-bold">Summary</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold">Priority</th>
                    <th className="py-3 px-4 font-bold">Location</th>
                    <th className="py-3 px-4 font-bold">Votes</th>
                    <th className="py-3 px-4 font-bold">Status</th>
                    <th className="py-3 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-500 font-semibold">
                        No complaints match your active filter search queries.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => (
                      <tr 
                        key={c.complaintId}
                        className="hover:bg-zinc-900/20 transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-zinc-400">
                          {c.complaintId.substring(0, 12)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-zinc-200 max-w-[180px] truncate">
                          {c.aiAnalysis?.summary || c.complaintText}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300 font-medium">
                          {c.aiAnalysis?.category || 'Uncategorized'}
                        </td>
                        <td className="py-3.5 px-4">
                          {getPriorityBadge(c.aiAnalysis?.priority || 'Medium')}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-medium">
                          {c.location.area}, {c.location.city}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-300 font-bold">
                          {c.upvotes}
                        </td>
                        <td className="py-3.5 px-4">
                          {getStatusBadge(c.status)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => openComplaintModal(c)}
                            className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-violet-600 border border-zinc-700 hover:border-violet-500 text-zinc-350 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            </div>
          )}
        </>
      )}

      {/* Admin Action Control Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative max-h-[95vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/30">
              <div>
                <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850">
                  Ticket Reference ID: {selectedComplaint.complaintId}
                </span>
                <h3 className="font-extrabold text-lg text-white mt-1">
                  Manage Dispatch Triage Case
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteComplaint(selectedComplaint.complaintId)}
                  className="p-2.5 rounded-xl border border-zinc-800 hover:border-red-500 bg-zinc-900 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                  title="Delete Complaint"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateComplaint} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs flex flex-col md:flex-row gap-6">
              
              {/* Left Column: Visual & Info */}
              <div className="flex-1 space-y-6">
                
                {/* Photo snapshot */}
                <div className="bg-zinc-900 border border-zinc-850 rounded-2xl aspect-video overflow-hidden flex items-center justify-center relative">
                  {selectedComplaint.imageUrl ? (
                    <img
                      src={selectedComplaint.imageUrl.startsWith('/uploads') ? `${API_URL}${selectedComplaint.imageUrl}` : selectedComplaint.imageUrl}
                      alt="Complaint proof"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 text-zinc-500">
                      <AlertTriangle className="w-8 h-8 text-zinc-750 mx-auto mb-2" />
                      <p className="text-[11px] font-bold">No visual photograph attached</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Citizen Complaint Text</span>
                    <p className="text-zinc-200 font-semibold leading-relaxed mt-1 text-xs bg-zinc-900/30 p-3 border border-zinc-850 rounded-xl">
                      "{selectedComplaint.complaintText}"
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Submitted By</span>
                      <span className="text-zinc-300 font-bold flex items-center gap-1 mt-0.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedComplaint.userName} ({selectedComplaint.userEmail})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Geographic Location</span>
                      <span className="text-zinc-300 font-bold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                        {selectedComplaint.location.road && `${selectedComplaint.location.road}, `}
                        {selectedComplaint.location.area}, {selectedComplaint.location.city}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follow up answers */}
                {selectedComplaint.answers && Object.keys(selectedComplaint.answers).length > 0 && (
                  <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Contextual Interview answers</span>
                    {Object.entries(selectedComplaint.answers).map(([q, a], idx) => (
                      <div key={idx} className="bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                        <p className="text-zinc-400 font-medium">{q}</p>
                        <p className="text-zinc-200 font-extrabold mt-0.5">{a}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Right Column: AI diagnosis & Operator Dispatch controls */}
              <div className="w-full md:w-80 space-y-6 border-t md:border-t-0 md:border-l border-zinc-850 pt-6 md:pt-0 md:pl-6">
                
                {/* AI diagnosis */}
                {selectedComplaint.aiAnalysis && (
                  <div className="glass-panel p-4 rounded-xl border-violet-500/20 bg-violet-950/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">AI Assessment</span>
                      <span className="text-violet-400 font-extrabold">{selectedComplaint.aiAnalysis.confidence}% Conf.</span>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-zinc-400 block">Classified Category:</span>
                      <span className="text-zinc-200 font-bold block">{selectedComplaint.aiAnalysis.category}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-semibold text-zinc-400 block">AI Rec. Action:</span>
                      <span className="text-zinc-300 font-medium block leading-normal">{selectedComplaint.aiAnalysis.recommendedAction}</span>
                    </div>
                  </div>
                )}

                {/* Operator Actions */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-zinc-850 pb-2">Dispatch Control Form</h4>
                  
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Complaint Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Pending', 'Investigating', 'In Progress', 'Resolved'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setAdminStatus(st)}
                          className={`py-2 rounded-lg border font-bold text-center transition-all cursor-pointer ${
                            adminStatus === st 
                              ? 'border-violet-500 bg-violet-500/10 text-violet-400 shadow'
                              : 'border-zinc-800 bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900/70 hover:text-zinc-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Assign Department */}
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Assigned Municipal Department</label>
                    <input
                      type="text"
                      required
                      value={adminDept}
                      onChange={(e) => setAdminDept(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-violet-500 transition-all"
                    />
                  </div>

                  {/* Operator progress note */}
                  <div>
                    <label className="block text-[9px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Government Response Notes (Public)</label>
                    <textarea
                      rows={4}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="e.g. Inspector dispatched. Water valve line repaired on Monday. Repair crew scheduled to fill road potholes next Tuesday."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-white placeholder-zinc-650 outline-none focus:border-violet-500 transition-all resize-none leading-relaxed"
                    />
                    <span className="text-[9px] text-zinc-500 mt-1 block">
                      This log is visible to reporting citizens and other supporters in their feeds.
                    </span>
                  </div>
                </div>

                {/* Form controls */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="flex-1 py-3 border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-pink-650 text-white font-bold py-3 rounded-xl shadow cursor-pointer transform active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {modalLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
