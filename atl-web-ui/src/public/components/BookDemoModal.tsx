import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar as CalendarIcon,
  Mail,
  User,
  Phone,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Loader2,
  Clock,
} from 'lucide-react';
import CustomDatePicker from '../../components/common/CustomDatePicker';
import FloatingLabelInput from '../../components/common/FloatingLabelInput';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

interface BookDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = ['10:00', '11:30', '14:00', '15:30', '17:00', '18:30'];

const BookDemoModal: React.FC<BookDemoModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName:          '',
    email:             '',
    phoneNumber:       '',
    instituteName:     '',
    estimatedStudents: '',
    preferredDate:     new Date(),
    preferredTime:     '10:00',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!formData.fullName.trim())      e.fullName      = 'Full name is required';
    if (!formData.email.trim())         e.email         = 'Email is required';
    if (!formData.phoneNumber.trim())   e.phoneNumber   = 'Contact number is required';
    if (!formData.instituteName.trim()) e.instituteName = 'Institution name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        preferredDate: formData.preferredDate.toISOString().split('T')[0],
        preferredTime: `${formData.preferredTime}:00`,
      };
      await api.post(
        '/ims-platform-service/api/v1/platform/public/demo-requests',
        payload,
      );
      setStep(3);
      toast.success('Request submitted successfully!');
    } catch {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrors({});
    onClose();
  };

  /* ── Step indicator ── */
  const StepDots = () => (
    <div className="flex items-center gap-1.5 mt-1">
      {[1, 2].map((s) => (
        <div
          key={s}
          className="rounded-full transition-all duration-300"
          style={{
            width:      s === step ? '20px' : '6px',
            height:     '6px',
            background: s <= step ? '#2A6DF4' : '#E2E8F8',
          }}
        />
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(15,29,58,0.55)' }}
          />

          {/* Modal card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{   opacity: 0, scale: 0.93, y: 24 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-[540px] bg-white overflow-hidden"
            style={{ borderRadius: '20px', boxShadow: '0 24px 64px rgba(42,109,244,0.18)' }}
          >
            {/* ── Header ── */}
            <div
              className="px-7 pt-7 pb-5 flex items-start justify-between"
              style={{ borderBottom: '1px solid #E2E8F8' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: '#EBF1FE' }}
                >
                  <CalendarIcon className="w-5 h-5" style={{ color: '#2A6DF4' }} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold tracking-tight" style={{ color: '#0F1D3A' }}>
                    Book a Live Demo
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] font-medium" style={{ color: '#8FA3C0' }}>
                      Step {Math.min(step, 2)} of 2
                    </p>
                    {step < 3 && <StepDots />}
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-[8px] transition-colors hover:bg-[#F7F9FF]"
                aria-label="Close"
              >
                <X className="w-5 h-5" style={{ color: '#8FA3C0' }} />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="px-7 py-6">

              {/* ═══ Step 1: Date & Time ═══ */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{   opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Date picker */}
                  <div>
                    <label
                      className="block text-[11px] font-bold uppercase tracking-[0.1em] mb-2"
                      style={{ color: '#8FA3C0' }}
                    >
                      Select Preferred Date
                    </label>
                    <CustomDatePicker
                      selectedDate={formData.preferredDate}
                      onChange={(date) => date && setFormData((p) => ({ ...p, preferredDate: date }))}
                      minDate={new Date()}
                    />
                  </div>

                  {/* Time slots */}
                  <div>
                    <label
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.1em] mb-3"
                      style={{ color: '#8FA3C0' }}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Preferred Time (IST)
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {TIME_SLOTS.map((t) => {
                        const active = formData.preferredTime === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setFormData((p) => ({ ...p, preferredTime: t }))}
                            className="py-3 rounded-[10px] text-[13px] font-semibold transition-all duration-150"
                            style={
                              active
                                ? {
                                    background: '#2A6DF4',
                                    color: '#FFFFFF',
                                    boxShadow: '0 4px 12px rgba(42,109,244,0.30)',
                                    border: '1.5px solid #2A6DF4',
                                  }
                                : {
                                    background: '#F7F9FF',
                                    color: '#5A6B88',
                                    border: '1.5px solid #E2E8F8',
                                  }
                            }
                            onMouseEnter={(e) => {
                              if (!active) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A6DF4';
                                (e.currentTarget as HTMLButtonElement).style.color = '#2A6DF4';
                                (e.currentTarget as HTMLButtonElement).style.background = '#EBF1FE';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!active) {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F8';
                                (e.currentTarget as HTMLButtonElement).style.color = '#5A6B88';
                                (e.currentTarget as HTMLButtonElement).style.background = '#F7F9FF';
                              }
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Continue CTA */}
                  <button
                    id="demo-step1-continue"
                    onClick={() => setStep(2)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-[12px] text-[15px] font-semibold text-white transition-all duration-150 group"
                    style={{
                      background: '#2A6DF4',
                      boxShadow: '0 4px 16px rgba(42,109,244,0.30)',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#1A5CE0'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#2A6DF4'; }}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </motion.div>
              )}

              {/* ═══ Step 2: Contact Info ═══ */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{   opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Full Name + Email side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingLabelInput
                      label="Full Name"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => set('fullName', e.target.value)}
                      icon={<User className="h-5 w-5" />}
                      error={errors.fullName}
                    />
                    <FloatingLabelInput
                      label="Personal Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => set('email', e.target.value)}
                      icon={<Mail className="h-5 w-5" />}
                      error={errors.email}
                    />
                  </div>

                  <FloatingLabelInput
                    label="Contact Number"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => set('phoneNumber', e.target.value)}
                    icon={<Phone className="h-5 w-5" />}
                    error={errors.phoneNumber}
                  />

                  <FloatingLabelInput
                    label="Institution Name"
                    name="instituteName"
                    type="text"
                    value={formData.instituteName}
                    onChange={(e) => set('instituteName', e.target.value)}
                    icon={<GraduationCap className="h-5 w-5" />}
                    error={errors.instituteName}
                  />

                  {/* Action row */}
                  <div className="flex gap-3 pt-2">
                    <button
                      id="demo-step2-back"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-[12px] text-[14px] font-semibold transition-all duration-150"
                      style={{
                        background: '#F7F9FF',
                        color: '#5A6B88',
                        border: '1.5px solid #E2E8F8',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#EBF1FE';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A6DF4';
                        (e.currentTarget as HTMLButtonElement).style.color = '#2A6DF4';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#F7F9FF';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#E2E8F8';
                        (e.currentTarget as HTMLButtonElement).style.color = '#5A6B88';
                      }}
                    >
                      Back
                    </button>

                    <button
                      id="demo-step2-submit"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[12px] text-[15px] font-semibold text-white transition-all duration-150 group disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        background: '#2A6DF4',
                        boxShadow: '0 4px 16px rgba(42,109,244,0.30)',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) (e.currentTarget as HTMLButtonElement).style.background = '#1A5CE0';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = '#2A6DF4';
                      }}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Finalize Booking
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ═══ Step 3: Success ═══ */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-center py-8 space-y-5"
                >
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                    style={{ background: '#DCFCE7' }}
                  >
                    <CheckCircle2 className="w-11 h-11" style={{ color: '#16A34A' }} />
                  </div>
                  <div>
                    <h3 className="text-[22px] font-bold tracking-tight mb-2" style={{ color: '#0F1D3A' }}>
                      Booking Confirmed!
                    </h3>
                    <p className="text-[14px] leading-relaxed max-w-sm mx-auto" style={{ color: '#5A6B88' }}>
                      We've received your request. A confirmation has been sent to{' '}
                      <span className="font-semibold" style={{ color: '#0F1D3A' }}>{formData.email}</span>.{' '}
                      Our team will reach out shortly with the meeting link.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[12px] text-[14px] font-semibold text-white"
                    style={{ background: '#2A6DF4', boxShadow: '0 4px 16px rgba(42,109,244,0.30)' }}
                  >
                    Got it, Thanks!
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookDemoModal;
