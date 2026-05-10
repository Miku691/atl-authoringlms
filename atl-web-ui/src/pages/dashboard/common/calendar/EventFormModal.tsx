import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { CalendarEvent, CalendarEventRequest } from '../../../../api/calendarService';
import { calendarService, EVENT_TYPE_CONFIG } from '../../../../api/calendarService';
import FloatingLabelInput from '../../../../components/common/FloatingLabelInput';

interface EventFormModalProps {
  isOpen: boolean;
  tenantId: string;
  editingEvent?: CalendarEvent | null;
  /** If true the user can only create MEETING type events */
  meetingOnly: boolean;
  defaultDate?: Date;
  onClose: () => void;
  onSaved: () => void;
}

type EventType = 'HOLIDAY' | 'EVENT' | 'MEETING';

const COLORS = [
  '#F59E0B', '#EF4444', '#10B981', '#6366F1',
  '#4F46E5', '#EC4899', '#8B5CF6', '#14B8A6',
];

const AUDIENCE_OPTIONS = [
  { value: 'ALL',     label: 'Everyone' },
  { value: 'STUDENT', label: 'Students Only' },
  { value: 'TEACHER', label: 'Teachers Only' },
  { value: 'ADMIN',   label: 'Admin Only' },
];

const toDateTimeLocal = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toIso = (local: string) => new Date(local).toISOString().replace('Z', '');

/**
 * Modal form for creating or editing an institute calendar event.
 * Admins can pick any allowed type; instructors are limited to MEETING.
 */
const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen, tenantId, editingEvent, meetingOnly, defaultDate, onClose, onSaved,
}) => {
  const isEdit = !!editingEvent;

  const defaultStart = defaultDate ?? new Date();
  const defaultEnd   = new Date(defaultStart.getTime() + 60 * 60 * 1000);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    type: EventType;
    targetAudience: string;
    fullDay: boolean;
    color: string;
    location: string;
  }>({
    title: '',
    description: '',
    startDate: toDateTimeLocal(defaultStart),
    endDate: toDateTimeLocal(defaultEnd),
    type: meetingOnly ? 'MEETING' : 'EVENT',
    targetAudience: 'ALL',
    fullDay: false,
    color: '#10B981',
    location: '',
  });

  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title,
        description: editingEvent.description || '',
        startDate: toDateTimeLocal(new Date(editingEvent.start)),
        endDate: toDateTimeLocal(new Date(editingEvent.end)),
        type: (editingEvent.type as EventType) || 'EVENT',
        targetAudience: editingEvent.targetAudience || 'ALL',
        fullDay: editingEvent.allDay,
        color: editingEvent.color || '#10B981',
        location: editingEvent.location || '',
      });
    } else {
      setForm(prev => ({
        ...prev,
        title: '',
        description: '',
        startDate: toDateTimeLocal(defaultDate ?? new Date()),
        endDate: toDateTimeLocal(defaultEnd),
        type: meetingOnly ? 'MEETING' : 'EVENT',
        color: '#10B981',
        location: '',
        targetAudience: 'ALL',
        fullDay: false,
      }));
    }
  }, [editingEvent, isOpen]);

  const allowedTypes: EventType[] = meetingOnly
    ? ['MEETING']
    : ['HOLIDAY', 'EVENT', 'MEETING'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    const payload: CalendarEventRequest = {
      title: form.title.trim(),
      description: form.description,
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
      type: form.type,
      targetAudience: form.targetAudience,
      fullDay: form.fullDay,
      color: form.color,
      location: form.location,
    };

    setSaving(true);
    try {
      if (isEdit && editingEvent?.sourceId) {
        await calendarService.updateEvent(tenantId, editingEvent.sourceId, payload);
        toast.success('Event updated');
      } else {
        await calendarService.createEvent(tenantId, payload);
        toast.success('Event created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 400 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-surface border border-border rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-subtle rounded-xl">
                    <CalendarDays className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-content-primary">
                      {isEdit ? 'Edit Event' : meetingOnly ? 'Schedule Meeting' : 'Add Event'}
                    </h2>
                    <p className="text-[10px] text-content-muted font-semibold uppercase tracking-widest">
                      Institute Calendar
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-chrome transition-colors text-content-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                {/* Title */}
                <FloatingLabelInput
                  label="Event Title *"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  required
                />

                {/* Type + Audience row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-content-muted pl-1">
                      Event Type
                    </label>
                    <select
                      value={form.type}
                      onChange={e => {
                        const t = e.target.value as EventType;
                        set('type', t);
                        set('color', EVENT_TYPE_CONFIG[t as keyof typeof EVENT_TYPE_CONFIG]?.color || '#10B981');
                      }}
                      disabled={meetingOnly}
                      className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold border outline-none"
                      style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    >
                      {allowedTypes.map(t => (
                        <option key={t} value={t}>{EVENT_TYPE_CONFIG[t as keyof typeof EVENT_TYPE_CONFIG]?.label || t}</option>
                      ))}
                    </select>
                  </div>
                  {!meetingOnly && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-content-muted pl-1">
                        Visible To
                      </label>
                      <select
                        value={form.targetAudience}
                        onChange={e => set('targetAudience', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold border outline-none"
                        style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      >
                        {AUDIENCE_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Date range */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'startDate', label: 'Start Date & Time' },
                    { key: 'endDate',   label: 'End Date & Time' },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-content-muted pl-1">
                        {label}
                      </label>
                      <input
                        type={form.fullDay ? 'date' : 'datetime-local'}
                        value={form.fullDay ? form[key as 'startDate'].slice(0, 10) : form[key as 'startDate']}
                        onChange={e => set(key, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm font-semibold border outline-none"
                        style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  ))}
                </div>

                {/* All day toggle */}
                <div className="flex items-center gap-3 p-3 bg-chrome rounded-xl">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.fullDay}
                      onChange={e => set('fullDay', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-border peer-checked:bg-indigo-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                  <span className="text-xs font-bold text-content-primary">All Day Event</span>
                </div>

                {/* Location */}
                <FloatingLabelInput
                  label="Location (optional)"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                />

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-content-muted pl-1">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    placeholder="Event description or notes..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border outline-none resize-none min-h-[80px]"
                    style={{ background: 'var(--bg-surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Colour picker */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-content-muted pl-1">
                    Event Colour
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => set('color', c)}
                        className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={form.color}
                      onChange={e => set('color', e.target.value)}
                      className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                      title="Custom colour"
                    />
                  </div>
                </div>

                {/* Preview chip */}
                <div className="flex items-center gap-2 p-3 rounded-xl" style={{ backgroundColor: form.color + '15' }}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: form.color }} />
                  <span className="text-xs font-bold truncate" style={{ color: form.color }}>
                    {form.title || 'Event preview'}
                  </span>
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl text-xs font-black text-content-secondary bg-chrome hover:bg-border transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-60"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isEdit ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventFormModal;
