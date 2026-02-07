import React, { useState, useRef } from 'react';
import { Client, MortgageStatus, Document, Reminder } from '../types';
import { ArrowRight, FileText, Upload, CheckCircle, XCircle, Wand2, Phone, Mail, DollarSign, Calendar, Bell, Clock, Trash2, Plus, MessageSquare, AlertTriangle } from 'lucide-react';
import { analyzeClientRisk } from '../services/geminiService';
import { sendSms } from '../services/smsService';

interface ClientDetailProps {
  client: Client;
  onBack: () => void;
  onUpdateClient: (updatedClient: Client) => void;
  onDeleteClient: (id: string) => void;
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

export const ClientDetail: React.FC<ClientDetailProps> = ({ client, onBack, onUpdateClient, onDeleteClient }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'reminders'>('details');
  const [notification, setNotification] = useState<Notification | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reminder Form State
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newReminderText, setNewReminderText] = useState('');
  const [isSendingSms, setIsSendingSms] = useState<string | null>(null); // Track which ID is sending

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleGenerateInsight = async () => {
    setIsLoadingAi(true);
    const analysis = await analyzeClientRisk(client);
    setAiAnalysis(analysis);
    setIsLoadingAi(false);
  };

  const toggleDocSign = (docId: string) => {
    const updatedDocs = client.documents.map(d => 
      d.id === docId ? { ...d, isSigned: !d.isSigned } : d
    );
    onUpdateClient({ ...client, documents: updatedDocs });
  };

  const changeStatus = (newStatus: MortgageStatus) => {
    onUpdateClient({ ...client, status: newStatus });
  };

  const handleDeleteClient = () => {
      // Directly call prop, App.tsx now handles confirmation modal
      onDeleteClient(client.id);
  };

  const handleDocumentSms = async (doc: Document) => {
    setIsSendingSms(doc.id);
    const message = `שלום ${client.firstName}, זוהי תזכורת מוואן משכנתאות לגבי חתימה על המסמך: ${doc.name}. אנא היכנס למערכת לחתימה.`;
    
    try {
      await sendSms(client.phone, message);
      showNotification(`SMS נשלח בהצלחה ל-${client.firstName} לגבי ${doc.name}`, 'success');
    } catch (error) {
      showNotification('שגיאה בשליחת SMS', 'error');
    } finally {
      setIsSendingSms(null);
    }
  };

  const handleReminderSms = async (reminder: Reminder) => {
    setIsSendingSms(reminder.id);
    const message = `שלום ${client.firstName}, תזכורת מוואן משכנתאות: ${reminder.note}`;

    try {
      await sendSms(client.phone, message);
      showNotification(`SMS נשלח בהצלחה ל-${client.firstName}`, 'success');
    } catch (error) {
      showNotification('שגיאה בשליחת SMS', 'error');
    } finally {
      setIsSendingSms(null);
    }
  };

  const addReminder = () => {
    if (!newReminderDate || !newReminderTime || !newReminderText) return;

    const newReminder: Reminder = {
      id: Date.now().toString(),
      dueDate: newReminderDate,
      dueTime: newReminderTime,
      note: newReminderText,
      isCompleted: false
    };

    onUpdateClient({
      ...client,
      reminders: [...client.reminders, newReminder]
    });

    setNewReminderText('');
    setNewReminderDate('');
    setNewReminderTime('');
    showNotification('תזכורת נוספה בהצלחה', 'success');
  };

  const toggleReminder = (id: string) => {
    const updatedReminders = client.reminders.map(r => 
      r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
    );
    onUpdateClient({ ...client, reminders: updatedReminders });
  };

  const deleteReminder = (id: string) => {
    const updatedReminders = client.reminders.filter(r => r.id !== id);
    onUpdateClient({ ...client, reminders: updatedReminders });
  };

  const getSortedReminders = () => {
    return [...client.reminders].sort((a, b) => {
      const dateA = new Date(`${a.dueDate}T${a.dueTime}`);
      const dateB = new Date(`${b.dueDate}T${b.dueTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newDoc: Document = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
        isSigned: false,
        uploadDate: new Date().toISOString().split('T')[0]
      };
      
      onUpdateClient({
        ...client,
        documents: [...client.documents, newDoc]
      });
      
      showNotification('המסמך הועלה בהצלחה למערכת', 'success');
      
      // Reset the input so the same file can be selected again if needed
      event.target.value = '';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col relative">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 transition-all animate-fade-in flex items-center gap-2 ${notification.type === 'success' ? 'bg-slate-800 text-white' : 'bg-red-500 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <button 
            onClick={onBack} 
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors w-fit"
        >
            <ArrowRight size={18} className="ml-2" />
            חזרה לרשימת הלקוחות
        </button>

        <button 
            onClick={handleDeleteClient}
            className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
        >
            <Trash2 size={16} />
            מחק תיק לקוח
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">{client.firstName} {client.lastName}</h1>
                <p className="text-slate-500 mt-1">מספר תיק: #{client.id}</p>
              </div>
              <div className="flex gap-2">
                 {/* Status Dropdown */}
                 <select 
                    value={client.status}
                    onChange={(e) => changeStatus(e.target.value as MortgageStatus)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                 >
                    {Object.values(MortgageStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full ml-3 text-blue-600"><Phone size={18}/></div>
                <div><span className="text-xs text-slate-400 block">טלפון</span>{client.phone}</div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="bg-blue-100 p-2 rounded-full ml-3 text-blue-600"><Mail size={18}/></div>
                <div><span className="text-xs text-slate-400 block">אימייל</span>{client.email}</div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="bg-green-100 p-2 rounded-full ml-3 text-green-600"><DollarSign size={18}/></div>
                <div><span className="text-xs text-slate-400 block">סכום מבוקש</span>₪{client.requestedAmount.toLocaleString()}</div>
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="bg-purple-100 p-2 rounded-full ml-3 text-purple-600"><Calendar size={18}/></div>
                <div><span className="text-xs text-slate-400 block">תאריך הצטרפות</span>{client.joinedDate}</div>
              </div>
            </div>

            {/* AI Section */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 size={20} className="text-indigo-500"/>
                  ניתוח בינה מלאכותית (AI)
                </h3>
                <button 
                  onClick={handleGenerateInsight}
                  disabled={isLoadingAi}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAi ? 'מנתח נתונים...' : 'נתח פרופיל לקוח'}
                </button>
              </div>
              
              {aiAnalysis && (
                <div className="bg-indigo-50 p-4 rounded-xl text-indigo-900 text-sm leading-relaxed border border-indigo-100">
                  {aiAnalysis}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="border-b border-slate-100 mb-6 flex gap-6 overflow-x-auto">
                <button 
                  className={`pb-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'details' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setActiveTab('details')}
                >
                  הערות ותהליך
                </button>
                <button 
                  className={`pb-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setActiveTab('documents')}
                >
                  מסמכים ({client.documents.length})
                </button>
                <button 
                  className={`pb-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'reminders' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setActiveTab('reminders')}
                >
                  <Bell size={16} />
                  תזכורות ({client.reminders.length})
                </button>
            </div>

            {activeTab === 'details' && (
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">הערות יועץ</label>
                   <textarea 
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 bg-white h-32 resize-none"
                      defaultValue={client.notes}
                      onBlur={(e) => onUpdateClient({...client, notes: e.target.value})}
                      placeholder="כתוב הערות על התיק כאן..."
                   />
                </div>
            )}

            {activeTab === 'documents' && (
                <div className="space-y-3">
                   {client.documents.map(doc => (
                     <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${doc.isSigned ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                             <FileText size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{doc.name}</p>
                            <p className="text-xs text-slate-400">{doc.uploadDate} • {doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {!doc.isSigned && (
                             <button 
                               onClick={() => handleDocumentSms(doc)}
                               disabled={isSendingSms === doc.id}
                               title="שלח תזכורת SMS ללקוח"
                               className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                             >
                               <MessageSquare size={18} className={isSendingSms === doc.id ? 'animate-pulse' : ''} />
                             </button>
                           )}
                           <button 
                             onClick={() => toggleDocSign(doc.id)}
                             className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${doc.isSigned ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                           >
                             {doc.isSigned ? 'נחתם' : 'סמן כנחתם'}
                           </button>
                        </div>
                     </div>
                   ))}
                   <div 
                      onClick={handleFileClick}
                      className="mt-4 border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer group"
                   >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <Upload className="mb-2 group-hover:text-blue-500" />
                      <span className="text-sm font-medium group-hover:text-blue-600">העלה מסמך חדש</span>
                   </div>
                </div>
            )}

            {activeTab === 'reminders' && (
              <div className="space-y-6">
                {/* Add Reminder Form */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Plus size={16} /> הוסף תזכורת חדשה
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="md:col-span-2">
                      <input 
                        type="text" 
                        placeholder="מה צריך לעשות?" 
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                        value={newReminderText}
                        onChange={(e) => setNewReminderText(e.target.value)}
                      />
                    </div>
                    <div>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                        value={newReminderDate}
                        onChange={(e) => setNewReminderDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <input 
                        type="time" 
                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800"
                        value={newReminderTime}
                        onChange={(e) => setNewReminderTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={addReminder}
                      disabled={!newReminderDate || !newReminderTime || !newReminderText}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      שמור תזכורת
                    </button>
                  </div>
                </div>

                {/* Reminder List */}
                <div className="space-y-3">
                  {getSortedReminders().length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      אין תזכורות פעילות ללקוח זה.
                    </div>
                  ) : (
                    getSortedReminders().map(reminder => (
                      <div 
                        key={reminder.id} 
                        className={`flex items-center justify-between p-3 border rounded-xl transition-all ${
                          reminder.isCompleted 
                            ? 'bg-slate-50 border-slate-100 opacity-60' 
                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => toggleReminder(reminder.id)}
                            className={`p-1.5 rounded-full transition-colors ${
                              reminder.isCompleted 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            <CheckCircle size={20} />
                          </button>
                          <div>
                            <p className={`font-medium ${reminder.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {reminder.note}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                               <Calendar size={12} /> {reminder.dueDate}
                               <Clock size={12} className="mr-1" /> {reminder.dueTime}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                             onClick={() => handleReminderSms(reminder)}
                             disabled={isSendingSms === reminder.id}
                             title="שלח הודעה ללקוח ב-SMS"
                             className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors disabled:opacity-50"
                          >
                            <MessageSquare size={18} className={isSendingSms === reminder.id ? 'animate-pulse' : ''} />
                          </button>
                          <button 
                            onClick={() => deleteReminder(reminder.id)}
                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Stats / Summary */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform -translate-x-10 -translate-y-10"></div>
              <h3 className="text-lg font-semibold mb-4 relative z-10">נתונים פיננסיים</h3>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center pb-2 border-b border-white/20">
                    <span className="text-blue-100">הכנסה חודשית</span>
                    <span className="font-bold text-xl">₪{client.monthlyIncome.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-white/20">
                    <span className="text-blue-100">דירוג אשראי</span>
                    <span className={`font-bold text-xl ${client.creditScore > 750 ? 'text-green-300' : 'text-yellow-300'}`}>{client.creditScore}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-blue-100">יחס החזר</span>
                    <span className="font-bold text-xl">{(client.requestedAmount * 0.005 / client.monthlyIncome * 100).toFixed(1)}%</span>
                 </div>
              </div>
           </div>

           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-semibold text-slate-800 mb-4">ציר זמן תהליך</h3>
             <div className="relative border-r border-slate-200 mr-2 space-y-6">
                <div className="relative mr-6">
                   <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                   <h4 className="text-sm font-semibold text-slate-800">פתיחת תיק</h4>
                   <p className="text-xs text-slate-400">{client.joinedDate}</p>
                </div>
                <div className="relative mr-6">
                   <div className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${client.status !== MortgageStatus.NEW ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                   <h4 className={`text-sm font-semibold ${client.status !== MortgageStatus.NEW ? 'text-slate-800' : 'text-slate-400'}`}>איסוף מסמכים</h4>
                   <p className="text-xs text-slate-400">{client.status !== MortgageStatus.NEW ? 'הושלם' : 'ממתין'}</p>
                </div>
                <div className="relative mr-6">
                   <div className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${client.status === MortgageStatus.APPROVED ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                   <h4 className={`text-sm font-semibold ${client.status === MortgageStatus.APPROVED ? 'text-slate-800' : 'text-slate-400'}`}>אישור עקרוני</h4>
                   <p className="text-xs text-slate-400">{client.status === MortgageStatus.APPROVED ? 'התקבל' : 'ממתין'}</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};