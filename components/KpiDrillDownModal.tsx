import React from 'react';
import { Client } from '../types';
import { X, ArrowRight, FileText, Phone, Info } from 'lucide-react';

interface KpiDrillDownModalProps {
  title: string;
  clients: Client[];
  type: 'TOTAL' | 'ACTIVE' | 'VOLUME' | 'DOCS' | 'CREDIT' | 'RATES' | 'WAIT_TIME';
  onClose: () => void;
  onClientSelect: (client: Client) => void;
}

export const KpiDrillDownModal: React.FC<KpiDrillDownModalProps> = ({ title, clients, type, onClose, onClientSelect }) => {
  
  // Helper to format date to DD.MM.YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
      }
      return dateString;
    } catch (e) {
      return dateString;
    }
  };

  // Helper to calculate hours waiting for display
  const getHoursWaiting = (client: Client) => {
      const createdTime = client.createdAt ? new Date(client.createdAt).getTime() : new Date(client.joinedDate).getTime();
      const now = Date.now();
      const diffHours = (now - createdTime) / (1000 * 60 * 60);
      return diffHours;
  };

  // Helper to format phone to 05X-XXXXXXX
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    // Strip all non-numeric characters
    const digits = phone.replace(/\D/g, '');
    
    // Check if it's a valid Israeli mobile number length (10 digits)
    if (digits.length === 10 && digits.startsWith('05')) {
      return `${digits.substring(0, 3)}-${digits.substring(3)}`;
    }
    // Fallback for landlines or other lengths if needed, or just return original
    if (digits.length > 0) return digits;
    
    return phone;
  };

  // Determine which specific value to show in the extra column based on KPI type
  const getDynamicColumnHeader = () => {
    switch (type) {
      case 'VOLUME': return 'סכום שאושר';
      case 'DOCS': return 'מסמכים לחתימה';
      case 'CREDIT': return 'דירוג אשראי';
      case 'ACTIVE': return 'סטטוס נוכחי';
      case 'WAIT_TIME': return 'זמן המתנה';
      default: return 'תאריך הצטרפות';
    }
  };

  const getDynamicValue = (client: Client) => {
    switch (type) {
      case 'VOLUME': 
        return <span className="font-bold text-emerald-600 truncate">₪{client.requestedAmount.toLocaleString()}</span>;
      case 'DOCS': 
        const pendingCount = client.documents.filter(d => !d.isSigned).length;
        return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap">{pendingCount} ממתינים</span>;
      case 'CREDIT': 
        return <span className={`font-bold ${client.creditScore > 750 ? 'text-green-600' : 'text-slate-600'}`}>{client.creditScore}</span>;
      case 'ACTIVE':
        return <span className="text-blue-600 font-medium text-sm whitespace-nowrap">{client.status}</span>;
      case 'WAIT_TIME':
        const hours = getHoursWaiting(client);
        const isCritical = hours > 2;
        return (
            <span className={`font-bold text-sm whitespace-nowrap ${isCritical ? 'text-red-600' : 'text-slate-600'}`}>
                {hours < 1 ? `${(hours * 60).toFixed(0)} דקות` : `${hours.toFixed(1)} שעות`}
            </span>
        );
      default: 
        return <span className="text-slate-500 text-sm font-mono whitespace-nowrap">{formatDate(client.joinedDate)}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 truncate">{title}</h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1 truncate">נמצאו {clients.length} לקוחות רלוונטיים</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors text-slate-500 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-3 md:p-4 custom-scrollbar bg-slate-50/30 flex-1">
          {clients.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText size={48} className="mx-auto mb-3 opacity-20" />
              <p>לא נמצאו נתונים להצגה בקטגוריה זו</p>
            </div>
          ) : (
            <>
              {/* DESKTOP VIEW (Table) */}
              <div className="hidden md:block">
                 <div className="grid grid-cols-4 px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-1">שם הלקוח</div>
                    <div className="col-span-1">טלפון</div>
                    <div className="col-span-1 text-left">{getDynamicColumnHeader()}</div>
                    <div className="col-span-1 text-left">פרטים נוספים</div>
                 </div>
                 <div className="grid gap-3">
                   {clients.map(client => (
                     <div 
                       key={client.id} 
                       onClick={() => onClientSelect(client)}
                       className="group grid grid-cols-4 items-center p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                     >
                        <div className="col-span-1 flex items-center gap-3 min-w-0">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors shrink-0">
                              {client.firstName[0]}
                           </div>
                           <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">{client.firstName} {client.lastName}</p>
                              <p className="text-xs text-slate-400">#{client.id}</p>
                           </div>
                        </div>
                        <div className="col-span-1 text-slate-600 text-sm font-medium font-mono truncate">
                           {formatPhone(client.phone)}
                        </div>
                        <div className="col-span-1 text-left pl-2 truncate">
                           {getDynamicValue(client)}
                        </div>
                        <div className="col-span-1 flex justify-end">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               onClientSelect(client);
                             }}
                             className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                           >
                              לתיק הלקוח <ArrowRight size={14} className="rotate-180"/>
                           </button>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* MOBILE VIEW (Cards) */}
              <div className="md:hidden space-y-3">
                  {clients.map(client => (
                    <div 
                      key={client.id}
                      onClick={() => onClientSelect(client)}
                      className="bg-white p-3.5 rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform"
                    >
                      <div className="flex justify-between items-center mb-3 border-b border-slate-50 pb-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-base md:text-lg shrink-0">
                                {client.firstName[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-slate-800 truncate text-sm md:text-base">{client.firstName} {client.lastName}</h3>
                                <p className="text-xs text-slate-400">#{client.id}</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded-full text-slate-400 shrink-0">
                            <ArrowRight size={16} className="rotate-180" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="min-w-0">
                              <span className="text-xs text-slate-400 block mb-1">טלפון</span>
                              <div className="flex items-center gap-1.5 text-slate-600 font-mono min-w-0">
                                  <Phone size={12} className="shrink-0" />
                                  <span className="truncate">{formatPhone(client.phone)}</span>
                              </div>
                          </div>
                          <div className="min-w-0">
                              <span className="text-xs text-slate-400 block mb-1">{getDynamicColumnHeader()}</span>
                              <div className="flex items-center gap-1.5 min-w-0">
                                  <Info size={12} className="text-blue-400 shrink-0"/>
                                  <div className="truncate w-full">{getDynamicValue(client)}</div>
                              </div>
                          </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400 hidden md:block">
           מציג נתונים בזמן אמת מתוך המערכת
        </div>
      </div>
    </div>
  );
};