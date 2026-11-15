import { formatTemplate, getLocalizedHonorificName, getT } from '../i18n/translations';
import { CareCircleState, DoseLog, LanguageCode, Medication } from '../types';

export function getLocalDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generatePasscode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createDemoState(language: LanguageCode = 'en'): CareCircleState {
  const today = getLocalDateStr(0);
  const now = new Date();
  const nowHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const eveningLastTime = nowHHMM >= '21:30' ? '23:59' : '21:30';

  const medications: Medication[] = [
    {
      id: 'med-metformin',
      name: 'Metformin',
      dose: '500mg',
      times: ['08:00', '20:00'],
      foodTiming: 'with_food',
      startDate: getLocalDateStr(-60),
      endDate: '',
      pillColor: 'white',
      pillShape: 'oval',
      stockCount: 18,
      lowStockThreshold: 6,
      purpose: 'Helps keep blood sugar steady after meals',
      sideEffects: ['mild stomach upset', 'nausea', 'loss of appetite'],
      routineCue: 'Right after breakfast & dinner',
      safeWindowHours: 5,
    },
    {
      id: 'med-amlodipine',
      name: 'Amlodipine',
      dose: '5mg',
      times: ['08:30'],
      foodTiming: 'without_food',
      startDate: getLocalDateStr(-90),
      endDate: '',
      pillColor: 'yellow',
      pillShape: 'round',
      stockCount: 4,
      lowStockThreshold: 5,
      purpose: 'Supports calm, healthy blood pressure',
      sideEffects: ['dizziness', 'headache', 'ankle swelling'],
      routineCue: 'With morning tea water',
      safeWindowHours: 12,
    },
    {
      id: 'med-vitd3',
      name: 'Vitamin D3',
      dose: '1000 IU',
      times: ['13:30'],
      foodTiming: 'with_food',
      startDate: getLocalDateStr(-30),
      endDate: '',
      pillColor: 'amber',
      pillShape: 'capsule',
      stockCount: 14,
      lowStockThreshold: 5,
      purpose: 'Strengthens bones and energy',
      sideEffects: ['mild dry mouth'],
      routineCue: 'After afternoon lunch',
      safeWindowHours: 12,
    },
    {
      id: 'med-atorvastatin',
      name: 'Atorvastatin',
      dose: '10mg',
      times: [eveningLastTime],
      foodTiming: 'either',
      startDate: getLocalDateStr(-120),
      endDate: '',
      pillColor: 'pink',
      pillShape: 'oval',
      stockCount: 22,
      lowStockThreshold: 5,
      purpose: 'Keeps cholesterol balanced for heart comfort',
      sideEffects: ['mild muscle ache', 'tiredness', 'headache'],
      routineCue: 'Before bedtime rest',
      safeWindowHours: 12,
    },
  ];

  // Build 30 days of realistic history (days -29 to -1) + today (0)
  // Includes full green days, partial amber days (mostly bedtime skipped), and 2 missed red days
  const doseLogs: DoseLog[] = [];
  for (let offset = -29; offset <= -1; offset++) {
    const dateStr = getLocalDateStr(offset);
    medications.forEach((med, medIdx) => {
      med.times.forEach((time, timeIdx) => {
        const id = `dose-${dateStr}-${med.id}-${time}`;
        const isRedDay = offset === -21 || offset === -10;
        const isPartialEvening =
          (offset === -26 || offset === -19 || offset === -12 || offset === -6 || offset === -4) &&
          med.id === 'med-atorvastatin';
        const isPartialAfternoon = offset === -26 && med.id === 'med-vitd3';
        const isMissedDose =
          (isRedDay && !(medIdx === 0 && timeIdx === 0)) || isPartialEvening || isPartialAfternoon;

        if (isMissedDose) {
          doseLogs.push({
            id,
            medicationId: med.id,
            date: dateStr,
            scheduledTime: time,
            status: 'missed',
          });
        } else {
          const confirmedIso = `${dateStr}T${time}:00`;
          const isVerified = offset <= -2 || med.id === 'med-metformin';
          doseLogs.push({
            id,
            medicationId: med.id,
            date: dateStr,
            scheduledTime: time,
            status: isVerified ? 'verified_taken' : 'said_taken',
            confirmedAt: confirmedIso,
            verifiedAt: isVerified ? confirmedIso : undefined,
            verifiedBy: isVerified ? (offset % 2 === 0 ? 'caretaker' : 'photo') : undefined,
          });
        }
      });
    });
  }

  // Today's doses: doses due earlier today are already taken so the Family dashboard starts "All is well" (green),
  // while the next upcoming dose stays pending so the elderly user can tap "I have taken it".

  doseLogs.push(
    {
      id: `dose-${today}-med-metformin-08:00`,
      medicationId: 'med-metformin',
      date: today,
      scheduledTime: '08:00',
      status: 'verified_taken',
      confirmedAt: new Date(new Date().setHours(8, 5, 0, 0)).toISOString(),
      verifiedAt: new Date(new Date().setHours(8, 12, 0, 0)).toISOString(),
      verifiedBy: 'caretaker',
      verificationNote: 'Verified by Priya after breakfast',
    },
    {
      id: `dose-${today}-med-amlodipine-08:30`,
      medicationId: 'med-amlodipine',
      date: today,
      scheduledTime: '08:30',
      status: 'said_taken',
      confirmedAt: new Date(new Date().setHours(8, 34, 0, 0)).toISOString(),
    },
    {
      id: `dose-${today}-med-vitd3-13:30`,
      medicationId: 'med-vitd3',
      date: today,
      scheduledTime: '13:30',
      status: nowHHMM >= '13:30' ? 'verified_taken' : 'pending',
      ...(nowHHMM >= '13:30'
        ? {
            confirmedAt: new Date(new Date().setHours(13, 35, 0, 0)).toISOString(),
            verifiedAt: new Date(new Date().setHours(13, 40, 0, 0)).toISOString(),
            verifiedBy: 'caretaker' as const,
            verificationNote: 'Verified by Priya after lunch',
          }
        : {}),
    },
    {
      id: `dose-${today}-med-metformin-20:00`,
      medicationId: 'med-metformin',
      date: today,
      scheduledTime: '20:00',
      status: nowHHMM >= '20:00' ? 'said_taken' : 'pending',
      ...(nowHHMM >= '20:00'
        ? {
            confirmedAt: new Date(new Date().setHours(20, 4, 0, 0)).toISOString(),
          }
        : {}),
    },
    {
      id: `dose-${today}-med-atorvastatin-${eveningLastTime}`,
      medicationId: 'med-atorvastatin',
      date: today,
      scheduledTime: eveningLastTime,
      status: 'pending',
    }
  );

  return {
    isSetupComplete: true,
    isDemoMode: true,
    passcode: '482915',
    language,
    activeUserId: 'user-ramesh',
    elderly: {
      name: 'Ramesh Sharma',
      honorificName: getLocalizedHonorificName(language, 'Ramesh Sharma'),
      age: 72,
      bloodGroup: 'O+',
      conditions: ['Type 2 Diabetes', 'Mild Hypertension', 'Cholesterol Management'],
      allergies: ['Penicillin', 'Sulfa drugs'],
      emergencyPhone: '108',
      doctorName: 'Dr. Meera Deshmukh',
      doctorPhone: '+91 98450 22190',
      familyContacts: [
        {
          id: 'fc-aditya',
          name: 'Aditya Sharma',
          relation: 'Son',
          phone: '+91 98201 44510',
        },
        {
          id: 'fc-priya',
          name: 'Priya Nair',
          relation: 'Primary Caretaker',
          phone: '+91 98455 77123',
        },
      ],
      locationLabel: 'Indiranagar, Bengaluru (12.9784° N, 77.6408° E)',
    },
    members: [
      {
        id: 'user-ramesh',
        name: 'Ramesh Sharma',
        email: 'ramesh.sharma@example.com',
        role: 'elderly',
        joinedAt: getLocalDateStr(-60),
      },
      {
        id: 'user-priya',
        name: 'Priya Nair',
        email: 'priya.care@example.com',
        role: 'caretaker',
        relation: 'Primary Caretaker',
        phone: '+91 98455 77123',
        joinedAt: getLocalDateStr(-60),
      },
      {
        id: 'user-aditya',
        name: 'Aditya Sharma',
        email: 'aditya.sharma@example.com',
        role: 'family',
        relation: 'Son',
        phone: '+91 98201 44510',
        joinedAt: getLocalDateStr(-60),
      },
    ],
    medications,
    doseLogs,
    appointments: [
      {
        id: 'appt-1',
        doctorName: 'Dr. Meera Deshmukh',
        specialty: 'Cardiology & Blood Pressure',
        clinic: 'Sakra Heart & Wellness Clinic',
        date: getLocalDateStr(3),
        time: '10:30',
        notes: 'Bring 7-day BP and Amlodipine adherence summary.',
      },
      {
        id: 'appt-2',
        doctorName: 'Dr. Rajesh Verma',
        specialty: 'Diabetes & Internal Medicine',
        clinic: 'Lotus Senior Care Centre',
        date: getLocalDateStr(9),
        time: '11:15',
        notes: 'Fasting sugar check before visit.',
      },
    ],
    alerts: [
      {
        id: 'alert-low-stock',
        type: 'low_stock',
        severity: 'warning',
        title: formatTemplate(getT(language).alertRefillTitle, { med: 'Amlodipine 5mg' }),
        message: formatTemplate(getT(language).alertRefillMsg, { count: 4 }),
        titleKey: 'alertRefillTitle',
        messageKey: 'alertRefillMsg',
        vars: { med: 'Amlodipine 5mg', count: 4 },
        createdAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
        acknowledged: false,
        targetRoles: ['caretaker', 'family'],
      },
      {
        id: 'alert-pattern-1',
        type: 'suspicious_pattern',
        severity: 'warning',
        title: getT(language).alertPatternTitle,
        message: getT(language).alertPatternMsg,
        titleKey: 'alertPatternTitle',
        messageKey: 'alertPatternMsg',
        createdAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
        acknowledged: false,
        targetRoles: ['caretaker', 'family'],
      },
    ],
    emailLogs: [
      {
        id: 'email-seed-reminder',
        toEmail: 'priya.care@example.com',
        toName: 'Priya Nair',
        recipientRole: 'caretaker',
        subject: formatTemplate(getT(language).emailReminderSubject, {
          med: 'Atorvastatin 10mg',
          time: eveningLastTime,
        }),
        bodyPreview: formatTemplate(getT(language).emailReminderBody, {
          recipient: 'Priya Nair',
          elder: getLocalizedHonorificName(language, 'Ramesh Sharma'),
          med: 'Atorvastatin 10mg',
          time: eveningLastTime,
          cue: 'Before bedtime rest',
        }),
        subjectKey: 'emailReminderSubject',
        bodyKey: 'emailReminderBody',
        vars: {
          recipient: 'Priya Nair',
          elder: getLocalizedHonorificName(language, 'Ramesh Sharma'),
          med: 'Atorvastatin 10mg',
          time: eveningLastTime,
          cue: 'Before bedtime rest',
        },
        sentAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
        triggerType: 'dose_reminder',
      },
      {
        id: 'email-seed-appt',
        toEmail: 'aditya.sharma@example.com',
        toName: 'Aditya Sharma',
        recipientRole: 'family',
        subject: formatTemplate(getT(language).emailAppointmentSubject, {
          doctor: 'Dr. Meera Deshmukh',
          date: getLocalDateStr(3),
          time: '10:30',
        }),
        bodyPreview: formatTemplate(getT(language).emailAppointmentBody, {
          recipient: 'Aditya Sharma',
          elder: getLocalizedHonorificName(language, 'Ramesh Sharma'),
          doctor: 'Dr. Meera Deshmukh',
          specialty: 'Cardiology & Blood Pressure',
          clinic: 'Sakra Heart & Wellness Clinic',
          date: getLocalDateStr(3),
          time: '10:30',
        }),
        subjectKey: 'emailAppointmentSubject',
        bodyKey: 'emailAppointmentBody',
        vars: {
          recipient: 'Aditya Sharma',
          elder: getLocalizedHonorificName(language, 'Ramesh Sharma'),
          doctor: 'Dr. Meera Deshmukh',
          specialty: 'Cardiology & Blood Pressure',
          clinic: 'Sakra Heart & Wellness Clinic',
          date: getLocalDateStr(3),
          time: '10:30',
        },
        sentAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
        triggerType: 'appointment_reminder',
      },
      {
        id: 'email-seed-1',
        toEmail: 'priya.care@example.com',
        toName: 'Priya Nair',
        recipientRole: 'caretaker',
        subject: formatTemplate(getT(language).alertRefillTitle, { med: 'Amlodipine 5mg' }),
        bodyPreview: formatTemplate(getT(language).alertRefillMsg, { count: 4 }),
        subjectKey: 'alertRefillTitle',
        bodyKey: 'alertRefillMsg',
        vars: { med: 'Amlodipine 5mg', count: 4 },
        sentAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(),
        triggerType: 'low_stock',
      },
      {
        id: 'email-seed-missed-hist',
        toEmail: 'aditya.sharma@example.com',
        toName: 'Aditya Sharma',
        recipientRole: 'family',
        subject: formatTemplate(getT(language).alertMissedTitle, {
          med: 'Atorvastatin 10mg',
          time: '21:30',
        }),
        bodyPreview: formatTemplate(getT(language).alertMissedMsg, {
          name: getLocalizedHonorificName(language, 'Ramesh Sharma'),
          med: 'Atorvastatin 10mg',
          time: '21:30',
        }),
        subjectKey: 'alertMissedTitle',
        bodyKey: 'alertMissedMsg',
        vars: {
          name: getLocalizedHonorificName(language, 'Ramesh Sharma'),
          med: 'Atorvastatin 10mg',
          time: '21:30',
        },
        sentAt: new Date(Date.now() - 3600 * 1000 * 14).toISOString(),
        triggerType: 'missed_dose',
      },
    ],
    moodLogs: [
      { id: 'mood-1', date: getLocalDateStr(-4), mood: 'happy', createdAt: getLocalDateStr(-4) },
      { id: 'mood-2', date: getLocalDateStr(-3), mood: 'calm', createdAt: getLocalDateStr(-3) },
      { id: 'mood-3', date: getLocalDateStr(-2), mood: 'tired', createdAt: getLocalDateStr(-2) },
      { id: 'mood-4', date: getLocalDateStr(-1), mood: 'calm', createdAt: getLocalDateStr(-1) },
    ],
    doctorNotes: [
      {
        id: 'docnote-seed-1',
        date: getLocalDateStr(-1),
        time: '09:40',
        category: 'pain',
        text: 'Mild stiffness in my left knee after the morning walk, eased after resting.',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'docnote-seed-2',
        date: getLocalDateStr(-3),
        time: '08:50',
        category: 'dizziness',
        text: 'Felt briefly lightheaded when standing up quickly after morning tea.',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
    ],
    privacy: {
      shareScheduleWithFamily: true,
      shareProgressWithFamily: true,
      shareMoodWithFamily: true,
      shareAppointmentsWithFamily: true,
      askBeforeMinorAlerts: true,
      allowFamilyToEdit: false,
    },
    accessibility: {
      textScale: 'normal',
      highContrast: false,
      dementiaFriendlyMode: false,
      voiceRemindersEnabled: true,
    },
    chatHistory: [
      {
        id: 'chat-welcome',
        role: 'assistant',
        text: formatTemplate(getT(language).initialChatWelcome, {
          name: getLocalizedHonorificName(language, 'Ramesh Sharma'),
        }),
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
        triageLevel: 'NONE',
      },
    ],
    lastActivityAt: new Date().toISOString(),
  };
}

export function createEmptyState(language: LanguageCode = 'en'): CareCircleState {
  return {
    isSetupComplete: false,
    isDemoMode: false,
    passcode: generatePasscode(),
    language,
    activeUserId: '',
    elderly: {
      name: '',
      honorificName: '',
      age: 70,
      bloodGroup: '',
      conditions: [],
      allergies: [],
      emergencyPhone: '108',
      doctorName: '',
      doctorPhone: '',
      familyContacts: [],
      locationLabel: 'Home Address (Live GPS Ready)',
    },
    members: [],
    medications: [],
    doseLogs: [],
    appointments: [],
    alerts: [],
    emailLogs: [],
    moodLogs: [],
    doctorNotes: [],
    privacy: {
      shareScheduleWithFamily: true,
      shareProgressWithFamily: true,
      shareMoodWithFamily: true,
      shareAppointmentsWithFamily: true,
      askBeforeMinorAlerts: true,
      allowFamilyToEdit: false,
    },
    accessibility: {
      textScale: 'normal',
      highContrast: false,
      dementiaFriendlyMode: false,
      voiceRemindersEnabled: true,
    },
    chatHistory: [],
    lastActivityAt: new Date().toISOString(),
  };
}
