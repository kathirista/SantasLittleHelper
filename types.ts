
export interface ProfileSEM {
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    linkedin?: string;
  };
  skills: string[];
  experience: {
    role: string;
    company: string;
    duration: string;
    achievements: string[]; // Quantified metrics
  }[];
  education: {
    degree: string;
    school: string;
  }[];
  summary: string;
}

export interface JobOpening {
  title: string;
  company: string;
  location?: string;
  snippet: string;
  description?: string; // Full description if available
  url?: string;
  salary?: string;
  stockPrice?: string;
  mission?: string;
  greenFlag?: string; // Reason for green flag (Environment, Charity, Humanitarian)
  isHighPaying?: boolean;
  postingDate?: string;
  matchScore?: number; // 0-100
  matchReason?: string;
  // New Insights
  glassdoorRating?: number;
  glassdoorSentiment?: 'Positive' | 'Negative' | 'Neutral';
  recentLayoffs?: string; // e.g. "Yes, 10% workforce reduction in Jan 2024" or "No major layoffs"
}

export enum QualificationStatus {
  OVER_QUALIFIED = "OVER_QUALIFIED",
  UNDER_QUALIFIED = "UNDER_QUALIFIED",
  PERFECTLY_SUITED = "PERFECTLY_SUITED"
}

export interface MatchAnalysis {
  score: number; // 0-100
  rationale: string;
  keyMatches: string[];
  qualificationStatus: QualificationStatus;
  qualificationReason: string;
  crossFunctionalAdvantage: string;
}

export interface GeneratedContent {
  resumeSnippet: string; // Full tailored resume markdown
  coverLetter: string; // Full tailored cover letter markdown
  changeSummary: string; // Explanation of changes made by AI
}

export interface ApplicationEntry {
  id: string;
  jobTitle: string;
  company: string;
  dateSent: string;
  score: number;
  status: 'Draft' | 'Submitted';
}

export interface SavedProfile {
  id: string;
  timestamp: number;
  label: string; // e.g. "San Francisco - 10/24/2023"
  resumeText: string;
  email: string;
  password?: string;
  location: string;
  postalCode: string;
  radius: string;
}

export type CoverLetterTone = 'Professional' | 'Casual' | 'Tech-Friendly' | 'Conversational' | 'Direct' | 'Enthusiastic';
