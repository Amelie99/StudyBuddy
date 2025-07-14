import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Users, Users2, MessageSquare, UserCircle, CalendarDays, Settings, Search } from 'lucide-react';

export const HAW_LANDSHUT_EMAIL_DOMAIN = '@stud.haw-landshut.de';
export const PRIVACY_POLICY_URL = 'https://www.haw-landshut.de/datenschutz.html';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSubpaths?: boolean;
}

export const NAV_ITEMS_CONFIG: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchSubpaths: false },
  { href: '/partner-finden', label: 'Buddies finden', icon: Search, matchSubpaths: false },
  { href: '/partner-gruppen', label: 'Buddies & Gruppen', icon: Users, matchSubpaths: true },
  { href: '/chats', label: 'Chats', icon: MessageSquare, matchSubpaths: true },
  { href: '/kalender', label: 'Kalender', icon: CalendarDays, matchSubpaths: true },
  { href: '/mein-profil', label: 'Mein Profil', icon: UserCircle, matchSubpaths: false },
  { href: '/einstellungen', label: 'Einstellungen', icon: Settings, matchSubpaths: true },
];

export const lerninteressenOptions = [
  { id: 'klausurvorbereitung', label: 'Klausurvorbereitung' },
  { id: 'hausaufgabenhilfe', label: 'Hausaufgabenhilfe' },
  { id: 'tiefverstaendnis', label: 'Tiefgehendes Verständnis' },
  { id: 'lerngruppefinden', label: 'Lerngruppe finden' },
  { id: 'projektarbeit', label: 'Projektarbeit' },
  { id: 'sprachaustausch', label: 'Sprachaustausch' },
];

export const lernstilOptions = [
  { id: 'visuell', label: 'Visuell' },
  { id: 'diskussion', label: 'Diskussion' },
  { id: 'durchuebung', label: 'Durch Übung' },
  { id: 'auditiv', label: 'Auditiv' },
  { id: 'lesenSchreiben', label: 'Lesen/Schreiben' },
];

export const verfuegbarkeitOptions = [
  { id: 'wochentags', label: 'Wochentags' },
  { id: 'wochenende', label: 'Wochenende' },
  { id: 'abends', label: 'Abends' },
  { id: 'flexibel', label: 'Flexibel' },
];

export const studiengangOptions = [
  { id: "informatik", label: "Informatik" },
  { id: "sozialeArbeit", label: "Soziale Arbeit" },
  { id: "masterElektrotechnik", label: "Master Elektrotechnik" },
  { id: "bwl", label: "Betriebswirtschaft (BWL)" },
  { id: "wirtschaftsingenieurwesen", label: "Wirtschaftsingenieurwesen" },
  { id: "maschinenbau", label: "Maschinenbau" },
  { id: "anderer", label: "Anderer Studiengang" },
];

export const semesterOptions = Array.from({ length: 10 }, (_, i) => ({
  id: (i + 1).toString(),
  label: `${i + 1}. Semester`,
}));
