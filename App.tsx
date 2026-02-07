import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientDetail } from './components/ClientDetail';
import { AddClientForm } from './components/AddClientForm';
import { IntegrationSettings } from './components/IntegrationSettings';
import { Client, MortgageStatus } from './types';
import { LayoutDashboard, Users, LogOut, UserPlus, Bot, MessageCircle, Download, Settings, Loader2, Wifi, WifiOff } from 'lucide-react';

// --- Fallback Data (For Offline Mode) ---
const FALLBACK_CLIENTS: Client[] = [
  {
    id: '1001',
    firstName: 'ישראל',
    lastName: 'ישראלי',
    phone: '050-1234567',
    email: 'israel@example.com',
    requestedAmount: 1500000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 18000,
    creditScore: 820,
    joinedDate: '2023-10-15',
    notes: 'לקוח מחפש משכנתא לדירה ראשונה בראשון לציון.',
    documents: [
      { id: 'd1', name: 'תעודת זהות', type: 'PDF', isSigned: true, uploadDate: '2023-10-16' },
      { id: 'd2', name: 'תלושי שכר (3 חודשים)', type: 'PDF', isSigned: false, uploadDate: '2023-10-17' },
    ],
    reminders: [
      { id: 'r1', dueDate: '2023-11-20', dueTime: '10:00', note: 'להתקשר לבדוק סטטוס מסמכים', isCompleted: false }
    ]
  },
  {
    id: '1002',
    firstName: 'שרה',
    lastName: 'כהן',
    phone: '052-9876543',
    email: 'sara@example.com',
    requestedAmount: 850000,
    status: MortgageStatus.APPROVED,
    monthlyIncome: 12500,
    creditScore: 750,
    joinedDate: '2023-09-20',
    notes: 'משכנתא לשיפוץ. אישור עקרוני התקבל.',
    documents: [
      { id: 'd3', name: 'אישור בעלות', type: 'PDF', isSigned: true, uploadDate: '2023-09-21' },
    ],
    reminders: []
  },
  {
    id: '1003',
    firstName: 'דוד',
    lastName: 'לוי',
    phone: '054-5555555',
    email: 'david@example.com',
    requestedAmount: 2200000,
    status: MortgageStatus.NEW,
    monthlyIncome: 25000,
    creditScore: 680,
    joinedDate: '2023-10-25',
    notes: 'פנייה חדשה מאתר האינטרנט.',
    documents: [],
    reminders: []
  }
];

// --- Components ---

const SidebarItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

enum View {
  DASHBOARD,
  CLIENTS,
  CLIENT_DETAIL,
  ADD_CLIENT,
  SETTINGS
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- API Functions ---
  const fetchClients = async () => {
    try {
      // Try to fetch from server
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        setIsOfflineMode(false);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.warn('Backend unavailable, switching to Offline Mode');
      // If server fails, use fallback data
      setClients(FALLBACK_CLIENTS);
      setIsOfflineMode(true);
      showNotification('מצב הדגמה (Offline): הנתונים נטענו מקומית');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchClients();
  }, []);

  // --- URL Query Param Listener (For "Magic Link" from Bot) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'add') {
      const fname = params.get('fname');
      const lname = params.get('lname');
      const phone = params.get('phone');
      const amount = params.get('amount');

      if (fname && phone) {
        const newClient: Client = {
            id: Date.now().toString(),
            firstName: fname,
            lastName: lname || '',
            phone: phone,
            email: params.get('email') || '',
            requestedAmount: Number(amount) || 0,
            monthlyIncome: 0,
            status: MortgageStatus.NEW,
            creditScore: 0,
            joinedDate: new Date().toISOString().split('T')[0],
            documents: [],
            reminders: [],
            notes: 'התקבל אוטומטית דרך קישור (Bot)'
        };

        handleAddClient(newClient, true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentView(View.CLIENT_DETAIL);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
    // Optimistic update (update UI immediately)
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);

    if (!isOfflineMode) {
      try {
          await fetch(`/api/clients/${updatedClient.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedClient)
          });
      } catch (error) {
          console.error('Sync failed, working locally');
          setIsOfflineMode(true);
      }
    }
  };

  const handleAddClient = async (newClient: Client, fromLink = false) => {
    // Optimistic update
    setClients(prev => [newClient, ...prev]);
    if (fromLink) {
        showNotification(`✅ נקלט ליד חדש: ${newClient.firstName} ${newClient.lastName}`);
        setCurrentView(View.CLIENTS);
    } else {
        setCurrentView(View.CLIENTS);
        showNotification(`הלקוח ${newClient.firstName} נוסף בהצלחה!`);
    }

    if (!isOfflineMode) {
        try {
            await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient)
            });
        } catch (error) {
            console.error('Save failed, working locally');
            setIsOfflineMode(true);
        }
    }
  };

  // Simulate calling the real Webhook
  const simulateBotWebhook = async () => {
    const fakeNames = ['רונית', 'יוסי', 'עומר', 'דניאל', 'נועה'];
    const fakeLastNames = ['חדד', 'אזולאי', 'פרידמן', 'גולן', 'ביטון'];
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const randomLastName = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
    
    const payload = {
        firstName: randomName,
        lastName: randomLastName,
        phone: `05${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 8999999 + 1000000)}`,
        email: 'lead@whatsapp-bot.com',
        requestedAmount: Math.floor(Math.random() * 15) * 100000 + 500000,
        source: 'whatsapp_bot_simulation'
    };

    console.log('Simulating webhook...');

    let success = false;
    
    // Attempt real server call first
    if (!isOfflineMode) {
        try {
            const res = await fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                success = true;
                showNotification(`🤖 הבוט שלח ליד: ${randomName} ${randomLastName}`);
                fetchClients(); // Refresh from server
            }
        } catch (e) {
            console.warn('Webhook server unreachable');
        }
    }

    // Fallback if server failed or we are in offline mode
    if (!success) {
        const newClient: Client = {
            id: Date.now().toString(),
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            email: payload.email,
            requestedAmount: payload.requestedAmount,
            status: MortgageStatus.NEW,
            monthlyIncome: 0,
            creditScore: 0,
            joinedDate: new Date().toISOString().split('T')[0],
            documents: [],
            reminders: [],
            notes: 'ליד נקלט בסימולציה (מצב מקומי)'
        };
        
        setClients(prev => [newClient, ...prev]);
        showNotification(`🤖 (מקומי) הבוט יצר ליד: ${randomName} ${randomLastName}`);
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(clients, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `crm_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('הנתונים נשמרו בהצלחה למחשב!');
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
                <p>טוען נתונים...</p>
            </div>
        );
    }

    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard clients={clients} onClientSelect={handleClientSelect} />;
      case View.CLIENTS:
        return <ClientList clients={clients} onSelectClient={handleClientSelect} />;
      case View.CLIENT_DETAIL:
        return selectedClient ? (
          <ClientDetail 
            client={selectedClient} 
            onBack={() => setCurrentView(View.CLIENTS)} 
            onUpdateClient={handleUpdateClient}
          />
        ) : <Dashboard clients={clients} onClientSelect={handleClientSelect} />;
      case View.ADD_CLIENT:
        return <AddClientForm onSave={(c) => handleAddClient(c)} onCancel={() => setCurrentView(View.CLIENTS)} />;
      case View.SETTINGS:
        return <IntegrationSettings onTestWebhook={simulateBotWebhook} />;
      default:
        return <Dashboard clients={clients} onClientSelect={handleClientSelect} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-6 z-50 bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce-in flex items-center gap-3">
          <MessageCircle className="text-green-400" />
          <div>
            <p className="font-semibold text-sm">עדכון מערכת</p>
            <p className="text-sm opacity-90">{notification}</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-slate-200 hidden md:flex flex-col z-10 shadow-lg">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg transform rotate-3 transition-transform hover:rotate-0 group shrink-0">
            <span className="font-black text-3xl italic pr-1 font-serif group-hover:scale-110 transition-transform">1</span>
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-xl leading-tight text-slate-800">
              <span className="text-blue-600">וואן</span> משכנתאות
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded-full w-fit mt-1">
              מספר 1 בפיננסים
            </p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="דשבורד ראשי" 
            isActive={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="ניהול לקוחות" 
            isActive={currentView === View.CLIENTS || currentView === View.CLIENT_DETAIL} 
            onClick={() => setCurrentView(View.CLIENTS)} 
          />
          <SidebarItem 
            icon={<UserPlus size={20} />} 
            label="הוסף לקוח ידנית" 
            isActive={currentView === View.ADD_CLIENT} 
            onClick={() => setCurrentView(View.ADD_CLIENT)} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="הגדרות וחיבורים" 
            isActive={currentView === View.SETTINGS} 
            onClick={() => setCurrentView(View.SETTINGS)} 
          />
          
          <div className="pt-6 mt-6 border-t border-slate-100">
             <p className="text-xs font-semibold text-slate-400 px-3 mb-2">סימולציות ואינטגרציות</p>
             <button 
               onClick={simulateBotWebhook}
               className="w-full flex items-center gap-3 p-3 rounded-xl text-green-600 hover:bg-green-50 transition-all duration-200"
             >
               <Bot size={20} />
               <span>הדמיית ליד מהבוט</span>
             </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${isOfflineMode ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
              {isOfflineMode ? 'מצב לא מקוון (Offline)' : 'מחובר לשרת בענן'}
           </div>

           <button 
             onClick={handleExportData}
             className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
           >
             <Download size={18} />
             <span className="text-sm font-medium">שמור/ייצא נתונים</span>
           </button>
           
           <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600">
             <LogOut size={18} />
             <span className="text-sm font-medium">התנתק</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-20">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white shadow-md">
                    <span className="font-black text-xl italic pr-0.5 font-serif">1</span>
                </div>
                <div>
                   <div className="font-bold text-blue-900 text-lg leading-none">וואן משכנתאות</div>
                   <div className="text-[10px] text-slate-500 font-bold">מספר 1 בפיננסים</div>
                </div>
             </div>
             <button className="p-2 bg-slate-100 rounded-md" onClick={() => setCurrentView(View.DASHBOARD)}>
               <LayoutDashboard size={20}/>
             </button>
        </header>
        <div className="max-w-7xl mx-auto">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}