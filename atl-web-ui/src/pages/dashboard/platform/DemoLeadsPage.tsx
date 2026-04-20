import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MoreVertical, Calendar, Mail, Phone, ExternalLink, CheckCircle2, XCircle, Clock, Loader2, Send, MessageSquare } from 'lucide-react';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';

const DemoLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [meetingLink, setMeetingLink] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ims-platform-service/api/v1/platform/admin/demo-requests');
      setLeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMeeting = async () => {
    if (!meetingLink) {
      toast.error('Please enter a meeting link');
      return;
    }
    
    if (!meetingLink.includes('meet.google.com/')) {
      toast.error('Only Google Meet links are authorized for this workflow.');
      return;
    }
    
    try {
      await api.patch(`/ims-platform-service/api/v1/platform/admin/demo-requests/${selectedLead.id}/confirm`, {
        meetingLink
      });
      toast.success('Meeting confirmed and protocol dispatched!');
      setIsConfirmModalOpen(false);
      setMeetingLink('');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to confirm meeting');
    }
  };

  const handleCompleteMeeting = async () => {
    if (!feedback.trim()) {
      toast.error('Mandatory feedback cluster required for completion.');
      return;
    }

    try {
      await api.patch(`/ims-platform-service/api/v1/platform/admin/demo-requests/${selectedLead.id}/status`, {
        status: 'COMPLETED',
        feedback
      });
      toast.success('Meeting node finalized successfully!');
      setIsFeedbackModalOpen(false);
      setFeedback('');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to finalize meeting');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SCHEDULED': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-gray-50/30">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-gray-900 italic uppercase">Lead <span className="text-primary italic">Intelligence</span></h1>
          <p className="text-gray-500 font-medium uppercase text-[11px] tracking-widest mt-1">Operational Pipeline for Demo Maturation & Conversion.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="QUERY LEADS..." 
              className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-[20px] text-[11px] font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-primary/5 w-72 shadow-sm uppercase"
            />
          </div>
          <button className="h-12 w-12 flex items-center justify-center bg-white border border-gray-100 rounded-[20px] hover:bg-gray-50 transition-all shadow-sm">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[50px] shadow-2xl shadow-gray-200/40 border border-gray-50 overflow-hidden relative group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
             <Send size={240} />
         </div>
        <table className="w-full text-left border-collapse relative z-10">
          <thead>
            <tr className="bg-gray-50/30 border-b border-gray-100/50">
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Requester Cluster</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Institution Identity</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Scheduled Telemetry</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Status Node</th>
              <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none">Operational Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-xs animate-pulse italic">Syncing Lead Universe...</p>
                  </div>
                </td>
              </tr>
            ) : leads.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 grayscale opacity-40">
                            <Clock size={64} className="text-gray-200" />
                            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No pending lead telemetry detected.</p>
                        </div>
                    </td>
                </tr>
            ) : leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-gray-50/80 transition-all duration-300 group/row">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/10 rounded-[22px] border border-primary/5 flex items-center justify-center font-black text-primary text-xl shadow-inner group-hover/row:rotate-6 transition-transform">
                      {lead.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-heading font-black text-gray-900 tracking-tight text-lg leading-tight mb-1">{lead.fullName}</p>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-primary/40" />
                        <span className="text-[11px] text-gray-500 font-black tracking-tight">{lead.email}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="space-y-2">
                    <p className="font-black text-gray-800 text-sm tracking-tight flex items-center gap-2 italic">
                      {lead.instituteName || 'UNIDENTIFIED ENTITY'}
                    </p>
                    <div className="inline-flex px-3 py-1 bg-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      EST: {lead.estimatedStudents || 'NA'} SCALE
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5 text-gray-900">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-black tracking-tight">{lead.preferredDate}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-400 ml-0.5">
                      <Clock className="w-4 h-4 text-gray-300" />
                      <span className="text-[11px] font-black tracking-widest">{lead.preferredTime} IST</span>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <span className={`px-5 py-2 rounded-[14px] text-[9px] font-black border uppercase tracking-[0.2em] shadow-sm ${getStatusColor(lead.status)}`}>
                    {lead.status === 'SCHEDULED' ? 'DISPATCHED' : lead.status}
                  </span>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-3">
                    {lead.status === 'PENDING' && (
                      <button 
                        onClick={() => { setSelectedLead(lead); setIsConfirmModalOpen(true); }}
                        className="h-11 px-5 bg-indigo-600 text-white rounded-[18px] hover:bg-indigo-700 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 group/btn"
                        title="Authorize & Dispatch Link"
                      >
                        <Send className="w-3.5 h-3.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        Authorize
                      </button>
                    )}
                    {lead.status === 'SCHEDULED' && (
                      <button 
                        onClick={() => { setSelectedLead(lead); setIsFeedbackModalOpen(true); }}
                        className="h-11 px-5 bg-emerald-600 text-white rounded-[18px] hover:bg-emerald-700 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 active:scale-95 group/btn"
                        title="Finalize Meeting Cycle"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Finalize
                      </button>
                    )}
                    <button className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-[18px] transition-all border border-transparent hover:border-rose-100">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal: Link Dispatch */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(false)}
              className="absolute inset-0 bg-indigo-950/40 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y : 0 }}
              exit={{ opacity: 0, scale : 0.95, y : 30 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] p-12 shadow-3xl border border-gray-100"
            >
              <h2 className="text-3xl font-display font-black tracking-tight text-gray-900 mb-3 italic">Authorize <span className="text-indigo-600">Meeting Node</span></h2>
              <p className="text-gray-400 font-medium text-[13px] leading-relaxed mb-10 max-w-[90%]">
                Initiating meeting dispatch for <span className="font-black text-gray-900">{selectedLead?.fullName}</span>. 
                Requester will receive verified Google Meet telemetry.
              </p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Verified Google Meet Link</label>
                  <div className="relative group">
                    <input 
                      type="url" 
                      placeholder="https://meet.google.com/xxx-xxxx-xxx" 
                      className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-[25px] outline-none transition-all font-black text-sm tracking-tight shadow-inner"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                    />
                    <ExternalLink className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsConfirmModalOpen(false)}
                    className="flex-1 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-gray-100"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={handleConfirmMeeting}
                    className="flex-[2] py-5 bg-indigo-600 text-white rounded-[25px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                  >
                    Confirm & Dispatch
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Completion Modal: Feedback Persistence */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackModalOpen(false)}
              className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y : 0 }}
              exit={{ opacity: 0, scale : 0.95, y : 30 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] p-12 shadow-3xl border border-gray-100"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-[22px] flex items-center justify-center text-emerald-600 mb-8 border border-emerald-100 shadow-inner">
                  <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-display font-black tracking-tight text-gray-900 mb-3 italic">Finalize <span className="text-emerald-600">Demo Cycle</span></h2>
              <p className="text-gray-400 font-medium text-[13px] leading-relaxed mb-10 max-w-[90%]">
                Persist meeting intelligence for <span className="font-black text-gray-900">{selectedLead?.fullName}</span>. 
                Feedback node is mandatory for conversion audit.
              </p>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Meeting Intelligence / Feedback</label>
                  <div className="relative group">
                    <textarea 
                      placeholder="ENTER OPERATIONAL FEEDBACK..." 
                      rows={4}
                      className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-transparent focus:border-emerald-600 focus:bg-white rounded-[25px] outline-none transition-all font-black text-sm tracking-tight shadow-inner resize-none uppercase"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                    <MessageSquare className="absolute left-5 top-6 w-5 h-5 text-gray-300 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsFeedbackModalOpen(false)}
                    className="flex-1 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all border border-gray-100"
                  >
                    Review Later
                  </button>
                  <button 
                    onClick={handleCompleteMeeting}
                    className="flex-[2] py-5 bg-emerald-600 text-white rounded-[25px] font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                  >
                    Commit Intelligence
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DemoLeadsPage;
