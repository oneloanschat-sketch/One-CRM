import React, { useState, useRef } from 'react';
import { Client, MortgageStatus, Document, Reminder } from '../types';
import { ArrowRight, FileText, Upload, CheckCircle, XCircle, Wand2, Phone, Mail, DollarSign, Calendar, Bell, Clock, Trash2, Plus, MessageSquare } from 'lucide-react';
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
    const message = `שלום ${client.firstName}, זוהי תזכורת מהסוכנות למשכנתאות לגבי חתימה על המסמך: ${doc.name}. אנא היכנס למערכת לחתימה.`;
    
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
    const message = `שלום ${client.firstName}, תזכורת מהסוכנות למשכנתאות: ${reminder.note}`;

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
    <div className="flex flex-col h-full relative animate-fade-in">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 transition-all animate-fade-in flex items-center gap-2 ${notification.type === 'success' ? 'bg-slate-900 text-white dark:bg-emerald-600' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle size={18} className="text-green-400 dark:text-white" /> : <XCircle size={18} />}
          <span className="font-medium text-sm">{notification.message}</span>
        </div>
      )}

      {/* Top Navigation (Fixed & Compact) */}
      <div className="shrink-0 px-4 pt-3 pb-2 md:px-6">
        <div className="flex flex-row justify-between items-center gap-3">
            <button 
                onClick={onBack} 
                className="flex items-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors group px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                <ArrowRight size={18} className="ml-1 group-hover:mr-1 transition-all" />
                <span className="font-bold text-base">חזרה</span>
            </button>

            <button 
                onClick={handleDeleteClient}
                className="group flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-sm"
                title="מחק תיק לקוח לצמיתות"
            >
                <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pt-1 md:pt-1 pb-20 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            {/* Left Side: Main Info */}
            <div className="lg:col-span-2 space-y-5">
            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                {/* Header: Name + Status - Compact Layout */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                    <div className="min-w-0 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                             <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate leading-tight">{client.firstName} {client.lastName}</h1>
                             <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">#{client.id}</span>
                        </div>
                    </div>
                    <div className="w-full md:w-auto">
                        {/* Status Dropdown */}
                        <div className="relative">
                            <select 
                                value={client.status}
                                onChange={(e) => changeStatus(e.target.value as MortgageStatus)}
                                className="w-full md:w-40 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors appearance-none"
                            >
                                {Object.values(MortgageStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <CheckCircle size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-4">
                    <div className="flex items-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg min-w-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                        <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-full ml-2 text-slate-600 dark:text-slate-300 shrink-0"><Phone size={16}/></div>
                        <div className="min-w-0 truncate">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">טלפון</span>
                            <span className="truncate block font-medium text-slate-700 dark:text-slate-200 text-sm" dir="ltr">{client.phone}</span>
                        </div>
                    </div>
                    <div className="flex items-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg min-w-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                        <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-full ml-2 text-slate-600 dark:text-slate-300 shrink-0"><Mail size={16}/></div>
                        <div className="min-w-0 truncate">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">אימייל</span>
                            <span className="truncate block font-medium text-slate-700 dark:text-slate-200 text-sm">{client.email || '-'}</span>
                        </div>
                    </div>
                    <div className="flex items-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg min-w-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full ml-2 text-amber-600 dark:text-amber-400 shrink-0"><DollarSign size={16}/></div>
                        <div className="min-w-0 truncate">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">סכום מבוקש</span>
                            <span className="truncate block font-medium text-slate-700 dark:text-slate-200 text-sm">₪{client.requestedAmount.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg min-w-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                        <div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-full ml-2 text-slate-600 dark:text-slate-300 shrink-0"><Calendar size={16}/></div>
                        <div className="min-w-0 truncate">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-semibold uppercase">תאריך הצטרפות</span>
                            <span className="truncate block font-medium text-slate-700 dark:text-slate-200 text-sm">{client.joinedDate}</span>
                        </div>
                    </div>
                </div>

                {/* AI Section */}
                <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                    <Wand2 size={16} className="text-amber-500"/>
                    ניתוח AI חכם
                    </h3>
                    <button 
                    onClick={handleGenerateInsight}
                    disabled={isLoadingAi}
                    className="w-full sm:w-auto bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 border border-transparent px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                    >
                    {isLoadingAi ? 'מנתח נתונים...' : (
                        <>
                            <span>הפעל ניתוח</span>
                            <Wand2 size={12} />
                        </>
                    )}
                    </button>
                </div>
                
                {aiAnalysis && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl text-slate-800 dark:text-slate-200 text-xs md:text-sm leading-relaxed border border-amber-100 dark:border-amber-900/40 animate-fade-in shadow-inner">
                    {aiAnalysis}
                    </div>
                )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                {/* Tabs */}
                <div className="border-b border-slate-100 dark:border-slate-700 mb-5 flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
                    <button 
                    className={`pb-2 font-bold transition-colors border-b-2 whitespace-nowrap text-sm ${activeTab === 'details' ? 'border-amber-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    onClick={() => setActiveTab('details')}
                    >
                    הערות ותהליך
                    </button>
                    <button 
                    className={`pb-2 font-bold transition-colors border-b-2 whitespace-nowrap text-sm ${activeTab === 'documents' ? 'border-amber-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    onClick={() => setActiveTab('documents')}
                    >
                    מסמכים ({client.documents.length})
                    </button>
                    <button 
                    className={`pb-2 font-bold transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 text-sm ${activeTab === 'reminders' ? 'border-amber-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                    onClick={() => setActiveTab('reminders')}
                    >
                    <Bell size={14} />
                    תזכורות ({client.reminders.length})
                    </button>
                </div>

                {activeTab === 'details' && (
                    <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">הערות יועץ</label>
                    <textarea 
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-700 h-40 resize-none text-sm transition-all"
                        defaultValue={client.notes}
                        onBlur={(e) => onUpdateClient({...client, notes: e.target.value})}
                        placeholder="כתוב הערות חשובות על התיק כאן..."
                    />
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="space-y-2 animate-fade-in">
                    {client.documents.map(doc => (
                        <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors gap-3 group">
                            <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 ${doc.isSigned ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-xs md:text-sm truncate">{doc.name}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{doc.uploadDate} • {doc.type}</p>
                            </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            {!doc.isSigned && (
                                <button 
                                onClick={() => handleDocumentSms(doc)}
                                disabled={isSendingSms === doc.id}
                                title="שלח תזכורת SMS ללקוח"
                                className="p-1.5 text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                <MessageSquare size={16} className={isSendingSms === doc.id ? 'animate-pulse' : ''} />
                                </button>
                            )}
                            <button 
                                onClick={() => toggleDocSign(doc.id)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold transition-colors whitespace-nowrap shadow-sm ${doc.isSigned ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                            >
                                {doc.isSigned ? 'נחתם' : 'סמן כנחתם'}
                            </button>
                            </div>
                        </div>
                    ))}
                    <div 
                        onClick={handleFileClick}
                        className="mt-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all cursor-pointer group"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                        />
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full mb-2 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                             <Upload size={20} />
                        </div>
                        <span className="text-xs font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400">לחץ להעלאת מסמך חדש</span>
                    </div>
                    </div>
                )}

                {activeTab === 'reminders' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Add Reminder Form */}
                    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                        <Plus size={14} /> הוסף תזכורת חדשה
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                        <input 
                            type="text" 
                            placeholder="מה צריך לעשות?" 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            value={newReminderText}
                            onChange={(e) => setNewReminderText(e.target.value)}
                        />
                        </div>
                        <div>
                        <input 
                            type="date" 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            value={newReminderDate}
                            onChange={(e) => setNewReminderDate(e.target.value)}
                        />
                        </div>
                        <div>
                        <input 
                            type="time" 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            value={newReminderTime}
                            onChange={(e) => setNewReminderTime(e.target.value)}
                        />
                        </div>
                    </div>
                    <div className="mt-2 flex justify-end">
                        <button 
                        onClick={addReminder}
                        disabled={!newReminderDate || !newReminderTime || !newReminderText}
                        className="w-full sm:w-auto bg-slate-900 dark:bg-slate-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                        שמור תזכורת
                        </button>
                    </div>
                    </div>

                    {/* Reminder List */}
                    <div className="space-y-2">
                    {getSortedReminders().length === 0 ? (
                        <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                        אין תזכורות פעילות ללקוח זה.
                        </div>
                    ) : (
                        getSortedReminders().map(reminder => (
                        <div 
                            key={reminder.id} 
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl transition-all gap-2 ${
                            reminder.isCompleted 
                                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-60' 
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start sm:items-center gap-3 w-full">
                            <button 
                                onClick={() => toggleReminder(reminder.id)}
                                className={`p-1.5 rounded-full transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                                reminder.isCompleted 
                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                <CheckCircle size={16} />
                            </button>
                            <div className="min-w-0 flex-1">
                                <p className={`font-bold text-sm break-words ${reminder.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                {reminder.note}
                                </p>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                                   <span className="flex items-center gap-1"><Calendar size={10} /> {reminder.dueDate}</span>
                                   <span className="flex items-center gap-1"><Clock size={10} /> {reminder.dueTime}</span>
                                </div>
                            </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto border-t sm:border-t-0 border-slate-50 dark:border-slate-700 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                            <button 
                                onClick={() => handleReminderSms(reminder)}
                                disabled={isSendingSms === reminder.id}
                                title="שלח הודעה ללקוח ב-SMS"
                                className="text-blue-500 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <MessageSquare size={16} className={isSendingSms === reminder.id ? 'animate-pulse' : ''} />
                            </button>
                            <button 
                                onClick={() => deleteReminder(reminder.id)}
                                className="text-red-400 bg-red-50 dark:bg-red-900/30 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 p-1.5 rounded-lg transition-colors"
                            >
                                <Trash2 size={16} />
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

            {/* Right Side: Quick Stats / Summary (Bottom on Mobile) */}
            <div className="space-y-5">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 text-white p-5 rounded-2xl shadow-xl shadow-slate-300 dark:shadow-slate-900 relative overflow-hidden border border-slate-700 dark:border-slate-800">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500 opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
                
                <h3 className="text-base font-bold mb-3 relative z-10 flex items-center gap-2 text-amber-400">
                    <DollarSign size={18} /> 
                    פרופיל פיננסי
                </h3>
                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-300 text-xs font-medium">הכנסה חודשית</span>
                        <span className="font-bold text-lg tracking-tight">₪{client.monthlyIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                        <span className="text-slate-300 text-xs font-medium">דירוג אשראי</span>
                        <span className={`font-bold text-lg tracking-tight ${client.creditScore > 750 ? 'text-emerald-400' : 'text-amber-400'}`}>{client.creditScore}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-300 text-xs font-medium">יחס החזר משוער</span>
                        <span className="font-bold text-lg tracking-tight">{(client.requestedAmount * 0.005 / client.monthlyIncome * 100).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-sm">ציר זמן תהליך</h3>
                <div className="relative border-r-2 border-slate-100 dark:border-slate-700 mr-2 space-y-6 py-1">
                    <div className="relative mr-6">
                    <div className="absolute -right-[33px] top-1 w-5 h-5 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-800 shadow-sm"></div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white">פתיחת תיק</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{client.joinedDate}</p>
                    </div>
                    <div className="relative mr-6">
                    <div className={`absolute -right-[33px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm ${client.status !== MortgageStatus.NEW ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>
                    <h4 className={`text-xs font-bold ${client.status !== MortgageStatus.NEW ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>איסוף מסמכים</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{client.status !== MortgageStatus.NEW ? 'הושלם' : 'ממתין לביצוע'}</p>
                    </div>
                    <div className="relative mr-6">
                    <div className={`absolute -right-[33px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-800 shadow-sm ${client.status === MortgageStatus.APPROVED ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}></div>
                    <h4 className={`text-xs font-bold ${client.status === MortgageStatus.APPROVED ? 'text-slate-800 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>אישור עקרוני</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{client.status === MortgageStatus.APPROVED ? 'התקבל' : 'ממתין לאישור'}</p>
                    </div>
                </div>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};