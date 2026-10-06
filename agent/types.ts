export interface ExtractedWorkExperience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

export interface ExtractedEducation {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  graduationYear: string;
}

export interface ExtractedProfile {
  full_name: string;
  phone: string;
  location: string;
  current_title: string;
  experience_level: string;
  years_experience: number | null;
  skills: string[];
  industries: string[];
  work_experience: ExtractedWorkExperience[];
  education: ExtractedEducation;
  job_titles_seeking: string[];
  remote_preference: string;
  salary_expectation: string;
  linkedin_url: string;
  portfolio_url: string;
  work_authorization: string;
}

export interface ResearchDossier {
  companyOverview: string;
  techStack: string[];
  culture: string[];
  whyThisRole: string;
  yourEdge: string[];
  gapsToAddress: string[];
  smartQuestions: string[];
  interviewPrep: string[];
  sources: string[];
}

export interface RawCompanyResearch {
  homepage: HomepageExtraction | null;
  subPages: SubPageExtraction[];
  sources: string[];
}

export interface HomepageExtraction {
  oneLiner: string;
  productSummary: string;
  signals: string[];
  pageLinks: Array<{ url: string; kind: string }>;
}

export interface SubPageExtraction {
  url: string;
  keyPoints: string[];
  technologies: string[];
  valuesOrCulture: string[];
  notable: string[];
}
