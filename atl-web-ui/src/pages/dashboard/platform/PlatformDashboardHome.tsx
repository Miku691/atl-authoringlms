import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, School, Calendar, ArrowUpRight, ArrowDownRight, MoreVertical, Search, Filter, MessageSquare, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';

const PlatformDashboardHome: React.FC = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingLeads: 0,
    scheduledLeads: 0,
    completedLeads: 0,
    totalInstitutes: 0,
    activeSubscribers: 0
  });
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      // Use the centralized api utility to ensure Authorization header is injected
      const response = await api.get('/ims-platform-service/api/v1/platform/admin/demo-requests');
      const leads = response.data;
      
      setRecentLeads(leads.slice(0, 5));
      setStats({
        totalLeads: leads.length,
        pendingLeads: leads.filter((l: any) => l.status === 'PENDING').length,
        scheduledLeads: leads.filter((l: any) => l.status === 'SCHEDULED').length,
        completedLeads: leads.filter((l: any) => l.status === 'COMPLETED').length,
        totalInstitutes: 24, // Mock
        activeSubscribers: 18 // Mock
      });
    } catch (error) {
      console.error('Error fetching platform data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: MessageSquare, color: 'indigo', trend: '+12%', isUp: true },
    { label: 'Pending Demos', value: stats.pendingLeads, icon: Calendar, color: 'amber', trend: '+5%', isUp: true },
    { label: 'Institutions', value: stats.totalInstitutes, icon: School, color: 'cyan', trend: '+2', isUp: true },
    { label: 'Conversions', value: `${((stats.completedLeads / (stats.totalLeads || 1)) * 100).toFixed(0)}%`, icon: CheckCircle2, color: 'emerald', trend: '+3%', isUp: true },
  ];

  return (
    <div className="space-y-8 p-6 lg:p-10 bg-chrome/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black tracking-tight text-content-primary italic">Platform <span className="text-primary">Command Center</span></h1>
          <p className="text-content-secondary font-medium">Welcome back, Super Admin. Here's what's happening across the ecosystem.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-surface border border-border rounded-xl font-bold text-sm text-content-secondary hover:bg-chrome transition-all shadow-sm">
            Export Reports
          </button>
          <button className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-surface p-6 rounded-[32px] shadow-sm border border-border relative overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
          >
            <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-500`}>
              <card.icon className={`w-6 h-6 text-${card.color}-600`} />
            </div>
            <div>
              <p className="text-sm font-bold text-content-muted uppercase tracking-wider mb-1">{card.label}</p>
              <div className="flex items-end gap-3">
                <h3 className="text-3xl font-display font-black tracking-tight text-content-primary">{card.value}</h3>
                <span className={`flex items-center text-xs font-black ${card.isUp ? 'text-emerald-500' : 'text-rose-500'} mb-1`}>
                  {card.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                  {card.trend}
                </span>
              </div>
            </div>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.color}-500/5 rounded-full -mr-8 -mt-8`} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Demo Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-display font-black tracking-tight text-content-primary">Recent Demo Requests</h3>
            <button className="text-sm font-bold text-primary hover:underline">View All Leads</button>
          </div>
          
          <div className="bg-surface rounded-[40px] shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-chrome/50 border-b border-border">
                    <th className="px-8 py-5 text-xs font-black text-content-muted uppercase tracking-widest">Requester</th>
                    <th className="px-8 py-5 text-xs font-black text-content-muted uppercase tracking-widest">Institute</th>
                    <th className="px-8 py-5 text-xs font-black text-content-muted uppercase tracking-widest">Preferred Timing</th>
                    <th className="px-8 py-5 text-xs font-black text-content-muted uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-chrome/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                            {lead.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-content-primary">{lead.fullName}</p>
                            <p className="text-xs text-content-secondary">{lead.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-content-primary">{lead.instituteName || '—'}</p>
                        <p className="text-xs text-content-secondary italic">{lead.estimatedStudents} students (est.)</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="font-bold text-content-primary text-sm">{lead.preferredDate}</p>
                        <p className="text-xs text-primary font-bold">{lead.preferredTime}</p>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          lead.status === 'PENDING' ? 'bg-amber-50 text-amber-600' :
                          lead.status === 'SCHEDULED' ? 'bg-indigo-50 text-indigo-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentLeads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-content-muted font-bold italic">
                        No recent demo requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* System Activity & Trends */}
        <div className="space-y-4">
          <h3 className="text-xl font-display font-black tracking-tight text-content-primary px-2">System Health</h3>
          <div className="bg-surface p-8 rounded-[40px] shadow-sm border border-border space-y-8">
            <div className="space-y-6">
              {[
                { label: 'Auth Service', status: 'Online', load: '12%' },
                { label: 'Academic Service', status: 'Online', load: '45%' },
                { label: 'Finance Service', status: 'Online', load: '28%' },
                { label: 'Notification Service', status: 'Queueing', load: '88%' },
              ].map((svc) => (
                <div key={svc.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${svc.status === 'Online' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    <span className="text-sm font-bold text-content-primary">{svc.label}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-1.5 bg-chrome rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: svc.load }} />
                    </div>
                    <span className="text-[10px] font-black text-content-muted w-8">{svc.load}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6 border-t border-border">
              <div className="bg-gray-900 rounded-3xl p-6 text-white text-center">
                <p className="text-content-muted text-xs font-black uppercase tracking-widest mb-2">Total System Uptime</p>
                <h4 className="text-2xl font-display font-bold">99.98%</h4>
                <div className="mt-4 flex gap-1 h-8 items-end justify-center">
                  {[4, 6, 5, 8, 9, 8, 10, 9, 10, 10].map((h, i) => (
                    <div key={i} className="w-1 bg-primary/40 rounded-t-sm" style={{ height: `${h * 10}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDashboardHome;
