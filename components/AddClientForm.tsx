import React, { useState } from 'react';
import { Client, MortgageStatus } from '../types';
import { Save, X } from 'lucide-react';

interface AddClientFormProps {
  onSave: (client: Client) => void;
  onCancel: () => void;
}

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
      documents: [],
      reminders: [],
      notes: formData.notes
    };

    onSave(newClient);
  };

  const inputClasses = "w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900 placeholder-slate-400 shadow-sm transition-shadow";

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">הוספת לקוח חדש</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">שם פרטי *</label>
            <input
              required
              type="text"
              placeholder="לדוגמה: ישראל"
              className={inputClasses}
              value={formData.firstName}
              onChange={e => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">שם משפחה *</label>
            <input
              required
              type="text"
              placeholder="לדוגמה: ישראלי"
              className={inputClasses}
              value={formData.lastName}
              onChange={e => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">טלפון *</label>
            <input
              required
              type="tel"
              placeholder="050-0000000"
              className={inputClasses}
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">אימייל</label>
            <input
              type="email"
              placeholder="name@example.com"
              className={inputClasses}
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">סכום משכנתא מבוקש (₪) *</label>
            <input
              required
              type="number"
              placeholder="1500000"
              className={inputClasses}
              value={formData.requestedAmount}
              onChange={e => setFormData({...formData, requestedAmount: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">הכנסה חודשית נטו (₪)</label>
            <input
              type="number"
              placeholder="15000"
              className={inputClasses}
              value={formData.monthlyIncome}
              onChange={e => setFormData({...formData, monthlyIncome: e.target.value})}
            />
          </div>
        </div>
        
        <div>
           <label className="block text-sm font-semibold text-slate-700 mb-2">הערות ראשוניות</label>
           <textarea
              className={`${inputClasses} h-32 resize-none`}
              placeholder="מקור הליד, בקשות מיוחדות וכו'..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
           />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-medium transition-colors border border-transparent hover:border-slate-200"
          >
            ביטול
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Save size={18} />
            שמור לקוח
          </button>
        </div>
      </form>
    </div>
  );
};