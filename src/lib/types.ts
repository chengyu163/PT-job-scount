export interface ScoredJob {
  title: string;
  company: string;
  source: string;
  location: string;
  remote: boolean;
  techStack: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  url: string;
  score: number;
  scoreBreakdown: {
    salaryScore: number;
    companyScore: number;
    remoteScore: number;
    techScore: number;
  };
  companyRating: number | null;
  hasReport: boolean;
}

export interface ScrapedData {
  source: string;
  sector?: "it" | "business" | "all";
  ratings?: {
    overall: number;
    culture: number;
    salary: number;
  };
  reviews?: {
    text: string;
    rating: number;
    date: string;
    pros: string;
    cons: string;
  }[];
  salaries?: {
    role: string;
    department: string;
    min: number;
    max: number;
    currency: string;
  }[];
  interviews?: {
    difficulty: number;
    questions: string[];
    process: string;
    department?: string;
  }[];
  jobs?: {
    title: string;
    department: string;
    techStack?: string[];
    remote: boolean;
    url: string;
  }[];
  companyInfo?: {
    size: string;
    founded: string;
    industry: string;
    capital?: string;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    year: string;
  }[];
  languages: { language: string; level: string }[];
  preferredRoles: string[];
  salaryExpectation: number | null;
  remotePreference: "remote" | "hybrid" | "onsite" | "any";
}

export interface JobMatch {
  job: ScoredJob;
  matchScore: number;
  matchBreakdown: {
    skillMatch: number;
    experienceMatch: number;
    salaryMatch: number;
    locationMatch: number;
  };
  strengths: string[];
  gaps: string[];
  suggestion: string;
}

export interface SalaryRange {
  min: number;
  max: number;
}

export interface SalaryByLevel {
  junior: SalaryRange | null;
  mid: SalaryRange | null;
  senior: SalaryRange | null;
}

export interface RedFlag {
  issue: string;
  confidence: "high" | "medium" | "low";
  sources: string[];
  mentions: number;
}

export interface ForeignerFriendly {
  score: number;
  visaSupport: boolean | null;
  englishEnvironment: "high" | "medium" | "low" | null;
  internationalTeam: boolean | null;
  relocationSupport: boolean | null;
  notes: string;
}

export interface ReviewAuthenticity {
  score: number;
  totalReviews: number;
  suspiciousPatterns: boolean;
  notes: string;
}

export interface CompanyReport {
  overallScore: number;
  summary: string;
  companyOverview: {
    size: string | null;
    founded: string | null;
    techStack: string[];
    industry: string | null;
  };
  salary: {
    roles: { role: string; min: number; max: number; source: string }[];
    currency: string;
  };
  culture: {
    positiveKeywords: string[];
    negativeKeywords: string[];
    workLifeBalance: number | null;
    remoteFriendly: boolean | null;
  };
  interview: {
    difficulty: number | null;
    process: string | null;
    commonQuestions: string[];
    avgDuration: string | null;
  };
  openPositions: {
    title: string;
    source: string;
    location: string;
    remote: boolean;
    salaryRange: string;
  }[];
  hiringTrends: {
    isHiring: boolean;
    totalOpenings: number;
    topRoles: string[];
    techDemand: string[];
    notes: string;
  };
  redFlags: RedFlag[];
  greenFlags: string[];
  foreignerFriendly: ForeignerFriendly | null;
  reviewAuthenticity: ReviewAuthenticity | null;
  recommendation: string;
}
