import { CompanyReport } from "../types";

export function getMockReport(companyName: string): CompanyReport {
  return {
    overallScore: 7.2,
    summary: `${companyName} is a well-established company in Portugal with a generally positive reputation among employees. The company offers competitive salaries and a supportive work environment, though some concerns about work-life balance have been noted.`,
    companyOverview: {
      size: "1,000-5,000",
      founded: "2005",
      techStack: ["Python", "React", "AWS", "PostgreSQL", "Kubernetes"],
      industry: "Technology / Internet Services",
    },
    salary: {
      it: {
        junior: { min: 18000, max: 25000 },
        mid: { min: 28000, max: 40000 },
        senior: { min: 42000, max: 60000 },
      },
      business: {
        junior: { min: 16000, max: 22000 },
        mid: { min: 25000, max: 35000 },
        senior: { min: 38000, max: 55000 },
      },
      currency: "EUR",
    },
    culture: {
      positiveKeywords: [
        "collaborative",
        "innovative",
        "flexible hours",
        "learning opportunities",
      ],
      negativeKeywords: ["bureaucracy", "slow promotion"],
      workLifeBalance: 6.5,
      remoteFriendly: true,
    },
    interview: {
      difficulty: 6,
      process:
        "Typically involves an HR screening call, a technical assessment or case study, followed by 1-2 interviews with the team and hiring manager.",
      commonQuestions: [
        "Tell us about a challenging project you led",
        "How do you handle tight deadlines?",
        "What interests you about working in Portugal?",
      ],
      avgDuration: "2-3 weeks",
    },
    redFlags: [
      {
        issue: "Overtime during peak seasons",
        confidence: "medium",
        sources: ["glassdoor"],
        mentions: 4,
      },
      {
        issue: "Slow internal promotion process",
        confidence: "low",
        sources: ["teamlyzer"],
        mentions: 2,
      },
    ],
    greenFlags: [
      "Strong engineering culture",
      "Regular team events and offsites",
      "Good onboarding process for new hires",
      "Transparent communication from leadership",
    ],
    foreignerFriendly: {
      score: 8,
      visaSupport: true,
      englishEnvironment: "high",
      internationalTeam: true,
      relocationSupport: true,
      notes:
        "Multiple reviews mention English as the primary working language. Company actively sponsors Tech Visa applications.",
    },
    reviewAuthenticity: {
      score: 8,
      totalReviews: 47,
      suspiciousPatterns: false,
      notes:
        "Reviews are spread over 4 years with consistent sentiment patterns. No signs of review manipulation detected.",
    },
    recommendation: `${companyName} appears to be a solid choice for both IT and business professionals looking to work in Portugal. The company offers competitive compensation, a supportive international environment, and strong visa support for foreign workers. The main area of concern is occasional overtime during busy periods, but overall the positives significantly outweigh the negatives. Recommended for candidates who value an international, tech-forward workplace.`,
  };
}
