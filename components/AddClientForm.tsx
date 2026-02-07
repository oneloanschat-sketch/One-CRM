import React, { useState } from 'react';
import { Client, MortgageStatus } from '../types';
import { Save, X, User, Phone, Mail, Briefcase, FileText } from 'lucide-react';

interface AddClientFormProps {
  onSave: (client: Client) => void;
  onCancel: () => void;
}

// Extracted Component to prevent focus loss on re-render
const InputGroup = ({ label, icon: Icon, required, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 flex items-center gap-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 group-focus-within:text-blue-500 transition-colors flex items-center justify-center w-5 h-5">
        {Icon ? <Icon size={18} /> : null}
      </div>
      <input
        {...props}
        className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400 transition-all font-medium"
      />
    </div>
  </div>
);

// Custom Shekel Icon Component
const ShekelIcon = () => (
  <span className="font-bold text-sm text-slate-500">₪</span>
);

export const AddClientForm: React.FC<AddClientFormProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    requestedAmount: '',
    monthlyIncome: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.phone || !formData.requestedAmount) {
        alert('אנא מלא את שדות החובה');
        return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      requestedAmount: Number(formData.requestedAmount),
      monthlyIncome: Number(formData.monthlyIncome),
      status: MortgageStatus.NEW,
      creditScore: 700, // Default starting score
      joinedDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      documents: [],
      reminders: [],
      notes: formData.notes
    };

    onSave(newClient);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 md:p-6 animate-fade-in">
      <div className="flex-1 flex flex-col bg-white md:rounded-2xl shadow-sm border border-slate-100 overflow-hidden max-w-4xl mx-auto w-full">
        
        {/* Header (Fixed) */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white shrink-0">
          <div>
             <h2 className="text-2xl font-bold text-slate-800">הוספת לקוח חדש</h2>
             <p className="text-slate-500 text-sm mt-1">הזן את פרטי הלקוח כדי לפתוח תיק חדש במערכת</p>
          </div>
          <button 
            onClick={onCancel} 
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors"
            title="סגור ללא שמירה"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          <form id="add-client-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Info Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">פרטים אישיים</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="שם פרטי"
                    icon={User}
                    required
                    type="text"
                    placeholder="לדוגמה: ישראל"
                    value={formData.firstName}
                    onChange={(e: any) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                  />
                  <InputGroup
                    label="שם משפחה"
                    icon={User}
                    required
                    type="text"
                    placeholder="לדוגמה: ישראלי"
                    value={formData.lastName}
                    onChange={(e: any) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                  />
                  <InputGroup
                    label="טלפון נייד"
                    icon={Phone}
                    required
                    type="tel"
                    dir="ltr"
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400 transition-all font-medium text-right"
                    placeholder="050-0000000"
                    value={formData.phone}
                    onChange={(e: any) => setFormData(prev => ({...prev, phone: e.target.value}))}
                  />
                  <InputGroup
                    label="כתובת אימייל"
                    icon={Mail}
                    type="email"
                    dir="ltr"
                    className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400 transition-all font-medium text-right"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e: any) => setFormData(prev => ({...prev, email: e.target.value}))}
                  />
               </div>
            </div>

            {/* Financial Info Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">פרטים פיננסיים</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputGroup
                    label="סכום משכנתא מבוקש (₪)"
                    icon={ShekelIcon}
                    required
                    type="number"
                    placeholder="1500000"
                    value={formData.requestedAmount}
                    onChange={(e: any) => setFormData(prev => ({...prev, requestedAmount: e.target.value}))}
                  />
                  <InputGroup
                    label="הכנסה חודשית נטו (₪)"
                    icon={Briefcase}
                    type="number"
                    placeholder="15000"
                    value={formData.monthlyIncome}
                    onChange={(e: any) => setFormData(prev => ({...prev, monthlyIncome: e.target.value}))}
                  />
               </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">הערות ומידע נוסף</h3>
               <div className="relative group">
                  <div className="absolute top-4 right-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                    <FileText size={18} />
                  </div>
                  <textarea
                      className="w-full pl-3 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 placeholder-slate-400 transition-all font-medium h-32 resize-none"
                      placeholder="מקור הליד, בקשות מיוחדות, סטטוס משפחתי וכו'..."
                      value={formData.notes}
                      onChange={e => setFormData(prev => ({...prev, notes: e.target.value}))}
                  />
               </div>
            </div>
            
            {/* Added Padding for scrolling so content isn't hidden behind footer on mobile if overlapped */}
            <div className="h-4"></div> 
          </form>
        </div>

        {/* Footer (Sticky/Fixed) */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-200 font-medium transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2 transform active:scale-95"
          >
            <Save size={18} />
            שמור לקוח
          </button>
        </div>

      </div>
    </div>
  );
};