import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, CheckCircle2, HeartHandshake, ShieldCheck, Sparkles, UserCheck, Users } from 'lucide-react';
import { getT, LANGUAGES } from '../i18n/translations';
import { LanguageCode, UserRole } from '../types';
import { HowSatiWorksModal } from './HowSatiWorksModal';
import { SatiLogo } from './PillGraphic';
import { PinPad } from './PinPad';

interface WelcomeSetupProps {
  language: LanguageCode;
  hasExistingCircle: boolean;
  existingPasscode: string;
  onSelectLanguage: (lang: LanguageCode) => void;
  onStartDemo: () => void;
  onCompleteElderlySetup: (payload: {
    name: string;
    email: string;
    age: number;
    conditions: string[];
    allergies: string[];
    language: LanguageCode;
  }) => void;
  onJoinWithPasscode: (payload: {
    name: string;
    email: string;
    role: 'caretaker' | 'family';
    passcode: string;
    relation?: string;
  }) => { ok: boolean; error?: string };
  onForgotPasscode?: (payload: {
    requesterName: string;
    requesterEmail: string;
    role: 'caretaker' | 'family';
  }) => void;
}

type Step = 'welcome' | 'identity' | 'role' | 'elderly_details' | 'passcode_join';

export function WelcomeSetup({
  language,
  existingPasscode,
  onSelectLanguage,
  onStartDemo,
  onCompleteElderlySetup,
  onJoinWithPasscode,
  onForgotPasscode,
}: WelcomeSetupProps) {
  const t = getT(language);
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('elderly');
  const [age, setAge] = useState('72');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [relation, setRelation] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [forgotPasscodeSent, setForgotPasscodeSent] = useState(false);

  useEffect(() => {
    setErrorMsg('');
  }, [language]);

  const handleContinueIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMsg(t.errMissingNameEmail);
      return;
    }
    setErrorMsg('');
    setStep('role');
  };

  const handleChooseRole = (chosen: UserRole) => {
    setRole(chosen);
    setErrorMsg('');
    if (chosen === 'elderly') {
      setStep('elderly_details');
    } else {
      setStep('passcode_join');
    }
  };

  const handleCreateElderly = (e: React.FormEvent) => {
    e.preventDefault();
    onCompleteElderlySetup({
      name: name.trim(),
      email: email.trim(),
      age: Number(age) || 70,
      conditions: conditions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      allergies: allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      language,
    });
  };

  const handleJoinCircle = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onJoinWithPasscode({
      name: name.trim(),
      email: email.trim(),
      role: role === 'caretaker' ? 'caretaker' : 'family',
      passcode: passcodeInput,
      relation: relation.trim(),
    });
    if (!res.ok) {
      setErrorMsg(res.error || t.enterPasscodePlaceholder);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#131B19] flex flex-col justify-center py-10 sm:py-14 px-5 sm:px-8 lg:px-10">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Left Calm Brand & Language Panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-8"
        >
          <div className="flex items-center gap-3.5">
            <SatiLogo size={52} />
            <span className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D5652]">
              {t.brandName}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.18] text-[#131B19]">
            {t.tagline}
          </h1>

          <div className="space-y-4 pt-1">
            <p className="text-lg font-semibold text-[#3E4C48]">{t.chooseLanguage}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => {
                const active = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    className={`min-h-[56px] px-4 py-3 rounded-2xl text-left border-2 transition-all duration-150 cursor-pointer flex items-center justify-between active:scale-[0.98] ${
                      active
                        ? 'bg-[#0D5652] text-white border-[#0D5652] shadow-sm'
                        : 'bg-white text-[#131B19] border-[#DFD5C5] hover:border-[#0D5652]/60'
                    }`}
                  >
                    <span className="font-bold text-lg truncate">{lang.nativeName}</span>
                    <span className={`text-xs font-medium ml-2 ${active ? 'text-teal-100' : 'text-[#3E4C48]'}`}>
                      {lang.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="min-h-[52px] px-5 py-2.5 rounded-2xl bg-white hover:bg-[#F2ECE1] border-2 border-[#DFD5C5] text-[#0D5652] font-bold text-base inline-flex items-center gap-2.5 cursor-pointer transition-colors"
            >
              <BookOpen className="w-5 h-5 shrink-0" />
              <span>{t.howSatiWorksBtn}</span>
            </button>
          </div>
        </motion.div>

        {/* Right Action / Onboarding Card */}
        <div className="lg:col-span-6">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="sati-card bg-white rounded-3xl border border-[#DFD5C5] shadow-sm p-7 sm:p-9 space-y-7"
          >
            {step === 'welcome' && (
              <>
                <div className="space-y-5">
                  <button
                    type="button"
                    onClick={onStartDemo}
                    className="w-full min-h-[76px] p-5 sm:p-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-left transition-all duration-150 shadow-sm flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 font-display text-xl sm:text-2xl font-bold">
                        <Sparkles className="w-6 h-6 text-amber-300 shrink-0" />
                        <span>{t.demoModeBtn}</span>
                      </div>
                      <p className="text-sm sm:text-base text-teal-50 leading-relaxed">{t.demoModeDesc}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 shrink-0" />
                  </button>

                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-[#DFD5C5]" />
                    <span className="px-4 text-sm font-medium text-[#3E4C48]">{t.orWord}</span>
                    <div className="flex-grow border-t border-[#DFD5C5]" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('identity')}
                    className="w-full min-h-[76px] p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] hover:bg-[#F2ECE1] text-[#131B19] border-2 border-[#DFD5C5] text-left transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer active:scale-[0.99]"
                  >
                    <div className="space-y-1.5">
                      <div className="font-display text-xl sm:text-2xl font-bold text-[#0D5652]">
                        {t.freshSetupBtn}
                      </div>
                      <p className="text-sm sm:text-base text-[#3E4C48] leading-relaxed">{t.freshSetupDesc}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-[#0D5652] shrink-0" />
                  </button>
                </div>

                <div className="pt-4 border-t border-[#DFD5C5] grid grid-cols-3 gap-4 text-center text-sm font-medium text-[#3E4C48]">
                  <div className="flex flex-col items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-[#0D5652]" />
                    <span>{t.featurePrivacy}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <HeartHandshake className="w-6 h-6 text-[#A85208]" />
                    <span>{t.featureVerification}</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6 text-[#0D5652]" />
                    <span>{t.featureCircle}</span>
                  </div>
                </div>
              </>
            )}

            {step === 'identity' && (
              <form onSubmit={handleContinueIdentity} className="space-y-6">
                <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.freshSetupBtn}</h2>
                <div>
                  <label className="block text-base font-semibold mb-2">{t.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder={t.namePlaceholder}
                    className="w-full min-h-[56px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-lg"
                  />
                </div>
                <div>
                  <label className="block text-base font-semibold mb-2">{t.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="name@example.com"
                    className="w-full min-h-[56px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-lg"
                  />
                </div>
                {errorMsg && <p className="text-base text-amber-900 bg-amber-50 p-4 rounded-2xl">{errorMsg}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep('welcome');
                    }}
                    className="min-h-[56px] px-6 rounded-2xl border-2 border-[#DFD5C5] font-semibold text-base cursor-pointer"
                  >
                    {t.backBtn}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[56px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-lg cursor-pointer"
                  >
                    {t.continueBtn}
                  </button>
                </div>
              </form>
            )}

            {step === 'role' && (
              <div className="space-y-4">
                <h2 className="font-display text-2xl sm:text-3xl font-bold pb-1">{t.chooseRoleTitle}</h2>
                <button
                  type="button"
                  onClick={() => handleChooseRole('elderly')}
                  className="w-full min-h-[76px] p-5 rounded-2xl border-2 border-[#DFD5C5] hover:border-[#0D5652] bg-[#FAF7F2] text-left flex items-start gap-4 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-8 h-8 text-[#0D5652] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-display text-xl font-bold text-[#131B19]">{t.roleElderly}</div>
                    <p className="text-base text-[#3E4C48] mt-1">{t.roleElderlyDesc}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChooseRole('caretaker')}
                  className="w-full min-h-[76px] p-5 rounded-2xl border-2 border-[#DFD5C5] hover:border-[#0D5652] bg-[#FAF7F2] text-left flex items-start gap-4 transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-8 h-8 text-[#A85208] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-display text-xl font-bold text-[#131B19]">{t.roleCaretaker}</div>
                    <p className="text-base text-[#3E4C48] mt-1">{t.roleCaretakerDesc}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChooseRole('family')}
                  className="w-full min-h-[76px] p-5 rounded-2xl border-2 border-[#DFD5C5] hover:border-[#0D5652] bg-[#FAF7F2] text-left flex items-start gap-4 transition-colors cursor-pointer"
                >
                  <Users className="w-8 h-8 text-[#0D5652] shrink-0 mt-0.5" />
                  <div>
                    <div className="font-display text-xl font-bold text-[#131B19]">{t.roleFamily}</div>
                    <p className="text-base text-[#3E4C48] mt-1">{t.roleFamilyDesc}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('identity')}
                  className="min-h-[48px] px-4 text-base font-semibold text-[#3E4C48] hover:text-[#131B19] cursor-pointer"
                >
                  {t.backBtn}
                </button>
              </div>
            )}

            {step === 'elderly_details' && (
              <form onSubmit={handleCreateElderly} className="space-y-5">
                <h2 className="font-display text-2xl sm:text-3xl font-bold">{t.roleElderly}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-base font-semibold mb-1.5">{t.ageLabel}</label>
                    <input
                      type="number"
                      min={50}
                      max={115}
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full min-h-[54px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-lg tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-base font-semibold mb-1.5">{t.conditionsLabel}</label>
                    <input
                      type="text"
                      value={conditions}
                      onChange={(e) => setConditions(e.target.value)}
                      placeholder={t.conditionsPlaceholder}
                      className="w-full min-h-[54px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-base font-semibold mb-1.5">{t.allergiesLabel}</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder={t.allergiesPlaceholder}
                    className="w-full min-h-[54px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base"
                  />
                </div>
                <div className="p-4 rounded-2xl bg-[#F2ECE1] text-base text-[#131B19] flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#0D5652] shrink-0 mt-0.5" />
                  <span>{t.passcodeCreatedNote}</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('role')}
                    className="min-h-[56px] px-6 rounded-2xl border-2 border-[#DFD5C5] font-semibold cursor-pointer"
                  >
                    {t.backBtn}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 min-h-[56px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-lg cursor-pointer"
                  >
                    {t.continueBtn}
                  </button>
                </div>
              </form>
            )}

            {step === 'passcode_join' && (
              <form onSubmit={handleJoinCircle} className="space-y-5">
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  {role === 'caretaker' ? t.roleCaretaker : t.roleFamily}
                </h2>
                <div>
                  <label className="block text-base font-semibold mb-2">{t.passcodeLabel}</label>
                  <PinPad
                    value={passcodeInput}
                    onChange={(next) => {
                      setPasscodeInput(next);
                      if (errorMsg) setErrorMsg('');
                    }}
                    language={language}
                    onForgotPasscode={() => {
                      onForgotPasscode?.({
                        requesterName: name.trim(),
                        requesterEmail: email.trim(),
                        role: role === 'caretaker' ? 'caretaker' : 'family',
                      });
                      setForgotPasscodeSent(true);
                    }}
                    forgotSent={forgotPasscodeSent}
                  />
                  <p className="text-sm text-[#3E4C48] mt-3">
                    {t.passcodeJoinTip}{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setPasscodeInput(existingPasscode || '482915');
                        setErrorMsg('');
                      }}
                      className="font-bold tabular-nums text-[#0D5652] underline underline-offset-2 cursor-pointer"
                    >
                      {existingPasscode || '482915'}
                    </button>
                  </p>
                </div>
                <div>
                  <label className="block text-base font-semibold mb-1.5">{t.relationOptional}</label>
                  <input
                    type="text"
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    placeholder={role === 'caretaker' ? t.relationCaretakerPlaceholder : t.relationFamilyPlaceholder}
                    className="w-full min-h-[54px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-[#FAF7F2] text-base"
                  />
                </div>
                {errorMsg && <p className="text-base text-amber-900 bg-amber-50 p-4 rounded-2xl">{errorMsg}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasscodeSent(false);
                      setStep('role');
                    }}
                    className="min-h-[56px] px-6 rounded-2xl border-2 border-[#DFD5C5] font-semibold cursor-pointer"
                  >
                    {t.backBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={passcodeInput.length < 6}
                    className="flex-1 min-h-[56px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] disabled:opacity-50 text-white font-bold text-lg cursor-pointer"
                  >
                    {t.continueBtn}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>

      <HowSatiWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
        language={language}
        onTryDemo={onStartDemo}
      />
    </div>
  );
}
