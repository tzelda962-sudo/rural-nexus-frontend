export interface ProgramArea {
  id: string;
  code: string; // e.g., 'PA1'
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  icon: string;
  colorTheme: string;
  sdgs: { code: string, title: string, color: string }[];
  initiatives: { title: string, desc: string }[];
  keyActivities?: string[];
}
