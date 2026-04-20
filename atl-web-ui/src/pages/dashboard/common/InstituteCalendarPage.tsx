import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  GraduationCap,
  CalendarCheck,
  Megaphone
} from 'lucide-react';
import type { RootState } from '../../../store/store';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: String;
  title: string;
  description: string;
  start: string;
  end: string;
  type: 'HOLIDAY' | 'CLASS' | 'EXAM' | 'EVENT' | 'MEETING';
  color: string;
  location: string;
  allDay: boolean;
  metadata?: any;
}

const InstituteCalendarPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewFilter, setViewFilter] = useState<string[]>(['HOLIDAY', 'CLASS', 'EXAM', 'EVENT', 'MEETING']);

  // Role check
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, user]);

  const fetchEvents = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const start = format(startOfWeek(startOfMonth(currentMonth)), 'yyyy-MM-dd');
      const end = format(endOfWeek(endOfMonth(currentMonth)), 'yyyy-MM-dd');
      
      const response = await api.get('/ims-academic-service/calendar/summary', {
        params: {
          tenantId: user.tenantId,
          startDate: start,
          endDate: end,
          personId: user.id, // Assuming user.id is the personId (student/instructor id)
          role: user.roles?.[0]
        }
      });
      
      if (response.data.status === 'SUCCESS') {
        setEvents(response.data.apiData);
      }
    } catch (error) {
      console.error('Failed to fetch calendar events', error);
      toast.error('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  const toggleFilter = (type: string) => {
    setViewFilter(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Filtered Events Mapping
  const filteredEvents = useMemo(() => {
    return events.filter(e => viewFilter.includes(e.type));
  }, [events, viewFilter]);

  const getEventsForDay = (day: Date) => {
    return filteredEvents.filter(event => isSameDay(parseISO(event.start), day));
  };

  const selectedDayEvents = useMemo(() => {
    return getEventsForDay(selectedDate).sort((a, b) => a.start.localeCompare(b.start));
  }, [selectedDate, filteredEvents]);

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50/50 p-6 space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h1>
            <p className="text-sm text-gray-500">Institute Academic & Operations Calendar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-sm font-semibold text-gray-700">
              Today
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {isAdmin && (
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Main Calendar Grid */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden flex flex-col">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/80">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 tracking-widest uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 flex-1 overflow-y-auto">
            {days.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentToday = isToday(day);

              return (
                <div 
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[120px] p-2 border-r border-b border-gray-50 transition-all cursor-pointer group hover:bg-indigo-50/20
                    ${!isCurrentMonth ? 'bg-gray-50/40 opacity-40' : 'bg-white'}
                    ${isSelected ? 'ring-2 ring-inset ring-indigo-500 bg-indigo-50/30' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold transition-all
                      ${isCurrentToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-700'}
                      ${isSelected && !isCurrentToday ? 'bg-indigo-100 text-indigo-700' : ''}
                      group-hover:scale-110
                    `}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  {/* Event Dots/Mini Labels */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eIdx) => (
                      <div 
                        key={eIdx}
                        className="px-2 py-1 rounded-md text-[10px] font-bold truncate transition-all hover:brightness-95"
                        style={{ backgroundColor: event.color + '15', color: event.color, borderLeft: `2.5px solid ${event.color}` }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-gray-400 font-bold pl-1">
                        + {dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Selected Day Details & Filters */}
        <div className="w-96 flex flex-col gap-6 h-full">
          {/* Filters */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-gray-900">
              <Filter className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold">Layer Filters</h3>
            </div>
            <div className="space-y-2">
              {[
                { type: 'HOLIDAY', label: 'Holidays', icon: <Megaphone className="w-3.5 h-3.5" />, color: '#F59E0B' },
                { type: 'CLASS', label: 'My Classes', icon: <GraduationCap className="w-3.5 h-3.5" />, color: '#4F46E5' },
                { type: 'EXAM', label: 'Exams', icon: <CalendarCheck className="w-3.5 h-3.5" />, color: '#EF4444' },
                { type: 'EVENT', label: 'Institute Events', icon: <Megaphone className="w-3.5 h-3.5" />, color: '#10B981' },
                { type: 'MEETING', label: 'Meetings', icon: <Clock className="w-3.5 h-3.5" />, color: '#6366F1' }
              ].map(f => (
                <button
                  key={f.type}
                  onClick={() => toggleFilter(f.type)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all
                    ${viewFilter.includes(f.type) 
                      ? 'border-transparent text-white shadow-sm' 
                      : 'border-gray-100 text-gray-500 grayscale opacity-60'}
                  `}
                  style={{ backgroundColor: viewFilter.includes(f.type) ? f.color : 'transparent' }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md ${viewFilter.includes(f.type) ? 'bg-white/20' : 'bg-gray-100'}`}>
                      {f.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide">{f.label}</span>
                  </div>
                  {viewFilter.includes(f.type) && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="flex-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{format(selectedDate, 'EEEE')}</h3>
                <p className="text-sm text-gray-500">{format(selectedDate, 'do MMMM')}</p>
              </div>
              <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase">
                {selectedDayEvents.length} Tasks
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scroll-smooth">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center opacity-40">
                  <CalendarIcon className="w-10 h-10 mb-2" />
                  <p className="text-xs font-medium">No events for this day</p>
                </div>
              ) : (
                selectedDayEvents.map((event, idx) => (
                  <div key={idx} className="group relative pl-4 border-l-4 rounded-r-xl p-3 bg-gray-50/50 hover:bg-indigo-50/30 transition-all border-l-indigo-500" style={{ borderLeftColor: event.color }}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-gray-100 shadow-sm uppercase tracking-wide" style={{ color: event.color }}>
                        {event.type}
                      </span>
                      {!event.allDay && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(event.start), 'hh:mm a')}
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 mb-1 leading-tight">{event.title}</h4>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {event.location}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteCalendarPage;
