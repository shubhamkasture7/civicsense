export interface Location {
  road: string;
  landmark: string;
  area: string;
  city: string;
}

export interface AIAnalysis {
  category: string;
  priority: string;
  department: string;
  summary: string;
  recommendedAction: string;
  confidence: number;
  followUpQuestions: string[];
}

export interface Complaint {
  complaintId: string;
  userId: string;
  userName: string;
  userEmail: string;
  complaintText: string;
  language: string;
  imageUrl?: string;
  location: Location;
  aiAnalysis?: AIAnalysis;
  answers?: Record<string, string>;
  status: 'Pending' | 'Investigating' | 'In Progress' | 'Resolved';
  adminNotes?: string;
  upvotes: number;
  subscribers: string[];
  createdAt: string;
}

export interface User {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'citizen' | 'admin';
}

export interface AnalyticsData {
  metrics: {
    total: number;
    pending: number;
    investigating: number;
    inProgress: number;
    resolved: number;
    highPriority: number;
    resolutionRate: number;
    avgResponseTimeHours: number;
  };
  categoryBreakdown: { name: string; value: number }[];
  priorityBreakdown: { name: string; value: number }[];
  departmentBreakdown: { name: string; value: number }[];
  monthlyTrends: { name: string; complaints: number; resolved: number }[];
}
