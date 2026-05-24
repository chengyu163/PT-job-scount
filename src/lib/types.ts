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
    it: SalaryByLevel | null;
    business: SalaryByLevel | null;
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
  redFlags: RedFlag[];
  greenFlags: string[];
  foreignerFriendly: ForeignerFriendly | null;
  reviewAuthenticity: ReviewAuthenticity | null;
  recommendation: string;
}
