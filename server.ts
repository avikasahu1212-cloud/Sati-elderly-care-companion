import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODEL_NAME = 'gemini-4-hydrogen';
const FALLBACK_MODEL_NAME = 'gemini-3.1-flash-lite';

function isRateLimitOrTransientError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err);
  return (
    raw.includes('RESOURCE_EXHAUSTED') ||
    raw.includes('"code":429') ||
    raw.includes('429') ||
    raw.includes('UNAVAILABLE') ||
    raw.includes('503')
  );
}

async function generateContentResilient(
  ai: GoogleGenAI,
  params: {
    contents: unknown;
    config?: Record<string, unknown>;
  },
  options?: { skipFallbackOn429?: boolean; modelOverride?: string }
) {
  const primaryModel = options?.modelOverride || MODEL_NAME;
  const primaryConfig =
    primaryModel === 'gemini-4-hydrogen'
      ? {
          ...(params.config || {}),
          thinkingConfig: (params.config?.thinkingConfig as Record<string, unknown>) || {
            thinkingLevel: ThinkingLevel.LOW,
          },
        }
      : params.config;

  try {
    return await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents as Parameters<GoogleGenAI['models']['generateContent']>[0]['contents'],
      config: primaryConfig as Parameters<GoogleGenAI['models']['generateContent']>[0]['config'],
    });
  } catch (err) {
    if (!options?.skipFallbackOn429 && isRateLimitOrTransientError(err) && primaryModel !== FALLBACK_MODEL_NAME) {
      const fallbackConfig = params.config ? { ...params.config } : undefined;
      if (fallbackConfig && 'thinkingConfig' in fallbackConfig) {
        delete fallbackConfig.thinkingConfig;
      }
      return await ai.models.generateContent({
        model: FALLBACK_MODEL_NAME,
        contents: params.contents as Parameters<GoogleGenAI['models']['generateContent']>[0]['contents'],
        config: fallbackConfig as Parameters<GoogleGenAI['models']['generateContent']>[0]['config'],
      });
    }
    throw err;
  }
}

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getLanguageName(code: string): string {
  const map: Record<string, string> = {
    en: 'English',
    hi: 'Hindi (हिन्दी)',
    mr: 'Marathi (मराठी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    bn: 'Bengali (বাংলা)',
    gu: 'Gujarati (ગુજરાતી)',
    kn: 'Kannada (ಕನ್ನಡ)',
  };
  return map[code] || 'English';
}

function formatError(err: unknown): { status: number; message: string; detail: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const concise = raw.replace(/\s+/g, ' ').trim().slice(0, 180);
  if (raw.includes('API_KEY_INVALID') || raw.includes('PERMISSION_DENIED') || raw.includes('GEMINI_API_KEY')) {
    return {
      status: 500,
      message: 'Gemini API key is missing or invalid. Please check Settings > Secrets.',
      detail: `gemini-error: ${concise}`,
    };
  }
  if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
    const cleanDetail = raw.includes('You exceeded your current quota')
      ? 'gemini-error: 429 RESOURCE_EXHAUSTED (API quota exceeded — check Settings > Secrets or retry later)'
      : `gemini-error: 429 RESOURCE_EXHAUSTED (${concise})`;
    return {
      status: 429,
      message: 'Sati is taking a brief pause due to API quota/rate limits. Please check Settings > Secrets or try again shortly.',
      detail: cleanDetail,
    };
  }
  return {
    status: 500,
    message: 'Sati could not complete that request right now. Please try again gently.',
    detail: `gemini-error: ${concise || 'unknown-error'}`,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, model: MODEL_NAME, configured: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, language, context, history } = req.body as {
        message: string;
        language: string;
        context: string;
        history?: Array<{ role: 'user' | 'assistant'; text: string }>;
      };

      const langLabel = getLanguageName(language || 'en');
      const ai = getAI();

      const systemInstruction = `You are Sati, a warm, respectful, voice-first AI health and medication companion for an elderly person and their care circle.
CRITICAL LANGUAGE RULE:
- You MUST write your entire "replyText" strictly in ${langLabel} (using its native script: Devanagari for Hindi and Marathi, Latin for English, and native script for Tamil/Telugu/Bengali/Gujarati/Kannada). NEVER mix English sentences into Hindi or Marathi replies unless citing a medicine brand name.
- Also write "alertReason" in ${langLabel} if shouldAlertCaretaker is true.
Tone rules:
- Be warm, patient, gentle, and reassuring.
- Always use respectful honorifics: in Hindi use "जी" and polite "आप", in Marathi use "जी" and polite "तुम्ही", in English use "ji" and warm respectful address, and polite elder forms in all other languages.
- Keep sentences short, clear, and easy to hear aloud (2 to 4 short sentences). Never use medical jargon or scary wording.
- Never accuse the user of forgetting or lying; if something looks off, gently suggest "Let's just double check together" in ${langLabel}.

Medical safety & triage rules:
- You are NOT a replacement for a doctor. Whenever answering a health or symptom question, gently remind the person in ${langLabel} that you are not a doctor and advise speaking with their doctor if symptoms persist.
- NEVER diagnose a condition, NEVER change a medication dose, and NEVER tell the person to stop or skip a medicine. Refer any dose questions to their doctor.
- If the person mentions any symptom (e.g., headache, dizziness, stomach upset, cough), check their current medication list in the context below to see if any medicine lists that symptom as a known side effect, mention it gently in ${langLabel} if so, offer safe mild comfort advice (like resting, drinking water), and say when to call the doctor.
- Classify triageLevel into exactly one of:
  1. "EMERGENCY": Red-flag symptoms or explicit ambulance/help requests such as chest pain, chest tightness, cannot breathe, shortness of breath, fainted, fell down, stroke symptoms (slurred speech, face drooping, arm weakness), heavy bleeding, severe allergic reaction, or "call an ambulance". Trigger immediately with calm, decisive reassurance.
  2. "CONCERNING": Persistent fever, severe pain, repeated vomiting, confusion, blood sugar or BP reading that sounds dangerous, or new side effects that need medical attention. Advise calling the doctor and set shouldAlertCaretaker=true.
  3. "MILD": Routine questions about schedule, progress, appointments, medicine purpose, or mild everyday symptoms (mild headache, slight tiredness).
  4. "NONE": Casual greeting or gratitude.

Family & Caretaker Voice Commands:
- If the elder asks you to tell, remind, inform, or send a message to a family member, son, daughter, relative, or caretaker by name or role (for example: "Remind my son we need more BP medicine", "Tell Priya I feel tired", "आदित्य को बोलो...", "प्रियाला सांग..."):
  * Populate "familyCommand": { "detected": true, "targetHint": "<person name or relation like 'son', 'Priya', 'family', 'caretaker'>", "messageSummary": "<concise message content in ${langLabel}>" }.
  * In "replyText", warmly confirm out loud in ${langLabel} that you have informed that person and recorded the reminder/note for them.
- Otherwise set "familyCommand": { "detected": false, "targetHint": "", "messageSummary": "" }.

Patient & Care Circle Context:
${context}`;

      const conversationPrompt = [
        ...(history || []).slice(-6).map((h) => `${h.role === 'user' ? 'User' : 'Sati'}: ${h.text}`),
        `User: ${message}`,
      ].join('\n');

      const response = await generateContentResilient(ai, {
        contents: conversationPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: {
                type: Type.STRING,
                description: 'The warm, short, clear response in the requested language.',
              },
              triageLevel: {
                type: Type.STRING,
                description: 'One of: NONE, MILD, CONCERNING, EMERGENCY',
              },
              shouldAlertCaretaker: {
                type: Type.BOOLEAN,
                description: 'True if caretaker should be gently alerted.',
              },
              shouldTriggerEmergency: {
                type: Type.BOOLEAN,
                description: 'True only if triageLevel is EMERGENCY.',
              },
              alertReason: {
                type: Type.STRING,
                description: 'Short summary for caretaker if shouldAlertCaretaker is true.',
              },
              familyCommand: {
                type: Type.OBJECT,
                properties: {
                  detected: { type: Type.BOOLEAN },
                  targetHint: { type: Type.STRING },
                  messageSummary: { type: Type.STRING },
                },
                required: ['detected', 'targetHint', 'messageSummary'],
              },
            },
            required: ['replyText', 'triageLevel', 'shouldAlertCaretaker', 'shouldTriggerEmergency'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/voice-chat', async (req, res) => {
    try {
      const { audioBase64, mimeType, language, context, history } = req.body as {
        audioBase64: string;
        mimeType?: string;
        language: string;
        context: string;
        history?: Array<{ role: 'user' | 'assistant'; text: string }>;
      };

      if (!audioBase64) {
        res.status(400).json({ error: 'No audio recording was received.', detail: 'gemini-error: empty-audio-payload' });
        return;
      }

      const langLabel = getLanguageName(language || 'hi');
      const ai = getAI();

      const systemInstruction = `You are Sati, a warm, respectful, voice-first AI health and medication companion for an elderly person and their care circle.

MULTILINGUAL AUDIO UNDERSTANDING RULES:
- Listen directly to the attached audio recording.
- The elderly speaker may speak Hindi, Marathi, English, or a natural code-switched mix (for example, English medicine or health words like "BP", "sugar", "tablet", "dizzy", "morning dose" spoken inside Hindi or Marathi sentences).
- Understand what the speaker MEANS — do NOT translate word for word.
- In "transcript", write accurately what the speaker said in the language/script they actually spoke (use Devanagari for Hindi/Marathi words and natural script for mixed words). If there is only silence or background noise with no clear spoken words, set "noSpeechDetected": true and "transcript": "".
- CRITICAL REPLY LANGUAGE RULE:
  * Write your ENTIRE "replyText" strictly in ${langLabel} (Devanagari for Hindi and Marathi, Latin for English).
  * Keep sentences very short, simple, warm, and easy to hear aloud (2 to 4 short sentences).
  * Always use respectful polite forms: in Hindi use "जी" and polite "आप", in Marathi use "जी" and polite "तुम्ही".
  * Also write "alertReason" in ${langLabel} if shouldAlertCaretaker is true.

Medical safety & triage rules:
- You are NOT a replacement for a doctor. Whenever answering a health or symptom question, gently remind the person in ${langLabel} that you are not a doctor and advise speaking with their doctor if symptoms persist.
- NEVER diagnose a condition, NEVER change a medication dose, and NEVER tell the person to stop or skip a medicine. Refer any dose questions to their doctor.
- If the person mentions any symptom (headache, dizziness, stomach upset, cough, tiredness, etc.), check their current medication list in the context below to see if any medicine lists that symptom as a known side effect, mention it gently in ${langLabel} if so, offer mild safe comfort advice, and say when to call the doctor.
- Classify triageLevel into exactly one of:
  1. "EMERGENCY": Red-flag symptoms or explicit help requests (chest pain, chest tightness, cannot breathe, shortness of breath, fainted, fell down, stroke symptoms, heavy bleeding, severe allergic reaction, or "call an ambulance").
  2. "CONCERNING": Persistent fever, severe pain, repeated vomiting, confusion, dangerous BP/sugar reading, or new side effects needing attention. Set shouldAlertCaretaker=true.
  3. "MILD": Routine medicine questions, schedule, appointments, or mild everyday symptoms.
  4. "NONE": Casual greeting, gratitude, or no-speech.

Family & Caretaker Voice Commands:
- If the elder asks you to tell, remind, inform, or send a message to a family member, son, daughter, relative, or caretaker by name or role (e.g., "Remind my son we need more BP medicine", "बेटे को याद दिला दो...", "प्रियाला सांग..."):
  * Populate "familyCommand": { "detected": true, "targetHint": "<person name or relation>", "messageSummary": "<concise message content in ${langLabel}>" }.
  * In "replyText", warmly confirm out loud in ${langLabel} that you have informed that person and saved the note.
- Otherwise set "familyCommand": { "detected": false, "targetHint": "", "messageSummary": "" }.

Patient & Care Circle Context:
${context}`;

      const recentHistory = (history || [])
        .slice(-4)
        .map((h) => `${h.role === 'user' ? 'User' : 'Sati'}: ${h.text}`)
        .join('\n');

      const response = await generateContentResilient(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/wav',
                data: audioBase64,
              },
            },
            {
              text: `${recentHistory ? `Recent conversation:\n${recentHistory}\n\n` : ''}Listen to this 16 kHz mono WAV recording from the elderly user. Transcribe what they said in "transcript" (in the language spoken), interpret their meaning naturally, and respond warmly only in ${langLabel} using short simple polite sentences.`,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: {
                type: Type.STRING,
                description: 'Accurate transcript of what the person said in the language/script spoken. Empty if silent.',
              },
              noSpeechDetected: {
                type: Type.BOOLEAN,
                description: 'True only if the recording has no intelligible spoken words.',
              },
              replyText: {
                type: Type.STRING,
                description: 'Short, warm, polite response strictly in the app selected language.',
              },
              triageLevel: {
                type: Type.STRING,
                description: 'One of: NONE, MILD, CONCERNING, EMERGENCY',
              },
              shouldAlertCaretaker: {
                type: Type.BOOLEAN,
              },
              shouldTriggerEmergency: {
                type: Type.BOOLEAN,
              },
              alertReason: {
                type: Type.STRING,
              },
              familyCommand: {
                type: Type.OBJECT,
                properties: {
                  detected: { type: Type.BOOLEAN },
                  targetHint: { type: Type.STRING },
                  messageSummary: { type: Type.STRING },
                },
                required: ['detected', 'targetHint', 'messageSummary'],
              },
            },
            required: [
              'transcript',
              'noSpeechDetected',
              'replyText',
              'triageLevel',
              'shouldAlertCaretaker',
              'shouldTriggerEmergency',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      if (isRateLimitOrTransientError(err)) {
        try {
          const { audioBase64, mimeType, language } = req.body as {
            audioBase64: string;
            mimeType?: string;
            language: string;
          };
          const ai = getAI();
          const langLabel = getLanguageName(language || 'hi');
          const tx = await ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [
                { inlineData: { mimeType: mimeType || 'audio/wav', data: audioBase64 } },
                { text: `Transcribe this ${langLabel} audio accurately in the language spoken. Return empty text if silent.` },
              ],
            },
          });
          const transcript = (tx.text || '').trim();
          res.json({
            transcript,
            noSpeechDetected: !transcript,
            replyText: '',
            triageLevel: 'NONE',
            shouldAlertCaretaker: false,
            shouldTriggerEmergency: false,
            quotaLimited: true,
          });
          return;
        } catch {
          // Fall through to structured 429 error response
        }
      }
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/transcribe-audio', async (req, res) => {
    try {
      const { audioBase64, mimeType, language } = req.body as {
        audioBase64: string;
        mimeType?: string;
        language: string;
      };
      if (!audioBase64) {
        res.status(400).json({ error: 'No audio recording was received.', detail: 'gemini-error: empty-audio-payload' });
        return;
      }

      const langLabel = getLanguageName(language || 'hi');
      const ai = getAI();

      const response = await generateContentResilient(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'audio/wav',
                data: audioBase64,
              },
            },
            {
              text: `Listen to this 16 kHz mono WAV recording of an elderly patient describing a health symptom or question for their doctor (primarily ${langLabel}, possibly mixed with English medical words).
1. Transcribe accurately in the language spoken into "transcript" (empty string if silent/no speech).
2. Set "noSpeechDetected" to true if there is no clear spoken speech.
3. Classify into exactly one symptom category: pain, dizziness, fatigue, digestion, breathing, sleep, or other.`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: { type: Type.STRING },
              noSpeechDetected: { type: Type.BOOLEAN },
              category: { type: Type.STRING },
            },
            required: ['transcript', 'noSpeechDetected', 'category'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      if (isRateLimitOrTransientError(err)) {
        try {
          const { audioBase64, mimeType, language } = req.body as {
            audioBase64: string;
            mimeType?: string;
            language: string;
          };
          const ai = getAI();
          const langLabel = getLanguageName(language || 'hi');
          const tx = await ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [
                { inlineData: { mimeType: mimeType || 'audio/wav', data: audioBase64 } },
                { text: `Transcribe this ${langLabel} audio accurately in the language spoken.` },
              ],
            },
          });
          const transcript = (tx.text || '').trim();
          res.json({
            transcript,
            noSpeechDetected: !transcript,
            category: 'other',
          });
          return;
        } catch {
          // Fall through to structured 429 error response
        }
      }
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/scan-prescription', async (req, res) => {
    try {
      const { imageBase64, mimeType, language } = req.body as {
        imageBase64: string;
        mimeType: string;
        language: string;
      };
      const ai = getAI();
      const langLabel = getLanguageName(language || 'en');

      const response = await generateContentResilient(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              text: `Inspect this prescription or medicine strip image carefully. Extract all visible medicines, their dosages, suggested daily times (in 24h HH:MM format like "08:00" and "20:00"), whether to take with food ("with_food", "without_food", or "either"), simple purpose, common side effects, and estimated tablet count if shown. Provide notes/purpose in ${langLabel}. If a field is unclear, make a safe standard estimate and note it in notes.`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              medicines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    dose: { type: Type.STRING },
                    times: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    foodTiming: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                    sideEffects: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    pillColor: { type: Type.STRING },
                    pillShape: { type: Type.STRING },
                    stockCount: { type: Type.INTEGER },
                    routineCue: { type: Type.STRING },
                  },
                  required: ['name', 'dose', 'times', 'foodTiming', 'purpose'],
                },
              },
            },
            required: ['summary', 'medicines'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/verify-photo', async (req, res) => {
    try {
      const { imageBase64, mimeType, medicineName, dose, pillColor, pillShape, language } = req.body as {
        imageBase64: string;
        mimeType: string;
        medicineName: string;
        dose: string;
        pillColor: string;
        pillShape: string;
        language: string;
      };
      const ai = getAI();
      const langLabel = getLanguageName(language || 'en');

      const response = await generateContentResilient(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              text: `The elderly person is verifying that they are taking or have taken ${medicineName} (${dose}, expected appearance: ${pillColor} ${pillShape} pill/capsule or an empty blister pack slot).
Look kindly at this photo. Does it show a tablet/capsule in hand, a pill bottle, or an empty blister strip slot?
Respond in ${langLabel}. Never accuse or scold. If unsure, warmly say "Let's just double check together" and describe what you see gently.`,
            },
          ],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              confidence: { type: Type.STRING },
              gentleMessage: { type: Type.STRING },
            },
            required: ['verified', 'confidence', 'gentleMessage'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/weekly-report', async (req, res) => {
    try {
      const { language, reportData } = req.body as {
        language: string;
        reportData: string;
      };
      const ai = getAI();
      const langLabel = getLanguageName(language || 'en');

      const response = await generateContentResilient(ai, {
        contents: `Write a friendly, clear, doctor-shareable weekly medication adherence and wellbeing summary based on this care circle data:\n${reportData}\n\nWrite it in ${langLabel} as 1 warm, concise paragraph (around 90-140 words) highlighting adherence rate, any missed evening/morning patterns, mood notes, any Patient Symptom Notes recorded for the doctor (with date/time/category), and readiness for the upcoming doctor visit.`,
        config: {
          systemInstruction: 'You are Sati, summarizing elderly care adherence clearly for family and doctors.',
        },
      });

      res.json({ report: (response.text || '').trim() });
    } catch (err) {
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/categorize-symptom', async (req, res) => {
    try {
      const { text } = req.body as { text: string };
      const ai = getAI();

      const response = await generateContentResilient(ai, {
        contents: `Classify this brief note spoken by an elderly patient for their doctor into exactly one symptom category:
"${text}"

Allowed categories:
- pain (headache, knee pain, joint ache, chest/back/body pain, cramps)
- dizziness (dizzy, lightheaded, vertigo, unsteady, spinning)
- fatigue (tired, weak, exhausted, low energy, drowsy)
- digestion (stomach, nausea, acidity, bloating, constipation, appetite)
- breathing (cough, shortness of breath, wheezing, congestion, throat)
- sleep (insomnia, woke up, couldn't sleep, restless night)
- other (anything else or general question)`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'One of: pain, dizziness, fatigue, digestion, breathing, sleep, other',
              },
            },
            required: ['category'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json({ category: parsed.category || 'other' });
    } catch (err) {
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/check-interactions', async (req, res) => {
    try {
      const { newMedicine, existingMedicines, allergies, conditions, foodTiming, language } = req.body as {
        newMedicine: string;
        existingMedicines: string[];
        allergies: string[];
        conditions: string[];
        foodTiming: string;
        language: string;
      };
      const ai = getAI();
      const langLabel = getLanguageName(language || 'en');

      const response = await generateContentResilient(ai, {
        contents: `Check potential medicine-to-medicine, allergy, condition, and food interactions for adding "${newMedicine}" (timing: ${foodTiming}).
Existing medicines: ${existingMedicines.join(', ') || 'None'}.
Allergies: ${allergies.join(', ') || 'None'}.
Conditions: ${conditions.join(', ') || 'None'}.
Respond in ${langLabel}. Keep guidance gentle, practical, and clear. Never advise stopping prescribed medicines without consulting the doctor.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hasWarning: { type: Type.BOOLEAN },
              severity: { type: Type.STRING, description: 'info or caution' },
              warningText: { type: Type.STRING },
              foodGuidance: { type: Type.STRING },
            },
            required: ['hasWarning', 'severity', 'warningText', 'foodGuidance'],
          },
        },
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      res.json(parsed);
    } catch (err) {
      const formatted = formatError(err);
      res.status(formatted.status).json({ error: formatted.message, detail: formatted.detail });
    }
  });

  app.post('/api/gemini/daily-tip', async (req, res) => {
    if (!process.env.GEMINI_API_KEY) {
      res.json({ tip: '' });
      return;
    }
    try {
      const { name, age, conditions, language } = req.body as {
        name: string;
        age: number;
        conditions: string[];
        language: string;
      };
      const ai = getAI();
      const langLabel = getLanguageName(language || 'en');

      const response = await generateContentResilient(
        ai,
        {
          contents: `Give one short, warm, uplifting daily wellness tip (max 2 short sentences) in ${langLabel} for ${name}, age ${age}, managing ${conditions.join(', ') || 'healthy aging'}. Keep it practical, culturally warm, and positive.`,
        },
        { skipFallbackOn429: true }
      );

      res.json({ tip: (response.text || '').trim() });
    } catch {
      res.json({ tip: '' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sati server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Sati server:', err);
  process.exit(1);
});
