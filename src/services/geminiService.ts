import { formatTemplate, getLocalizedHonorificName, getT } from '../i18n/translations';
import { CareCircleState, FoodTiming, LanguageCode, SymptomCategory } from '../types';

export interface SatiChatResponse {
  replyText: string;
  triageLevel: 'NONE' | 'MILD' | 'CONCERNING' | 'EMERGENCY';
  shouldAlertCaretaker: boolean;
  shouldTriggerEmergency: boolean;
  alertReason?: string;
  familyCommand?: {
    detected: boolean;
    targetHint: string;
    messageSummary: string;
  };
}

export interface SatiVoiceChatResponse extends SatiChatResponse {
  transcript: string;
  noSpeechDetected?: boolean;
  quotaLimited?: boolean;
}

export class GeminiRequestError extends Error {
  detail?: string;
  constructor(message: string, detail?: string) {
    super(message);
    this.name = 'GeminiRequestError';
    this.detail = detail;
  }
}

export interface ExtractedPrescriptionMedicine {
  name: string;
  dose: string;
  times: string[];
  foodTiming: FoodTiming;
  purpose: string;
  sideEffects: string[];
  pillColor: string;
  pillShape: string;
  stockCount: number;
  routineCue: string;
}

export interface PrescriptionScanResponse {
  summary: string;
  medicines: ExtractedPrescriptionMedicine[];
}

export interface PhotoVerificationResponse {
  verified: boolean;
  confidence: string;
  gentleMessage: string;
}

export interface InteractionCheckResponse {
  hasWarning: boolean;
  severity: 'info' | 'caution';
  warningText: string;
  foodGuidance: string;
}

const EMERGENCY_KEYWORDS = [
  'chest pain',
  'chest tightness',
  'cannot breathe',
  "can't breathe",
  'trouble breathing',
  'shortness of breath',
  'fainted',
  'passed out',
  'fell down',
  'fall down',
  'stroke',
  'face drooping',
  'slurred speech',
  'heavy bleeding',
  'bleeding heavily',
  'call an ambulance',
  'call ambulance',
  'dial 108',
  'emergency',
  // Hindi
  'सीने में दर्द',
  'सांस नहीं',
  'साँस नहीं',
  'गिर गया',
  'गिर गई',
  'बेहोश',
  'एम्बुलेंस',
  // Marathi
  'छातीत दुख',
  'श्वास घेता येत नाही',
  'रक्तस्त्राव',
  'चक्कर येऊन पडलो',
  'रुग्णवाहिका',
  'ambulance',
];

export function detectInstantEmergencyPhrase(input: string): boolean {
  const lower = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export function buildPatientContext(state: CareCircleState, todayStr: string): string {
  const honorific = getLocalizedHonorificName(state.language, state.elderly.name);
  const todaysDoses = state.doseLogs
    .filter((d) => d.date === todayStr)
    .map((d) => {
      const med = state.medications.find((m) => m.id === d.medicationId);
      return `- ${med ? `${med.name} (${med.dose})` : d.medicationId} at ${d.scheduledTime}: status=${d.status}${d.confirmedAt ? ` (confirmed at ${new Date(d.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})` : ''}`;
    })
    .join('\n');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekLogs = state.doseLogs.filter((d) => d.date >= sevenDaysAgo.toISOString().slice(0, 10));
  const takenCount = weekLogs.filter((d) => d.status === 'verified_taken' || d.status === 'said_taken').length;
  const totalFinished = weekLogs.filter((d) => d.status !== 'pending').length;

  const medsSummary = state.medications
    .map(
      (m) =>
        `- ${m.name} (${m.dose}), times: ${m.times.join(', ')}, food: ${m.foodTiming}, purpose: ${m.purpose}, known side effects: ${m.sideEffects.join(', ') || 'none listed'}, stock left: ${m.stockCount}`
    )
    .join('\n');

  const apptsSummary = state.appointments
    .slice(0, 3)
    .map((a) => `- ${a.date} at ${a.time}: ${a.doctorName} (${a.specialty}) at ${a.clinic}`)
    .join('\n');

  const recentMoods = state.moodLogs
    .slice(0, 5)
    .map((m) => `${m.date}: ${m.mood}`)
    .join(', ');

  const doctorNotesSummary = (state.doctorNotes || [])
    .slice(0, 10)
    .map((n) => `- ${n.date} ${n.time} [${n.category}]: ${n.text}`)
    .join('\n');

  return `Patient Name: ${state.elderly.name} (Address respectfully as: ${honorific}), Age: ${state.elderly.age}
Medical Conditions: ${state.elderly.conditions.join(', ') || 'None specified'}
Allergies: ${state.elderly.allergies.join(', ') || 'None specified'}
Today's Date: ${todayStr}
Weekly Adherence: ${takenCount} of ${totalFinished || weekLogs.length} scheduled doses taken in the past 7 days.
Recent Moods: ${recentMoods || 'Not recorded'}
Current Medications:
${medsSummary || 'None'}
Today's Doses:
${todaysDoses || 'None scheduled'}
Upcoming Appointments:
${apptsSummary || 'None scheduled'}
Patient Symptom Notes for the Doctor:
${doctorNotesSummary || 'None recorded'}`;
}

async function postJson<T>(url: string, body: unknown, fallbackError = 'Unable to reach Sati right now.'): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    throw new GeminiRequestError(fallbackError, `network: ${raw}`);
  }

  let data: Record<string, unknown> = {};
  try {
    const text = await res.text();
    if (text) {
      data = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    throw new GeminiRequestError(fallbackError, `http-${res.status}: invalid-json-response`);
  }

  if (!res.ok) {
    const msg = typeof data?.error === 'string' && data.error.trim() ? data.error : fallbackError;
    const detail =
      typeof data?.detail === 'string' && data.detail.trim()
        ? data.detail
        : `gemini-error: HTTP ${res.status} ${msg}`;
    throw new GeminiRequestError(msg, detail);
  }
  return data as T;
}

export function detectFamilyVoiceCommand(
  input: string,
  state: CareCircleState
): { detected: boolean; targetHint: string; messageSummary: string } {
  const clean = input.trim();
  if (!clean) return { detected: false, targetHint: '', messageSummary: '' };
  const lower = clean.toLowerCase();

  // Check if the message explicitly mentions a known care circle member or contact name
  const knownNames = [
    ...state.members.filter((m) => m.role !== 'elderly').map((m) => m.name),
    ...(state.elderly.familyContacts || []).map((c) => c.name),
  ]
    .map((n) => n.trim())
    .filter(Boolean);

  const matchedFullName = knownNames.find((fullName) => {
    const first = fullName.split(/\s+/)[0]?.toLowerCase();
    return (
      lower.includes(fullName.toLowerCase()) ||
      (first && first.length >= 3 && lower.includes(first))
    );
  });

  const relationKeywords = [
    { pattern: /\b(son|बेटे|बेटा|मुलगा|मुलाला)\b/i, hint: 'son' },
    { pattern: /\b(daughter|बेटी|मुलगी|मुलीला)\b/i, hint: 'daughter' },
    { pattern: /\b(caretaker|caregiver|nurse|केयरटेकर|काळजीवाहू)\b/i, hint: 'caretaker' },
    { pattern: /\b(family|kids|children|परिवार|घरवालों|कुटुंब)\b/i, hint: 'family' },
  ];

  const matchedRel = relationKeywords.find((r) => r.pattern.test(clean));

  // English imperative patterns: "Tell Priya...", "Remind my son...", "Let Aditya know...", "Message my daughter..."
  const enMatch = clean.match(
    /^(?:please\s+)?(?:tell|remind|inform|message|text|notify|let)\s+([^,.!?]+?)(?:\s+(?:that|to|about|know(?:\s+that)?)\s+(.+))?$/i
  );

  // Hindi/Marathi directive indicators
  const indicVerbPattern = /(बता\s*दो|बताओ|बता\s*देना|बोल\s*दो|बोलो|याद\s*दिला|संदेश\s*भेज|सांग|कळव|निरोप\s*दे)/i;
  const enVerbPattern = /\b(tell|remind|inform|message|notify|let\s+.+\s+know)\b/i;

  const hasDirectiveVerb = enVerbPattern.test(clean) || indicVerbPattern.test(clean);

  if (!hasDirectiveVerb && !(matchedFullName && /(need|feel|tired|refill|medicine|pain|water|call|आवश्यकता|दवा|थकान|पाहिजे|औषध|थकवा)/i.test(clean))) {
    return { detected: false, targetHint: '', messageSummary: '' };
  }

  let targetHint = matchedFullName || matchedRel?.hint || '';
  if (!targetHint && enMatch?.[1]) {
    targetHint = enMatch[1].replace(/^my\s+/i, '').trim();
  }
  if (!targetHint) {
    targetHint = 'family';
  }

  let summary = clean;
  if (enMatch?.[2]) {
    summary = enMatch[2].trim();
  } else {
    // Strip leading "tell X that" / "remind my son that" prefixes neatly
    summary = clean
      .replace(
        /^(?:please\s+)?(?:tell|remind|inform|message|notify)\s+(?:my\s+)?[a-zA-Z\s]{1,24}?(?:\s+that\s+|\s+to\s+)/i,
        ''
      )
      .trim();
  }

  return {
    detected: true,
    targetHint,
    messageSummary: summary || clean,
  };
}

function buildLocalSatiFallback(
  message: string,
  state: CareCircleState,
  todayStr: string
): SatiChatResponse | null {
  const lower = message.toLowerCase();
  const lang = state.language;
  const honorific = getLocalizedHonorificName(lang, state.elderly.name);

  // 1. Weekly progress / adherence queries
  if (/(progress|week|how am i|adherence|प्रगति|प्रगती|सप्ताह|आठवड|कशी आहे|कैसी रही)/.test(lower)) {
    const activeIds = new Set(state.medications.map((m) => m.id));
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString().slice(0, 10);
    const logs = state.doseLogs.filter(
      (d) => d.date >= cutoff && d.status !== 'pending' && activeIds.has(d.medicationId)
    );
    const taken = logs.filter((d) => d.status === 'verified_taken' || d.status === 'said_taken').length;
    const total = logs.length;
    const pct = total > 0 ? Math.round((taken / total) * 100) : 100;

    if (lang === 'hi') {
      return {
        replyText: `${honorific}, इस सप्ताह आपने ${total} में से ${taken} दवाइयाँ (${pct}%) समय पर ली हैं। आप बहुत अच्छा ध्यान रख रहे हैं, ऐसे ही नियमित रहें।`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    if (lang === 'mr') {
      return {
        replyText: `${honorific}, या आठवड्यात तुम्ही ${total} पैकी ${taken} औषधे (${pct}%) वेळेवर घेतली आहेत. तुम्ही खूप छान काळजी घेत आहात, असेच नियमित राहा.`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    return {
      replyText: `${honorific}, you have taken ${taken} of ${total} scheduled doses (${pct}%) this week. You are doing very well—keep up this steady routine.`,
      triageLevel: 'NONE',
      shouldAlertCaretaker: false,
      shouldTriggerEmergency: false,
    };
  }

  // 2. Next doctor appointment queries
  if (/(appointment|doctor|visit|clinic|डॉक्टर|मुलाकात|भेट|अपॉइंटमेंट)/.test(lower)) {
    const sorted = [...state.appointments].sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    );
    const nextAppt = sorted.find((a) => a.date >= todayStr) || sorted[0];
    if (!nextAppt) {
      if (lang === 'hi') {
        return {
          replyText: `${honorific}, अभी कोई आगामी डॉक्टर अपॉइंटमेंट दर्ज नहीं है। आपके केयरटेकर अपॉइंटमेंट टैब में नई तारीख जोड़ सकते हैं।`,
          triageLevel: 'NONE',
          shouldAlertCaretaker: false,
          shouldTriggerEmergency: false,
        };
      }
      if (lang === 'mr') {
        return {
          replyText: `${honorific}, सध्या कोणतीही आगामी डॉक्टर भेट नोंदवलेली नाही. तुमचे काळजीवाहू नवीन भेट जोडू शकतात.`,
          triageLevel: 'NONE',
          shouldAlertCaretaker: false,
          shouldTriggerEmergency: false,
        };
      }
      return {
        replyText: `${honorific}, there is no upcoming doctor appointment listed right now. Your caretaker can add one in the Appointments tab anytime.`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    if (lang === 'hi') {
      return {
        replyText: `${honorific}, आपकी अगली मुलाकात ${nextAppt.doctorName} (${nextAppt.clinic}) के साथ ${nextAppt.date} को ${nextAppt.time} बजे है।`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    if (lang === 'mr') {
      return {
        replyText: `${honorific}, तुमची पुढची भेट ${nextAppt.doctorName} (${nextAppt.clinic}) यांच्यासोबत ${nextAppt.date} रोजी ${nextAppt.time} वाजता आहे.`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    return {
      replyText: `${honorific}, your next visit is with ${nextAppt.doctorName} at ${nextAppt.clinic} on ${nextAppt.date} at ${nextAppt.time}.`,
      triageLevel: 'NONE',
      shouldAlertCaretaker: false,
      shouldTriggerEmergency: false,
    };
  }

  // 3. Today's medicines / next dose / schedule queries
  if (
    /(medicine|med|pill|tablet|dose|schedule|today|next|morning|evening|दवा|दवाइ|गोळी|औषध|आज|अगली|पुढची|सकाळ|सुबह|शाम)/.test(
      lower
    )
  ) {
    const activeIds = new Set(state.medications.map((m) => m.id));
    const todaysLogs = state.doseLogs
      .filter((d) => d.date === todayStr && activeIds.has(d.medicationId))
      .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
    const pendingLogs = todaysLogs.filter((d) => d.status === 'pending');

    if (pendingLogs.length === 0) {
      if (lang === 'hi') {
        return {
          replyText: `${honorific}, आज की आपकी सभी दवाइयाँ पूरी हो चुकी हैं। बहुत बढ़िया, अब आराम कीजिए और पानी पीते रहिए।`,
          triageLevel: 'NONE',
          shouldAlertCaretaker: false,
          shouldTriggerEmergency: false,
        };
      }
      if (lang === 'mr') {
        return {
          replyText: `${honorific}, आजची तुमची सर्व औषधे पूर्ण झाली आहेत. खूप छान, आता विश्रांती घ्या आणि पाणी प्या.`,
          triageLevel: 'NONE',
          shouldAlertCaretaker: false,
          shouldTriggerEmergency: false,
        };
      }
      return {
        replyText: `${honorific}, you have completed all your scheduled medicines for today. Well done—please rest and stay hydrated.`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }

    const next = pendingLogs[0];
    const med = state.medications.find((m) => m.id === next.medicationId);
    const remainingNames = pendingLogs
      .map((l) => {
        const m = state.medications.find((item) => item.id === l.medicationId);
        return m ? `${m.name} (${l.scheduledTime})` : l.scheduledTime;
      })
      .slice(0, 3)
      .join(', ');

    if (lang === 'hi') {
      return {
        replyText: `${honorific}, आपकी अगली दवा ${med?.name || ''} ${med?.dose || ''} है, जो ${next.scheduledTime} बजे (${med?.routineCue || ''}) लेनी है। आज बाकी दवाइयाँ: ${remainingNames}।`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    if (lang === 'mr') {
      return {
        replyText: `${honorific}, तुमचे पुढचे औषध ${med?.name || ''} ${med?.dose || ''} हे ${next.scheduledTime} वाजता (${med?.routineCue || ''}) घ्यायचे आहे. आजची उर्वरित औषधे: ${remainingNames}.`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    return {
      replyText: `${honorific}, your next medicine is ${med?.name || ''} (${med?.dose || ''}) at ${next.scheduledTime}. Remaining today: ${remainingNames}.`,
      triageLevel: 'NONE',
      shouldAlertCaretaker: false,
      shouldTriggerEmergency: false,
    };
  }

  // 4. Common mild symptom / side-effect check
  if (
    /(headache|pain|dizzy|tired|weak|nausea|stomach|cough|sleep|सिरदर्द|दर्द|चक्कर|थकान|कमजोर|पेट|खांसी|नींद|डोके|दुखत|भोवळ|थकवा|झोप)/.test(
      lower
    )
  ) {
    const matchedMeds = state.medications
      .filter((m) =>
        m.sideEffects.some((se) => {
          const s = se.toLowerCase();
          return (
            (lower.includes('headache') || lower.includes('सिरदर्द') || lower.includes('डोके')) && s.includes('headache') ||
            (lower.includes('dizzy') || lower.includes('चक्कर') || lower.includes('भोवळ')) && s.includes('dizz') ||
            (lower.includes('cough') || lower.includes('खांसी')) && s.includes('cough') ||
            (lower.includes('stomach') || lower.includes('nausea') || lower.includes('पेट')) && (s.includes('stomach') || s.includes('nausea')) ||
            (lower.includes('tired') || lower.includes('weak') || lower.includes('थक')) && (s.includes('fatigue') || s.includes('tired') || s.includes('ache'))
          );
        })
      )
      .map((m) => m.name);

    const medNoteEn = matchedMeds.length ? ` This can occasionally happen as a mild side effect of ${matchedMeds.join(', ')}.` : '';
    const medNoteHi = matchedMeds.length ? ` यह कभी-कभी ${matchedMeds.join(', ')} के हल्के असर से भी हो सकता है।` : '';
    const medNoteMr = matchedMeds.length ? ` हे कधीकधी ${matchedMeds.join(', ')} मुळे हलकेच होऊ शकते.` : '';

    if (lang === 'hi') {
      return {
        replyText: `${honorific}, सुनकर चिंता हुई। कृपया थोड़ा आराम करें और गुनगुना पानी पिएँ।${medNoteHi} मैं डॉक्टर नहीं हूँ—यदि यह तकलीफ बनी रहे या बढ़े, तो कृपया अपने डॉक्टर से जरूर बात करें।`,
        triageLevel: 'MILD',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    if (lang === 'mr') {
      return {
        replyText: `${honorific}, हे ऐकून काळजी वाटली. कृपया थोडी विश्रांती घ्या आणि कोमट पाणी प्या.${medNoteMr} मी डॉक्टर नाही—त्रास कायम राहिल्यास कृपया तुमच्या डॉक्टरांशी बोला.`,
        triageLevel: 'MILD',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    return {
      replyText: `${honorific}, I am sorry you are feeling uncomfortable. Please sit calmly, rest, and sip some water.${medNoteEn} I am not a doctor, so please speak with your doctor if it continues or gets worse.`,
      triageLevel: 'MILD',
      shouldAlertCaretaker: false,
      shouldTriggerEmergency: false,
    };
  }

  // 5. Warm greetings / thank you
  if (/(hello|hi|namaste|thank|morning|evening|नमस्ते|धन्यवाद|शुक्रिया|आभार|नमस्कार)/.test(lower)) {
    if (lang === 'hi') {
      return {
        replyText: `नमस्ते ${honorific}! मैं सती हूँ। आप अपनी आज की दवाइयों, सेहत या परिवार को संदेश भेजने के बारे में मुझसे कुछ भी पूछ सकते हैं।`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    if (lang === 'mr') {
      return {
        replyText: `नमस्कार ${honorific}! मी सती आहे. तुम्ही तुमच्या आजच्या औषधांबद्दल, तब्येतीबद्दल किंवा कुटुंबाला निरोप देण्यासाठी मला कधीही सांगू शकता.`,
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
      };
    }
    return {
      replyText: `Namaste ${honorific}! I am Sati. Feel free to ask about today's medicines, your progress, upcoming appointments, or send a message to your family.`,
      triageLevel: 'NONE',
      shouldAlertCaretaker: false,
      shouldTriggerEmergency: false,
    };
  }

  return null;
}

export async function askSatiCompanion(
  message: string,
  state: CareCircleState,
  todayStr: string
): Promise<SatiChatResponse> {
  if (detectInstantEmergencyPhrase(message)) {
    const t = getT(state.language);
    const honorific = getLocalizedHonorificName(state.language, state.elderly.name);
    return {
      replyText: formatTemplate(t.emergencySpokenMsg, { name: honorific }),
      triageLevel: 'EMERGENCY',
      shouldAlertCaretaker: true,
      shouldTriggerEmergency: true,
      alertReason: message,
    };
  }

  const localFamilyCmd = detectFamilyVoiceCommand(message, state);

  try {
    const context = buildPatientContext(state, todayStr);
    const res = await postJson<SatiChatResponse>('/api/gemini/chat', {
      message,
      language: state.language,
      context,
      history: state.chatHistory.slice(-6).map((c) => ({ role: c.role, text: c.text })),
    });
    if (!res.familyCommand?.detected && localFamilyCmd.detected) {
      return { ...res, familyCommand: localFamilyCmd };
    }
    return res;
  } catch (err) {
    // If Gemini is temporarily unavailable or quota-limited, fulfill family commands and core care queries locally
    if (localFamilyCmd.detected) {
      return {
        replyText: '',
        triageLevel: 'NONE',
        shouldAlertCaretaker: false,
        shouldTriggerEmergency: false,
        familyCommand: localFamilyCmd,
      };
    }
    const localReply = buildLocalSatiFallback(message, state, todayStr);
    if (localReply) {
      return localReply;
    }
    throw err;
  }
}

export async function askSatiWithAudio(
  audioBase64: string,
  mimeType: string,
  state: CareCircleState,
  todayStr: string
): Promise<SatiVoiceChatResponse> {
  const context = buildPatientContext(state, todayStr);
  const res = await postJson<SatiVoiceChatResponse>('/api/gemini/voice-chat', {
    audioBase64,
    mimeType,
    language: state.language,
    context,
    history: state.chatHistory.slice(-6).map((c) => ({ role: c.role, text: c.text })),
  });

  const transcript = (res.transcript || '').trim();
  if (!res.noSpeechDetected && transcript) {
    if (detectInstantEmergencyPhrase(transcript)) {
      const t = getT(state.language);
      const honorific = getLocalizedHonorificName(state.language, state.elderly.name);
      return {
        ...res,
        transcript,
        replyText: res.replyText?.trim()
          ? res.replyText
          : formatTemplate(t.emergencySpokenMsg, { name: honorific }),
        triageLevel: 'EMERGENCY',
        shouldAlertCaretaker: true,
        shouldTriggerEmergency: true,
        alertReason: res.alertReason || transcript,
      };
    }

    const localFamilyCmd = detectFamilyVoiceCommand(transcript, state);
    if (!res.familyCommand?.detected && localFamilyCmd.detected) {
      return {
        ...res,
        transcript,
        familyCommand: localFamilyCmd,
      };
    }

    if (res.quotaLimited || !res.replyText?.trim()) {
      const localReply = buildLocalSatiFallback(transcript, state, todayStr);
      if (localReply) {
        return {
          ...res,
          ...localReply,
          transcript,
        };
      }
      return {
        ...res,
        transcript,
        replyText: getT(state.language).geminiErrorChat,
      };
    }
  }

  return {
    ...res,
    transcript,
  };
}

export async function transcribeDoctorAudio(
  audioBase64: string,
  mimeType: string,
  language: LanguageCode
): Promise<{ transcript: string; noSpeechDetected: boolean; category: SymptomCategory }> {
  const res = await postJson<{
    transcript: string;
    noSpeechDetected: boolean;
    category: string;
  }>('/api/gemini/transcribe-audio', {
    audioBase64,
    mimeType,
    language,
  });
  const transcript = (res.transcript || '').trim();
  const category = VALID_SYMPTOM_CATEGORIES.includes(res.category as SymptomCategory)
    ? (res.category as SymptomCategory)
    : fallbackCategorizeSymptom(transcript);
  return {
    transcript,
    noSpeechDetected: Boolean(res.noSpeechDetected || !transcript),
    category,
  };
}

export async function scanPrescriptionImage(
  imageBase64: string,
  mimeType: string,
  language: LanguageCode
): Promise<PrescriptionScanResponse> {
  return postJson<PrescriptionScanResponse>('/api/gemini/scan-prescription', {
    imageBase64,
    mimeType,
    language,
  });
}

export async function verifyDosePhoto(params: {
  imageBase64: string;
  mimeType: string;
  medicineName: string;
  dose: string;
  pillColor: string;
  pillShape: string;
  language: LanguageCode;
}): Promise<PhotoVerificationResponse> {
  return postJson<PhotoVerificationResponse>('/api/gemini/verify-photo', params);
}

export async function generateWeeklyDoctorReport(
  state: CareCircleState,
  todayStr: string
): Promise<{ report: string }> {
  const reportData = buildPatientContext(state, todayStr);
  return postJson<{ report: string }>('/api/gemini/weekly-report', {
    language: state.language,
    reportData,
  });
}

export async function checkMedicationInteractions(params: {
  newMedicine: string;
  existingMedicines: string[];
  allergies: string[];
  conditions: string[];
  foodTiming: string;
  language: LanguageCode;
}): Promise<InteractionCheckResponse> {
  return postJson<InteractionCheckResponse>('/api/gemini/check-interactions', params);
}

export async function fetchDailyHealthTip(
  state: CareCircleState
): Promise<{ tip: string }> {
  return postJson<{ tip: string }>('/api/gemini/daily-tip', {
    name: getLocalizedHonorificName(state.language, state.elderly.name),
    age: state.elderly.age,
    conditions: state.elderly.conditions,
    language: state.language,
  });
}

const VALID_SYMPTOM_CATEGORIES: SymptomCategory[] = [
  'pain',
  'dizziness',
  'fatigue',
  'digestion',
  'breathing',
  'sleep',
  'other',
];

function fallbackCategorizeSymptom(text: string): SymptomCategory {
  const lower = text.toLowerCase();
  if (/(pain|ache|hurt|sore|stiff|cramp|दर्द|पीड़ा|दुख|वेदना)/.test(lower)) return 'pain';
  if (/(dizz|vertigo|spin|lighthead|unsteady|balance|चक्कर|गरगर|भोवळ)/.test(lower))
    return 'dizziness';
  if (/(tired|fatigue|weak|exhaust|energy|sleepy|थक|कमजोर|अशक्त|थकवा)/.test(lower))
    return 'fatigue';
  if (/(stomach|nausea|vomit|acid|gas|bloat|appetite|digest|पेट|उल्टी|मळमळ|पचन|अ‍ॅसिडिटी)/.test(lower))
    return 'digestion';
  if (/(breath|cough|wheez|chest|cold|congestion|खांसी|सांस|खोकला|श्वास)/.test(lower))
    return 'breathing';
  if (/(sleep|insomnia|awake|night|restless|नींद|झोप)/.test(lower)) return 'sleep';
  return 'other';
}

export async function categorizeSymptomNote(text: string): Promise<SymptomCategory> {
  try {
    const res = await postJson<{ category: string }>('/api/gemini/categorize-symptom', { text });
    if (VALID_SYMPTOM_CATEGORIES.includes(res.category as SymptomCategory)) {
      return res.category as SymptomCategory;
    }
    return fallbackCategorizeSymptom(text);
  } catch {
    return fallbackCategorizeSymptom(text);
  }
}
