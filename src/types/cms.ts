export type MenuTab = 'Home' | 'About' | 'Archive' | 'Journal' | 'Contact' | 'Admin';

export type AdminTab =
  | 'Home'
  | 'About'
  | 'Archive'
  | 'Journal'
  | 'Contact'
  | 'GitHub';

export interface HomeSlide {
  id: string;
  imageUrl: string;
}

export interface ContentBlock {
  id: string;
  type: 'text' | 'image';
  content: string; // text body or image URL/DataURL
  caption?: string; // optional figure caption or subheading
}

export interface AboutArticle {
  title: string;
  subtitle: string;
  updatedDate: string;
  blocks: ContentBlock[];
}

export interface ArchiveSpecimen {
  id: string;
  archiveNo: string; // e.g. "Archive No. 001"
  title?: string; // Editable product/archive title in Admin
  nameKo: string; // e.g. "상엽 뽕잎"
  scientificName: string; // e.g. "Morus alba"
  originCoords: string; // e.g. "충북 영동 · 36°10'N 127°46'E"
  altitude: string; // e.g. "ALT 480M"
  processingSpec: string; // e.g. "220°C 살청 · 유념 · 210°C 배전 · 12mm 컷팅"
  extractionProtocol: string; // e.g. "3.5g / 150ml / 95°C / 20s → 15s → 25s → 40s"
  flavorComponents: string; // e.g. "구수한 숭늉·곡물 향 / 카페인 0.0% / 루틴·DNJ"
  imageUrl?: string;
  harvestSeason?: string;
  specimenNotes?: string;
}

export interface JournalPost {
  id: string;
  issueNo: string; // e.g. "ISSUE 01"
  title: string;
  date: string; // e.g. "2026. 10"
  summary?: string;
  blocks: ContentBlock[];
}

export interface ContactConfig {
  title: string;
  introText: string;
  email: string;
  addressHours: string;
  socialHandle: string;
  inquiryTypes: string[];
}

export interface InquirySubmission {
  id: string;
  organization: string;
  contactName: string;
  email: string;
  inquiryType: string;
  message: string;
  createdAt: string;
}

export interface KyungDataset {
  version: number;
  updatedAt: string;
  homeSlides?: HomeSlide[];
  about: AboutArticle;
  archives: ArchiveSpecimen[];
  journals: JournalPost[];
  contact: ContactConfig;
}

export interface GitHubSyncConfig {
  owner: string;
  repo: string;
  branch: string;
  filePath: string; // e.g. "public/data.json" or "data.json"
  token: string;
  autoSyncOnSave: boolean;
}
