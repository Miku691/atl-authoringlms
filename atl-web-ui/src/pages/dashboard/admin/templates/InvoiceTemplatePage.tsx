import React, { useState, useEffect } from 'react';
import { Save, RefreshCcw, Layout, Image as ImageIcon, Palette, Type, CheckCircle2, ChevronRight, HelpCircle, Eye, X, Info, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { reportsService } from '../../../../api/reportsService';
import InvoicePreview, { type InvoiceConfig } from '../../../../components/admin/templates/InvoicePreview.tsx';
import Modal from '../../../../components/common/Modal';

const DEFAULT_CONFIG: InvoiceConfig = {
  institutionName: 'Your Institute Name',
  address: '123 Academic Street, Education City, 56789',
  contact: '+1 234 567 8900',
  email: 'info@institute.com',
  website: 'www.institute.com',
  logoUrl: '',
  primaryColor: '#4f46e5', // Indigo 600
  accentColor: '#f3f4f6', // Gray 100
  fontFamily: 'Inter',
  showLogo: true,
  showStudentPhoto: false,
  showBalanceDue: true,
  showPreviousDues: true,
  receiptPrefix: 'RCPT-',
  footerNote: 'This is a computer-generated receipt.',
  termsAndConditions: '1. Fees once paid are not refundable.\n2. Please keep this receipt for future reference.'
};

const InvoiceTemplatePage: React.FC = () => {
  const [config, setConfig] = useState<InvoiceConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullPreviewOpen, setIsFullPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'LAYOUT' | 'CONTENT'>('BRANDING');

  useEffect(() => {
    const initPage = async () => {
      try {
        // Now calling only reports service. 
        // Backend (Feign) will populate defaults from auth-service if no template exists.
        const response = await reportsService.getTemplate('INVOICE');
        
        if (response && response.config) {
          setConfig(JSON.parse(response.config));
        }
      } catch (error) {
        console.error('Failed to initialize template page', error);
      }
    };
    initPage();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await reportsService.saveTemplate('INVOICE', JSON.stringify(config));
      toast.success('Template saved successfully!');
    } catch (error) {
      toast.error('Failed to save template. Please try again.');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default settings?')) {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const updateConfig = (key: keyof InvoiceConfig, value: any) => {
    setConfig((prev: InvoiceConfig) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-chrome rounded-2xl overflow-hidden shadow-sm border border-border">

      {/* Header */}
      <div className="bg-surface px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-content-primary tracking-tight">Invoice Template</h1>
            <p className="text-xs text-content-secondary">Customize the appearance of your fee receipts</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-content-secondary hover:text-red-600 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" /> Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-indigo-700 transition-all ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
          >
            {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Left Side: Controls */}
        <div className="w-1/3 min-w-[380px] bg-surface border-r border-border flex flex-col">

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(['BRANDING', 'LAYOUT', 'CONTENT'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${activeTab === tab
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
                    : 'border-transparent text-content-muted hover:text-content-secondary hover:bg-chrome'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

            {activeTab === 'BRANDING' && (
              <div className="space-y-6 animate-fade-in-up">
                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    <ImageIcon className="w-4 h-4 text-indigo-500" /> Institution Identity
                  </label>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Institution Name</span>
                      <input
                        type="text"
                        value={config.institutionName}
                        onChange={(e) => updateConfig('institutionName', e.target.value)}
                        className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Logo URL</span>
                      <input
                        type="text"
                        value={config.logoUrl}
                        onChange={(e) => updateConfig('logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-chrome rounded-xl border border-border">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-content-primary">Show Logo on Receipt</span>
                        <span className="text-[10px] text-content-secondary">Toggle visibility of the institution logo</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.showLogo}
                          onChange={(e) => updateConfig('showLogo', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-chrome peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </section>

                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    Contact Information
                  </label>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Address</span>
                      <textarea
                        rows={2}
                        value={config.address}
                        onChange={(e) => updateConfig('address', e.target.value)}
                        className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none resize-none"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Contact Number</span>
                      <input
                        type="text"
                        value={config.contact}
                        onChange={(e) => updateConfig('contact', e.target.value)}
                        className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Email</span>
                        <input
                          type="text"
                          value={config.email}
                          onChange={(e) => updateConfig('email', e.target.value)}
                          className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Website</span>
                        <input
                          type="text"
                          value={config.website}
                          onChange={(e) => updateConfig('website', e.target.value)}
                          className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'LAYOUT' && (
              <div className="space-y-6 animate-fade-in-up">
                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    <Palette className="w-4 h-4 text-indigo-500" /> Branding Colors
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-chrome rounded-xl border border-border">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-content-primary">Primary Color</span>
                        <span className="text-[10px] text-content-secondary">Headers, borders, and accents</span>
                      </div>
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => updateConfig('primaryColor', e.target.value)}
                        className="w-10 h-10 border-0 bg-transparent cursor-pointer rounded-lg overflow-hidden"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    <Type className="w-4 h-4 text-indigo-500" /> Typography
                  </label>
                  <div>
                    <select
                      value={config.fontFamily}
                      onChange={(e) => updateConfig('fontFamily', e.target.value)}
                      className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none appearance-none"
                    >
                      <option value="Inter">Inter (Modern Sans)</option>
                      <option value="'Outfit', sans-serif">Outfit (Premium Sans)</option>
                      <option value="'Roboto', sans-serif">Roboto (Clean)</option>
                      <option value="Georgia">Georgia (Classic Serif)</option>
                    </select>
                  </div>
                </section>

                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500" /> Section Visibility
                  </label>
                  <div className="space-y-3">
                    {[
                      { id: 'showStudentPhoto', label: 'Show Student Photo' },
                      { id: 'showBalanceDue', label: 'Show Balance Summary' },
                      { id: 'showPreviousDues', label: 'Include Arrears/Previous Dues' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-chrome rounded-xl border border-border">
                        <span className="text-xs font-medium text-content-primary">{item.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!(config as any)[item.id]}
                            onChange={(e) => updateConfig(item.id as keyof InvoiceConfig, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-chrome peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'CONTENT' && (
              <div className="space-y-6 animate-fade-in-up">
                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    Receipt Formatting
                  </label>
                  <div>
                    <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Receipt Number Prefix</span>
                    <input
                      type="text"
                      value={config.receiptPrefix}
                      onChange={(e) => updateConfig('receiptPrefix', e.target.value)}
                      placeholder="RCPT-"
                      className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                    />
                  </div>
                </section>

                <section>
                  <label className="flex items-center gap-2 text-sm font-semibold text-content-primary mb-4">
                    Footer & Terms
                  </label>
                  <div className="space-y-4">
                    <div>
                      <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Custom Footer Note</span>
                      <input
                        type="text"
                        value={config.footerNote}
                        onChange={(e) => updateConfig('footerNote', e.target.value)}
                        className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-medium text-content-secondary mb-1.5 uppercase">Terms & Conditions</span>
                      <textarea
                        rows={4}
                        value={config.termsAndConditions}
                        onChange={(e) => updateConfig('termsAndConditions', e.target.value)}
                        className="w-full px-3 py-2 bg-chrome border border-border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-surface transition-all outline-none resize-none"
                      />
                    </div>
                  </div>
                </section>
              </div>
            )}

          </div>

          {/* Tips Section */}
          <div className="p-6 bg-indigo-50/50 border-t border-indigo-100/50">
            <div className="flex gap-3">
              <HelpCircle className="w-5 h-5 text-indigo-500 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-indigo-900">Design Tip</p>
                <p className="text-[10px] text-indigo-700 mt-0.5 leading-relaxed">
                  Use high-quality transparent PNG logos for the best appearance. Most premium institutes use subtle accent colors to keep the receipt looking minimal and professional.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Preview */}
        <div className="flex-1 bg-chrome p-8 overflow-y-auto flex flex-col items-center custom-scrollbar">
          <div className="w-full max-w-4xl flex flex-col items-center">

            {/* Action Bar for Preview */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-content-secondary uppercase tracking-widest">
                  <ChevronRight className="w-3 h-3" /> Live Receipt Preview
                </div>
                <button 
                  onClick={() => setIsFullPreviewOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-surface text-[10px] font-bold text-indigo-600 rounded shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-colors uppercase tracking-wider"
                >
                  <Eye className="w-3 h-3" /> View Full Preview
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[9px] text-content-muted font-bold bg-surface/50 px-2 py-1 rounded">
                   <Info className="w-3 h-3" /> A4 SCALE
                </div>
              </div>
            </div>

            {/* The Actual Previewer */}
            <div className="shadow-2xl hover:shadow-indigo-500/10 transition-shadow">
               <InvoicePreview config={config} />
            </div>

            <p className="mt-6 text-[10px] text-content-secondary flex items-center gap-2 leading-relaxed max-w-md text-center">
              Note: The preview above uses dummy sample data for visualization purposes. 
              The layout adapts dynamically based on your branding colors and toggles.
            </p>
          </div>
        </div>

      </div>

      {/* Full Preview Modal */}
      <Modal
        isOpen={isFullPreviewOpen}
        onClose={() => setIsFullPreviewOpen(false)}
        size="xl"
        showHeader={false}
        cardClassName="!p-0 !bg-transparent !shadow-none"
      >
        <div className="relative">
          <div className="absolute -top-12 right-0 flex items-center gap-4">
            <div className="bg-surface/10 px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2">
              <FileText className="w-4 h-4" /> Final A4 Appearance
            </div>
            <button
              onClick={() => setIsFullPreviewOpen(false)}
              className="p-2 bg-surface/10 hover:bg-surface/20 text-white rounded-full transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="w-full flex justify-center mt-8">
            <div className="scale-100 origin-top shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <InvoicePreview config={config} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceTemplatePage;
