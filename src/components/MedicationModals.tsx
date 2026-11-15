import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Camera, CheckCircle2, FileScan, Loader2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { getLocalDateStr } from '../data/seedData';
import { getT } from '../i18n/translations';
import {
  checkMedicationInteractions,
  ExtractedPrescriptionMedicine,
  InteractionCheckResponse,
  scanPrescriptionImage,
  verifyDosePhoto,
} from '../services/geminiService';
import { FoodTiming, LanguageCode, Medication, PillColor, PillShape } from '../types';
import { PillGraphic } from './PillGraphic';

const PILL_COLORS: PillColor[] = ['white', 'yellow', 'pink', 'blue', 'amber', 'teal', 'green'];
const PILL_SHAPES: PillShape[] = ['round', 'oval', 'capsule'];

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    if (file.type && !file.type.startsWith('image/')) {
      reject(new Error('Unsupported file type.'));
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      reject(new Error('Image file is too large.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = String(reader.result || '');
      const commaIdx = res.indexOf(',');
      resolve({
        base64: commaIdx >= 0 ? res.slice(commaIdx + 1) : res,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

interface MedicationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  existingMedications: Medication[];
  allergies: string[];
  conditions: string[];
  initialMed?: Medication | null;
  openWithScan?: boolean;
  onSave: (med: Omit<Medication, 'id'>, existingId?: string) => void;
}

export function MedicationEditorModal({
  isOpen,
  onClose,
  language,
  existingMedications,
  allergies,
  conditions,
  initialMed,
  openWithScan = false,
  onSave,
}: MedicationEditorModalProps) {
  const t = getT(language);
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [timesStr, setTimesStr] = useState('08:00, 20:00');
  const [foodTiming, setFoodTiming] = useState<FoodTiming>('with_food');
  const [startDate, setStartDate] = useState(getLocalDateStr(0));
  const [endDate, setEndDate] = useState('');
  const [pillColor, setPillColor] = useState<PillColor>('white');
  const [pillShape, setPillShape] = useState<PillShape>('oval');
  const [stockCount, setStockCount] = useState('30');
  const [purpose, setPurpose] = useState('');
  const [routineCue, setRoutineCue] = useState(t.defaultRoutineCue);
  const [sideEffectsStr, setSideEffectsStr] = useState('');

  const [scanning, setScanning] = useState(false);
  const [scanSummary, setScanSummary] = useState('');
  const [scannedList, setScannedList] = useState<ExtractedPrescriptionMedicine[]>([]);
  const [scanError, setScanError] = useState('');

  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [interactionResult, setInteractionResult] = useState<InteractionCheckResponse | null>(null);
  const [timesError, setTimesError] = useState('');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setScanSummary('');
    setScannedList([]);
    setScanError('');
    setTimesError('');
    setDateError('');
    setInteractionResult(null);
    if (initialMed) {
      setName(initialMed.name);
      setDose(initialMed.dose);
      setTimesStr(initialMed.times.join(', '));
      setFoodTiming(initialMed.foodTiming);
      setStartDate(initialMed.startDate);
      setEndDate(initialMed.endDate);
      setPillColor(initialMed.pillColor);
      setPillShape(initialMed.pillShape);
      setStockCount(String(initialMed.stockCount));
      setPurpose(initialMed.purpose);
      setRoutineCue(initialMed.routineCue);
      setSideEffectsStr(initialMed.sideEffects.join(', '));
    } else {
      setName('');
      setDose('');
      setTimesStr('08:00');
      setFoodTiming('with_food');
      setStartDate(getLocalDateStr(0));
      setEndDate('');
      setPillColor('white');
      setPillShape('round');
      setStockCount('30');
      setPurpose('');
      setRoutineCue(getT(language).defaultRoutineCue);
      setSideEffectsStr('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMed]);

  if (!isOpen) return null;

  const applyExtracted = (m: ExtractedPrescriptionMedicine) => {
    setName(m.name || '');
    setDose(m.dose || '');
    setTimesStr((m.times && m.times.length ? m.times : ['08:00']).join(', '));
    setFoodTiming(
      m.foodTiming === 'without_food' || m.foodTiming === 'either' ? m.foodTiming : 'with_food'
    );
    setPurpose(m.purpose || '');
    setRoutineCue(m.routineCue || t.defaultRoutineCue);
    setSideEffectsStr((m.sideEffects || []).join(', '));
    setStockCount(String(m.stockCount || 30));
    const c = (m.pillColor || '').toLowerCase() as PillColor;
    if (PILL_COLORS.includes(c)) setPillColor(c);
    const s = (m.pillShape || '').toLowerCase() as PillShape;
    if (PILL_SHAPES.includes(s)) setPillShape(s);
  };

  const handleScanFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setScanning(true);
    setScanError('');
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await scanPrescriptionImage(base64, mimeType, language);
      setScanSummary(res.summary);
      setScannedList(res.medicines || []);
      if (res.medicines && res.medicines.length > 0) {
        applyExtracted(res.medicines[0]);
      }
    } catch {
      setScanError(t.geminiErrorScan);
    } finally {
      setScanning(false);
    }
  };

  const handleCheckInteractions = async () => {
    if (!name.trim()) return;
    setCheckingInteractions(true);
    setScanError('');
    try {
      const res = await checkMedicationInteractions({
        newMedicine: `${name.trim()} ${dose.trim()}`,
        existingMedicines: existingMedications
          .filter((m) => m.id !== initialMed?.id)
          .map((m) => `${m.name} ${m.dose}`),
        allergies,
        conditions,
        foodTiming,
        language,
      });
      setInteractionResult(res);
    } catch {
      setScanError(t.geminiErrorInteraction);
    } finally {
      setCheckingInteractions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dose.trim()) return;
    const rawSegments = timesStr
      .split(',')
      .map((tItem) => tItem.trim())
      .filter(Boolean);

    const parsedTimes: string[] = [];
    for (const seg of rawSegments) {
      const match = /^(\d{1,2}):(\d{2})$/.exec(seg);
      if (!match) {
        setTimesError(t.invalidTimesError);
        return;
      }
      const hour = Number(match[1]);
      const minute = Number(match[2]);
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        setTimesError(t.invalidTimesError);
        return;
      }
      parsedTimes.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }

    if (parsedTimes.length === 0) {
      setTimesError(t.invalidTimesError);
      return;
    }
    if (endDate && startDate && endDate < startDate) {
      setDateError(`${t.endDateLabel} ≥ ${t.startDateLabel}`);
      return;
    }
    const uniqueTimes = Array.from(new Set(parsedTimes));
    setTimesError('');
    setDateError('');

    onSave(
      {
        name: name.trim(),
        dose: dose.trim(),
        times: uniqueTimes,
        foodTiming,
        startDate,
        endDate,
        pillColor,
        pillShape,
        stockCount: Math.max(0, Number(stockCount) || 0),
        lowStockThreshold: 5,
        purpose: purpose.trim() || t.defaultMedPurpose,
        sideEffects: sideEffectsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        routineCue: routineCue.trim() || t.defaultRoutineCue,
        safeWindowHours: uniqueTimes.length > 1 ? 5 : 12,
      },
      initialMed?.id
    );
    onClose();
  };

  const colorLabelMap: Record<PillColor, string> = {
    white: t.colorWhite,
    yellow: t.colorYellow,
    pink: t.colorPink,
    blue: t.colorBlue,
    amber: t.colorAmber,
    teal: t.colorTeal,
    green: t.colorGreen,
  };
  const shapeLabelMap: Record<PillShape, string> = {
    round: t.shapeRound,
    oval: t.shapeOval,
    capsule: t.shapeCapsule,
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={initialMed ? `${t.editBtn}: ${initialMed.name}` : t.addMedication}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="sati-card bg-[#FAF7F2] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden border border-[#DFD5C5] shadow-2xl"
      >
        <div className="flex items-center justify-between px-6 sm:px-7 py-5 bg-white border-b border-[#DFD5C5]">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">
            {initialMed ? `${t.editBtn}: ${initialMed.name}` : t.addMedication}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#F2ECE1] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 overflow-y-auto space-y-6">
          {/* Prescription Scan Banner */}
          <div
            className={`p-5 rounded-3xl border-2 ${
              openWithScan ? 'bg-teal-50 border-[#0D5652]' : 'bg-white border-[#DFD5C5]'
            } space-y-3`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <FileScan className="w-7 h-7 text-[#0D5652] shrink-0" />
                <div>
                  <div className="font-bold text-lg">{t.scanPrescription}</div>
                  <div className="sati-muted text-sm text-[#3E4C48]">
                    {t.scanHelpText}
                  </div>
                </div>
              </div>
              <label className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white text-base font-bold flex items-center gap-2 cursor-pointer transition-colors">
                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                <span>{scanning ? t.scanningText : t.uploadPhotoBtn}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleScanFile}
                  disabled={scanning}
                />
              </label>
            </div>
            {scanSummary && <p className="text-base text-[#0D5652] font-semibold">{scanSummary}</p>}
            {scanError && <p className="text-base text-amber-950 bg-amber-50 p-3 rounded-2xl">{scanError}</p>}
            {scannedList.length > 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {scannedList.map((item, idx) => {
                  const isActive =
                    item.name.trim().toLowerCase() === name.trim().toLowerCase() &&
                    item.dose.trim().toLowerCase() === dose.trim().toLowerCase();
                  return (
                    <button
                      key={`${item.name}-${idx}`}
                      type="button"
                      onClick={() => applyExtracted(item)}
                      className={`min-h-[44px] px-4 py-2 rounded-2xl text-sm font-bold cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-[#0D5652] text-white'
                          : 'bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#131B19]'
                      }`}
                    >
                      {t.fillMedBtnLabel} {item.name} ({item.dose})
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Medication Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.medicineNameLabel}</label>
              <input
                type="text"
                required
                pattern=".*\S.*"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.medNamePlaceholder}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.doseLabel}</label>
              <input
                type="text"
                required
                pattern=".*\S.*"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder={t.medDosePlaceholder}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.timesPerDayLabel}</label>
              <input
                type="text"
                required
                value={timesStr}
                onChange={(e) => {
                  setTimesStr(e.target.value);
                  if (timesError) setTimesError('');
                }}
                placeholder="08:00, 20:00"
                className={`w-full min-h-[52px] px-4 rounded-2xl border-2 bg-white text-base tabular-nums ${
                  timesError ? 'border-rose-500' : 'border-[#DFD5C5]'
                }`}
              />
              {timesError && (
                <p className="text-sm font-semibold text-rose-800 mt-1.5">{timesError}</p>
              )}
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.foodTimingLabel}</label>
              <select
                value={foodTiming}
                onChange={(e) => setFoodTiming(e.target.value as FoodTiming)}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              >
                <option value="with_food">{t.withFood}</option>
                <option value="without_food">{t.withoutFood}</option>
                <option value="either">{t.eitherFood}</option>
              </select>
            </div>
          </div>

          {/* Interaction Check Trigger */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#DFD5C5]">
            <div className="sati-muted text-base text-[#3E4C48]">
              {t.checkInteractionsDesc}
            </div>
            <button
              type="button"
              onClick={handleCheckInteractions}
              disabled={!name.trim() || checkingInteractions}
              className="min-h-[48px] px-5 py-2 rounded-2xl bg-[#F2ECE1] hover:bg-[#E7DFD1] text-[#0D5652] font-bold text-base flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {checkingInteractions ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#A85208]" />
              )}
              <span>{t.checkInteractionsBtn}</span>
            </button>
          </div>

          {interactionResult && (
            <div
              className={`p-5 rounded-2xl border-2 flex items-start gap-3.5 ${
                interactionResult.hasWarning || interactionResult.severity === 'caution'
                  ? 'bg-amber-50 border-amber-400 text-amber-950'
                  : 'bg-teal-50 border-teal-300 text-teal-950'
              }`}
            >
              {interactionResult.hasWarning ? (
                <AlertTriangle className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-6 h-6 text-[#0D5652] shrink-0 mt-0.5" />
              )}
              <div className="text-base space-y-1">
                <p className="font-bold">{interactionResult.warningText}</p>
                <p className="text-sm">{interactionResult.foodGuidance}</p>
              </div>
            </div>
          )}

          {/* Pill Appearance Picker */}
          <div className="p-5 rounded-3xl bg-white border border-[#DFD5C5] space-y-4">
            <div className="flex items-center gap-5">
              <PillGraphic color={pillColor} shape={pillShape} size={72} />
              <div className="flex-1 space-y-3">
                <div>
                  <span className="sati-muted block text-sm font-bold text-[#3E4C48] mb-2">
                    {t.pillColorLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PILL_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setPillColor(c)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-sm font-bold border-2 cursor-pointer transition-colors ${
                          pillColor === c
                            ? 'bg-[#0D5652] text-white border-[#0D5652]'
                            : 'bg-[#FAF7F2] text-[#131B19] border-[#DFD5C5]'
                        }`}
                      >
                        {colorLabelMap[c]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="sati-muted block text-sm font-bold text-[#3E4C48] mb-2">
                    {t.pillShapeLabel}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PILL_SHAPES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPillShape(s)}
                        className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-sm font-bold border-2 cursor-pointer transition-colors ${
                          pillShape === s
                            ? 'bg-[#0D5652] text-white border-[#0D5652]'
                            : 'bg-[#FAF7F2] text-[#131B19] border-[#DFD5C5]'
                        }`}
                      >
                        {shapeLabelMap[s]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.stockCountLabel}</label>
              <input
                type="number"
                min={0}
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base tabular-nums"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.startDateLabel}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (dateError) setDateError('');
                }}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.endDateLabel}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (dateError) setDateError('');
                }}
                className={`w-full min-h-[52px] px-4 rounded-2xl border-2 bg-white text-base ${
                  dateError ? 'border-rose-500' : 'border-[#DFD5C5]'
                }`}
              />
              {dateError && (
                <p className="text-sm font-semibold text-rose-800 mt-1.5">{dateError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.routineCueLabel}</label>
              <input
                type="text"
                value={routineCue}
                onChange={(e) => setRoutineCue(e.target.value)}
                placeholder={t.medCuePlaceholder}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.simplePurposeLabel}</label>
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder={t.medPurposePlaceholder}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold mb-1.5">{t.sideEffectsLabel}</label>
            <input
              type="text"
              value={sideEffectsStr}
              onChange={(e) => setSideEffectsStr(e.target.value)}
              placeholder={t.medSideEffectsPlaceholder}
              className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[56px] px-6 rounded-2xl border-2 border-[#DFD5C5] bg-white font-bold text-base cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[56px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-lg cursor-pointer transition-colors"
            >
              {t.saveBtn}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

interface PhotoVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  medicine: Medication | null;
  onVerified: (note: string) => void;
}

export function PhotoVerifyModal({
  isOpen,
  onClose,
  language,
  medicine,
  onVerified,
}: PhotoVerifyModalProps) {
  const t = getT(language);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ verified: boolean; gentleMessage: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !medicine) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const { base64, mimeType } = await fileToBase64(file);
      const res = await verifyDosePhoto({
        imageBase64: base64,
        mimeType,
        medicineName: medicine.name,
        dose: medicine.dose,
        pillColor: medicine.pillColor,
        pillShape: medicine.pillShape,
        language,
      });
      setResult({ verified: res.verified, gentleMessage: res.gentleMessage });
      if (res.verified) {
        onVerified(res.gentleMessage);
      }
    } catch {
      setError(t.geminiErrorPhoto);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.verifyWithPhoto}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="sati-card bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-7 space-y-6 border border-[#DFD5C5] shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl sm:text-3xl font-bold">{t.verifyWithPhoto}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#F2ECE1] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#DFD5C5]">
          <PillGraphic color={medicine.pillColor} shape={medicine.pillShape} size={64} />
          <div>
            <div className="font-bold text-xl">
              {medicine.name} {medicine.dose}
            </div>
            <p className="sati-muted text-base text-[#3E4C48]">
              {t.showTabletHint}
            </p>
          </div>
        </div>

        <label className="w-full min-h-[68px] rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-xl flex items-center justify-center gap-3 cursor-pointer transition-colors">
          {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Camera className="w-7 h-7" />}
          <span>{loading ? t.satiLookingGently : t.takeOrChoosePhoto}</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={loading}
          />
        </label>

        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-950 text-base flex items-start gap-2.5">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div
            className={`p-5 rounded-2xl border-2 text-lg space-y-4 ${
              result.verified
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <p className="font-semibold leading-relaxed">{result.gentleMessage}</p>
            {result.verified && (
              <button
                type="button"
                onClick={onClose}
                className="w-full min-h-[54px] rounded-2xl bg-emerald-800 text-white font-bold text-lg cursor-pointer"
              >
                {t.continueBtn}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  onSave: (appt: {
    doctorName: string;
    specialty: string;
    clinic: string;
    date: string;
    time: string;
    notes: string;
  }) => void;
}

export function AppointmentModal({ isOpen, onClose, language, onSave }: AppointmentModalProps) {
  const t = getT(language);
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [clinic, setClinic] = useState('');
  const [date, setDate] = useState(getLocalDateStr(2));
  const [time, setTime] = useState('10:30');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setDoctorName('');
    setSpecialty('');
    setClinic('');
    setDate(getLocalDateStr(2));
    setTime('10:30');
    setNotes('');
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName.trim() || !date || !time) return;
    onSave({
      doctorName: doctorName.trim(),
      specialty: specialty.trim() || t.defaultSpecialty,
      clinic: clinic.trim() || t.defaultClinic,
      date,
      time,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-5"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t.addAppointment}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="sati-card bg-[#FAF7F2] w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-7 space-y-5 border border-[#DFD5C5] shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl sm:text-3xl font-bold">{t.addAppointment}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.cancelBtn}
            className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-[#F2ECE1] cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-semibold mb-1.5">{t.doctorNameLabel}</label>
            <input
              type="text"
              required
              pattern=".*\S.*"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder={t.apptDoctorPlaceholder}
              className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.specialtyLabel}</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder={t.apptSpecialtyPlaceholder}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.clinicLabel}</label>
              <input
                type="text"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                placeholder={t.apptClinicPlaceholder}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.dateLabel}</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-1.5">{t.timeLabel}</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
              />
            </div>
          </div>
          <div>
            <label className="block text-base font-semibold mb-1.5">{t.visitNotesLabel}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.apptNotesPlaceholder}
              className="w-full min-h-[52px] px-4 rounded-2xl border-2 border-[#DFD5C5] bg-white text-base"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[54px] px-6 rounded-2xl border-2 border-[#DFD5C5] bg-white font-bold cursor-pointer"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[54px] px-6 rounded-2xl bg-[#0D5652] hover:bg-[#09413E] text-white font-bold text-lg cursor-pointer transition-colors"
            >
              {t.saveBtn}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
