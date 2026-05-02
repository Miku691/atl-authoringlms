import React from 'react';
import { User, Receipt, Calendar, CreditCard, CheckCircle, Smartphone, Mail, Globe, MapPin } from 'lucide-react';

export interface InvoiceConfig {
  institutionName: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  showLogo: boolean;
  showStudentPhoto: boolean;
  showBalanceDue: boolean;
  showPreviousDues: boolean;
  receiptPrefix: string;
  footerNote: string;
  termsAndConditions: string;
}

interface InvoicePreviewProps {
  config: InvoiceConfig;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ config }) => {
  // Sample Data for Preview
  const sampleStudent = {
    name: 'Mukulakar Soni',
    id: 'STU-2024-001',
    class: 'XII - Science (Section A)',
    parent: 'Rajesh Soni',
    session: '2024-25',
    receiptNo: `${config.receiptPrefix}100234`,
    date: new Date().toLocaleDateString('en-GB'),
  };

  const sampleFees = [
    { head: 'Tuition Fee (Quarter 1)', amount: 15000 },
    { head: 'Library Maintenance Fee', amount: 500 },
    { head: 'Laboratory Fee (Physics)', amount: 1200 },
    { head: 'Late Fee Fine', amount: 100 },
  ];

  const subTotal = sampleFees.reduce((acc, curr) => acc + curr.amount, 0);
  const discount = 500;
  const netTotal = subTotal - discount;
  const previousBalance = config.showPreviousDues ? 2500 : 0;
  const totalDue = netTotal + previousBalance;

  const primaryStyle = { color: config.primaryColor };
  const primaryBgStyle = { backgroundColor: config.primaryColor };
  const primaryBorderStyle = { borderColor: config.primaryColor };

  return (
    <div 
      className="bg-surface shadow-2xl rounded-sm p-12 mx-auto w-full max-w-[210mm] min-h-[297mm] transition-all duration-300 transform scale-[0.95] origin-top"
      style={{ fontFamily: config.fontFamily }}
    >
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-start border-b-2 pb-8 mb-8" style={primaryBorderStyle}>
        
        {/* Left Side: Institution Details */}
        <div className="flex gap-6 max-w-2/3">
          {config.showLogo && (
            <div className="w-24 h-24 bg-chrome rounded-xl overflow-hidden flex items-center justify-center border border-border flex-shrink-0">
               {config.logoUrl ? (
                 <img src={config.logoUrl} alt="logo" className="w-full h-full object-contain" />
               ) : (
                 <div className="text-gray-300 font-bold text-center p-2 text-xs">NO LOGO</div>
               )}
            </div>
          )}
          <div className="flex flex-col justify-center">
             <h1 className="text-3xl font-black uppercase tracking-tight leading-none mb-2" style={primaryStyle}>
                {config.institutionName}
             </h1>
             <div className="space-y-1">
                <p className="flex items-start gap-2 text-xs text-content-secondary">
                   <MapPin className="w-3 h-3 mt-0.5" style={primaryStyle} /> {config.address}
                </p>
                <div className="flex gap-4">
                   <p className="flex items-center gap-1.5 text-xs text-content-secondary">
                      <Smartphone className="w-3 h-3" style={primaryStyle} /> {config.contact}
                   </p>
                   <p className="flex items-center gap-1.5 text-xs text-content-secondary">
                      <Mail className="w-3 h-3" style={primaryStyle} /> {config.email}
                   </p>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-content-secondary">
                   <Globe className="w-3 h-3" style={primaryStyle} /> {config.website}
                </p>
             </div>
          </div>
        </div>

        {/* Right Side: Receipt Identifier */}
        <div className="text-right">
           <div 
             className="inline-block px-4 py-2 rounded-lg mb-4 text-white text-sm font-black uppercase tracking-widest"
             style={primaryBgStyle}
           >
              Fee Receipt
           </div>
           <div className="space-y-0.5">
              <p className="text-[10px] text-content-muted font-bold uppercase">Academic Session</p>
              <p className="text-sm font-bold text-content-primary">{sampleStudent.session}</p>
           </div>
        </div>
      </div>

      {/* 2. Metadata Grid */}
      <div className="grid grid-cols-2 gap-12 mb-10">
         
         {/* Receipt Context */}
         <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
               <span className="text-[10px] text-content-muted font-black uppercase flex items-center gap-2">
                  <Receipt className="w-3 h-3" /> Receipt Number
               </span>
               <span className="text-sm font-bold text-content-primary">{sampleStudent.receiptNo}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
               <span className="text-[10px] text-content-muted font-black uppercase flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Payment Date
               </span>
               <span className="text-sm font-bold text-content-primary">{sampleStudent.date}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
               <span className="text-[10px] text-content-muted font-black uppercase flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Payment Mode
               </span>
               <span className="text-sm font-bold text-content-primary">ONLINE (UPI Transfer)</span>
            </div>
         </div>

         {/* Student Details */}
         <div className="p-4 bg-chrome rounded-2xl border border-border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 opacity-5 pointer-events-none" style={primaryStyle}>
               <User className="w-full h-full" />
            </div>
            
            <div className="flex gap-4">
               {config.showStudentPhoto && (
                  <div className="w-16 h-16 bg-surface rounded-xl border border-border flex items-center justify-center flex-shrink-0">
                     <User className="w-8 h-8 text-gray-200" />
                  </div>
               )}
               <div className="flex-1">
                  <p className="text-[10px] text-content-muted font-black uppercase mb-1">Student Details</p>
                  <h3 className="text-lg font-black text-content-primary leading-none mb-1">{sampleStudent.name}</h3>
                  <p className="text-xs text-content-secondary font-medium">ID: {sampleStudent.id}</p>
                  <p className="text-xs font-bold mt-2" style={primaryStyle}>{sampleStudent.class}</p>
               </div>
            </div>
         </div>
      </div>

      {/* 3. Fee Breakdown Table */}
      <div className="mb-10">
         <table className="w-full border-collapse">
            <thead>
               <tr className="text-white uppercase tracking-widest text-[10px] font-black" style={primaryBgStyle}>
                  <th className="px-6 py-3 text-left rounded-l-xl">Sl No.</th>
                  <th className="px-6 py-3 text-left">Fee Particulars</th>
                  <th className="px-6 py-3 text-right rounded-r-xl">Amount (₹)</th>
               </tr>
            </thead>
            <tbody>
               {sampleFees.map((fee, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-chrome/50 transition-colors">
                     <td className="px-6 py-4 text-xs text-content-muted font-bold">{idx + 1}</td>
                     <td className="px-6 py-4 text-sm text-content-primary font-medium">{fee.head}</td>
                     <td className="px-6 py-4 text-sm text-content-primary font-bold text-right">{fee.amount.toLocaleString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* 4. Totals Summary Grid */}
      <div className="flex justify-end gap-12 mb-12">
         
         <div className="w-1/3 border-t-2 pt-6" style={primaryBorderStyle}>
            <div className="space-y-2">
               <div className="flex justify-between items-center text-xs text-content-secondary font-medium">
                  <span>Gross Subtotal</span>
                  <span>₹{subTotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                  <span>Fee Concession/Discount (-)</span>
                  <span>₹{discount.toLocaleString()}</span>
               </div>
               
               <div className="my-3 py-3 border-y border-dashed border-border">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-black uppercase tracking-wider text-content-primary">Current Paid</span>
                     <span className="text-lg font-black" style={primaryStyle}>₹{netTotal.toLocaleString()}</span>
                  </div>
               </div>

               {config.showBalanceDue && (
                  <div className="space-y-2">
                      {config.showPreviousDues && (
                         <div className="flex justify-between items-center text-xs text-content-secondary">
                            <span>Arrears/Carry Forward (+)</span>
                            <span>₹{previousBalance.toLocaleString()}</span>
                         </div>
                      )}
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                         <span className="text-[10px] font-black uppercase text-red-800">Remaining Balance</span>
                         <span className="text-sm font-black text-red-600">₹{totalDue.toLocaleString()}</span>
                      </div>
                  </div>
               )}
            </div>
         </div>
      </div>

      {/* 5. Amount in Words */}
      <div className="mb-12 p-5 bg-chrome rounded-2xl border border-border italic text-xs text-content-secondary">
         <span className="font-bold not-italic uppercase text-[10px] text-content-muted mr-2">Amount in Words:</span>
         Sixteen Thousand Two Hundred Only
      </div>

      {/* 6. Footer & Certification */}
      <div className="flex justify-between items-end pt-12 border-t border-border mt-auto">
         
         <div className="max-w-[60%]">
            <div className="space-y-3">
               <div className="flex items-center gap-2 text-[10px] font-black text-content-muted uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3 text-emerald-500" /> Terms & Conditions
               </div>
               <p className="text-[10px] text-content-secondary leading-relaxed whitespace-pre-line">
                  {config.termsAndConditions}
               </p>
            </div>
            
            <p className="mt-8 text-[10px] font-black text-gray-300 uppercase italic">
               {config.footerNote}
            </p>
         </div>

         <div className="text-center w-48">
            <div className="h-16 mb-4 flex items-center justify-center opacity-40">
               {/* Placeholder for Signature/Stamp */}
               <div className="w-32 border-b border-border"></div>
            </div>
            <p className="text-[10px] font-black text-content-primary uppercase tracking-wider mb-0.5">Authorized Signatory</p>
            <p className="text-[9px] text-content-muted uppercase">Accounts Department</p>
         </div>
      </div>

      {/* Watermark/Security Feature */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center -rotate-45"
        style={{ fontSize: '120px', fontWeight: 900 }}
      >
        RECEIPT
      </div>

    </div>
  );
};

export default InvoicePreview;
