export type LanguageCode = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn';

export type UserRole = 'elderly' | 'caretaker' | 'family';

export type DoseStatus = 'pending' | 'said_taken' | 'verified_taken' | 'missed';

export type FoodTiming = 'with_food' | 'without_food' | 'either';

export type PillColor = 'white' | 'yellow' | 'pink' | 'blue' | 'amber' | 'teal' | 'green';

export type PillShape = 'round' | 'oval' | 'capsule';

export type MoodValue = 'happy' | 'calm' | 'tired' | 'sad' | 'unwell';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  times: string[]; // 24h HH:MM e.g. ['08:00', '20:00']
  foodTiming: FoodTiming;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD or '' for ongoing
  pillColor: PillColor;
  pillShape: PillShape;
  stockCount: number;
  lowStockThreshold: number;
  purpose: string;
  sideEffects: string[];
  routineCue: string; // For dementia-friendly mode e.g. 'After breakfast'
  safeWindowHours: number; // Double-dose protection window
}

export interface DoseLog {
  id: string;
  medicationId: string;
  date: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  status: DoseStatus;
  confirmedAt?: string; // ISO timestamp
  verifiedAt?: string; // ISO timestamp
  verifiedBy?: 'caretaker' | 'photo' | 'pillbox_sensor';
  verificationNote?: string;
  suspiciousFlag?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
}

export interface CareAlert {
  id: string;
  type:
    | 'missed_dose'
    | 'escalation'
    | 'suspicious_pattern'
    | 'low_stock'
    | 'mood_trend'
    | 'health_concern'
    | 'emergency'
    | 'inactivity'
    | 'family_message'
    | 'passcode_help';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  titleKey?: string;
  messageKey?: string;
  vars?: Record<string, string | number>;
  createdAt: string;
  acknowledged: boolean;
  targetRoles: UserRole[];
}

export interface EmailLogEntry {
  id: string;
  toEmail: string;
  toName: string;
  recipientRole: UserRole;
  subject: string;
  bodyPreview: string;
  subjectKey?: string;
  bodyKey?: string;
  vars?: Record<string, string | number>;
  sentAt: string;
  triggerType: string;
}

export interface MoodLog {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodValue;
  note?: string;
  createdAt: string;
}

export interface PrivacySettings {
  shareScheduleWithFamily: boolean;
  shareProgressWithFamily: boolean;
  shareMoodWithFamily: boolean;
  shareAppointmentsWithFamily: boolean;
  askBeforeMinorAlerts: boolean;
  allowFamilyToEdit: boolean;
}

export interface AccessibilitySettings {
  textScale: 'normal' | 'large' | 'xlarge'; // 20px, 24px, 28px
  highContrast: boolean;
  dementiaFriendlyMode: boolean;
  voiceRemindersEnabled: boolean;
  customVoiceMessageDataUrl?: string;
  customVoiceSenderName?: string;
}

export interface CareMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  relation?: string;
  phone?: string;
  joinedAt: string;
}

export interface FamilyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
}

export interface ElderlyProfile {
  name: string;
  honorificName: string;
  age: number;
  bloodGroup?: string;
  conditions: string[];
  allergies: string[];
  emergencyPhone: string;
  doctorName?: string;
  doctorPhone?: string;
  familyContacts?: FamilyContact[];
  locationLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  triageLevel?: 'NONE' | 'MILD' | 'CONCERNING' | 'EMERGENCY';
}

export type SymptomCategory =
  | 'pain'
  | 'dizziness'
  | 'fatigue'
  | 'digestion'
  | 'breathing'
  | 'sleep'
  | 'other';

export interface DoctorNote {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category: SymptomCategory;
  text: string;
  createdAt: string; // ISO timestamp
}

export interface CareCircleState {
  isSetupComplete: boolean;
  isDemoMode: boolean;
  passcode: string;
  language: LanguageCode;
  activeUserId: string;
  elderly: ElderlyProfile;
  members: CareMember[];
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: Appointment[];
  alerts: CareAlert[];
  emailLogs: EmailLogEntry[];
  moodLogs: MoodLog[];
  doctorNotes: DoctorNote[];
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
  chatHistory: ChatMessage[];
  lastActivityAt: string;
}
