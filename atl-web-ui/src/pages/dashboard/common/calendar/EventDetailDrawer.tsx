import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { X, MapPin, Users, Edit2, Trash2, CalendarDays, Tag } from 'lucide-react';
import type { CalendarEvent } from '../../../../api/calendarService';
import { EVENT_TYPE_CONFIG } from '../../../../api/calendarService';

interface EventDetailDrawerProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

/**
 * Slide-in right drawer that shows full event details on click.
 */
const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event, isOpen, canEdit, canDelete, onClose, onEdit, onDelete,
}) => {
  const config = event ? EVENT_TYPE_CONFIG[event.type as keyof typeof EVENT_TYPE_CONFIG] : null;

  return (
    <AnimatePresence>
      {isOpen && event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed right-0 top-0 h-full w-[380px] max-w-full bg-surface border-l border-border shadow-2xl z-50 flex flex-col"
          >
            {/* Colour accent top bar */}
            <div className="h-1 w-full shrink-0" style={{ backgroundColor: event.color }} />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black"
                  style={{ backgroundColor: event.color }}
                >
                  {event.type[0]}
                </div>
                <div>
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: event.color }}
                  >
                    {config?.label || event.type}
                  </span>
                  <p className="text-[10px] text-content-muted font-medium">Event Details</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-chrome transition-colors text-content-muted hover:text-content-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-xl font-black text-content-primary leading-tight">{event.title}</h2>
                {event.description && (
                  <p className="text-sm text-content-secondary font-medium mt-2 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>

              {/* Details list */}
              <div className="space-y-4">
                {/* Date & time */}
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-chrome rounded-lg mt-0.5 shrink-0">
                    <CalendarDays className="w-4 h-4 text-content-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-content-primary">
                      {format(parseISO(event.start), 'EEEE, MMMM do yyyy')}
                    </p>
                    {!event.allDay ? (
                      <p className="text-xs text-content-muted font-medium mt-0.5">
                        {format(parseISO(event.start), 'h:mm a')} – {format(parseISO(event.end), 'h:mm a')}
                      </p>
                    ) : (
                      <p className="text-xs text-content-muted font-medium mt-0.5">All day</p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-chrome rounded-lg shrink-0">
                      <MapPin className="w-4 h-4 text-content-muted" />
                    </div>
                    <p className="text-xs font-semibold text-content-secondary">{event.location}</p>
                  </div>
                )}

                {/* Audience */}
                {event.targetAudience && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-chrome rounded-lg shrink-0">
                      <Users className="w-4 h-4 text-content-muted" />
                    </div>
                    <div>
                      <p className="text-[10px] text-content-muted font-bold uppercase tracking-wider">Audience</p>
                      <p className="text-xs font-semibold text-content-secondary capitalize">
                        {event.targetAudience === 'ALL' ? 'Everyone' : event.targetAudience.toLowerCase()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Type badge */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chrome rounded-lg shrink-0">
                    <Tag className="w-4 h-4 text-content-muted" />
                  </div>
                  <span
                    className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest"
                    style={{ backgroundColor: event.color + '20', color: event.color }}
                  >
                    {config?.label || event.type}
                  </span>
                </div>
              </div>

              {/* Subject / Offering info for CLASS events */}
              {event.type === 'CLASS' && (event.subjectId || event.offeringId) && (
                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                  <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-1">
                    Class Information
                  </p>
                  {event.offeringId && (
                    <p className="text-xs text-content-secondary font-medium">
                      Offering: <span className="font-bold text-content-primary">{event.offeringId}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer actions (only for editable events) */}
            {(canEdit || canDelete) && event.sourceId && (
              <div className="px-6 py-5 border-t border-border flex gap-3 shrink-0">
                {canEdit && (
                  <button
                    onClick={() => onEdit(event)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-chrome hover:bg-border rounded-xl text-xs font-black text-content-primary transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit Event
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(event)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-xs font-black text-rose-600 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EventDetailDrawer;
