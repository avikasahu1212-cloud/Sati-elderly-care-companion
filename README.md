# Sati: Elderly Care & Medication Companion

A voice-first, multilingual AI companion and "care circle" for elderly medication management. Built solo for **PromptWars x Catalyst (Build with AI)**.

**Live demo:** https://sati-studio.ai.studio/

## Problem statement

**Elderly Care & Medication Management Platform.** Build a connected healthcare platform that helps elderly people manage daily medications, appointments and routines while keeping family and caretakers informed. Elderly individuals, caretakers and family share a healthcare profile through secure, passcode-based access, and the system proactively reminds about missed medications, upcoming doses and appointments. The challenge is to go beyond a basic reminder app and keep the elderly person at the centre of their own healthcare decisions.

## Our solution

Sati puts a **care circle** around the elderly person. Everyone shares one health profile, but each role gets an interface made for them:

| Role | Experience |
| --- | --- |
| Elderly person | Minimal, large-text, high-contrast, voice-first screen: greeting, next medicine, one big "Taken" button, and Sati |
| Caretaker | Dashboard with today's doses, verification, medication editing, alerts and timeline |
| Family | Analytical view: calendar, adherence trends, appointments and alerts |

## Features

- **Role-based sign-up** (elderly, caretaker, family) and **passcode-based access** to a shared care circle
- **Medication schedules** with reminders, adherence tracking and a calendar
- **Escalating missed-dose alerts** to caretakers and family, with email-style notifications
- **Double-dose protection:** a second confirmation inside the safe window is blocked
- **"Said taken" vs "verified taken"** statuses for honest tracking
- **Sati, the AI companion** powered by Gemini: answers basic health questions with awareness of the person's medicines, and sorts concerns into mild, concerning and emergency
- **Emergency mode** with Medical ID details and alerts to the care circle
- **Appointment tracking** and a report to share with the doctor
- **Elderly-first design:** large text, high contrast, voice-first interaction
- **Multilingual interface:** English, Hindi, Marathi

> Note: Sati gives general guidance only and is not a replacement for a doctor.

## Tech stack

- Google AI Studio (Build mode) and the Gemini API
- TypeScript, Vite
- Web Speech API for voice input and spoken replies
- Deployed through Google AI Studio

## Run locally

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and set your Gemini API key (use the variable name shown in `.env.example`).
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the printed local URL in **Chrome or Edge** (needed for voice features) and allow the microphone.

## Try it quickly

Open the live link and choose **Demo Mode** to load a pre-registered elderly person (Ramesh Sharma) with a caretaker and a family member and a week of medication history, or choose **Fresh Setup** to create your own care circle.

## Manual test checklist

- [ ] Demo Mode loads with realistic data
- [ ] Marking a dose as taken updates the caretaker and family views
- [ ] A second "taken" for the same dose is blocked (double-dose protection)
- [ ] A missed dose creates alerts for caretaker and family
- [ ] An emergency trigger shows the Medical ID and alerts the care circle
- [ ] Switching language updates the interface (English, Hindi, Marathi)
- [ ] Sati answers a basic health question such as "I have a headache"

## Accessibility

ARIA labels on interactive controls, a language attribute matching the selected language, keyboard focus styles, large touch targets, adjustable text size and a high-contrast mode.

## Known limitations and future scope

- Voice input works best in Chrome or Edge, and regional-language recognition is less accurate than English
- Email alerts, ambulance calls and the pill box sensor are simulated
- Future: pharmacy refill integration, biometric unlock, wearable and smart pill box support, a native app with background wake-word listening
- Automated tests for the core care logic are planned

## Author

Avika Sahu
