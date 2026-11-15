import { LanguageCode } from '../types';

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechLocale: string;
  honorificSuffix: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-IN', honorificSuffix: 'ji' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN', honorificSuffix: 'जी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN', honorificSuffix: 'जी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN', honorificSuffix: 'அவர்களே' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN', honorificSuffix: 'గారు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN', honorificSuffix: 'জি' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN', honorificSuffix: 'જી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN', honorificSuffix: 'ಅವರೇ' },
];

export interface TranslationDict {
  brandName: string;
  tagline: string;
  chooseLanguage: string;
  orWord: string;
  demoModeBtn: string;
  demoModeDesc: string;
  freshSetupBtn: string;
  freshSetupDesc: string;
  featurePrivacy: string;
  featureVerification: string;
  featureCircle: string;
  emailLabel: string;
  nameLabel: string;
  chooseRoleTitle: string;
  roleElderly: string;
  roleElderlyDesc: string;
  roleCaretaker: string;
  roleCaretakerDesc: string;
  roleFamily: string;
  roleFamilyDesc: string;
  relationOptional: string;
  passcodeLabel: string;
  enterPasscodePlaceholder: string;
  yourCirclePasscode: string;
  sharePasscodeHint: string;
  passcodeCreatedNote: string;
  passcodeJoinTip: string;
  continueBtn: string;
  backBtn: string;
  ageLabel: string;
  conditionsLabel: string;
  allergiesLabel: string;
  greetingMorning: string;
  greetingAfternoon: string;
  greetingEvening: string;
  nextMedicineLabel: string;
  allDoneToday: string;
  allDoneSubtitle: string;
  todaysSchedule: string;
  readAloud: string;
  iHaveTakenIt: string;
  verifyWithPhoto: string;
  withFood: string;
  withoutFood: string;
  eitherFood: string;
  tabToday: string;
  tabProgress: string;
  tabAppointments: string;
  tabTalk: string;
  tabEmergency: string;
  tabDashboard: string;
  tabMedications: string;
  tabAlerts: string;
  tabCalendar: string;
  tabOverview: string;
  tabSettings: string;
  talkToSatiTitle: string;
  tapMicHint: string;
  listeningNow: string;
  satiSpeaking: string;
  satiThinking: string;
  voiceOn: string;
  voiceOff: string;
  listenAgain: string;
  askAnythingPlaceholder: string;
  sendBtn: string;
  quickPrompt1: string;
  quickPrompt2: string;
  quickPrompt3: string;
  quickPrompt4: string;
  progressBestWeek: string;
  streakLabel: string;
  daysWord: string;
  dosesTakenLabel: string;
  gentleEncouragement: string;
  moodTitle: string;
  moodHappy: string;
  moodCalm: string;
  moodTired: string;
  moodSad: string;
  moodUnwell: string;
  dailyTipTitle: string;
  preparingTip: string;
  upcomingAppointments: string;
  shareDoctorReport: string;
  doctorReportHeading: string;
  preparingReport: string;
  privacyTitle: string;
  shareSchedule: string;
  shareProgress: string;
  shareMood: string;
  shareAppointments: string;
  askBeforeMinorAlerts: string;
  allowFamilyEdit: string;
  accessibilityTitle: string;
  textSizeLabel: string;
  textNormal: string;
  textLarge: string;
  textXLarge: string;
  highContrastLabel: string;
  dementiaModeLabel: string;
  dementiaModeDesc: string;
  reminderPreviewsTitle: string;
  statusPending: string;
  statusSaidTaken: string;
  statusVerifiedTaken: string;
  statusMissed: string;
  verifyInPerson: string;
  pillboxBtn: string;
  markMissedBtn: string;
  editBtn: string;
  addMedication: string;
  scanPrescription: string;
  addAppointment: string;
  activityTimeline: string;
  alertsFeed: string;
  allClearAlerts: string;
  acknowledgedWord: string;
  emailLogTitle: string;
  emailSentTo: string;
  smtpReadyNote: string;
  weeklyReportBtn: string;
  copyForDoctor: string;
  emergencyTitle: string;
  emergencySubtitle: string;
  callingAmbulance: string;
  connectedWord: string;
  sharingLocation: string;
  circleNotified: string;
  inAppEmailDispatched: string;
  cancelEmergency: string;
  medicalSummaryForResponders: string;
  patientWord: string;
  allergiesWord: string;
  noneReported: string;
  healthConditionsWord: string;
  activeMedicationsWord: string;
  areYouOkayTitle: string;
  inactivityDesc: string;
  imOkayBtn: string;
  iNeedHelpBtn: string;
  doubleDoseWarningTitle: string;
  doubleDoseBlockedMsg: string;
  doseConfirmedSpoken: string;
  saveBtn: string;
  cancelBtn: string;
  deleteBtn: string;
  refillNeeded: string;
  leftWord: string;
  switchRole: string;
  roleElderShort: string;
  roleCaretakerShort: string;
  roleFamilyShort: string;
  logoutReset: string;
  recordFamilyVoice: string;
  recordFamilyVoiceDesc: string;
  recordVoiceBtn: string;
  stopRecordingBtn: string;
  uploadAudioBtn: string;
  previewVoiceBtn: string;
  playVoiceReminder: string;
  calendarTitle: string;
  monthView: string;
  dayView: string;
  noAppointments: string;
  noDosesForDate: string;
  reminderBannerTitle: string;
  reminderStage0: string;
  reminderStage1: string;
  reminderStage2: string;
  reminderStage3: string;
  fastForward10m: string;
  snoozeBtn: string;
  testReminderBtn: string;
  testInactivityBtn: string;
  medicineNameLabel: string;
  doseLabel: string;
  timesPerDayLabel: string;
  foodTimingLabel: string;
  stockCountLabel: string;
  pillColorLabel: string;
  pillShapeLabel: string;
  routineCueLabel: string;
  simplePurposeLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  doctorNameLabel: string;
  specialtyLabel: string;
  clinicLabel: string;
  dateLabel: string;
  timeLabel: string;
  visitNotesLabel: string;
  viewEmailLog: string;
  privacyBlockedNotice: string;
  copiedNotice: string;
  acknowledgeBtn: string;
  careCircleHeading: string;
  passcodeWord: string;
  todaysDosesTitle: string;
  scheduledWord: string;
  confirmedWord: string;
  familyOverviewHeading: string;
  editingPermitted: string;
  viewOnlyPrivacy: string;
  weeklyAdherenceLabel: string;
  todayWord: string;
  dosesWord: string;
  doctorReportCardTitle: string;
  todaysMedSchedule: string;
  wellbeingMoodTitle: string;
  latestCheckIn: string;
  noMoodRecorded: string;
  uploadPhotoBtn: string;
  scanningText: string;
  scanHelpText: string;
  checkInteractionsDesc: string;
  checkInteractionsBtn: string;
  showTabletHint: string;
  takeOrChoosePhoto: string;
  satiLookingGently: string;
  spokenReminderTemplate: string;
  spokenRepeatTemplate: string;
  emergencySpokenMsg: string;
  initialChatWelcome: string;
  alertRefillTitle: string;
  alertRefillMsg: string;
  alertPatternTitle: string;
  alertPatternMsg: string;
  alertEmergencyTitle: string;
  alertEmergencyMsg: string;
  alertHealthTitle: string;
  alertEscalationCaretakerTitle: string;
  alertEscalationCaretakerMsg: string;
  alertEscalationFamilyTitle: string;
  alertEscalationFamilyMsg: string;
  alertInactivityTitle: string;
  alertInactivityMsg: string;
  alertMoodTitle: string;
  alertMoodMsg: string;
  alertSuspiciousTitle: string;
  alertSuspiciousMsg: string;
  alertMissedTitle: string;
  alertMissedMsg: string;
  demoControlsTitle: string;
  demoControlsSubtitle: string;
  demoControlsHint: string;
  demoMissedDoseBtn: string;
  demoMissedDoseDesc: string;
  demoDoubleDoseBtn: string;
  demoDoubleDoseDesc: string;
  demoEmergencyBtn: string;
  demoEmergencyDesc: string;
  demoSuspiciousBtn: string;
  demoSuspiciousDesc: string;
  demoSuspiciousFlagText: string;
  demoEmergencyReason: string;
  noMedicinesYetTitle: string;
  noMedicinesYetDesc: string;
  noDosesToday: string;
  noEmailsYet: string;
  noTimelineYet: string;
  noProgressYet: string;
  errMissingNameEmail: string;
  defaultRoutineCue: string;
  colorWhite: string;
  colorYellow: string;
  colorPink: string;
  colorBlue: string;
  colorAmber: string;
  colorTeal: string;
  colorGreen: string;
  shapeRound: string;
  shapeOval: string;
  shapeCapsule: string;
  monthCalendarTitle: string;
  tapDayPrompt: string;
  legendAllTaken: string;
  legendPartial: string;
  legendMissed: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  adherenceTrendTitle: string;
  last14Days: string;
  last30Days: string;
  averageAdherenceWord: string;
  weeklyBarTitle: string;
  perMedicineTitle: string;
  takenOfTotal: string;
  missedCountLabel: string;
  verifiedShareLabel: string;
  mostMissedTimesTitle: string;
  windowMorning: string;
  windowAfternoon: string;
  windowEvening: string;
  windowNight: string;
  missedInsightSummary: string;
  missedPeakSlot: string;
  missedInsightTip: string;
  noMissedInsight: string;
  streakCounterTitle: string;
  bestStreakLabel: string;
  thirtyDayAdherenceLabel: string;
  verificationRateLabel: string;
  alertsTimelineTitle: string;
  todayProgressLabel: string;
  noAnalyticsYet: string;
  nextAppointmentTitle: string;
  countdownToday: string;
  countdownTomorrow: string;
  countdownInDays: string;
  countdownPassed: string;
  notesLabel: string;
  placeLabel: string;
  tellDoctorBtn: string;
  tellDoctorDesc: string;
  tellDoctorModalTitle: string;
  tellDoctorListeningHint: string;
  tellDoctorPlaceholder: string;
  tellDoctorTapToSpeak: string;
  tellDoctorStopListening: string;
  tellDoctorSaveBtn: string;
  tellDoctorSaving: string;
  tellDoctorSavedToast: string;
  tellDoctorSpokenConfirm: string;
  doctorNotesSectionTitle: string;
  noDoctorNotesYet: string;
  symptomCatPain: string;
  symptomCatDizziness: string;
  symptomCatFatigue: string;
  symptomCatDigestion: string;
  symptomCatBreathing: string;
  symptomCatSleep: string;
  symptomCatOther: string;
  allIsWellTitle: string;
  allIsWellMorningDone: string;
  allIsWellSoFarDone: string;
  allIsWellNoDosesYet: string;
  oneDoseLateTitle: string;
  oneDoseLateMsg: string;
  escalatedConsecutiveTitle: string;
  escalatedConsecutiveMsg: string;
  alertConsecutiveMissedTitle: string;
  alertConsecutiveMissedMsg: string;
  micPermissionTitle: string;
  micPermissionPromptDesc: string;
  micWhyDetail: string;
  allowMicBtn: string;
  checkingMicBtn: string;
  micDeniedTitle: string;
  micDeniedMsg: string;
  micBlockedStepsTitle: string;
  micBlockedStep1: string;
  micBlockedStep2: string;
  micBlockedStep3: string;
  micUnavailableMsg: string;
  retryMicBtn: string;
  liveTranscriptLabel: string;
  speakNowPlaceholder: string;
  stopAndSendBtn: string;
  cancelVoiceBtn: string;
  textFallbackLabel: string;
  micNoSpeechMsg: string;
  micAudioErrorMsg: string;
  micNetworkErrorMsg: string;
  speechSynthUnavailableMsg: string;
  voiceErrorReasonLabel: string;
  recordingWavLabel: string;
  recordingAutoStopHint: string;
  processingVoiceLabel: string;
  satiHeardLabel: string;
  tryAgainVoiceBtn: string;
  fallbackVoiceLargeTextNote: string;
  wakePhraseBadge: string;
  latestReplyBannerLabel: string;
  voiceRemindersLabel: string;
  copyPasscodeBtn: string;
  copiedPasscodeWord: string;
  sideEffectsLabel: string;
  invalidTimesError: string;
  fillMedBtnLabel: string;
  removeVoiceBtn: string;
  voiceRecordError: string;
  confirmResetTitle: string;
  confirmResetDesc: string;
  confirmResetBtn: string;
  demoAddMedFirstNotice: string;
  howSatiWorksBtn: string;
  howSatiWorksTitle: string;
  howSatiWorksSubtitle: string;
  howStep1Title: string;
  howStep1Desc: string;
  howStep2Title: string;
  howStep2Desc: string;
  howStep3Title: string;
  howStep3Desc: string;
  howStep4Title: string;
  howStep4Desc: string;
  howStep5Title: string;
  howStep5Desc: string;
  howAccessibilityTitle: string;
  howAccessibilityDesc: string;
  howSatiWorksCtaDemo: string;
  skipToMainContent: string;
  primaryNavLabel: string;
  mobileNavLabel: string;
  pillGraphicAlt: string;
  pillGraphicForMedAlt: string;
  defaultMedPurpose: string;
  defaultSpecialty: string;
  defaultClinic: string;
  namePlaceholder: string;
  conditionsPlaceholder: string;
  allergiesPlaceholder: string;
  relationCaretakerPlaceholder: string;
  relationFamilyPlaceholder: string;
  geminiErrorChat: string;
  geminiErrorScan: string;
  geminiErrorInteraction: string;
  geminiErrorPhoto: string;
  offlineReportNote: string;
  emailFilterAll: string;
  emailFilterReminders: string;
  emailFilterAlerts: string;
  emailFilterAppointments: string;
  emailTypeDoseReminder: string;
  emailTypeAppointmentReminder: string;
  emailTypeMissedDose: string;
  emailTypeLowStock: string;
  emailTypeEscalation: string;
  emailTypeEmergency: string;
  emailTypeSuspiciousPattern: string;
  emailTypeMoodTrend: string;
  emailTypeHealthConcern: string;
  emailTypeInactivity: string;
  emailReminderSubject: string;
  emailReminderBody: string;
  emailAppointmentSubject: string;
  emailAppointmentBody: string;
  emailEmergencySubject: string;
  emailEmergencyBody: string;
  emailHealthSubject: string;
  emailHealthBody: string;
  emailEscalationCaretakerSubject: string;
  emailEscalationCaretakerBody: string;
  emailEscalationFamilySubject: string;
  emailEscalationFamilyBody: string;
  emailInactivitySubject: string;
  emailInactivityBody: string;
  emailSuspiciousSubject: string;
  emailSuspiciousBody: string;
  emailMoodSubject: string;
  emailMoodBody: string;
  suspiciousEarlyFlag: string;
  suspiciousLateNightFlag: string;
  medNamePlaceholder: string;
  medDosePlaceholder: string;
  medCuePlaceholder: string;
  medPurposePlaceholder: string;
  medSideEffectsPlaceholder: string;
  apptDoctorPlaceholder: string;
  apptSpecialtyPlaceholder: string;
  apptClinicPlaceholder: string;
  apptNotesPlaceholder: string;
  medicalIdBtn: string;
  medicalIdTitle: string;
  medicalIdSubtitle: string;
  bloodGroupLabel: string;
  notSpecifiedWord: string;
  doctorContactLabel: string;
  doctorPhoneLabel: string;
  familyContactsLabel: string;
  callFamilyBtn: string;
  callDoctorBtn: string;
  callContactBtn: string;
  callingBannerText: string;
  noPhoneAddedNote: string;
  medicalIdEditTitle: string;
  medicalIdEditDesc: string;
  medicalIdSavedToast: string;
  addContactBtn: string;
  contactNamePlaceholder: string;
  contactRelationPlaceholder: string;
  contactPhonePlaceholder: string;
  conditionsCommaHint: string;
  allergiesCommaHint: string;
  emergencyPhoneLabel: string;
  closeBtn: string;
  undoDoseBtn: string;
  dismissBtn: string;
  doseUndoneBanner: string;
  takenTodayHeading: string;
  tagForSugar: string;
  tagForBP: string;
  tagForHeart: string;
  tagForBones: string;
  tagForStomach: string;
  tagForSleep: string;
  tagForHealth: string;
  tagTakeAfterFood: string;
  tagTakeAfterBreakfast: string;
  tagTakeAfterLunch: string;
  tagTakeAfterDinner: string;
  tagTakeBeforeFood: string;
  tagTakeBeforeBreakfast: string;
  tagTakeBeforeSleep: string;
  tagTakeAnytime: string;
  plainConditionSugar: string;
  plainConditionBP: string;
  plainConditionHeart: string;
  plainConditionJoints: string;
  familyMsgSentConfirm: string;
  familyMsgAlertTitle: string;
  familyMsgEmailSubject: string;
  familyMsgEmailBody: string;
  emailTypeFamilyMessage: string;
  pinDigitEnteredToast: string;
  pinDigitSpokenWord: string;
  pinBackspaceBtn: string;
  pinClearBtn: string;
  forgotPasscodeBtn: string;
  forgotPasscodeSentTitle: string;
  forgotPasscodeSentDesc: string;
  passcodeHelpAlertTitle: string;
  passcodeHelpAlertMsg: string;
  passcodeHelpEmailSubject: string;
  passcodeHelpEmailBody: string;
  emailTypePasscodeHelp: string;
}

const en: TranslationDict = {
  brandName: 'Sati',
  tagline: 'Warm, voice-first care that keeps elders at the heart of every decision.',
  chooseLanguage: 'Choose your language',
  orWord: 'or',
  demoModeBtn: 'Explore Demo Mode (Ramesh Sharma)',
  demoModeDesc: 'Pre-loaded with Ramesh ji (72), Caretaker Priya, Son Aditya, and 7 days of history.',
  freshSetupBtn: 'Start Fresh Care Circle',
  freshSetupDesc: 'Create a new elderly profile or join an existing circle with a 6-digit passcode.',
  featurePrivacy: 'Elder-led privacy',
  featureVerification: 'Honest verification',
  featureCircle: '6-digit care circle',
  emailLabel: 'Email address',
  nameLabel: 'Full name',
  chooseRoleTitle: 'Who are you in this care circle?',
  roleElderly: 'I am the elderly person',
  roleElderlyDesc: 'Large clear screens, voice companion Sati, and full privacy control.',
  roleCaretaker: 'I am a caretaker',
  roleCaretakerDesc: 'Verify doses, manage medicines, scan prescriptions, and track alerts.',
  roleFamily: 'I am a family member',
  roleFamilyDesc: 'Calm weekly summaries, doctor reports, and gentle updates.',
  relationOptional: 'Relation (optional)',
  passcodeLabel: '6-digit Care Circle Passcode',
  enterPasscodePlaceholder: 'Enter 6-digit code',
  yourCirclePasscode: 'Your Care Circle Passcode',
  sharePasscodeHint: 'Share this code with trusted family and caretakers so they can join.',
  passcodeCreatedNote:
    'Once created, Sati will generate your private 6-digit passcode so trusted family or caretakers can join.',
  passcodeJoinTip: 'Tip: To try joining Ramesh Sharma’s demo circle, enter',
  continueBtn: 'Continue',
  backBtn: 'Back',
  ageLabel: 'Age',
  conditionsLabel: 'Health conditions (comma separated)',
  allergiesLabel: 'Allergies (comma separated)',
  greetingMorning: 'Good morning',
  greetingAfternoon: 'Good afternoon',
  greetingEvening: 'Good evening',
  nextMedicineLabel: 'Your next medicine',
  allDoneToday: 'All medicines for now are complete',
  allDoneSubtitle: 'Take a peaceful rest. Sati will gently remind you when the next dose is due.',
  todaysSchedule: 'Today’s Schedule',
  readAloud: 'Read aloud',
  iHaveTakenIt: 'I have taken it',
  verifyWithPhoto: 'Confirm with a quick photo',
  withFood: 'Take with food',
  withoutFood: 'Take on empty stomach',
  eitherFood: 'With or without food',
  tabToday: 'Today',
  tabProgress: 'My Progress',
  tabAppointments: 'Visits',
  tabTalk: 'Talk to Sati',
  tabEmergency: 'Emergency',
  tabDashboard: 'Doses',
  tabMedications: 'Medicines',
  tabAlerts: 'Alerts',
  tabCalendar: 'Calendar',
  tabOverview: 'Overview',
  tabSettings: 'Settings',
  talkToSatiTitle: 'Talk to Sati',
  tapMicHint: 'Tap the microphone or say "Hey Sati"',
  listeningNow: 'Listening warmly...',
  satiSpeaking: 'Sati is speaking...',
  satiThinking: 'Sati is thinking gently...',
  voiceOn: 'Voice On',
  voiceOff: 'Voice Off',
  listenAgain: 'Listen again',
  askAnythingPlaceholder: 'Type or speak to Sati...',
  sendBtn: 'Send',
  quickPrompt1: 'How am I doing this week?',
  quickPrompt2: 'What medicines do I take today?',
  quickPrompt3: 'When is my next appointment?',
  quickPrompt4: 'I have a mild headache',
  progressBestWeek: 'You took {taken} of {total} doses this week — your best week yet!',
  streakLabel: 'Current steady streak',
  daysWord: 'days',
  dosesTakenLabel: 'Weekly adherence',
  gentleEncouragement: 'Every steady step supports your comfort and strength.',
  moodTitle: 'How are you feeling today?',
  moodHappy: 'Happy',
  moodCalm: 'Calm',
  moodTired: 'Tired',
  moodSad: 'Low',
  moodUnwell: 'Unwell',
  dailyTipTitle: 'Today’s gentle wellness tip',
  preparingTip: 'Preparing a warm tip for you...',
  upcomingAppointments: 'Upcoming doctor visits',
  shareDoctorReport: 'Share adherence report with doctor',
  doctorReportHeading: 'Doctor Adherence Summary',
  preparingReport: 'Preparing...',
  privacyTitle: 'Privacy & Care Circle Control',
  shareSchedule: 'Let family see my daily medicine schedule',
  shareProgress: 'Let family see my weekly progress',
  shareMood: 'Let family see my daily mood check-ins',
  shareAppointments: 'Let family see my doctor visits',
  askBeforeMinorAlerts: 'Ask my permission before alerting family on minor delays',
  allowFamilyEdit: 'Allow family members to edit medicines or visits',
  accessibilityTitle: 'Comfort & Display',
  textSizeLabel: 'Text size',
  textNormal: 'Large (20px)',
  textLarge: 'Larger (24px)',
  textXLarge: 'Extra Large (28px)',
  highContrastLabel: 'High-contrast mode',
  dementiaModeLabel: 'Dementia-friendly mode',
  dementiaModeDesc: 'Simpler cards tied to daily routines ("After breakfast") and gentle repeated prompts.',
  reminderPreviewsTitle: 'Reminder & Check-in Previews',
  statusPending: 'Pending',
  statusSaidTaken: 'Said Taken',
  statusVerifiedTaken: 'Verified Taken',
  statusMissed: 'Missed',
  verifyInPerson: 'Verify in person',
  pillboxBtn: 'Pillbox',
  markMissedBtn: 'Mark Missed',
  editBtn: 'Edit',
  addMedication: 'Add medicine',
  scanPrescription: 'Scan prescription',
  addAppointment: 'Add appointment',
  activityTimeline: 'Activity timeline',
  alertsFeed: 'Alerts & patterns',
  allClearAlerts: 'All clear — no alerts right now.',
  acknowledgedWord: 'Acknowledged',
  emailLogTitle: 'Simulated Email Log',
  emailSentTo: 'Email sent to',
  smtpReadyNote: 'Ready for SMTP / SendGrid webhook integration',
  weeklyReportBtn: 'Generate Weekly Doctor Report',
  copyForDoctor: 'Copy for doctor',
  emergencyTitle: 'Emergency Support Active',
  emergencySubtitle: 'Stay calm. Help is on the way and your care circle has been alerted.',
  callingAmbulance: 'Dialing Ambulance 108',
  connectedWord: 'Connected',
  sharingLocation: 'Sharing live location',
  circleNotified: 'Caretaker & family notified with medical profile',
  inAppEmailDispatched: 'In-app + Email dispatched',
  cancelEmergency: 'I am safe — close emergency screen',
  medicalSummaryForResponders: 'Medical Summary for Responders',
  patientWord: 'Patient',
  allergiesWord: 'Allergies',
  noneReported: 'None reported',
  healthConditionsWord: 'Health Conditions',
  activeMedicationsWord: 'Active Medications',
  areYouOkayTitle: 'Gentle check-in: Are you okay?',
  inactivityDesc:
    'Sati has not heard from you for a while today. Please tap a button so we know you are comfortable.',
  imOkayBtn: 'Yes, I am okay',
  iNeedHelpBtn: 'I need help',
  doubleDoseWarningTitle: 'Gentle double-dose check',
  doubleDoseBlockedMsg: 'You already took {med} at {lastTime}, so please wait until {nextTime}.',
  doseConfirmedSpoken: 'Well done, {name}. {med} is marked as taken.',
  saveBtn: 'Save',
  cancelBtn: 'Cancel',
  deleteBtn: 'Remove',
  refillNeeded: 'Low stock — refill soon',
  leftWord: 'left',
  switchRole: 'Switch View',
  roleElderShort: 'Elder',
  roleCaretakerShort: 'Caretaker',
  roleFamilyShort: 'Family',
  logoutReset: 'Reset / Welcome',
  recordFamilyVoice: 'Record family voice reminder',
  recordFamilyVoiceDesc:
    'Record a warm message that plays as a comforting reminder when Dementia-friendly mode is on.',
  recordVoiceBtn: 'Record Voice',
  stopRecordingBtn: 'Stop Recording',
  uploadAudioBtn: 'Upload Audio',
  previewVoiceBtn: 'Preview saved family voice',
  playVoiceReminder: 'Play family voice',
  calendarTitle: 'Care Calendar',
  monthView: 'Month',
  dayView: 'Day',
  noAppointments: 'No upcoming visits scheduled.',
  noDosesForDate: 'No medication doses logged for this date.',
  reminderBannerTitle: 'Gentle medicine reminder',
  reminderStage0: 'Initial gentle prompt',
  reminderStage1: '10-minute gentle repeat',
  reminderStage2: 'Caretaker notified (in-app + email)',
  reminderStage3: 'Family members notified (in-app + email)',
  fastForward10m: 'Fast-forward +10m',
  snoozeBtn: 'Remind in 10 min',
  testReminderBtn: 'Simulate Dose Reminder',
  testInactivityBtn: 'Simulate Inactivity Check-in',
  medicineNameLabel: 'Medicine name',
  doseLabel: 'Dose (e.g. 500mg)',
  timesPerDayLabel: 'Times (comma separated, 24h HH:MM)',
  foodTimingLabel: 'With food or without?',
  stockCountLabel: 'Tablets in stock',
  pillColorLabel: 'Pill colour',
  pillShapeLabel: 'Pill shape',
  routineCueLabel: 'Daily routine cue (e.g. After breakfast)',
  simplePurposeLabel: 'Simple purpose',
  startDateLabel: 'Start date',
  endDateLabel: 'End date (optional)',
  doctorNameLabel: 'Doctor name',
  specialtyLabel: 'Specialty',
  clinicLabel: 'Clinic / Hospital',
  dateLabel: 'Date',
  timeLabel: 'Time',
  visitNotesLabel: 'Visit notes',
  viewEmailLog: 'Email Log',
  privacyBlockedNotice: 'This section is kept private by your loved one.',
  copiedNotice: 'Copied report summary for sharing.',
  acknowledgeBtn: 'Acknowledge',
  careCircleHeading: 'Care Circle',
  passcodeWord: 'Passcode',
  todaysDosesTitle: 'Today’s Doses & Verification',
  scheduledWord: 'Scheduled',
  confirmedWord: 'Confirmed',
  familyOverviewHeading: 'Family Overview',
  editingPermitted: 'Editing permitted by elder',
  viewOnlyPrivacy: 'View-only (elder-led privacy)',
  weeklyAdherenceLabel: 'Weekly Adherence',
  todayWord: 'Today',
  dosesWord: 'doses',
  doctorReportCardTitle: 'Doctor-Shareable Weekly Report',
  todaysMedSchedule: 'Today’s Medicine Schedule',
  wellbeingMoodTitle: 'Wellbeing & Mood',
  latestCheckIn: 'Latest check-in',
  noMoodRecorded: 'No mood check-ins recorded yet.',
  uploadPhotoBtn: 'Upload / Photo',
  scanningText: 'Scanning...',
  scanHelpText: 'Upload or capture a prescription or blister strip; Gemini Vision fills the details.',
  checkInteractionsDesc: 'Check interactions with current medicines, allergies & food',
  checkInteractionsBtn: 'Check Interactions',
  showTabletHint: 'Show the tablet in your hand or the empty blister pack slot.',
  takeOrChoosePhoto: 'Take or Choose Photo',
  satiLookingGently: 'Sati is looking gently...',
  spokenReminderTemplate: '{name}, it is time for {med} {dose}, {cue}.',
  spokenRepeatTemplate: 'Gentle reminder, {name}: please take {med} {dose}.',
  emergencySpokenMsg:
    'I am calling for help right now, {name}. Please stay calm and sit safely. Emergency services (108) and your care circle are being alerted immediately.',
  initialChatWelcome:
    'Namaste {name}. I am Sati, your care companion. You have already taken your morning medicines today. How are you feeling?',
  alertRefillTitle: 'Refill needed: {med}',
  alertRefillMsg: 'Only {count} tablets remain. Please arrange a pharmacy refill soon.',
  alertPatternTitle: 'Pattern check: Evening Atorvastatin',
  alertPatternMsg:
    'Atorvastatin (21:30) was missed twice in the past 6 days. Consider gently reviewing bedtime routine together.',
  alertEmergencyTitle: 'EMERGENCY: {name} needs immediate assistance',
  alertEmergencyMsg: '{reason}. Ambulance 108 initiated and live location shared.',
  alertHealthTitle: 'Health check-in advised for {name}',
  alertEscalationCaretakerTitle: 'No response yet: {med}',
  alertEscalationCaretakerMsg:
    '{name} has not confirmed their dose after 10 minutes. Caretaker alerted.',
  alertEscalationFamilyTitle: 'Family Escalation: {med}',
  alertEscalationFamilyMsg: 'Still awaiting confirmation for {name}. Family members have been notified.',
  alertInactivityTitle: 'No reply to "Are you okay?" check-in',
  alertInactivityMsg:
    "{name} did not respond to Sati's wellness check-in. Please call or visit immediately.",
  alertMoodTitle: "Gentle family note: {name}'s mood",
  alertMoodMsg:
    '{name} has shared feeling low or unwell recently. A warm phone call or visit could brighten their day.',
  alertSuspiciousTitle: 'Gentle verification suggested: {med}',
  alertSuspiciousMsg: '{flag}. Sati suggests gently double-checking together.',
  alertMissedTitle: 'Missed dose: {med} ({time})',
  alertMissedMsg: '{name} missed their {time} dose of {med}. Caretaker and family have been notified.',
  demoControlsTitle: 'Presentation Demo Controls',
  demoControlsSubtitle: 'Trigger live care circle events with one tap.',
  demoControlsHint: 'Shortcut: Ctrl/Cmd + Shift + D or triple-tap the Sati logo',
  demoMissedDoseBtn: 'Trigger Missed Dose',
  demoMissedDoseDesc: 'Marks a scheduled dose missed, notifies caretaker & logs email.',
  demoDoubleDoseBtn: 'Trigger Double-Dose Attempt',
  demoDoubleDoseDesc: 'Attempts a second dose early; Sati blocks it & speaks gently.',
  demoEmergencyBtn: 'Trigger Emergency',
  demoEmergencyDesc: 'Opens Ambulance 108 overlay, speaks guidance & alerts circle.',
  demoSuspiciousBtn: 'Trigger Suspicious Pattern',
  demoSuspiciousDesc: 'Logs a 02:47 AM odd-hour confirmation & flags gentle review.',
  demoSuspiciousFlagText: 'Confirmed at 02:47 AM — unusual hour before morning reminder',
  demoEmergencyReason: 'Live demo: Sudden dizziness & SOS triggered',
  noMedicinesYetTitle: 'No medicines added yet',
  noMedicinesYetDesc: 'Add your first medicine or ask your caretaker to scan a prescription.',
  noDosesToday: 'No doses scheduled for today yet. Add a medicine to begin tracking.',
  noEmailsYet: 'No simulated emails sent yet.',
  noTimelineYet: 'No dose activity recorded today yet.',
  noProgressYet: 'Your progress story will appear here once daily doses begin.',
  errMissingNameEmail: 'Please enter both your name and email address.',
  defaultRoutineCue: 'After breakfast',
  colorWhite: 'White',
  colorYellow: 'Yellow',
  colorPink: 'Pink',
  colorBlue: 'Blue',
  colorAmber: 'Amber',
  colorTeal: 'Teal',
  colorGreen: 'Green',
  shapeRound: 'Round',
  shapeOval: 'Oval',
  shapeCapsule: 'Capsule',
  monthCalendarTitle: 'Monthly Adherence Calendar',
  tapDayPrompt: 'Tap any day to inspect scheduled & logged doses',
  legendAllTaken: 'All taken',
  legendPartial: 'Partial',
  legendMissed: 'Missed',
  prevMonthLabel: 'Previous month',
  nextMonthLabel: 'Next month',
  adherenceTrendTitle: 'Adherence Trend',
  last14Days: '14 Days',
  last30Days: '30 Days',
  averageAdherenceWord: 'Average',
  weeklyBarTitle: 'Weekly Bar Breakdown',
  perMedicineTitle: 'Per-Medicine Breakdown',
  takenOfTotal: '{taken} of {total} taken',
  missedCountLabel: '{count} missed',
  verifiedShareLabel: '{pct}% verified',
  mostMissedTimesTitle: 'Most-Missed Times Insight',
  windowMorning: 'Morning (05:00–11:59)',
  windowAfternoon: 'Afternoon (12:00–16:59)',
  windowEvening: 'Evening (17:00–20:59)',
  windowNight: 'Night / Bedtime (21:00–04:59)',
  missedInsightSummary: '{window} accounts for {pct}% of missed doses ({missed} of {totalMissed}).',
  missedPeakSlot: 'Most frequently skipped slot: {time}',
  missedInsightTip: 'Consider pairing this time slot with a warm routine cue or family check-in call.',
  noMissedInsight: 'Zero missed doses recorded in the past 30 days — every time window is steady.',
  streakCounterTitle: 'Steady Streak',
  bestStreakLabel: 'Best (30d): {days}d',
  thirtyDayAdherenceLabel: '30-Day Adherence',
  verificationRateLabel: 'Verified Rate',
  alertsTimelineTitle: 'Alerts Timeline',
  todayProgressLabel: 'Today’s Progress',
  noAnalyticsYet: 'Analytical charts will populate as daily doses are scheduled and logged.',
  nextAppointmentTitle: 'Next Doctor Appointment',
  countdownToday: 'Today',
  countdownTomorrow: 'Tomorrow',
  countdownInDays: 'In {days} days',
  countdownPassed: 'Past visit',
  notesLabel: 'Notes',
  placeLabel: 'Place',
  tellDoctorBtn: 'Tell the Doctor',
  tellDoctorDesc: 'Speak any symptom so it is saved for your next doctor visit.',
  tellDoctorModalTitle: 'Record a Symptom for the Doctor',
  tellDoctorListeningHint: 'Speak clearly or type below — Sati saves it with date, time, and category.',
  tellDoctorPlaceholder: 'Example: Mild ache in my left knee after my morning walk...',
  tellDoctorTapToSpeak: 'Tap to Speak',
  tellDoctorStopListening: 'Stop Listening',
  tellDoctorSaveBtn: 'Save for Doctor',
  tellDoctorSaving: 'Saving & categorizing...',
  tellDoctorSavedToast: 'Saved note for your doctor ({category}).',
  tellDoctorSpokenConfirm: 'Thank you, {name}. I have saved that note for your doctor.',
  doctorNotesSectionTitle: 'Patient Symptom Notes for the Doctor',
  noDoctorNotesYet: 'No symptom notes recorded yet.',
  symptomCatPain: 'Pain / Discomfort',
  symptomCatDizziness: 'Dizziness',
  symptomCatFatigue: 'Fatigue / Weakness',
  symptomCatDigestion: 'Digestion',
  symptomCatBreathing: 'Breathing / Cough',
  symptomCatSleep: 'Sleep',
  symptomCatOther: 'General Note',
  allIsWellTitle: 'All is well',
  allIsWellMorningDone: '{name} has taken his morning medicines',
  allIsWellSoFarDone: '{name} has taken all medicines due so far today',
  allIsWellNoDosesYet: '{name} has a calm start — no doses due yet today',
  oneDoseLateTitle: 'Gentle check',
  oneDoseLateMsg: '{name} has 1 late or missed dose ({med}) — watching gently before alerting',
  escalatedConsecutiveTitle: 'Alert escalated',
  escalatedConsecutiveMsg: '{name} missed two consecutive doses — caretaker and family have been notified',
  alertConsecutiveMissedTitle: '2 Consecutive Doses Missed',
  alertConsecutiveMissedMsg: '{name} missed two consecutive scheduled doses ({med}). Please check in right away.',
  micPermissionTitle: 'Microphone access for voice chat',
  micPermissionPromptDesc: 'Allow microphone access so Sati can hear your voice clearly and answer warmly.',
  micWhyDetail: 'Why Sati asks: audio is only captured when you tap the mic or say "Hey Sati", and stops automatically after you pause.',
  allowMicBtn: 'Allow Microphone Access',
  checkingMicBtn: 'Checking microphone...',
  micDeniedTitle: 'Microphone permission is blocked',
  micDeniedMsg: 'Please allow microphone access in your browser site settings, or use the text box below anytime.',
  micBlockedStepsTitle: 'How to turn microphone access back on:',
  micBlockedStep1: '1. Tap the lock or settings icon next to the website address bar.',
  micBlockedStep2: '2. Find "Microphone" and switch it to "Allow".',
  micBlockedStep3: '3. Tap "Check Mic Again" below or refresh this page.',
  micUnavailableMsg: 'Voice recording or recognition is not supported in this browser. You can always type to Sati below.',
  retryMicBtn: 'Check Mic Again',
  liveTranscriptLabel: 'Live transcript — listening',
  speakNowPlaceholder: 'Start speaking now — your words will appear here...',
  stopAndSendBtn: 'Stop & Send',
  cancelVoiceBtn: 'Cancel',
  textFallbackLabel: 'Type to Sati (always available)',
  micNoSpeechMsg: 'No speech was detected. Tap the microphone to try again, or type below.',
  micAudioErrorMsg: 'No working microphone was found. Please check your device or type below.',
  micNetworkErrorMsg: 'Voice recognition had a connection issue. Please try again or type below.',
  speechSynthUnavailableMsg: 'Spoken voice playback is unavailable in this browser; Sati will reply in large text.',
  voiceErrorReasonLabel: 'Error reason:',
  recordingWavLabel: 'Recording your voice — speak naturally',
  recordingAutoStopHint: 'Stops automatically ~1.5s after you finish (max 20s)',
  processingVoiceLabel: 'Sati is listening carefully to your recording...',
  satiHeardLabel: 'Sati heard:',
  tryAgainVoiceBtn: 'Not what I said? Try again',
  fallbackVoiceLargeTextNote: 'No matching native voice is installed on this device — using the best available voice and showing Sati’s reply in large text below.',
  wakePhraseBadge: 'Say "Hey Sati" or tap the mic',
  latestReplyBannerLabel: 'Sati says:',
  voiceRemindersLabel: 'Spoken medicine reminders & confirmation voice',
  copyPasscodeBtn: 'Copy code',
  copiedPasscodeWord: 'Copied!',
  sideEffectsLabel: 'Known side effects (comma separated, optional)',
  invalidTimesError: 'Please enter valid 24-hour times such as 08:00, 20:00.',
  fillMedBtnLabel: 'Fill:',
  removeVoiceBtn: 'Remove saved voice',
  voiceRecordError: 'Microphone recording is unavailable or blocked. You can upload an audio file instead.',
  confirmResetTitle: 'Return to welcome screen?',
  confirmResetDesc: 'This clears your current care circle session from this browser and returns to setup.',
  confirmResetBtn: 'Yes, Reset Session',
  demoAddMedFirstNotice: 'Please add at least one medicine first to preview this demo event.',
  howSatiWorksBtn: 'How Sati works (30-sec guide)',
  howSatiWorksTitle: 'How Sati Works',
  howSatiWorksSubtitle: 'Understand the care circle, roles, passcode access, and honest verification in 30 seconds.',
  howStep1Title: '1. The Care Circle Idea',
  howStep1Desc: 'The elder, caretakers, and family share one calm healthcare profile — with the elder always in control of privacy and permissions.',
  howStep2Title: '2. Three Tailored Roles',
  howStep2Desc: 'Elderly view keeps one big action and voice companion Sati; Caretaker view verifies doses and manages medicines; Family view offers calm summaries and doctor reports.',
  howStep3Title: '3. Private 6-Digit Passcode',
  howStep3Desc: 'Creating an elder profile generates a 6-digit code. Caretakers and family enter their email plus that passcode to join securely.',
  howStep4Title: '4. Gentle Escalation & Email Log',
  howStep4Desc: 'At dose time Sati speaks warmly. If unanswered: repeats after 10 min → alerts caretaker → after 10 more min alerts family, logging every simulated email.',
  howStep5Title: '5. Verified vs. Said-Taken',
  howStep5Desc: 'Separates "Said Taken" (elder confirmation) from "Verified Taken" (photo check, caretaker sign-off, or pillbox sensor), while blocking accidental double doses.',
  howAccessibilityTitle: '6. Accessibility & Dignity',
  howAccessibilityDesc: 'Includes Normal, Large & Extra Large text across every view, High Contrast mode, Dementia-friendly mode, 48px+ touch targets, full keyboard focus, screen-reader live announcements, reduced-motion support, and voice + text input.',
  howSatiWorksCtaDemo: 'Try Demo Mode Now',
  skipToMainContent: 'Skip to main content',
  primaryNavLabel: 'Primary navigation',
  mobileNavLabel: 'Mobile bottom navigation',
  pillGraphicAlt: '{color} {shape} pill',
  pillGraphicForMedAlt: '{color} {shape} pill for {med}',
  defaultMedPurpose: 'Daily prescribed care',
  defaultSpecialty: 'General Consultation',
  defaultClinic: 'Local Clinic',
  namePlaceholder: 'e.g. Sunita Kulkarni',
  conditionsPlaceholder: 'e.g. Diabetes, Blood Pressure',
  allergiesPlaceholder: 'e.g. Penicillin (leave blank if none)',
  relationCaretakerPlaceholder: 'Primary Nurse / Caretaker',
  relationFamilyPlaceholder: 'Daughter / Son',
  geminiErrorChat: 'Sati could not connect right now. Please try again in a moment, or check the schedule below.',
  geminiErrorScan: 'Could not scan that prescription right now. You can enter the medicine details manually below.',
  geminiErrorInteraction: 'Interaction check is unavailable right now. Please review with your doctor or pharmacist.',
  geminiErrorPhoto: 'Unable to check that photo right now. You can confirm manually or ask your caretaker.',
  offlineReportNote: 'AI summary is temporarily unavailable; generated an accurate local adherence report instead.',
  emailFilterAll: 'All',
  emailFilterReminders: 'Dose Reminders',
  emailFilterAlerts: 'Missed & Alerts',
  emailFilterAppointments: 'Appointments',
  emailTypeDoseReminder: 'Dose Reminder',
  emailTypeAppointmentReminder: 'Appointment',
  emailTypeMissedDose: 'Missed Dose',
  emailTypeLowStock: 'Refill Notice',
  emailTypeEscalation: 'Escalation',
  emailTypeEmergency: 'Emergency',
  emailTypeSuspiciousPattern: 'Pattern Check',
  emailTypeMoodTrend: 'Wellbeing Note',
  emailTypeHealthConcern: 'Health Check',
  emailTypeInactivity: 'Check-in',
  emailReminderSubject: '[Sati Reminder] Upcoming dose: {med} ({time})',
  emailReminderBody: 'Hello {recipient}, {elder} has {med} scheduled at {time} ({cue}). Sati has spoken a gentle reminder.',
  emailAppointmentSubject: '[Sati Visit Reminder] {doctor} on {date} at {time}',
  emailAppointmentBody: 'Hello {recipient}, upcoming doctor visit for {elder}: {doctor} ({specialty}) at {clinic} on {date} at {time}.',
  emailEmergencySubject: '[URGENT EMERGENCY] {elder} — Sati Alert',
  emailEmergencyBody: 'Emergency support was triggered for {elder}. Reason: {reason}. Conditions: {conditions}. Allergies: {allergies}. Location: {location}.',
  emailHealthSubject: '[Sati Care Circle] Health Check-in Needed for {elder}',
  emailHealthBody: 'Hello {recipient}, Sati noticed a health question or concern from {elder}: {reason}. Please check in warmly.',
  emailEscalationCaretakerSubject: '[Sati Escalation] Caretaker Check-in: {med}',
  emailEscalationCaretakerBody: 'Hello {recipient}, {elder} has not responded to two gentle reminders for {med}. Please check in.',
  emailEscalationFamilySubject: '[Sati Family Alert] Missed Dose Follow-up for {elder}',
  emailEscalationFamilyBody: 'Hello {recipient}, {elder} has not confirmed {med} after caretaker escalation. Please reach out kindly.',
  emailInactivitySubject: '[Sati Urgent Check-in] No response from {elder}',
  emailInactivityBody: 'Hello {recipient}, {elder} did not respond to Sati\'s "Are you okay?" check-in. Please check on them right away.',
  emailSuspiciousSubject: '[Sati] Pattern Notice: {med} confirmation',
  emailSuspiciousBody: 'Hello {recipient}, {elder}\'s {med} was marked taken ({flag}). Let\'s gently verify together.',
  emailMoodSubject: '[Sati] Gentle check-in suggestion for {elder}',
  emailMoodBody: 'Hello {recipient}, Sati noticed {elder} has felt low or unwell recently. A warm call would mean a lot.',
  suspiciousEarlyFlag: 'Confirmed {mins} minutes before scheduled reminder',
  suspiciousLateNightFlag: 'Confirmed at an unusual late hour ({time})',
  medNamePlaceholder: 'e.g. Metformin',
  medDosePlaceholder: 'e.g. 500mg',
  medCuePlaceholder: 'After breakfast',
  medPurposePlaceholder: 'Supports blood pressure',
  medSideEffectsPlaceholder: 'e.g. dizziness, mild nausea',
  apptDoctorPlaceholder: 'Dr. Meera Deshmukh',
  apptSpecialtyPlaceholder: 'Cardiology',
  apptClinicPlaceholder: 'City Wellness Clinic',
  apptNotesPlaceholder: 'Bring fasting blood sugar log',
  medicalIdBtn: 'Medical ID',
  medicalIdTitle: 'Emergency Medical ID Card',
  medicalIdSubtitle: 'One-tap access to your health details, doctor, and family contacts.',
  bloodGroupLabel: 'Blood Group',
  notSpecifiedWord: 'Not added yet',
  doctorContactLabel: 'Primary Doctor',
  doctorPhoneLabel: "Doctor's Phone",
  familyContactsLabel: 'Family Contacts',
  callFamilyBtn: 'Call Family',
  callDoctorBtn: 'Call Doctor',
  callContactBtn: 'Call',
  callingBannerText: 'Calling {name} ({phone}) now...',
  noPhoneAddedNote: 'No phone number saved yet. You can add one in Settings > Medical ID.',
  medicalIdEditTitle: 'Medical ID Profile',
  medicalIdEditDesc: 'Edit blood group, allergies, health conditions, doctor phone, and family contacts shown on your Emergency Medical ID card.',
  medicalIdSavedToast: 'Medical ID details saved.',
  addContactBtn: 'Add Family Contact',
  contactNamePlaceholder: 'Name (e.g. Aditya Sharma)',
  contactRelationPlaceholder: 'Relation (e.g. Son)',
  contactPhonePlaceholder: 'Phone (e.g. +91 98201 44510)',
  conditionsCommaHint: 'Health Conditions (separated by commas)',
  allergiesCommaHint: 'Allergies (separated by commas)',
  emergencyPhoneLabel: 'Emergency Number',
  closeBtn: 'Close',
  undoDoseBtn: "Undo, I didn’t take it yet",
  dismissBtn: 'Dismiss',
  doseUndoneBanner: 'Changed {med} back to pending. Take it whenever you are ready.',
  takenTodayHeading: 'Taken today (tap Undo if entered by mistake)',
  tagForSugar: 'For Sugar',
  tagForBP: 'For BP',
  tagForHeart: 'For Heart',
  tagForBones: 'For Bones & Strength',
  tagForStomach: 'For Stomach',
  tagForSleep: 'For Sleep',
  tagForHealth: 'For Daily Health',
  tagTakeAfterFood: 'Take AFTER food',
  tagTakeAfterBreakfast: 'Take AFTER breakfast',
  tagTakeAfterLunch: 'Take AFTER lunch',
  tagTakeAfterDinner: 'Take AFTER dinner',
  tagTakeBeforeFood: 'Take BEFORE food',
  tagTakeBeforeBreakfast: 'Take BEFORE breakfast',
  tagTakeBeforeSleep: 'Take BEFORE sleep',
  tagTakeAnytime: 'Take ANYTIME',
  plainConditionSugar: 'Sugar',
  plainConditionBP: 'High BP',
  plainConditionHeart: 'Heart Care',
  plainConditionJoints: 'Joint Comfort',
  familyMsgSentConfirm: 'I have sent a message to {recipients}: "{summary}"',
  familyMsgAlertTitle: 'Voice message from {elder} to {recipients}',
  familyMsgEmailSubject: '[Sati Message from {elder}] Note for {recipient}',
  familyMsgEmailBody: 'Hello {recipient}, {elder} asked Sati to let you know: "{summary}" (Message: "{original}").',
  emailTypeFamilyMessage: 'Family Message',
  pinDigitEnteredToast: 'Digit {count} of 6 entered',
  pinDigitSpokenWord: 'Digit entered',
  pinBackspaceBtn: 'Delete',
  pinClearBtn: 'Clear',
  forgotPasscodeBtn: 'Forgot passcode? Ask family',
  forgotPasscodeSentTitle: 'Help request sent to family',
  forgotPasscodeSentDesc: 'Sati sent an alert and simulated email asking {circle} to share the 6-digit passcode with you.',
  passcodeHelpAlertTitle: 'Passcode Help Requested by {name}',
  passcodeHelpAlertMsg: '{name} ({role}) tapped "Forgot passcode?" and asked for the 6-digit Care Circle passcode.',
  passcodeHelpEmailSubject: '[Sati Passcode Help] {name} is asking for the Care Circle passcode',
  passcodeHelpEmailBody: 'Hello {recipient}, {name} ({email}) tapped "Forgot passcode? Ask family" while joining {elder}\'s Care Circle. Please share your 6-digit passcode with them.',
  emailTypePasscodeHelp: 'Passcode Help',
};

const hi: TranslationDict = {
  brandName: 'सती (Sati)',
  tagline: 'आत्मीय और आवाज़-आधारित देखभाल, जहाँ हर निर्णय के केंद्र में बुज़ुर्ग रहते हैं।',
  chooseLanguage: 'अपनी भाषा चुनें',
  orWord: 'या',
  demoModeBtn: 'डेमो मोड देखें (रमेश शर्मा)',
  demoModeDesc: 'रमेश जी (72), देखभालकर्ता प्रिया, बेटे आदित्य और 7 दिनों के रिकॉर्ड के साथ तैयार।',
  freshSetupBtn: 'नया केयर सर्कल शुरू करें',
  freshSetupDesc: 'नया बुज़ुर्ग प्रोफ़ाइल बनाएं या 6-अंकों के पासकोड से जुड़ें।',
  featurePrivacy: 'बुज़ुर्गों का नियंत्रण',
  featureVerification: 'विश्वसनीय सत्यापन',
  featureCircle: '6-अंकों का केयर सर्कल',
  emailLabel: 'ईमेल पता',
  nameLabel: 'पूरा नाम',
  chooseRoleTitle: 'इस केयर सर्कल में आपकी भूमिका क्या है?',
  roleElderly: 'मैं बुज़ुर्ग व्यक्ति हूँ',
  roleElderlyDesc: 'बड़े स्पष्ट अक्षर, सती आवाज़ साथी और पूर्ण गोपनीयता नियंत्रण।',
  roleCaretaker: 'मैं देखभालकर्ता (केयरटेकर) हूँ',
  roleCaretakerDesc: 'दवा सत्यापित करें, दवाइयाँ जोड़ें, पर्चा स्कैन करें और अलर्ट देखें।',
  roleFamily: 'मैं परिवार का सदस्य हूँ',
  roleFamilyDesc: 'साप्ताहिक रिपोर्ट, डॉक्टर विज़िट और शांत अपडेट देखें।',
  relationOptional: 'रिश्ता (वैकल्पिक)',
  passcodeLabel: '6-अंकों का केयर सर्कल पासकोड',
  enterPasscodePlaceholder: '6-अंकों का कोड लिखें',
  yourCirclePasscode: 'आपका केयर सर्कल पासकोड',
  sharePasscodeHint: 'परिवार और केयरटेकर से जुड़ने के लिए यह कोड साझा करें।',
  passcodeCreatedNote:
    'प्रोफ़ाइल बनने पर सती आपका निजी 6-अंकों का पासकोड बनाएगी ताकि परिवार और केयरटेकर जुड़ सकें।',
  passcodeJoinTip: 'सुझाव: रमेश शर्मा के डेमो सर्कल में जुड़ने के लिए कोड लिखें:',
  continueBtn: 'आगे बढ़ें',
  backBtn: 'पीछे',
  ageLabel: 'उम्र',
  conditionsLabel: 'स्वास्थ्य स्थितियाँ (कॉमा लगाकर लिखें)',
  allergiesLabel: 'एलर्जी (कॉमा लगाकर लिखें)',
  greetingMorning: 'सुप्रभात',
  greetingAfternoon: 'नमस्कार',
  greetingEvening: 'शुभ संध्या',
  nextMedicineLabel: 'आपकी अगली दवा',
  allDoneToday: 'अभी के लिए सभी दवाइयाँ पूरी हो चुकी हैं',
  allDoneSubtitle: 'आराम करें। अगली दवा का समय होने पर सती आपको प्यार से याद दिलाएगी।',
  todaysSchedule: 'आज की समय-सारणी',
  readAloud: 'पढ़कर सुनाएं',
  iHaveTakenIt: 'मैंने दवा ले ली है',
  verifyWithPhoto: 'फोटो से पुष्टि करें',
  withFood: 'भोजन के साथ लें',
  withoutFood: 'खाली पेट लें',
  eitherFood: 'भोजन के साथ या बिना',
  tabToday: 'आज',
  tabProgress: 'मेरी प्रगति',
  tabAppointments: 'मुलाकातें',
  tabTalk: 'सती से बात',
  tabEmergency: 'आपातकाल',
  tabDashboard: 'खुराक',
  tabMedications: 'दवाइयाँ',
  tabAlerts: 'अलर्ट',
  tabCalendar: 'कैलेंडर',
  tabOverview: 'सारांश',
  tabSettings: 'सेटिंग्स',
  talkToSatiTitle: 'सती से बात करें',
  tapMicHint: 'माइक दबाएं या कहें "हे सती"',
  listeningNow: 'सती सुन रही हैं...',
  satiSpeaking: 'सती बोल रही हैं...',
  satiThinking: 'सती सोच रही हैं...',
  voiceOn: 'आवाज़ चालू',
  voiceOff: 'आवाज़ बंद',
  listenAgain: 'फिर से सुनें',
  askAnythingPlaceholder: 'सती से कुछ भी लिखें या पूछें...',
  sendBtn: 'भेजें',
  quickPrompt1: 'इस सप्ताह मेरी प्रगति कैसी रही?',
  quickPrompt2: 'आज मुझे कौन-सी दवाइयाँ लेनी हैं?',
  quickPrompt3: 'डॉक्टर से अगली मुलाकात कब है?',
  quickPrompt4: 'मुझे हल्का सिरदर्द हो रहा है',
  progressBestWeek: 'आपने इस सप्ताह {total} में से {taken} खुराक लीं — यह आपका सबसे अच्छा सप्ताह है!',
  streakLabel: 'लगातार नियमित दिन',
  daysWord: 'दिन',
  dosesTakenLabel: 'साप्ताहिक नियमितता',
  gentleEncouragement: 'हर छोटा और नियमित कदम आपके स्वास्थ्य को मज़बूत बनाता है।',
  moodTitle: 'आज आप कैसा महसूस कर रहे हैं?',
  moodHappy: 'प्रसन्न',
  moodCalm: 'शांत',
  moodTired: 'थके हुए',
  moodSad: 'उदास',
  moodUnwell: 'अस्वस्थ',
  dailyTipTitle: 'आज की स्वास्थ्य सलाह',
  preparingTip: 'आपके लिए स्वास्थ्य सलाह तैयार हो रही है...',
  upcomingAppointments: 'आगामी डॉक्टर मुलाकातें',
  shareDoctorReport: 'डॉक्टर के साथ रिपोर्ट साझा करें',
  doctorReportHeading: 'डॉक्टर के लिए दवा सारांश',
  preparingReport: 'तैयार हो रहा है...',
  privacyTitle: 'गोपनीयता और नियंत्रण',
  shareSchedule: 'परिवार को मेरी दैनिक दवा का समय देखने दें',
  shareProgress: 'परिवार को मेरी साप्ताहिक प्रगति देखने दें',
  shareMood: 'परिवार को मेरा दैनिक मूड देखने दें',
  shareAppointments: 'परिवार को डॉक्टर की मुलाकातें देखने दें',
  askBeforeMinorAlerts: 'छोटी देरी पर परिवार को बताने से पहले मुझसे पूछें',
  allowFamilyEdit: 'परिवार के सदस्यों को दवा या मुलाकात बदलने की अनुमति दें',
  accessibilityTitle: 'सुविधा और स्क्रीन सेटिंग्स',
  textSizeLabel: 'अक्षरों का आकार',
  textNormal: 'बड़ा (20px)',
  textLarge: 'और बड़ा (24px)',
  textXLarge: 'सबसे बड़ा (28px)',
  highContrastLabel: 'हाई-कंट्रास्ट मोड',
  dementiaModeLabel: 'डिमेंशिया-अनुकूल मोड',
  dementiaModeDesc: 'दैनिक दिनचर्या ("नाश्ते के बाद") से जुड़े सरल कार्ड और दोहराई गई आवाज़ यादें।',
  reminderPreviewsTitle: 'रिमाइंडर और जांच परीक्षण',
  statusPending: 'बाकी है',
  statusSaidTaken: 'लेने की सूचना',
  statusVerifiedTaken: 'सत्यापित',
  statusMissed: 'छूटी हुई',
  verifyInPerson: 'सामने सत्यापित करें',
  pillboxBtn: 'पिलबॉक्स',
  markMissedBtn: 'छूटी लिखें',
  editBtn: 'संपादित करें',
  addMedication: 'दवा जोड़ें',
  scanPrescription: 'पर्चा स्कैन करें',
  addAppointment: 'मुलाकात जोड़ें',
  activityTimeline: 'गतिविधि समयरेखा',
  alertsFeed: 'अलर्ट और पैटर्न',
  allClearAlerts: 'सब ठीक है — अभी कोई अलर्ट नहीं है।',
  acknowledgedWord: 'स्वीकृत',
  emailLogTitle: 'भेजे गए ईमेल लॉग',
  emailSentTo: 'ईमेल भेजा गया:',
  smtpReadyNote: 'असली ईमेल सेवा से जुड़ने के लिए तैयार',
  weeklyReportBtn: 'साप्ताहिक डॉक्टर रिपोर्ट बनाएं',
  copyForDoctor: 'डॉक्टर के लिए कॉपी करें',
  emergencyTitle: 'आपातकालीन सहायता सक्रिय',
  emergencySubtitle: 'शांत रहें। मदद आ रही है और आपके परिवार को सूचित कर दिया गया है।',
  callingAmbulance: 'एम्बुलेंस 108 को कॉल किया जा रहा है',
  connectedWord: 'जुड़ा हुआ',
  sharingLocation: 'लाइव लोकेशन साझा हो रही है',
  circleNotified: 'केयरटेकर और परिवार को पूरी स्वास्थ्य जानकारी भेजी गई',
  inAppEmailDispatched: 'ऐप और ईमेल सूचना भेजी गई',
  cancelEmergency: 'मैं सुरक्षित हूँ — बंद करें',
  medicalSummaryForResponders: 'चिकित्सा सारांश',
  patientWord: 'रोगी',
  allergiesWord: 'एलर्जी',
  noneReported: 'कोई ज्ञात एलर्जी नहीं',
  healthConditionsWord: 'स्वास्थ्य स्थितियाँ',
  activeMedicationsWord: 'वर्तमान दवाइयाँ',
  areYouOkayTitle: 'सती पूछ रही हैं: क्या आप ठीक हैं?',
  inactivityDesc:
    'आज कुछ समय से आपसे बात नहीं हुई है। कृपया एक बटन दबाएं ताकि हमें पता चले कि आप आराम से हैं।',
  imOkayBtn: 'हाँ, मैं ठीक हूँ',
  iNeedHelpBtn: 'मुझे मदद चाहिए',
  doubleDoseWarningTitle: 'दोहरी खुराक सुरक्षा जांच',
  doubleDoseBlockedMsg: 'आपने {med} पहले ही {lastTime} बजे ले ली है, कृपया {nextTime} तक प्रतीक्षा करें।',
  doseConfirmedSpoken: 'शाबाश, {name}। {med} दर्ज कर ली गई है।',
  saveBtn: 'सहेजें',
  cancelBtn: 'रद्द करें',
  deleteBtn: 'हटाएं',
  refillNeeded: 'कम स्टॉक — जल्द मंगाएं',
  leftWord: 'शेष',
  switchRole: 'भूमिका बदलें',
  roleElderShort: 'बुज़ुर्ग',
  roleCaretakerShort: 'देखभालकर्ता',
  roleFamilyShort: 'परिवार',
  logoutReset: 'रीसेट / मुख्य पृष्ठ',
  recordFamilyVoice: 'परिवार की आवाज़ रिकॉर्ड करें',
  recordFamilyVoiceDesc:
    'एक स्नेहभरा संदेश रिकॉर्ड करें जो डिमेंशिया-अनुकूल मोड में दवा याद दिलाते समय बजेगा।',
  recordVoiceBtn: 'आवाज़ रिकॉर्ड करें',
  stopRecordingBtn: 'रिकॉर्डिंग रोकें',
  uploadAudioBtn: 'ऑडियो अपलोड करें',
  previewVoiceBtn: 'परिवार की आवाज़ सुनें',
  playVoiceReminder: 'परिवार की आवाज़ सुनें',
  calendarTitle: 'देखभाल कैलेंडर',
  monthView: 'माह',
  dayView: 'दिन',
  noAppointments: 'कोई आगामी मुलाकात नहीं है।',
  noDosesForDate: 'इस तारीख के लिए कोई दवा दर्ज नहीं है।',
  reminderBannerTitle: 'दवा का समय हो गया है',
  reminderStage0: 'पहली कोमल याद',
  reminderStage1: '10 मिनट बाद दोबारा याद',
  reminderStage2: 'केयरटेकर को सूचित किया गया (ऐप + ईमेल)',
  reminderStage3: 'परिवार के सदस्यों को सूचित किया गया (ऐप + ईमेल)',
  fastForward10m: '10 मिनट आगे बढ़ाएं',
  snoozeBtn: '10 मिनट बाद याद दिलाएं',
  testReminderBtn: 'दवा रिमाइंडर टेस्ट करें',
  testInactivityBtn: 'निष्क्रियता जांच टेस्ट करें',
  medicineNameLabel: 'दवा का नाम',
  doseLabel: 'खुराक (जैसे 500mg)',
  timesPerDayLabel: 'समय (कॉमा लगाकर, 24 घंटे HH:MM)',
  foodTimingLabel: 'भोजन के साथ या बिना?',
  stockCountLabel: 'बची हुई गोलियाँ',
  pillColorLabel: 'गोली का रंग',
  pillShapeLabel: 'गोली का आकार',
  routineCueLabel: 'दैनिक दिनचर्या संकेत (जैसे नाश्ते के बाद)',
  simplePurposeLabel: 'सरल उपयोग',
  startDateLabel: 'शुरू होने की तारीख',
  endDateLabel: 'समाप्ति तारीख (वैकल्पिक)',
  doctorNameLabel: 'डॉक्टर का नाम',
  specialtyLabel: 'विशेषज्ञता',
  clinicLabel: 'क्लिनिक / अस्पताल',
  dateLabel: 'तारीख',
  timeLabel: 'समय',
  visitNotesLabel: 'मुलाकात नोट्स',
  viewEmailLog: 'ईमेल लॉग',
  privacyBlockedNotice: 'यह जानकारी आपके बुज़ुर्ग द्वारा निजी रखी गई है।',
  copiedNotice: 'डॉक्टर के साथ साझा करने के लिए रिपोर्ट कॉपी हो गई।',
  acknowledgeBtn: 'स्वीकार करें',
  careCircleHeading: 'केयर सर्कल',
  passcodeWord: 'पासकोड',
  todaysDosesTitle: 'आज की खुराक और सत्यापन',
  scheduledWord: 'निर्धारित',
  confirmedWord: 'पुष्टि समय',
  familyOverviewHeading: 'पारिवारिक सारांश',
  editingPermitted: 'बुज़ुर्ग द्वारा बदलाव की अनुमति है',
  viewOnlyPrivacy: 'केवल देखने की अनुमति (बुज़ुर्ग-नियंत्रित गोपनीयता)',
  weeklyAdherenceLabel: 'साप्ताहिक नियमितता',
  todayWord: 'आज',
  dosesWord: 'खुराक',
  doctorReportCardTitle: 'डॉक्टर के साथ साझा करने योग्य साप्ताहिक रिपोर्ट',
  todaysMedSchedule: 'आज की दवा सूची',
  wellbeingMoodTitle: 'स्वास्थ्य और मनःस्थिति',
  latestCheckIn: 'नवीनतम जानकारी',
  noMoodRecorded: 'अभी तक कोई मूड दर्ज नहीं हुआ है।',
  uploadPhotoBtn: 'फोटो अपलोड करें',
  scanningText: 'स्कैन हो रहा है...',
  scanHelpText: 'पर्चे या दवा के पत्ते की फोटो अपलोड करें; सती विवरण भर देगी।',
  checkInteractionsDesc: 'मौजूदा दवाइयों, एलर्जी और भोजन के साथ जांच करें',
  checkInteractionsBtn: 'असर जांचें',
  showTabletHint: 'अपने हाथ में गोली या खाली पत्ते की फोटो दिखाएं।',
  takeOrChoosePhoto: 'फोटो लें या चुनें',
  satiLookingGently: 'सती ध्यान से देख रही हैं...',
  spokenReminderTemplate: '{name}, अब {med} {dose} लेने का समय हो गया है, {cue}।',
  spokenRepeatTemplate: 'प्यार से याद दिला रही हूँ {name}: कृपया {med} {dose} ले लें।',
  emergencySpokenMsg:
    '{name}, मैं अभी मदद बुला रही हूँ। कृपया शांत रहें। एम्बुलेंस 108 और आपके परिवार को तुरंत सूचना भेजी जा रही है।',
  initialChatWelcome:
    'नमस्ते {name}। मैं सती हूँ, आपकी देखभाल साथी। आपने आज सुबह की दवाइयाँ ले ली हैं। आज आप कैसा महसूस कर रहे हैं?',
  alertRefillTitle: 'दवा कम है: {med}',
  alertRefillMsg: 'केवल {count} गोलियाँ बची हैं। कृपया जल्द नई दवा मंगा लें।',
  alertPatternTitle: 'पैटर्न जांच: रात की Atorvastatin',
  alertPatternMsg: 'पिछले 6 दिनों में रात 9:30 बजे की Atorvastatin दो बार छूटी है। कृपया सोने से पहले याद दिलाएं।',
  alertEmergencyTitle: 'आपातकाल: {name} को तुरंत मदद की आवश्यकता है',
  alertEmergencyMsg: '{reason}। एम्बुलेंस 108 को कॉल और लाइव लोकेशन साझा की गई।',
  alertHealthTitle: '{name} के लिए स्वास्थ्य जांच की सलाह',
  alertEscalationCaretakerTitle: 'अभी उत्तर नहीं मिला: {med}',
  alertEscalationCaretakerMsg: '10 मिनट बाद भी {name} से पुष्टि नहीं मिली। केयरटेकर को सूचित किया गया।',
  alertEscalationFamilyTitle: 'परिवार सूचना: {med}',
  alertEscalationFamilyMsg: '{name} से अभी तक पुष्टि नहीं मिली है। परिवार के सदस्यों को सूचित किया गया।',
  alertInactivityTitle: '"क्या आप ठीक हैं?" जांच का उत्तर नहीं मिला',
  alertInactivityMsg: '{name} ने सती की स्वास्थ्य जांच का उत्तर नहीं दिया। कृपया तुरंत संपर्क करें।',
  alertMoodTitle: 'परिवार के लिए कोमल सूचना: {name} का मूड',
  alertMoodMsg: '{name} ने हाल ही में उदास या अस्वस्थ महसूस किया है। एक प्यार भरा फोन कॉल उन्हें अच्छा लगेगा।',
  alertSuspiciousTitle: 'साथ मिलकर जांचने का सुझाव: {med}',
  alertSuspiciousMsg: '{flag}। सती प्यार से एक बार फिर जांच करने का सुझाव देती है।',
  alertMissedTitle: 'छूटी हुई खुराक: {med} ({time})',
  alertMissedMsg: '{name} की {time} की {med} खुराक छूट गई है। केयरटेकर और परिवार को सूचित किया गया।',
  demoControlsTitle: 'प्रस्तुति डेमो नियंत्रण',
  demoControlsSubtitle: 'एक टैप से सती की मुख्य सुविधाएं लाइव दिखाएं।',
  demoControlsHint: 'शॉर्टकट: Ctrl/Cmd + Shift + D या सती लोगो पर तीन बार टैप करें',
  demoMissedDoseBtn: 'छूटी हुई खुराक दिखाएं',
  demoMissedDoseDesc: 'निर्धारित खुराक को छूटी हुई दिखाकर अलर्ट और ईमेल भेजें।',
  demoDoubleDoseBtn: 'दोहरी खुराक प्रयास दिखाएं',
  demoDoubleDoseDesc: 'समय से पहले दूसरी गोली रोकने और सती की आवाज़ चेतावनी दिखाएं।',
  demoEmergencyBtn: 'आपातकाल दिखाएं',
  demoEmergencyDesc: '108 एम्बुलेंस स्क्रीन खोलें और पूरे केयर सर्कल को अलर्ट करें।',
  demoSuspiciousBtn: 'संदिग्ध पैटर्न दिखाएं',
  demoSuspiciousDesc: 'रात 02:47 बजे की असामान्य पुष्टि दर्ज कर जांच अलर्ट दिखाएं।',
  demoSuspiciousFlagText: 'सुबह के रिमाइंडर से पहले रात 02:47 बजे असामान्य समय पर पुष्टि',
  demoEmergencyReason: 'लाइव डेमो: अचानक चक्कर आना और SOS दबाया गया',
  noMedicinesYetTitle: 'अभी कोई दवा जोड़ी नहीं गई है',
  noMedicinesYetDesc: 'अपनी पहली दवा जोड़ें या केयरटेकर से पर्चा स्कैन करने को कहें।',
  noDosesToday: 'आज के लिए कोई खुराक निर्धारित नहीं है। शुरू करने के लिए दवा जोड़ें।',
  noEmailsYet: 'अभी तक कोई ईमेल नहीं भेजा गया है।',
  noTimelineYet: 'आज अभी तक कोई खुराक दर्ज नहीं हुई है।',
  noProgressYet: 'दवाइयाँ शुरू होने पर आपकी साप्ताहिक प्रगति यहाँ दिखेगी।',
  errMissingNameEmail: 'कृपया अपना नाम और ईमेल पता दोनों लिखें।',
  defaultRoutineCue: 'नाश्ते के बाद',
  colorWhite: 'सफ़ेद',
  colorYellow: 'पीला',
  colorPink: 'गुलाबी',
  colorBlue: 'नीला',
  colorAmber: 'नारंगी',
  colorTeal: 'हरा-नीला',
  colorGreen: 'हरा',
  shapeRound: 'गोल',
  shapeOval: 'अंडाकार',
  shapeCapsule: 'कैप्सूल',
  monthCalendarTitle: 'मासिक नियमितता कैलेंडर',
  tapDayPrompt: 'उस दिन की सभी खुराक देखने के लिए किसी भी तारीख पर टैप करें',
  legendAllTaken: 'सभी ली गईं',
  legendPartial: 'आंशिक',
  legendMissed: 'छूटी हुई',
  prevMonthLabel: 'पिछला महीना',
  nextMonthLabel: 'अगला महीना',
  adherenceTrendTitle: 'नियमितता ट्रेंड',
  last14Days: '14 दिन',
  last30Days: '30 दिन',
  averageAdherenceWord: 'औसत',
  weeklyBarTitle: 'साप्ताहिक बार चार्ट',
  perMedicineTitle: 'प्रति-दवा विवरण',
  takenOfTotal: '{total} में से {taken} ली गईं',
  missedCountLabel: '{count} छूटीं',
  verifiedShareLabel: '{pct}% सत्यापित',
  mostMissedTimesTitle: 'सबसे अधिक छूटने वाले समय',
  windowMorning: 'सुबह (05:00–11:59)',
  windowAfternoon: 'दोपहर (12:00–16:59)',
  windowEvening: 'शाम (17:00–20:59)',
  windowNight: 'रात / सोने से पहले (21:00–04:59)',
  missedInsightSummary: 'छूटी हुई खुराकों में {pct}% ({totalMissed} में से {missed}) {window} में हैं।',
  missedPeakSlot: 'सबसे अधिक छूटने वाला समय: {time}',
  missedInsightTip: 'इस समय को दिनचर्या की आदत या परिवार के फोन कॉल से जोड़ने पर मदद मिलेगी।',
  noMissedInsight: 'पिछले 30 दिनों में कोई खुराक नहीं छूटी — हर समय सारिणी संतुलित है।',
  streakCounterTitle: 'निरंतर स्ट्रीक',
  bestStreakLabel: 'सर्वश्रेष्ठ (30 दिन): {days} दिन',
  thirtyDayAdherenceLabel: '30-दिन की नियमितता',
  verificationRateLabel: 'सत्यापन दर',
  alertsTimelineTitle: 'अलर्ट टाइमलाइन',
  todayProgressLabel: 'आज की प्रगति',
  noAnalyticsYet: 'दैनिक खुराक दर्ज होते ही विश्लेषणात्मक चार्ट यहाँ दिखाई देंगे।',
  nextAppointmentTitle: 'अगला डॉक्टर अपॉइंटमेंट',
  countdownToday: 'आज',
  countdownTomorrow: 'कल',
  countdownInDays: '{days} दिनों में',
  countdownPassed: 'बीती हुई मुलाकात',
  notesLabel: 'नोट्स',
  placeLabel: 'स्थान',
  tellDoctorBtn: 'डॉक्टर को बताएं',
  tellDoctorDesc: 'अपना कोई भी लक्षण बोलकर सहेजें ताकि डॉक्टर की मुलाकात में काम आए।',
  tellDoctorModalTitle: 'डॉक्टर के लिए लक्षण दर्ज करें',
  tellDoctorListeningHint: 'साफ़ शब्दों में बोलें या नीचे लिखें — सती इसे तारीख, समय और श्रेणी के साथ सहेज देगी।',
  tellDoctorPlaceholder: 'जैसे: आज सुबह सैर के बाद मेरे बाएं घुटने में हल्का दर्द महसूस हुआ...',
  tellDoctorTapToSpeak: 'बोलने के लिए टैप करें',
  tellDoctorStopListening: 'सुनना रोकें',
  tellDoctorSaveBtn: 'डॉक्टर के लिए सहेजें',
  tellDoctorSaving: 'श्रेणी और समय सहेजा जा रहा है...',
  tellDoctorSavedToast: 'डॉक्टर के लिए आपका नोट ({category}) सहेज लिया गया है।',
  tellDoctorSpokenConfirm: 'धन्यवाद {name}। मैंने डॉक्टर से मुलाकात के लिए आपका यह नोट सहेज लिया है।',
  doctorNotesSectionTitle: 'डॉक्टर के लिए रोगी के लक्षण नोट्स',
  noDoctorNotesYet: 'बुज़ुर्ग द्वारा अभी तक कोई लक्षण नोट दर्ज नहीं किया गया है।',
  symptomCatPain: 'दर्द / अकड़न',
  symptomCatDizziness: 'चक्कर आना',
  symptomCatFatigue: 'थकान / कमजोरी',
  symptomCatDigestion: 'पाचन / पेट',
  symptomCatBreathing: 'सांस / खांसी',
  symptomCatSleep: 'नींद',
  symptomCatOther: 'सामान्य नोट',
  allIsWellTitle: 'सब ठीक है',
  allIsWellMorningDone: '{name} ने आज सुबह की अपनी दवाइयाँ ले ली हैं',
  allIsWellSoFarDone: '{name} ने अभी तक की सभी निर्धारित दवाइयाँ ले ली हैं',
  allIsWellNoDosesYet: '{name} का दिन शांति से शुरू हुआ है — अभी कोई खुराक बाकी नहीं है',
  oneDoseLateTitle: 'ध्यान दें',
  oneDoseLateMsg: '{name} की एक खुराक ({med}) थोड़ी देर से है — अलर्ट भेजने से पहले प्रतीक्षा जारी है',
  escalatedConsecutiveTitle: 'अलर्ट भेजा गया',
  escalatedConsecutiveMsg: '{name} की लगातार दो खुराकें छूट गई हैं — केयरटेकर और परिवार को सूचित किया गया है',
  alertConsecutiveMissedTitle: 'लगातार 2 खुराकें छूटीं: तुरंत जांच आवश्यक',
  alertConsecutiveMissedMsg: '{name} की लगातार दो निर्धारित खुराकें ({med}) छूट गई हैं। कृपया संपर्क करें।',
  micPermissionTitle: 'आवाज़ से बात करने के लिए माइक की अनुमति',
  micPermissionPromptDesc: 'माइक की अनुमति दें ताकि सती आपकी आवाज़ साफ़ सुन सके और सरल हिंदी में जवाब दे सके।',
  micWhyDetail: 'सती माइक क्यों माँगती है: ऑडियो केवल तभी रिकॉर्ड होता है जब आप माइक दबाएं या "Hey Sati" बोलें, और आपके रुकते ही अपने आप बंद हो जाता है।',
  allowMicBtn: 'माइक की अनुमति दें',
  checkingMicBtn: 'माइक जांच हो रही है...',
  micDeniedTitle: 'माइक की अनुमति बंद है',
  micDeniedMsg: 'कृपया ब्राउज़र सेटिंग्स में माइक चालू करें, या नीचे दिए गए बॉक्स में लिखकर सती से बात करें।',
  micBlockedStepsTitle: 'माइक चालू करने के आसान चरण:',
  micBlockedStep1: '1. ऊपर वेबसाइट के पते के पास बने ताले (लॉक) या सेटिंग आइकन पर टैप करें।',
  micBlockedStep2: '2. "Microphone" विकल्प ढूंढें और उसे "Allow" (अनुमति दें) पर सेट करें।',
  micBlockedStep3: '3. नीचे "माइक फिर जांचें" दबाएं या पेज को रीलोड करें।',
  micUnavailableMsg: 'इस ब्राउज़र में माइक रिकॉर्डिंग उपलब्ध नहीं है। आप नीचे लिखकर सती से बात कर सकते हैं।',
  retryMicBtn: 'माइक फिर जांचें',
  liveTranscriptLabel: 'लाइव ट्रांसक्रिप्ट — सुन रही हूँ',
  speakNowPlaceholder: 'अब बोलिए — आपके शब्द यहाँ दिखाई देंगे...',
  stopAndSendBtn: 'रोकें और भेजें',
  cancelVoiceBtn: 'रद्द करें',
  textFallbackLabel: 'सती को लिखकर पूछें (हमेशा उपलब्ध)',
  micNoSpeechMsg: 'कोई आवाज़ सुनाई नहीं दी। फिर से माइक दबाएं या नीचे लिखें।',
  micAudioErrorMsg: 'माइक उपलब्ध नहीं मिला। कृपया डिवाइस जांचें या नीचे लिखें।',
  micNetworkErrorMsg: 'आवाज़ पहचान में नेटवर्क समस्या आई। कृपया फिर से बोलें या नीचे लिखें।',
  speechSynthUnavailableMsg: 'इस ब्राउज़र में आवाज़ सुनाना उपलब्ध नहीं है; सती बड़े अक्षरों में लिखकर उत्तर देगी।',
  voiceErrorReasonLabel: 'तकनीकी कारण:',
  recordingWavLabel: 'आपकी आवाज़ रिकॉर्ड हो रही है — आराम से बोलिए',
  recordingAutoStopHint: 'रुकने के ~1.5 सेकंड बाद अपने आप भेजेगा (अधिकतम 20 सेकंड)',
  processingVoiceLabel: 'सती आपकी बात ध्यान से समझ रही हैं...',
  satiHeardLabel: 'सती ने यह सुना:',
  tryAgainVoiceBtn: 'मैंने यह नहीं कहा? फिर से बोलें',
  fallbackVoiceLargeTextNote: 'इस डिवाइस पर हिंदी आवाज़ उपलब्ध नहीं है — उपलब्ध आवाज़ से बोल रही हूँ और सती का उत्तर नीचे बड़े अक्षरों में दिखाया गया है।',
  wakePhraseBadge: '"Hey Sati" बोलें या माइक दबाएं',
  latestReplyBannerLabel: 'सती कहती हैं:',
  voiceRemindersLabel: 'दवा रिमाइंडर और पुष्टि बोलकर सुनाएं',
  copyPasscodeBtn: 'कोड कॉपी करें',
  copiedPasscodeWord: 'कॉपी हो गया!',
  sideEffectsLabel: 'संभावित दुष्प्रभाव (कॉमा लगाकर, वैकल्पिक)',
  invalidTimesError: 'कृपया सही 24-घंटे का समय लिखें, जैसे 08:00, 20:00।',
  fillMedBtnLabel: 'भरें:',
  removeVoiceBtn: 'रिकॉर्ड आवाज़ हटाएं',
  voiceRecordError: 'माइक रिकॉर्डिंग उपलब्ध नहीं है या बंद है। आप ऑडियो फ़ाइल अपलोड कर सकते हैं।',
  confirmResetTitle: 'मुख्य पृष्ठ पर वापस जाएं?',
  confirmResetDesc: 'इससे इस ब्राउज़र से वर्तमान केयर सर्कल सत्र हट जाएगा और शुरुआत की स्क्रीन खुलेगी।',
  confirmResetBtn: 'हाँ, रीसेट करें',
  demoAddMedFirstNotice: 'इस डेमो घटना को देखने के लिए कृपया पहले कम से कम एक दवा जोड़ें।',
  howSatiWorksBtn: 'सती कैसे काम करती है (30 सेकंड गाइड)',
  howSatiWorksTitle: 'सती कैसे काम करती है',
  howSatiWorksSubtitle: '30 सेकंड में केयर सर्कल, तीनों भूमिकाएं, पासकोड और सत्यापन व्यवस्था समझें।',
  howStep1Title: '1. केयर सर्कल की सोच',
  howStep1Desc: 'बुज़ुर्ग, देखभालकर्ता और परिवार एक ही साझा स्वास्थ्य प्रोफ़ाइल से जुड़ते हैं — और गोपनीयता का पूरा नियंत्रण बुज़ुर्ग के पास रहता है।',
  howStep2Title: '2. तीन अलग-अलग भूमिकाएं',
  howStep2Desc: 'बुज़ुर्ग स्क्रीन पर बड़ा आसान बटन और सती आवाज़ साथी; केयरटेकर स्क्रीन पर खुराक सत्यापन और दवा प्रबंधन; परिवार स्क्रीन पर शांत सारांश और डॉक्टर रिपोर्ट।',
  howStep3Title: '3. निजी 6-अंकों का पासकोड',
  howStep3Desc: 'बुज़ुर्ग प्रोफ़ाइल बनने पर 6-अंकों का कोड मिलता है। केयरटेकर और परिवार अपने ईमेल व इस कोड से सुरक्षित जुड़ते हैं।',
  howStep4Title: '4. कोमल याद और ईमेल लॉग',
  howStep4Desc: 'समय पर सती प्यार से याद दिलाती है। जवाब न मिलने पर: 10 मिनट बाद दोबारा याद → केयरटेकर को अलर्ट → 10 मिनट बाद परिवार को अलर्ट और हर ईमेल लॉग होता है।',
  howStep5Title: '5. Verified बनाम Said-Taken',
  howStep5Desc: '"लेने की सूचना" (बुज़ुर्ग का कहना) और "सत्यापित" (फोटो जांच, केयरटेकर पुष्टि या पिलबॉक्स सेंसर) अलग रहते हैं, और दोहरी खुराक रोकी जाती है।',
  howAccessibilityTitle: '6. सुलभता और गरिमा (Accessibility)',
  howAccessibilityDesc: 'हर स्क्रीन पर सामान्य, बड़ा व अतिरिक्त बड़ा टेक्स्ट, हाई कॉन्ट्रास्ट मोड, डिमेंशिया-अनुकूल मोड, 48px+ बड़े बटन, पूर्ण कीबोर्ड नेविगेशन, स्क्रीन-रीडर लाइव घोषणाएं, कम गति समर्थन और आवाज़ व टेक्स्ट दोनों विकल्प मिलते हैं।',
  howSatiWorksCtaDemo: 'अभी डेमो मोड देखें',
  skipToMainContent: 'मुख्य सामग्री पर जाएं',
  primaryNavLabel: 'मुख्य नेविगेशन',
  mobileNavLabel: 'मोबाइल त्वरित नेविगेशन',
  pillGraphicAlt: '{color} {shape} गोली',
  pillGraphicForMedAlt: '{med} की {color} {shape} गोली',
  defaultMedPurpose: 'दैनिक निर्धारित देखभाल',
  defaultSpecialty: 'सामान्य परामर्श',
  defaultClinic: 'स्थानीय क्लिनिक',
  namePlaceholder: 'जैसे: सुनीता कुलकर्णी',
  conditionsPlaceholder: 'जैसे: मधुमेह, रक्तचाप',
  allergiesPlaceholder: 'जैसे: पेनिसिलिन (न हो तो खाली छोड़ें)',
  relationCaretakerPlaceholder: 'मुख्य नर्स / देखभालकर्ता',
  relationFamilyPlaceholder: 'बेटी / बेटा',
  geminiErrorChat: 'सती अभी संपर्क नहीं कर पा रही हैं। कृपया थोड़ी देर में फिर प्रयास करें या नीचे दवा सूची देखें।',
  geminiErrorScan: 'अभी पर्चा स्कैन नहीं हो सका। आप नीचे दवा का विवरण स्वयं भर सकते हैं।',
  geminiErrorInteraction: 'दवा असर की जांच अभी उपलब्ध नहीं है। कृपया अपने डॉक्टर या फार्मासिस्ट से पुष्टि करें।',
  geminiErrorPhoto: 'अभी फोटो की जांच नहीं हो सकी। आप स्वयं पुष्टि कर सकते हैं या केयरटेकर से मदद ले सकते हैं।',
  offlineReportNote: 'AI सारांश अभी उपलब्ध नहीं है; इसके स्थान पर सटीक स्थानीय रिपोर्ट तैयार की गई है।',
  emailFilterAll: 'सभी',
  emailFilterReminders: 'दवा रिमाइंडर',
  emailFilterAlerts: 'छूटी दवा और अलर्ट',
  emailFilterAppointments: 'डॉक्टर मुलाकातें',
  emailTypeDoseReminder: 'दवा रिमाइंडर',
  emailTypeAppointmentReminder: 'मुलाकात',
  emailTypeMissedDose: 'छूटी खुराक',
  emailTypeLowStock: 'दवा रिफिल',
  emailTypeEscalation: 'एस्केलेशन',
  emailTypeEmergency: 'आपातकाल',
  emailTypeSuspiciousPattern: 'पैटर्न जांच',
  emailTypeMoodTrend: 'मनःस्थिति सूचना',
  emailTypeHealthConcern: 'स्वास्थ्य जांच',
  emailTypeInactivity: 'हाल-चाल जांच',
  emailReminderSubject: '[सती रिमाइंडर] अगली दवा: {med} ({time})',
  emailReminderBody: 'नमस्ते {recipient}, {elder} की {med} खुराक {time} बजे ({cue}) निर्धारित है। सती ने आवाज़ में कोमल याद दिलाई है।',
  emailAppointmentSubject: '[सती मुलाकात रिमाइंडर] {doctor} — {date}, {time}',
  emailAppointmentBody: 'नमस्ते {recipient}, {elder} की आगामी डॉक्टर मुलाकात: {doctor} ({specialty}), स्थान: {clinic}, समय: {date} को {time} बजे।',
  emailEmergencySubject: '[तत्काल आपातकाल] {elder} — सती अलर्ट',
  emailEmergencyBody: '{elder} के लिए आपातकालीन सहायता शुरू की गई है। कारण: {reason}। स्वास्थ्य स्थितियाँ: {conditions}। एलर्जी: {allergies}। स्थान: {location}।',
  emailHealthSubject: '[सती केयर सर्कल] {elder} के लिए स्वास्थ्य जांच आवश्यक',
  emailHealthBody: 'नमस्ते {recipient}, सती ने {elder} के स्वास्थ्य प्रश्न पर ध्यान दिया: {reason}। कृपया प्यार से हाल-चाल पूछें।',
  emailEscalationCaretakerSubject: '[सती एस्केलेशन] केयरटेकर जांच: {med}',
  emailEscalationCaretakerBody: 'नमस्ते {recipient}, {elder} ने {med} की दो कोमल यादों का उत्तर नहीं दिया। कृपया जांच करें।',
  emailEscalationFamilySubject: '[सती परिवार अलर्ट] {elder} की छूटी खुराक की सूचना',
  emailEscalationFamilyBody: 'नमस्ते {recipient}, केयरटेकर सूचना के बाद भी {elder} ने {med} की पुष्टि नहीं की है। कृपया संपर्क करें।',
  emailInactivitySubject: '[सती तत्काल जांच] {elder} से उत्तर नहीं मिला',
  emailInactivityBody: 'नमस्ते {recipient}, {elder} ने सती के "क्या आप ठीक हैं?" संदेश का उत्तर नहीं दिया। कृपया तुरंत संपर्क करें।',
  emailSuspiciousSubject: '[सती] पैटर्न सूचना: {med} पुष्टि',
  emailSuspiciousBody: 'नमस्ते {recipient}, {elder} की {med} खुराक ({flag}) दर्ज हुई है। कृपया साथ मिलकर शांति से जांच करें।',
  emailMoodSubject: '[सती] {elder} से स्नेहपूर्ण बातचीत का सुझाव',
  emailMoodBody: 'नमस्ते {recipient}, सती ने देखा कि {elder} हाल में थोड़ा उदास या अस्वस्थ महसूस कर रहे हैं। आपका एक फोन कॉल उन्हें अच्छा लगेगा।',
  suspiciousEarlyFlag: 'निर्धारित समय से {mins} मिनट पहले पुष्टि की गई',
  suspiciousLateNightFlag: 'असामान्य देर रात ({time}) को पुष्टि की गई',
  medNamePlaceholder: 'जैसे: मेटफॉर्मिन (Metformin)',
  medDosePlaceholder: 'जैसे: 500mg',
  medCuePlaceholder: 'नाश्ते के बाद',
  medPurposePlaceholder: 'रक्तचाप संतुलित रखने के लिए',
  medSideEffectsPlaceholder: 'जैसे: चक्कर आना, हल्की मतली',
  apptDoctorPlaceholder: 'डॉ. मीरा देशमुख',
  apptSpecialtyPlaceholder: 'हृदय रोग (Cardiology)',
  apptClinicPlaceholder: 'सिटी वेलनेस क्लिनिक',
  apptNotesPlaceholder: 'खाली पेट शुगर की रिपोर्ट साथ लाएं',
  medicalIdBtn: 'मेडिकल आईडी',
  medicalIdTitle: 'आपातकालीन मेडिकल आईडी कार्ड',
  medicalIdSubtitle: 'आपकी सेहत की जानकारी, डॉक्टर और परिवार के नंबर एक टैप में।',
  bloodGroupLabel: 'ब्लड ग्रुप',
  notSpecifiedWord: 'अभी जोड़ा नहीं गया',
  doctorContactLabel: 'मुख्य डॉक्टर',
  doctorPhoneLabel: 'डॉक्टर का फोन',
  familyContactsLabel: 'परिवार के संपर्क',
  callFamilyBtn: 'परिवार को कॉल करें',
  callDoctorBtn: 'डॉक्टर को कॉल करें',
  callContactBtn: 'कॉल करें',
  callingBannerText: '{name} ({phone}) को कॉल लगाया जा रहा है...',
  noPhoneAddedNote: 'अभी कोई फोन नंबर सेव नहीं है। सेटिंग्स > मेडिकल आईडी में जोड़ें।',
  medicalIdEditTitle: 'मेडिकल आईडी विवरण',
  medicalIdEditDesc: 'ब्लड ग्रुप, एलर्जी, स्वास्थ्य स्थितियाँ, डॉक्टर का नंबर और परिवार के संपर्क यहाँ बदलें।',
  medicalIdSavedToast: 'मेडिकल आईडी विवरण सहेज लिए गए हैं।',
  addContactBtn: 'परिवार का संपर्क जोड़ें',
  contactNamePlaceholder: 'नाम (जैसे: आदित्य शर्मा)',
  contactRelationPlaceholder: 'रिश्ता (जैसे: बेटा)',
  contactPhonePlaceholder: 'फोन (जैसे: +91 98201 44510)',
  conditionsCommaHint: 'स्वास्थ्य स्थितियाँ (कॉमा से अलग लिखें)',
  allergiesCommaHint: 'एलर्जी (कॉमा से अलग लिखें)',
  emergencyPhoneLabel: 'आपातकालीन नंबर',
  closeBtn: 'बंद करें',
  undoDoseBtn: 'वापस लें, मैंने अभी दवा नहीं खाई',
  dismissBtn: 'हटाएं',
  doseUndoneBanner: '{med} को फिर से बाकी सूची में रख दिया गया है। समय होने पर आराम से लें।',
  takenTodayHeading: 'आज ली गई दवाइयाँ (गलती से दबने पर वापस लें)',
  tagForSugar: 'शुगर के लिए',
  tagForBP: 'बीपी के लिए',
  tagForHeart: 'दिल के लिए',
  tagForBones: 'हड्डियों और ताकत के लिए',
  tagForStomach: 'पेट के लिए',
  tagForSleep: 'नींद के लिए',
  tagForHealth: 'रोज़ की सेहत के लिए',
  tagTakeAfterFood: 'खाने के बाद लें',
  tagTakeAfterBreakfast: 'नाश्ते के बाद लें',
  tagTakeAfterLunch: 'दोपहर के खाने के बाद लें',
  tagTakeAfterDinner: 'रात के खाने के बाद लें',
  tagTakeBeforeFood: 'खाने से पहले लें',
  tagTakeBeforeBreakfast: 'नाश्ते से पहले लें',
  tagTakeBeforeSleep: 'सोने से पहले लें',
  tagTakeAnytime: 'किसी भी समय लें',
  plainConditionSugar: 'शुगर',
  plainConditionBP: 'उच्च बीपी',
  plainConditionHeart: 'दिल की देखभाल',
  plainConditionJoints: 'जोड़ों की देखभाल',
  familyMsgSentConfirm: 'मैंने {recipients} को आपका संदेश भेज दिया है: "{summary}"',
  familyMsgAlertTitle: '{elder} का संदेश ({recipients} के लिए)',
  familyMsgEmailSubject: '[सती संदेश — {elder}] {recipient} के लिए',
  familyMsgEmailBody: 'नमस्ते {recipient}, {elder} ने सती से आपको यह बताने को कहा है: "{summary}" (मूल संदेश: "{original}")।',
  emailTypeFamilyMessage: 'परिवार संदेश',
  pinDigitEnteredToast: '6 में से अंक {count} दर्ज हुआ',
  pinDigitSpokenWord: 'अंक दर्ज हुआ',
  pinBackspaceBtn: 'मिटाएं',
  pinClearBtn: 'साफ करें',
  forgotPasscodeBtn: 'पासकोड भूल गए? परिवार से पूछें',
  forgotPasscodeSentTitle: 'परिवार को अनुरोध भेजा गया',
  forgotPasscodeSentDesc: 'सती ने {circle} को 6 अंकों का पासकोड साझा करने के लिए अलर्ट और सिमुलेटेड ईमेल भेज दिया है।',
  passcodeHelpAlertTitle: '{name} ने पासकोड सहायता मांगी है',
  passcodeHelpAlertMsg: '{name} ({role}) ने "पासकोड भूल गए?" दबाया है और केयर सर्कल का पासकोड मांग रहे हैं।',
  passcodeHelpEmailSubject: '[सती पासकोड मदद] {name} पासकोड पूछ रहे हैं',
  passcodeHelpEmailBody: 'नमस्ते {recipient}, {name} ({email}) ने {elder} के केयर सर्कल से जुड़ते समय "पासकोड भूल गए? परिवार से पूछें" चुना है। कृपया अपना 6 अंकों का पासकोड साझा करें।',
  emailTypePasscodeHelp: 'पासकोड मदद',
};

const mr: TranslationDict = {
  brandName: 'सती (Sati)',
  tagline: 'आश्वासक आणि आवाज-केंद्रित काळजी, जिथे ज्येष्ठ नागरिक प्रत्येक निर्णयाच्या केंद्रस्थानी असतात.',
  chooseLanguage: 'तुमची भाषा निवडा',
  orWord: 'किंवा',
  demoModeBtn: 'डेमो मोड पहा (रमेश शर्मा)',
  demoModeDesc: 'रमेश जी (72), काळजीवाहू प्रिया, मुलगा आदित्य आणि 7 दिवसांच्या नोंदींसह तयार.',
  freshSetupBtn: 'नवीन केअर सर्कल सुरू करा',
  freshSetupDesc: 'नवीन ज्येष्ठ प्रोफाइल तयार करा किंवा 6-अंकी पासकोडने सामील व्हा.',
  featurePrivacy: 'ज्येष्ठांचे नियंत्रण',
  featureVerification: 'विश्वासार्ह खात्री',
  featureCircle: '6-अंकी केअर सर्कल',
  emailLabel: 'ईमेल पत्ता',
  nameLabel: 'पूर्ण नाव',
  chooseRoleTitle: 'या केअर सर्कलमध्ये तुमची भूमिका कोणती?',
  roleElderly: 'मी ज्येष्ठ व्यक्ती आहे',
  roleElderlyDesc: 'मोठे स्पष्ट अक्षर, सती आवाज सोबती आणि संपूर्ण गोपनीयता नियंत्रण.',
  roleCaretaker: 'मी काळजीवाहू (केअरटेकर) आहे',
  roleCaretakerDesc: 'औषधाची खात्री करा, औषधे जोडा, प्रिस्क्रिप्शन स्कॅन करा आणि सूचना पहा.',
  roleFamily: 'मी कुटुंबातील सदस्य आहे',
  roleFamilyDesc: 'साप्ताहिक अहवाल, डॉक्टरांच्या भेटी आणि शांत माहिती पहा.',
  relationOptional: 'नाते (ऐच्छिक)',
  passcodeLabel: '6-अंकी केअर सर्कल पासकोड',
  enterPasscodePlaceholder: '6-अंकी कोड टाका',
  yourCirclePasscode: 'तुमचा केअर सर्कल पासकोड',
  sharePasscodeHint: 'कुटुंब आणि काळजीवाहू यांना जोडण्यासाठी हा कोड शेअर करा.',
  passcodeCreatedNote:
    'प्रोफाइल तयार झाल्यावर सती तुमचा खाजगी 6-अंकी पासकोड तयार करेल जेणेकरून कुटुंब सामील होऊ शकेल.',
  passcodeJoinTip: 'टीप: रमेश शर्मा यांच्या डेमो सर्कलमध्ये सामील होण्यासाठी कोड टाका:',
  continueBtn: 'पुढे जा',
  backBtn: 'मागे',
  ageLabel: 'वय',
  conditionsLabel: 'आरोग्य स्थिती (स्वल्पविराम देऊन लिहा)',
  allergiesLabel: 'अ‍ॅलर्जी (स्वल्पविराम देऊन लिहा)',
  greetingMorning: 'सुप्रभात',
  greetingAfternoon: 'नमस्कार',
  greetingEvening: 'शुभ संध्या',
  nextMedicineLabel: 'तुमचे पुढील औषध',
  allDoneToday: 'सध्याची सर्व औषधे घेतली आहेत',
  allDoneSubtitle: 'आराम करा. पुढच्या औषधाची वेळ झाल्यावर सती तुम्हाला प्रेमाने आठवण करून देईल.',
  todaysSchedule: 'आजचे वेळापत्रक',
  readAloud: 'वाचून दाखवा',
  iHaveTakenIt: 'मी औषध घेतले आहे',
  verifyWithPhoto: 'फोटोने खात्री करा',
  withFood: 'जेवणासोबत घ्या',
  withoutFood: 'रिकाम्या पोटी घ्या',
  eitherFood: 'जेवणासोबत किंवा त्याशिवाय',
  tabToday: 'आज',
  tabProgress: 'माझी प्रगती',
  tabAppointments: 'भेटी',
  tabTalk: 'सतीशी बोला',
  tabEmergency: 'आणीबाणी',
  tabDashboard: 'डोस',
  tabMedications: 'औषधे',
  tabAlerts: 'सूचना',
  tabCalendar: 'दिनदर्शिका',
  tabOverview: 'सारांश',
  tabSettings: 'सेटिंग्ज',
  talkToSatiTitle: 'सतीशी बोला',
  tapMicHint: 'माइक दाबा किंवा म्हणा "हे सती"',
  listeningNow: 'सती लक्षपूर्वक ऐकत आहे...',
  satiSpeaking: 'सती बोलत आहे...',
  satiThinking: 'सती विचार करत आहे...',
  voiceOn: 'आवाज चालू',
  voiceOff: 'आवाज बंद',
  listenAgain: 'पुन्हा ऐका',
  askAnythingPlaceholder: 'सतीला काहीही विचारा किंवा लिहा...',
  sendBtn: 'पाठवा',
  quickPrompt1: 'या आठवड्यात माझी प्रगती कशी आहे?',
  quickPrompt2: 'आज मला कोणती औषधे घ्यायची आहेत?',
  quickPrompt3: 'डॉक्टरांची पुढची भेट कधी आहे?',
  quickPrompt4: 'मला थोडे डोके दुखत आहे',
  progressBestWeek: 'तुम्ही या आठवड्यात {total} पैकी {taken} डोस घेतले — हा तुमचा सर्वोत्तम आठवडा!',
  streakLabel: 'सलग नियमित दिवस',
  daysWord: 'दिवस',
  dosesTakenLabel: 'साप्ताहिक नियमितता',
  gentleEncouragement: 'प्रत्येक नियमित पाऊल तुमच्या आरोग्याला बळ देते.',
  moodTitle: 'आज तुम्हाला कसे वाटत आहे?',
  moodHappy: 'आनंदी',
  moodCalm: 'शांत',
  moodTired: 'थकलेले',
  moodSad: 'उदास',
  moodUnwell: 'अस्वस्थ',
  dailyTipTitle: 'आजचा आरोग्य सल्ला',
  preparingTip: 'तुमच्यासाठी आरोग्य सल्ला तयार होत आहे...',
  upcomingAppointments: 'डॉक्टरांच्या आगामी भेटी',
  shareDoctorReport: 'डॉक्टरांसोबत अहवाल शेअर करा',
  doctorReportHeading: 'डॉक्टरांसाठी औषध सारांश',
  preparingReport: 'तयार होत आहे...',
  privacyTitle: 'गोपनीयता आणि नियंत्रण',
  shareSchedule: 'कुटुंबाला माझे दैनंदिन औषधाचे वेळापत्रक पाहू द्या',
  shareProgress: 'कुटुंबाला माझी साप्ताहिक प्रगती पाहू द्या',
  shareMood: 'कुटुंबाला माझा दैनंदिन मूड पाहू द्या',
  shareAppointments: 'कुटुंबाला डॉक्टरांच्या भेटी पाहू द्या',
  askBeforeMinorAlerts: 'किरकोळ उशिरासाठी कुटुंबाला कळवण्यापूर्वी मला विचारा',
  allowFamilyEdit: 'कुटुंबातील सदस्यांना औषधे किंवा भेटी बदलण्याची परवानगी द्या',
  accessibilityTitle: 'सोय आणि स्क्रीन सेटिंग्ज',
  textSizeLabel: 'अक्षरांचा आकार',
  textNormal: 'मोठा (20px)',
  textLarge: 'अधिक मोठा (24px)',
  textXLarge: 'सर्वात मोठा (28px)',
  highContrastLabel: 'हाय-कंट्रास्ट मोड',
  dementiaModeLabel: 'डिमेंशिया-अनुकूल मोड',
  dementiaModeDesc: 'दैनंदिन सवयींशी ("नाश्त्यानंतर") जोडलेली सोपी कार्डे आणि वारंवार आवाज आठवण.',
  reminderPreviewsTitle: 'आठवण आणि तपासणी चाचणी',
  statusPending: 'बाकी आहे',
  statusSaidTaken: 'घेतल्याचे सांगितले',
  statusVerifiedTaken: 'खात्री झाली',
  statusMissed: 'राहिलेले',
  verifyInPerson: 'समक्ष खात्री करा',
  pillboxBtn: 'पिलबॉक्स',
  markMissedBtn: 'राहिले नोंदवा',
  editBtn: 'संपादन',
  addMedication: 'औषध जोडा',
  scanPrescription: 'प्रिस्क्रिप्शन स्कॅन करा',
  addAppointment: 'भेट जोडा',
  activityTimeline: 'दैनिक नोंदी',
  alertsFeed: 'सूचना आणि पॅटर्न',
  allClearAlerts: 'सर्व ठीक आहे — सध्या कोणतीही सूचना नाही.',
  acknowledgedWord: 'मान्य केले',
  emailLogTitle: 'पाठवलेल्या ईमेलची नोंद',
  emailSentTo: 'ईमेल पाठवला:',
  smtpReadyNote: 'थेट ईमेल सेवेशी जोडण्यासाठी तयार',
  weeklyReportBtn: 'साप्ताहिक डॉक्टर अहवाल तयार करा',
  copyForDoctor: 'डॉक्टरांसाठी कॉपी करा',
  emergencyTitle: 'आणीबाणी मदत सुरू',
  emergencySubtitle: 'शांत राहा. मदत येत आहे आणि तुमच्या कुटुंबाला कळवले आहे.',
  callingAmbulance: 'रुग्णवाहिका १०८ ला कॉल करत आहे',
  connectedWord: 'जोडलेले',
  sharingLocation: 'थेट लोकेशन शेअर होत आहे',
  circleNotified: 'काळजीवाहू आणि कुटुंबाला संपूर्ण वैद्यकीय माहिती पाठवली',
  inAppEmailDispatched: 'अ‍ॅप आणि ईमेल सूचना पाठवली',
  cancelEmergency: 'मी सुरक्षित आहे — बंद करा',
  medicalSummaryForResponders: 'वैद्यकीय सारांश',
  patientWord: 'रुग्ण',
  allergiesWord: 'अ‍ॅलर्जी',
  noneReported: 'कोणतीही अ‍ॅलर्जी नाही',
  healthConditionsWord: 'आरोग्य स्थिती',
  activeMedicationsWord: 'सध्याची औषधे',
  areYouOkayTitle: 'सती विचारत आहे: तुम्ही ठीक आहात का?',
  inactivityDesc:
    'आज काही वेळ तुमच्याकडून प्रतिसाद मिळाला नाही. तुम्ही आरामात आहात हे कळवण्यासाठी कृपया एक बटण दाबा.',
  imOkayBtn: 'होय, मी ठीक आहे',
  iNeedHelpBtn: 'मला मदत हवी आहे',
  doubleDoseWarningTitle: 'दुहेरी डोस सुरक्षा तपासणी',
  doubleDoseBlockedMsg: 'तुम्ही {med} आधीच {lastTime} वाजता घेतले आहे, कृपया {nextTime} पर्यंत थांबा.',
  doseConfirmedSpoken: 'छान, {name}. {med} घेतल्याची नोंद झाली आहे.',
  saveBtn: 'जतन करा',
  cancelBtn: 'रद्द करा',
  deleteBtn: 'काढा',
  refillNeeded: 'कमी साठा — लवकर मागवा',
  leftWord: 'शिल्लक',
  switchRole: 'भूमिका बदला',
  roleElderShort: 'ज्येष्ठ',
  roleCaretakerShort: 'काळजीवाहू',
  roleFamilyShort: 'कुटुंब',
  logoutReset: 'रीसेट / मुख्य पान',
  recordFamilyVoice: 'कुटुंबाचा आवाज रेकॉर्ड करा',
  recordFamilyVoiceDesc:
    'डिमेंशिया-अनुकूल मोड सुरू असताना औषधाच्या आठवणीसाठी प्रेमळ संदेश रेकॉर्ड करा.',
  recordVoiceBtn: 'आवाज रेकॉर्ड करा',
  stopRecordingBtn: 'रेकॉर्डिंग थांबवा',
  uploadAudioBtn: 'ऑडिओ अपलोड करा',
  previewVoiceBtn: 'जतन केलेला आवाज ऐका',
  playVoiceReminder: 'कुटुंबाचा आवाज ऐका',
  calendarTitle: 'काळजी दिनदर्शिका',
  monthView: 'महिना',
  dayView: 'दिवस',
  noAppointments: 'कोणतीही आगामी भेट नाही.',
  noDosesForDate: 'या तारखेसाठी कोणतेही औषध नोंदवलेले नाही.',
  reminderBannerTitle: 'औषधाची वेळ झाली आहे',
  reminderStage0: 'पहिली प्रेमळ आठवण',
  reminderStage1: '10 मिनिटांनंतर पुन्हा आठवण',
  reminderStage2: 'काळजीवाहूंना कळवले (अ‍ॅप + ईमेल)',
  reminderStage3: 'कुटुंबातील सदस्यांना कळवले (अ‍ॅप + ईमेल)',
  fastForward10m: '10 मिनिटे पुढे न्या',
  snoozeBtn: '10 मिनिटांनी आठवण करा',
  testReminderBtn: 'औषध आठवण तपासा',
  testInactivityBtn: 'सक्रियता तपासणी चाचणी',
  medicineNameLabel: 'औषधाचे नाव',
  doseLabel: 'मात्रा (उदा. 500mg)',
  timesPerDayLabel: 'वेळ (स्वल्पविराम देऊन, 24h HH:MM)',
  foodTimingLabel: 'जेवणासोबत की रिकाम्या पोटी?',
  stockCountLabel: 'शिल्लक गोळ्या',
  pillColorLabel: 'गोळीचा रंग',
  pillShapeLabel: 'गोळीचा आकार',
  routineCueLabel: 'दैनंदिन वेळेची खूण (उदा. नाश्त्यानंतर)',
  simplePurposeLabel: 'सोपा उपयोग',
  startDateLabel: 'सुरुवातीची तारीख',
  endDateLabel: 'शेवटची तारीख (ऐच्छिक)',
  doctorNameLabel: 'डॉक्टरांचे नाव',
  specialtyLabel: 'तज्ञता',
  clinicLabel: 'क्लिनिक / रुग्णालय',
  dateLabel: 'तारीख',
  timeLabel: 'वेळ',
  visitNotesLabel: 'भेटीची नोंद',
  viewEmailLog: 'ईमेल नोंदी',
  privacyBlockedNotice: 'ही माहिती तुमच्या ज्येष्ठांनी गोपनीय ठेवली आहे.',
  copiedNotice: 'डॉक्टरांसोबत शेअर करण्यासाठी अहवाल कॉपी झाला.',
  acknowledgeBtn: 'मान्य करा',
  careCircleHeading: 'केअर सर्कल',
  passcodeWord: 'पासकोड',
  todaysDosesTitle: 'आजचे डोस आणि खात्री',
  scheduledWord: 'नियोजित वेळ',
  confirmedWord: 'नोंद वेळ',
  familyOverviewHeading: 'कौटुंबिक सारांश',
  editingPermitted: 'ज्येष्ठांकडून बदलाची परवानगी आहे',
  viewOnlyPrivacy: 'फक्त पाहण्यासाठी (ज्येष्ठ-नियंत्रित गोपनीयता)',
  weeklyAdherenceLabel: 'साप्ताहिक नियमितता',
  todayWord: 'आज',
  dosesWord: 'डोस',
  doctorReportCardTitle: 'डॉक्टरांना देण्याजोगा साप्ताहिक अहवाल',
  todaysMedSchedule: 'आजच्या औषधांची यादी',
  wellbeingMoodTitle: 'प्रकृती आणि मनःस्थिती',
  latestCheckIn: 'ताजी नोंद',
  noMoodRecorded: 'अजून कोणतीही मूड नोंद नाही.',
  uploadPhotoBtn: 'फोटो अपलोड करा',
  scanningText: 'स्कॅन होत आहे...',
  scanHelpText: 'प्रिस्क्रिप्शन किंवा औषधाच्या पाकिटाचा फोटो द्या; सती माहिती भरेल.',
  checkInteractionsDesc: 'सध्याची औषधे, अ‍ॅलर्जी आणि जेवणासोबत तपासणी करा',
  checkInteractionsBtn: 'परिणाम तपासा',
  showTabletHint: 'हातातील गोळी किंवा रिकाम्या पाकिटाचा फोटो दाखवा.',
  takeOrChoosePhoto: 'फोटो काढा किंवा निवडा',
  satiLookingGently: 'सती काळजीपूर्वक पाहत आहे...',
  spokenReminderTemplate: '{name}, {med} {dose} घेण्याची वेळ झाली आहे, {cue}.',
  spokenRepeatTemplate: 'प्रेमाने आठवण करून देत आहे {name}: कृपया {med} {dose} घ्या.',
  emergencySpokenMsg:
    '{name}, मी आत्ताच मदत बोलवत आहे. कृपया शांत राहा. रुग्णवाहिका 108 आणि तुमच्या कुटुंबाला लगेच कळवले जात आहे.',
  initialChatWelcome:
    'नमस्कार {name}. मी सती, तुमची काळजी सोबती. तुम्ही आज सकाळची औषधे घेतली आहेत. आज तुम्हाला कसे वाटत आहे?',
  alertRefillTitle: 'औषध संपत आले आहे: {med}',
  alertRefillMsg: 'फक्त {count} गोळ्या शिल्लक आहेत. कृपया लवकर नवीन औषध आणा.',
  alertPatternTitle: 'पॅटर्न तपासणी: रात्रीची Atorvastatin',
  alertPatternMsg: 'गेल्या 6 दिवसांत रात्री 9:30 ची Atorvastatin दोनदा राहिली आहे. झोपण्यापूर्वी आठवण द्या.',
  alertEmergencyTitle: 'आणीबाणी: {name} यांना तात्काळ मदतीची गरज आहे',
  alertEmergencyMsg: '{reason}. रुग्णवाहिका 108 ला कॉल आणि थेट लोकेशन शेअर केले.',
  alertHealthTitle: '{name} यांच्यासाठी आरोग्य तपासणीचा सल्ला',
  alertEscalationCaretakerTitle: 'अजून प्रतिसाद नाही: {med}',
  alertEscalationCaretakerMsg: '10 मिनिटांनंतरही {name} कडून खात्री मिळाली नाही. काळजीवाहूंना कळवले.',
  alertEscalationFamilyTitle: 'कुटुंब सूचना: {med}',
  alertEscalationFamilyMsg: '{name} कडून अजून प्रतिसाद नाही. कुटुंबातील सदस्यांना कळवले.',
  alertInactivityTitle: '"तुम्ही ठीक आहात का?" तपासणीला उत्तर नाही',
  alertInactivityMsg: '{name} यांनी सतीच्या तपासणीला प्रतिसाद दिला नाही. कृपया लगेच संपर्क साधा.',
  alertMoodTitle: 'कुटुंबासाठी प्रेमळ सूचना: {name} यांची मनःस्थिती',
  alertMoodMsg: '{name} यांना अलीकडे उदास किंवा अस्वस्थ वाटत आहे. एक प्रेमळ फोन कॉल त्यांना बरे वाटेल.',
  alertSuspiciousTitle: 'एकत्र खात्री करण्याची सूचना: {med}',
  alertSuspiciousMsg: '{flag}. सती प्रेमाने पुन्हा एकदा खात्री करण्याचा सल्ला देते.',
  alertMissedTitle: 'राहिलेला डोस: {med} ({time})',
  alertMissedMsg: '{name} यांचा {time} चा {med} डोस राहिला आहे. काळजीवाहू आणि कुटुंबाला कळवले.',
  demoControlsTitle: 'सादरीकरण डेमो नियंत्रण',
  demoControlsSubtitle: 'एका टॅपने सतीची प्रमुख वैशिष्ट्ये थेट दाखवा.',
  demoControlsHint: 'शॉर्टकट: Ctrl/Cmd + Shift + D किंवा सती लोगोवर तीनदा टॅप करा',
  demoMissedDoseBtn: 'राहिलेला डोस दाखवा',
  demoMissedDoseDesc: 'नियोजित डोस राहिल्याची नोंद करून सूचना आणि ईमेल पाठवा.',
  demoDoubleDoseBtn: 'दुहेरी डोस प्रयत्न दाखवा',
  demoDoubleDoseDesc: 'वेळेपूर्वी दुसरा डोस थांबवून सतीचा प्रेमळ आवाज इशारा दाखवा.',
  demoEmergencyBtn: 'आणीबाणी दाखवा',
  demoEmergencyDesc: '108 रुग्णवाहिका स्क्रीन उघडा आणि कुटुंबाला तात्काळ कळवा.',
  demoSuspiciousBtn: 'संशयास्पद पॅटर्न दाखवा',
  demoSuspiciousDesc: 'पहाटे 02:47 ची असामान्य नोंद करून तपासणी सूचना तयार करा.',
  demoSuspiciousFlagText: 'सकाळच्या आठवणीपूर्वी पहाटे 02:47 वाजता असामान्य वेळी नोंद',
  demoEmergencyReason: 'थेट डेमो: अचानक चक्कर येणे आणि SOS बटण दाबले',
  noMedicinesYetTitle: 'अजून कोणतेही औषध जोडलेले नाही',
  noMedicinesYetDesc: 'तुमचे पहिले औषध जोडा किंवा काळजीवाहूंना प्रिस्क्रिप्शन स्कॅन करायला सांगा.',
  noDosesToday: 'आजसाठी कोणताही डोस नियोजित नाही. सुरू करण्यासाठी औषध जोडा.',
  noEmailsYet: 'अजून कोणताही ईमेल पाठवलेला नाही.',
  noTimelineYet: 'आज अजून कोणतीही औषध नोंद झालेली नाही.',
  noProgressYet: 'औषधे सुरू झाल्यावर तुमची साप्ताहिक प्रगती येथे दिसेल.',
  errMissingNameEmail: 'कृपया तुमचे नाव आणि ईमेल पत्ता दोन्ही भरा.',
  defaultRoutineCue: 'नाश्त्यानंतर',
  colorWhite: 'पांढरा',
  colorYellow: 'पिवळा',
  colorPink: 'गुलाबी',
  colorBlue: 'निळा',
  colorAmber: 'केशरी',
  colorTeal: 'हिरवट-निळा',
  colorGreen: 'हिरवा',
  shapeRound: 'गोल',
  shapeOval: 'लंबगोल',
  shapeCapsule: 'कॅप्सूल',
  monthCalendarTitle: 'मासिक नियमितता दिनदर्शिका',
  tapDayPrompt: 'त्या दिवसाचे डोस पाहण्यासाठी कोणत्याही तारखेवर टॅप करा',
  legendAllTaken: 'सर्व घेतले',
  legendPartial: 'अंशतः',
  legendMissed: 'चुकलेले',
  prevMonthLabel: 'मागील महिना',
  nextMonthLabel: 'पुढील महिना',
  adherenceTrendTitle: 'नियमितता ट्रेंड',
  last14Days: '14 दिवस',
  last30Days: '30 दिवस',
  averageAdherenceWord: 'सरासरी',
  weeklyBarTitle: 'साप्ताहिक बार चार्ट',
  perMedicineTitle: 'औषधानुसार विश्लेषण',
  takenOfTotal: '{total} पैकी {taken} घेतले',
  missedCountLabel: '{count} चुकले',
  verifiedShareLabel: '{pct}% खात्रीशीर',
  mostMissedTimesTitle: 'सर्वाधिक चुकणाऱ्या वेळा',
  windowMorning: 'सकाळ (05:00–11:59)',
  windowAfternoon: 'दुपार (12:00–16:59)',
  windowEvening: 'संध्याकाळ (17:00–20:59)',
  windowNight: 'रात्र / झोपण्यापूर्वी (21:00–04:59)',
  missedInsightSummary: 'चुकलेल्या डोसमधील {pct}% ({totalMissed} पैकी {missed}) {window} मध्ये आहेत.',
  missedPeakSlot: 'सर्वाधिक चुकलेली वेळ: {time}',
  missedInsightTip: 'या वेळेसोबत घरगुती सवय किंवा कुटुंबाचा प्रेमळ फोन कॉल जोडणे उपयुक्त ठरेल.',
  noMissedInsight: 'गेल्या 30 दिवसांत एकही डोस चुकला नाही — सर्व वेळा नियमित आहेत.',
  streakCounterTitle: 'सलग नियमितता',
  bestStreakLabel: 'सर्वोत्तम (30 दि.): {days} दि.',
  thirtyDayAdherenceLabel: '30-दिवसांची नियमितता',
  verificationRateLabel: 'खात्री दर',
  alertsTimelineTitle: 'सूचना टाइमलाइन',
  todayProgressLabel: 'आजची प्रगती',
  noAnalyticsYet: 'दैनंदिन डोस नोंदवले की विश्लेषणात्मक तक्ते येथे दिसतील.',
  nextAppointmentTitle: 'डॉक्टरांची पुढील भेट',
  countdownToday: 'आज',
  countdownTomorrow: 'उद्या',
  countdownInDays: '{days} दिवसांत',
  countdownPassed: 'मागील भेट',
  notesLabel: 'नोंदी',
  placeLabel: 'ठिकाण',
  tellDoctorBtn: 'डॉक्टरांना सांगा',
  tellDoctorDesc: 'कोणतेही लक्षण बोलून जतन करा जेणेकरून डॉक्टरांच्या भेटीत ते वाचता येतील.',
  tellDoctorModalTitle: 'डॉक्टरांसाठी लक्षण नोंदवा',
  tellDoctorListeningHint: 'स्पष्ट बोला किंवा खाली टाइप करा — सती तारीख, वेळ आणि प्रकारासह जतन करेल.',
  tellDoctorPlaceholder: 'उदा. आज सकाळी चालून आल्यावर माझ्या डाव्या गुडघ्यात थोडे दुखत आहे...',
  tellDoctorTapToSpeak: 'बोलण्यासाठी टॅप करा',
  tellDoctorStopListening: 'ऐकणे थांबवा',
  tellDoctorSaveBtn: 'डॉक्टरांसाठी जतन करा',
  tellDoctorSaving: 'वर्गीकरण करून जतन होत आहे...',
  tellDoctorSavedToast: 'डॉक्टरांसाठी तुमची नोंद ({category}) जतन झाली आहे.',
  tellDoctorSpokenConfirm: 'धन्यवाद {name}. डॉक्टरांच्या भेटीसाठी तुमची ही नोंद मी जतन केली आहे.',
  doctorNotesSectionTitle: 'डॉक्टरांसाठी रुग्णाच्या लक्षणांच्या नोंदी',
  noDoctorNotesYet: 'ज्येष्ठांनी अजून कोणतीही लक्षण नोंद केलेली नाही.',
  symptomCatPain: 'वेदना / दुखणे',
  symptomCatDizziness: 'चक्कर येणे',
  symptomCatFatigue: 'थकवा / अशक्तपणा',
  symptomCatDigestion: 'पचन / पोट',
  symptomCatBreathing: 'श्वास / खोकला',
  symptomCatSleep: 'झोप',
  symptomCatOther: 'सामान्य नोंद',
  allIsWellTitle: 'सर्व ठीक आहे',
  allIsWellMorningDone: '{name} यांनी आज सकाळची सर्व औषधे घेतली आहेत',
  allIsWellSoFarDone: '{name} यांनी आतापर्यंतची सर्व नियोजित औषधे घेतली आहेत',
  allIsWellNoDosesYet: '{name} यांचा दिवस शांतपणे सुरू झाला आहे — कोणताही डोस प्रलंबित नाही',
  oneDoseLateTitle: 'लक्ष द्या',
  oneDoseLateMsg: '{name} यांचा एक डोस ({med}) थोडा उशिरा आहे — लगेच अलर्ट न पाठवता शांतपणे पाहत आहोत',
  escalatedConsecutiveTitle: 'अलर्ट पाठवला आहे',
  escalatedConsecutiveMsg: '{name} यांचे सलग दोन डोस राहिले आहेत — काळजीवाहू आणि कुटुंबाला कळवले आहे',
  alertConsecutiveMissedTitle: 'सलग 2 डोस राहिले: कृपया संपर्क साधा',
  alertConsecutiveMissedMsg: '{name} यांचे सलग दोन नियोजित डोस ({med}) राहिले आहेत. कृपया चौकशी करा.',
  micPermissionTitle: 'आवाजाने बोलण्यासाठी माइकची परवानगी',
  micPermissionPromptDesc: 'माइकची परवानगी द्या जेणेकरून सती तुमचे बोलणे स्पष्ट ऐकू शकेल आणि सोप्या मराठीत उत्तर देईल.',
  micWhyDetail: 'सती माइक का मागते: तुम्ही माइक दाबल्यावर किंवा "Hey Sati" म्हणाल्यावरच आवाज रेकॉर्ड होतो आणि तुम्ही थांबताच आपोआप बंद होतो.',
  allowMicBtn: 'माइकची परवानगी द्या',
  checkingMicBtn: 'माइक तपासत आहे...',
  micDeniedTitle: 'माइकची परवानगी बंद आहे',
  micDeniedMsg: 'कृपया ब्राउझर सेटिंग्जमध्ये माइक सुरू करा, किंवा खालील बॉक्समध्ये टाइप करून सतीशी बोला.',
  micBlockedStepsTitle: 'माइक सुरू करण्याच्या सोप्या पायऱ्या:',
  micBlockedStep1: '1. वर वेबसाइट पत्त्याशेजारील कुलूप (लॉक) किंवा सेटिंग चिन्हावर टॅप करा.',
  micBlockedStep2: '2. "Microphone" पर्याय शोधा आणि तो "Allow" (परवानगी द्या) करा.',
  micBlockedStep3: '3. खाली "माइक पुन्हा तपासा" दाबा किंवा पान रीलोड करा.',
  micUnavailableMsg: 'या ब्राउझरमध्ये माइक रेकॉर्डिंग उपलब्ध नाही. तुम्ही खाली टाइप करून सतीशी बोलू शकता.',
  retryMicBtn: 'माइक पुन्हा तपासा',
  liveTranscriptLabel: 'थेट ट्रान्सक्रिप्ट — ऐकत आहे',
  speakNowPlaceholder: 'आता बोला — तुमचे शब्द येथे दिसतील...',
  stopAndSendBtn: 'थांबवा आणि पाठवा',
  cancelVoiceBtn: 'रद्द करा',
  textFallbackLabel: 'सतीला टाइप करून विचारा (नेहमी उपलब्ध)',
  micNoSpeechMsg: 'कोणताही आवाज ऐकू आला नाही. पुन्हा माइक दाबा किंवा खाली टाइप करा.',
  micAudioErrorMsg: 'कार्यरत माइक आढळला नाही. कृपया डिव्हाइस तपासा किंवा खाली टाइप करा.',
  micNetworkErrorMsg: 'आवाज ओळखताना नेटवर्क अडचण आली. पुन्हा प्रयत्न करा किंवा खाली टाइप करा.',
  speechSynthUnavailableMsg: 'या ब्राउझरमध्ये बोलून उत्तर देणे उपलब्ध नाही; सती मोठ्या अक्षरांत उत्तर देईल.',
  voiceErrorReasonLabel: 'तांत्रिक कारण:',
  recordingWavLabel: 'तुमचा आवाज रेकॉर्ड होत आहे — सावकाश बोला',
  recordingAutoStopHint: 'थांबल्यानंतर ~1.5 सेकंदांत आपोआप पाठवेल (कमाल 20 सेकंद)',
  processingVoiceLabel: 'सती तुमचे बोलणे लक्षपूर्वक समजून घेत आहे...',
  satiHeardLabel: 'सतीने हे ऐकले:',
  tryAgainVoiceBtn: 'मी हे बोललो नाही? पुन्हा प्रयत्न करा',
  fallbackVoiceLargeTextNote: 'या डिव्हाइसवर मराठी आवाज उपलब्ध नाही — उपलब्ध आवाजात उत्तर देत आहे आणि सतीचे उत्तर खाली मोठ्या अक्षरांत दाखवले आहे.',
  wakePhraseBadge: '"Hey Sati" म्हणा किंवा माइक दाबा',
  latestReplyBannerLabel: 'सती सांगते:',
  voiceRemindersLabel: 'औषधांची आठवण आणि खात्री बोलून ऐकवा',
  copyPasscodeBtn: 'कोड कॉपी करा',
  copiedPasscodeWord: 'कॉपी झाला!',
  sideEffectsLabel: 'संभाव्य दुष्परिणाम (स्वल्पविराम देऊन, ऐच्छिक)',
  invalidTimesError: 'कृपया योग्य 24-तासांची वेळ लिहा, उदा. 08:00, 20:00.',
  fillMedBtnLabel: 'भरा:',
  removeVoiceBtn: 'आवाज काढून टाका',
  voiceRecordError: 'माइक रेकॉर्डिंग उपलब्ध नाही किंवा बंद आहे. त्याऐवजी ऑडिओ फाइल अपलोड करा.',
  confirmResetTitle: 'मुख्य पानावर परत जायचे का?',
  confirmResetDesc: 'यामुळे या ब्राउझरमधील सध्याचे केअर सर्कल सत्र पुसले जाईल आणि सुरुवातीचा स्क्रीन उघडेल.',
  confirmResetBtn: 'होय, रीसेट करा',
  demoAddMedFirstNotice: 'हा डेमो पाहण्यासाठी कृपया आधी किमान एक औषध जोडा.',
  howSatiWorksBtn: 'सती कसे काम करते (30 सेकंद माहिती)',
  howSatiWorksTitle: 'सती कसे काम करते',
  howSatiWorksSubtitle: '30 सेकंदात केअर सर्कल, तीन भूमिका, पासकोड प्रवेश आणि खात्रीची पद्धत समजून घ्या.',
  howStep1Title: '1. केअर सर्कलची संकल्पना',
  howStep1Desc: 'ज्येष्ठ व्यक्ती, काळजीवाहू आणि कुटुंब एकच आरोग्य प्रोफाइल वापरतात — आणि गोपनीयतेचे सर्व नियंत्रण नेहमी ज्येष्ठांकडेच राहते.',
  howStep2Title: '2. तीन विशेष भूमिका',
  howStep2Desc: 'ज्येष्ठ स्क्रीनवर मोठे सोपे बटण व सती आवाज सोबती; काळजीवाहू स्क्रीनवर डोस खात्री व औषध व्यवस्थापन; कुटुंब स्क्रीनवर शांत सारांश व डॉक्टरांचा अहवाल.',
  howStep3Title: '3. खाजगी 6-अंकी पासकोड',
  howStep3Desc: 'ज्येष्ठ प्रोफाइल तयार झाल्यावर 6-अंकी कोड मिळतो. काळजीवाहू आणि कुटुंबीय ईमेल व हा कोड टाकून सुरक्षित सामील होतात.',
  howStep4Title: '4. सौम्य आठवण आणि ईमेल लॉग',
  howStep4Desc: 'वेळेवर सती प्रेमाने बोलते. प्रतिसाद न मिळाल्यास: 10 मिनिटांनी पुन्हा आठवण → काळजीवाहूंना सूचना → आणखी 10 मिनिटांनी कुटुंबाला सूचना व प्रत्येक ईमेल नोंदवला जातो.',
  howStep5Title: '5. Verified विरुद्ध Said-Taken',
  howStep5Desc: '"घेतल्याची नोंद" (ज्येष्ठांचे बोलणे) आणि "खात्रीशीर" (फोटो तपासणी, काळजीवाहू खात्री किंवा पिलबॉक्स सेन्सर) वेगळे ठेवले जातात आणि दुहेरी डोस रोखला जातो.',
  howAccessibilityTitle: '6. सुलभता आणि सन्मान (Accessibility)',
  howAccessibilityDesc: 'सर्व स्क्रीनवर सामान्य, मोठा व अतिमोठा मजकूर, हाय कॉन्ट्रास्ट मोड, डिमेंशिया-स्नेही मोड, 48px+ मोठी बटणे, पूर्ण कीबोर्ड नेव्हिगेशन, स्क्रीन-रीडर थेट सूचना, कमी हालचाल आधार आणि आवाज + मजकूर पर्याय आहेत.',
  howSatiWorksCtaDemo: 'आता डेमो मोड पहा',
  skipToMainContent: 'मुख्य भागाकडे जा',
  primaryNavLabel: 'मुख्य नेव्हिगेशन',
  mobileNavLabel: 'मोबाईल तळाचे नेव्हिगेशन',
  pillGraphicAlt: '{color} {shape} गोळी',
  pillGraphicForMedAlt: '{med} साठी {color} {shape} गोळी',
  defaultMedPurpose: 'दैनंदिन औषधोपचार',
  defaultSpecialty: 'सामान्य तपासणी',
  defaultClinic: 'स्थानिक क्लिनिक',
  namePlaceholder: 'उदा. सुनीता कुलकर्णी',
  conditionsPlaceholder: 'उदा. मधुमेह, रक्तदाब',
  allergiesPlaceholder: 'उदा. पेनिसिलिन (नसल्यास रिकामे सोडा)',
  relationCaretakerPlaceholder: 'मुख्य परिचारिका / काळजीवाहू',
  relationFamilyPlaceholder: 'मुलगी / मुलगा',
  geminiErrorChat: 'सती सध्या संपर्क करू शकत नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा किंवा खालील वेळापत्रक पहा.',
  geminiErrorScan: 'सध्या प्रिस्क्रिप्शन स्कॅन करता आले नाही. तुम्ही खाली औषधाचा तपशील स्वतः भरू शकता.',
  geminiErrorInteraction: 'औषध परिणाम तपासणी सध्या उपलब्ध नाही. कृपया डॉक्टरांचा किंवा फार्मासिस्टचा सल्ला घ्या.',
  geminiErrorPhoto: 'सध्या फोटो तपासता आला नाही. तुम्ही स्वतः नोंद करू शकता किंवा काळजीवाहूंची मदत घेऊ शकता.',
  offlineReportNote: 'AI सारांश तात्पुरता उपलब्ध नाही; त्याऐवजी अचूक स्थानिक अहवाल तयार केला आहे.',
  emailFilterAll: 'सर्व',
  emailFilterReminders: 'औषध आठवणी',
  emailFilterAlerts: 'चुकलेले डोस व सूचना',
  emailFilterAppointments: 'डॉक्टरांच्या भेटी',
  emailTypeDoseReminder: 'औषध आठवण',
  emailTypeAppointmentReminder: 'भेट आठवण',
  emailTypeMissedDose: 'चुकलेला डोस',
  emailTypeLowStock: 'रिफिल सूचना',
  emailTypeEscalation: 'एस्केलेशन',
  emailTypeEmergency: 'आणीबाणी',
  emailTypeSuspiciousPattern: 'पॅटर्न तपासणी',
  emailTypeMoodTrend: 'मनःस्थिती सूचना',
  emailTypeHealthConcern: 'आरोग्य तपासणी',
  emailTypeInactivity: 'विचारपूस',
  emailReminderSubject: '[सती आठवण] पुढील डोस: {med} ({time})',
  emailReminderBody: 'नमस्कार {recipient}, {elder} यांचा {med} डोस {time} वाजता ({cue}) आहे. सतीने आवाजात प्रेमाने आठवण करून दिली आहे.',
  emailAppointmentSubject: '[सती भेट आठवण] {doctor} — {date}, {time}',
  emailAppointmentBody: 'नमस्कार {recipient}, {elder} यांची आगामी डॉक्टर भेट: {doctor} ({specialty}), ठिकाण: {clinic}, वेळ: {date} रोजी {time} वाजता.',
  emailEmergencySubject: '[तातडीची आणीबाणी] {elder} — सती अलर्ट',
  emailEmergencyBody: '{elder} यांच्यासाठी आणीबाणी मदत सुरू करण्यात आली आहे. कारण: {reason}. आजार: {conditions}. अ‍ॅलर्जी: {allergies}. ठिकाण: {location}.',
  emailHealthSubject: '[सती केअर सर्कल] {elder} साठी आरोग्य चौकशी आवश्यक',
  emailHealthBody: 'नमस्कार {recipient}, सतीला {elder} यांच्याकडून आरोग्याची शंका आढळली: {reason}. कृपया प्रेमाने चौकशी करा.',
  emailEscalationCaretakerSubject: '[सती एस्केलेशन] काळजीवाहू तपासणी: {med}',
  emailEscalationCaretakerBody: 'नमस्कार {recipient}, {elder} यांनी {med} च्या दोन आठवणींना प्रतिसाद दिला नाही. कृपया खात्री करा.',
  emailEscalationFamilySubject: '[सती कुटुंब सूचना] {elder} यांचा डोस बाकी आहे',
  emailEscalationFamilyBody: 'नमस्कार {recipient}, काळजीवाहू सूचनेनंतरही {elder} यांनी {med} ची नोंद केलेली नाही. कृपया प्रेमाने संपर्क साधा.',
  emailInactivitySubject: '[सती तातडीची तपासणी] {elder} कडून प्रतिसाद नाही',
  emailInactivityBody: 'नमस्कार {recipient}, {elder} यांनी सतीच्या "तुम्ही ठीक आहात का?" तपासणीला उत्तर दिले नाही. कृपया लगेच संपर्क करा.',
  emailSuspiciousSubject: '[सती] पॅटर्न सूचना: {med} नोंद',
  emailSuspiciousBody: 'नमस्कार {recipient}, {elder} यांचे {med} औषध ({flag}) नोंदवले गेले आहे. कृपया सोबत शांतपणे तपासून पहा.',
  emailMoodSubject: '[सती] {elder} शी प्रेमाने बोलण्याची सूचना',
  emailMoodBody: 'नमस्कार {recipient}, {elder} अलीकडे थोडे उदास किंवा अस्वस्थ वाटत असल्याचे सतीच्या लक्षात आले. तुमचा एक फोन कॉल त्यांना नक्की आवडेल.',
  suspiciousEarlyFlag: 'नियोजित वेळेपूर्वी {mins} मिनिटे आधी नोंदवले',
  suspiciousLateNightFlag: 'रात्रीच्या असामान्य वेळी ({time}) नोंदवले',
  medNamePlaceholder: 'उदा. मेटफॉर्मिन (Metformin)',
  medDosePlaceholder: 'उदा. 500mg',
  medCuePlaceholder: 'नाश्त्यानंतर',
  medPurposePlaceholder: 'रक्तदाब नियंत्रित ठेवण्यासाठी',
  medSideEffectsPlaceholder: 'उदा. चक्कर येणे, सौम्य मळमळ',
  apptDoctorPlaceholder: 'डॉ. मीरा देशमुख',
  apptSpecialtyPlaceholder: 'हृदयरोग (Cardiology)',
  apptClinicPlaceholder: 'सिटी वेलनेस क्लिनिक',
  apptNotesPlaceholder: 'रिकाम्या पोटी शुगरची नोंद सोबत आणा',
  medicalIdBtn: 'मेडिकल आयडी',
  medicalIdTitle: 'तातडीचे मेडिकल आयडी कार्ड',
  medicalIdSubtitle: 'तुमची आरोग्य माहिती, डॉक्टर आणि कुटुंबाचे नंबर एका टॅपमध्ये.',
  bloodGroupLabel: 'रक्तगट',
  notSpecifiedWord: 'अद्याप नोंदवलेले नाही',
  doctorContactLabel: 'मुख्य डॉक्टर',
  doctorPhoneLabel: 'डॉक्टरांचा फोन',
  familyContactsLabel: 'कुटुंबातील संपर्क',
  callFamilyBtn: 'कुटुंबाला कॉल करा',
  callDoctorBtn: 'डॉक्टरांना कॉल करा',
  callContactBtn: 'कॉल करा',
  callingBannerText: '{name} ({phone}) यांना कॉल केला जात आहे...',
  noPhoneAddedNote: 'अद्याप फोन नंबर जतन केलेला नाही. सेटिंग्ज > मेडिकल आयडी मध्ये जोडा.',
  medicalIdEditTitle: 'मेडिकल आयडी तपशील',
  medicalIdEditDesc: 'रक्तगट, अ‍ॅलर्जी, आजार, डॉक्टरांचा नंबर आणि कुटुंबातील संपर्क येथे बदला.',
  medicalIdSavedToast: 'मेडिकल आयडी तपशील जतन केले आहेत.',
  addContactBtn: 'कुटुंबाचा संपर्क जोडा',
  contactNamePlaceholder: 'नाव (उदा. आदित्य शर्मा)',
  contactRelationPlaceholder: 'नाते (उदा. मुलगा)',
  contactPhonePlaceholder: 'फोन (उदा. +91 98201 44510)',
  conditionsCommaHint: 'आरोग्य स्थिती (स्वल्पविरामाने वेगळे लिहा)',
  allergiesCommaHint: 'अ‍ॅलर्जी (स्वल्पविरामाने वेगळे लिहा)',
  emergencyPhoneLabel: 'आणीबाणी नंबर',
  closeBtn: 'बंद करा',
  undoDoseBtn: 'परत घ्या, मी अजून औषध घेतलेले नाही',
  dismissBtn: 'बंद करा',
  doseUndoneBanner: '{med} पुन्हा बाकी यादीत ठेवले आहे. वेळ झाल्यावर आरामात घ्या.',
  takenTodayHeading: 'आज घेतलेली औषधे (चूक झाल्यास परत घ्या)',
  tagForSugar: 'शुगरसाठी',
  tagForBP: 'बीपीसाठी',
  tagForHeart: 'हृदयासाठी',
  tagForBones: 'हाडे आणि ताकदीसाठी',
  tagForStomach: 'पोटासाठी',
  tagForSleep: 'झोपेसाठी',
  tagForHealth: 'दररोजच्या आरोग्यासाठी',
  tagTakeAfterFood: 'जेवणानंतर घ्या',
  tagTakeAfterBreakfast: 'नाश्त्यानंतर घ्या',
  tagTakeAfterLunch: 'दुपारच्या जेवणानंतर घ्या',
  tagTakeAfterDinner: 'रात्रीच्या जेवणानंतर घ्या',
  tagTakeBeforeFood: 'जेवणापूर्वी घ्या',
  tagTakeBeforeBreakfast: 'नाश्त्यापूर्वी घ्या',
  tagTakeBeforeSleep: 'झोपण्यापूर्वी घ्या',
  tagTakeAnytime: 'केव्हाही घ्या',
  plainConditionSugar: 'शुगर',
  plainConditionBP: 'उच्च बीपी',
  plainConditionHeart: 'हृदयाची काळजी',
  plainConditionJoints: 'सांधेदुखी काळजी',
  familyMsgSentConfirm: 'मी {recipients} यांना तुमचा निरोप पाठवला आहे: "{summary}"',
  familyMsgAlertTitle: '{elder} यांचा निरोप ({recipients} साठी)',
  familyMsgEmailSubject: '[सती निरोप — {elder}] {recipient} यांच्यासाठी',
  familyMsgEmailBody: 'नमस्कार {recipient}, {elder} यांनी सतीला तुम्हाला हा निरोप देण्यास सांगितले आहे: "{summary}" (मूळ बोलणे: "{original}").',
  emailTypeFamilyMessage: 'कुटुंब निरोप',
  pinDigitEnteredToast: '6 पैकी अंक {count} नोंदवला गेला',
  pinDigitSpokenWord: 'अंक नोंदवला गेला',
  pinBackspaceBtn: 'पुसा',
  pinClearBtn: 'साफ करा',
  forgotPasscodeBtn: 'पासकोड विसरलात? कुटुंबाला विचारा',
  forgotPasscodeSentTitle: 'कुटुंबाला विनंती पाठवली आहे',
  forgotPasscodeSentDesc: 'सतीने {circle} यांना 6 अंकी पासकोड देण्यासाठी सूचना आणि सिम्युलेटेड ईमेल पाठवला आहे.',
  passcodeHelpAlertTitle: '{name} यांनी पासकोड मदत मागितली आहे',
  passcodeHelpAlertMsg: '{name} ({role}) यांनी "पासकोड विसरलात?" दाबले आहे आणि केअर सर्कलचा पासकोड हवा आहे.',
  passcodeHelpEmailSubject: '[सती पासकोड मदत] {name} पासकोड मागत आहेत',
  passcodeHelpEmailBody: 'नमस्कार {recipient}, {name} ({email}) यांनी {elder} यांच्या केअर सर्कलमध्ये सामील होताना "पासकोड विसरलात? कुटुंबाला विचारा" दाबले आहे. कृपया तुमचा 6 अंकी पासकोड शेअर करा.',
  emailTypePasscodeHelp: 'पासकोड मदत',
};

const ta: TranslationDict = {
  ...en,
  brandName: 'சதி (Sati)',
  tagline: 'முதியவர்களை ஒவ்வொரு முடிவின் மையத்திலும் வைக்கும் அன்பான குரல் வழி பராமரிப்பு.',
  chooseLanguage: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
  demoModeBtn: 'டெமோ பயன்முறை (ரமேஷ் சர்மா)',
  freshSetupBtn: 'புதிய பராமரிப்பு வட்டம் தொடங்கவும்',
  greetingMorning: 'காலை வணக்கம்',
  greetingAfternoon: 'மதிய வணக்கம்',
  greetingEvening: 'மாலை வணக்கம்',
  nextMedicineLabel: 'உங்கள் அடுத்த மருந்து',
  allDoneToday: 'இப்போதைய மருந்துகள் அனைத்தும் எடுக்கப்பட்டன',
  iHaveTakenIt: 'நான் எடுத்துவிட்டேன்',
  verifyWithPhoto: 'புகைப்படத்துடன் உறுதிப்படுத்தவும்',
  withFood: 'உணவுடன் எடுக்கவும்',
  withoutFood: 'வெறும் வயிற்றில் எடுக்கவும்',
  eitherFood: 'உணவுடனோ அல்லது இல்லாமலோ',
  tabToday: 'இன்று',
  tabProgress: 'முன்னேற்றம்',
  tabAppointments: 'சந்திப்புகள்',
  tabTalk: 'சதியிடம் பேசு',
  tabEmergency: 'அவசரம்',
  tabDashboard: 'மருந்துகள்',
  tabMedications: 'மருந்து பட்டியல்',
  tabAlerts: 'எச்சரிக்கைகள்',
  tabCalendar: 'நாட்காட்டி',
  tabOverview: 'சுருக்கம்',
  tabSettings: 'அமைப்புகள்',
  talkToSatiTitle: 'சதியிடம் பேசுங்கள்',
  progressBestWeek: 'இந்த வாரம் {total} இல் {taken} மருந்துகளை எடுத்தீர்கள் — இதுவே உங்கள் சிறந்த வாரம்!',
  moodTitle: 'இன்று எப்படி உணர்கிறீர்கள்?',
  emergencyTitle: 'அவசர உதவி செயல்பாட்டில் உள்ளது',
  callingAmbulance: 'ஆம்புலன்ஸ் 108 அழைக்கப்படுகிறது',
  areYouOkayTitle: 'நீங்கள் நலமாக இருக்கிறீர்களா?',
  imOkayBtn: 'ஆம், நான் நலமாக இருக்கிறேன்',
  iNeedHelpBtn: 'எனக்கு உதவி தேவை',
  roleElderly: 'நான் முதியவர்',
  roleCaretaker: 'நான் பராமரிப்பாளர்',
  roleFamily: 'நான் குடும்ப உறுப்பினர்',
};

const te: TranslationDict = {
  ...en,
  brandName: 'సతి (Sati)',
  tagline: 'పెద్దలను ప్రతి నిర్ణయంలోనూ కేంద్రంగా ఉంచే ఆప్యాయత గల వాయిస్ కేర్.',
  chooseLanguage: 'మీ భాషను ఎంచుకోండి',
  demoModeBtn: 'డెమో మోడ్ చూడండి (రమేష్ శర్మ)',
  freshSetupBtn: 'కొత్త కేర్ సర్కిల్ ప్రారంభించండి',
  greetingMorning: 'శుభోదయం',
  greetingAfternoon: 'నమస్కారం',
  greetingEvening: 'శుభ సాయంత్రం',
  nextMedicineLabel: 'మీ తదుపరి మందు',
  allDoneToday: 'ఇప్పటివరకు అన్ని మందులు పూర్తయ్యాయి',
  iHaveTakenIt: 'నేను వేసుకున్నాను',
  verifyWithPhoto: 'ఫోటోతో నిర్ధారించండి',
  withFood: 'ఆహారంతో వేసుకోండి',
  withoutFood: 'ఖాళీ కడుపుతో వేసుకోండి',
  eitherFood: 'ఆహారంతో లేదా లేకుండా',
  tabToday: 'ఈ రోజు',
  tabProgress: 'నా ప్రగతి',
  tabAppointments: 'అపాయింట్‌మెంట్లు',
  tabTalk: 'సతితో మాట్లాడండి',
  tabEmergency: 'అత్యవసరం',
  tabDashboard: 'డోసులు',
  tabMedications: 'మందులు',
  tabAlerts: 'హెచ్చరికలు',
  tabCalendar: 'క్యాలెండర్',
  tabOverview: 'సారాంశం',
  tabSettings: 'సెట్టింగులు',
  progressBestWeek: 'ఈ వారం {total} లో {taken} డోసులు తీసుకున్నారు — ఇది మీ అత్యుత్తమ వారం!',
  moodTitle: 'ఈ రోజు మీరు ఎలా ఉన్నారు?',
  emergencyTitle: 'అత్యవసర సహాయం సక్రియంగా ఉంది',
  callingAmbulance: 'అంబులెన్స్ 108 కు కాల్ చేస్తోంది',
  areYouOkayTitle: 'మీరు క్షేమంగా ఉన్నారా?',
  imOkayBtn: 'అవును, నేను బాగున్నాను',
  iNeedHelpBtn: 'నాకు సహాయం కావాలి',
  roleElderly: 'నేను వృద్ధుడిని',
  roleCaretaker: 'నేను సంరక్షకుడిని',
  roleFamily: 'నేను కుటుంబ సభ్యుడిని',
};

const bn: TranslationDict = {
  ...en,
  brandName: 'সতী (Sati)',
  tagline: 'আন্তরিক ও কণ্ঠ-নির্ভর যত্ন, যেখানে প্রবীণরা প্রতিটি সিদ্ধান্তের কেন্দ্রে থাকেন।',
  chooseLanguage: 'আপনার ভাষা বেছে নিন',
  demoModeBtn: 'ডেমো মোড দেখুন (রমেশ শর্মা)',
  freshSetupBtn: 'নতুন কেয়ার সার্কেল শুরু করুন',
  greetingMorning: 'সুপ্রভাত',
  greetingAfternoon: 'শুভ অপরাহ্ন',
  greetingEvening: 'শুভ সন্ধ্যা',
  nextMedicineLabel: 'আপনার পরবর্তী ওষুধ',
  allDoneToday: 'এখনকার মতো সব ওষুধ নেওয়া হয়েছে',
  iHaveTakenIt: 'আমি ওষুধ খেয়েছি',
  verifyWithPhoto: 'ছবি তুলে নিশ্চিত করুন',
  withFood: 'খাবারের সাথে খান',
  withoutFood: 'খালি পেটে খান',
  eitherFood: 'খাবারের সাথে বা ছাড়া',
  tabToday: 'আজ',
  tabProgress: 'আমার অগ্রগতি',
  tabAppointments: 'সাক্ষাৎ',
  tabTalk: 'সতীর সাথে কথা',
  tabEmergency: 'জরুরি',
  tabDashboard: 'ডোজ',
  tabMedications: 'ওষুধ',
  tabAlerts: 'সতর্কতা',
  tabCalendar: 'ক্যালেন্ডার',
  tabOverview: 'সারসংক্ষেপ',
  tabSettings: 'সেটিংস',
  progressBestWeek: 'আপনি এই সপ্তাহে {total}টির মধ্যে {taken}টি ডোজ নিয়েছেন — আপনার সেরা সপ্তাহ!',
  moodTitle: 'আজ আপনার কেমন লাগছে?',
  emergencyTitle: 'জরুরি সহায়তা সক্রিয়',
  callingAmbulance: 'অ্যাম্বুলেন্স ১০৮-এ কল করা হচ্ছে',
  areYouOkayTitle: 'আপনি কি ঠিক আছেন?',
  imOkayBtn: 'হ্যাঁ, আমি ভালো আছি',
  iNeedHelpBtn: 'আমার সাহায্য দরকার',
  roleElderly: 'আমি প্রবীণ ব্যক্তি',
  roleCaretaker: 'আমি কেয়ারটেকার',
  roleFamily: 'আমি পরিবারের সদস্য',
};

const gu: TranslationDict = {
  ...en,
  brandName: 'સતી (Sati)',
  tagline: 'વડીલોને દરેક નિર્ણયના કેન્દ્રમાં રાખતી હૂંફાળી અને અવાજ-આધારિત સંભાળ.',
  chooseLanguage: 'તમારી ભાષા પસંદ કરો',
  demoModeBtn: 'ડેમો મોડ જુઓ (રમેશ શર્મા)',
  freshSetupBtn: 'નવું કેર સર્કલ શરૂ કરો',
  greetingMorning: 'સુપ્રભાત',
  greetingAfternoon: 'નમસ્તે',
  greetingEvening: 'શુભ સાંજ',
  nextMedicineLabel: 'તમારી આગામી દવા',
  allDoneToday: 'અત્યારની બધી દવાઓ પૂરી થઈ ગઈ છે',
  iHaveTakenIt: 'મેં દવા લઈ લીધી છે',
  verifyWithPhoto: 'ફોટો દ્વારા ખાતરી કરો',
  withFood: 'જમ્યા સાથે લો',
  withoutFood: 'ખાલી પેટે લો',
  eitherFood: 'જમ્યા સાથે કે વગર',
  tabToday: 'આજ',
  tabProgress: 'મારી પ્રગતિ',
  tabAppointments: 'મુલાકાતો',
  tabTalk: 'સતી સાથે વાત',
  tabEmergency: 'કટોકટી',
  tabDashboard: 'ડોઝ',
  tabMedications: 'દવાઓ',
  tabAlerts: 'સૂચનાઓ',
  tabCalendar: 'કૅલેન્ડર',
  tabOverview: 'સારાંશ',
  tabSettings: 'સેટિંગ્સ',
  progressBestWeek: 'તમે આ અઠવાડિયે {total} માંથી {taken} ડોઝ લીધા — તમારું શ્રેષ્ઠ અઠવાડિયું!',
  moodTitle: 'આજે તમને કેવું લાગે છે?',
  emergencyTitle: 'કટોકટી સહાય સક્રિય',
  callingAmbulance: 'એમ્બ્યુલન્સ 108 પર કૉલ થઈ રહ્યો છે',
  areYouOkayTitle: 'શું તમે ઠીક છો?',
  imOkayBtn: 'હા, હું ઠીક છું',
  iNeedHelpBtn: 'મને મદદ જોઈએ છે',
  roleElderly: 'હું વડીલ છું',
  roleCaretaker: 'હું સંભાળ રાખનાર (કેરટેકર) છું',
  roleFamily: 'હું પરિવારનો સભ્ય છું',
};

const kn: TranslationDict = {
  ...en,
  brandName: 'ಸತಿ (Sati)',
  tagline: 'ಪ್ರತಿ ನಿರ್ಧಾರದಲ್ಲೂ ಹಿರಿಯರನ್ನು ಕೇಂದ್ರದಲ್ಲಿರಿಸುವ ಆತ್ಮೀಯ ಧ್ವನಿ-ಆಧಾರಿತ ಆರೈಕೆ.',
  chooseLanguage: 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
  demoModeBtn: 'ಡೆಮೋ ಮೋಡ್ ನೋಡಿ (ರಮೇಶ್ ಶರ್ಮಾ)',
  freshSetupBtn: 'ಹೊಸ ಕೇರ್ ಸರ್ಕಲ್ ಪ್ರಾರಂಭಿಸಿ',
  greetingMorning: 'ಶುಭೋದಯ',
  greetingAfternoon: 'ನಮಸ್ಕಾರ',
  greetingEvening: 'ಶುಭ ಸಂಜೆ',
  nextMedicineLabel: 'ನಿಮ್ಮ ಮುಂದಿನ ಔಷಧಿ',
  allDoneToday: 'ಇದೀಗ ಎಲ್ಲಾ ಔಷಧಿಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ',
  iHaveTakenIt: 'ನಾನು ತೆಗೆದುಕೊಂಡಿದ್ದೇನೆ',
  verifyWithPhoto: 'ಫೋಟೋ ಮೂಲಕ ದೃಢೀಕರಿಸಿ',
  withFood: 'ಆಹಾರದೊಂದಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ',
  withoutFood: 'ಖಾಲಿ ಹೊಟ್ಟೆಯಲ್ಲಿ ತೆಗೆದುಕೊಳ್ಳಿ',
  eitherFood: 'ಆಹಾರದೊಂದಿಗೆ ಅಥವಾ ಇಲ್ಲದೆ',
  tabToday: 'ಇಂದು',
  tabProgress: 'ನನ್ನ ಪ್ರಗತಿ',
  tabAppointments: 'ಭೇಟಿಗಳು',
  tabTalk: 'ಸತಿಯೊಂದಿಗೆ ಮಾತನಾಡಿ',
  tabEmergency: 'ತುರ್ತು',
  tabDashboard: 'ಡೋಸ್‌ಗಳು',
  tabMedications: 'ಔಷಧಿಗಳು',
  tabAlerts: 'ಎಚ್ಚರಿಕೆಗಳು',
  tabCalendar: 'ಕ್ಯಾಲೆಂಡರ್',
  tabOverview: 'ಸಾರಾಂಶ',
  tabSettings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
  progressBestWeek: 'ಈ ವಾರ ನೀವು {total} ರಲ್ಲಿ {taken} ಡೋಸ್‌ಗಳನ್ನು ತೆಗೆದುಕೊಂಡಿದ್ದೀರಿ — ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ವಾರ!',
  moodTitle: 'ಇಂದು ನಿಮಗೆ ಹೇಗೆ ಅನಿಸುತ್ತಿದೆ?',
  emergencyTitle: 'ತುರ್ತು ಸಹಾಯ ಸಕ್ರಿಯವಾಗಿದೆ',
  callingAmbulance: 'ಆಂಬ್ಯುಲೆನ್ಸ್ 108 ಕ್ಕೆ ಕರೆ ಮಾಡಲಾಗುತ್ತಿದೆ',
  areYouOkayTitle: 'ನೀವು ಆರಾಮವಾಗಿದ್ದೀರಾ?',
  imOkayBtn: 'ಹೌದು, ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ',
  iNeedHelpBtn: 'ನನಗೆ ಸಹಾಯ ಬೇಕು',
  roleElderly: 'ನಾನು ಹಿರಿಯ ನಾಗರಿಕ',
  roleCaretaker: 'ನಾನು ಆರೈಕೆದಾರ',
  roleFamily: 'ನಾನು ಕುಟುಂಬದ ಸದಸ್ಯ',
};

const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en,
  hi,
  mr,
  ta,
  te,
  bn,
  gu,
  kn,
};

export function getT(lang: LanguageCode): TranslationDict {
  return TRANSLATIONS[lang] || en;
}

export function getLocalizedHonorificName(lang: LanguageCode, fullName: string): string {
  const firstName = fullName.trim().split(/\s+/)[0] || fullName.trim() || 'Friend';
  const langOpt = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  return `${firstName} ${langOpt.honorificSuffix}`;
}

export function getGreeting(lang: LanguageCode, fullName: string): string {
  const t = getT(lang);
  const hour = new Date().getHours();
  const base = hour < 12 ? t.greetingMorning : hour < 17 ? t.greetingAfternoon : t.greetingEvening;
  return `${base}, ${getLocalizedHonorificName(lang, fullName)}`;
}

export function formatTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)),
    template
  );
}
