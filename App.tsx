import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientDetail } from './components/ClientDetail';
import { AddClientForm } from './components/AddClientForm';
import { Client, MortgageStatus } from './types';
import { LayoutDashboard, Users, LogOut, Building2, UserPlus, Bot, MessageCircle } from 'lucide-react';

// --- MOCK DATA (Fallback) ---
const mockClients: Client[] = [
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

enum View {
  DASHBOARD,
  CLIENTS,
  CLIENT_DETAIL,
  ADD_CLIENT
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Initialize clients from LocalStorage or use Mock Data
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('crm_clients');
    return savedClients ? JSON.parse(savedClients) : mockClients;
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Save to LocalStorage whenever clients change
  useEffect(() => {
    localStorage.setItem('crm_clients', JSON.stringify(clients));
  }, [clients]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentView(View.CLIENT_DETAIL);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
  };

  const handleAddClient = (newClient: Client) => {
    setClients(prev => [newClient, ...prev]);
    setCurrentView(View.CLIENTS);
    showNotification(`הלקוח ${newClient.firstName} נוסף בהצלחה!`);
  };

  // Simulate receiving a webhook from a WhatsApp bot
  const simulateBotWebhook = () => {
    const fakeNames = ['רונית', 'יוסי', 'עומר', 'דניאל', 'נועה'];
    const fakeLastNames = ['חדד', 'אזולאי', 'פרידמן', 'גולן', 'ביטון'];
    const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
    const randomLastName = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
    
    const botClient: Client = {
      id: Date.now().toString(),
      firstName: randomName,
      lastName: randomLastName,
      phone: `05${Math.floor(Math.random() * 9)} - ${Math.floor(Math.random() * 8999999 + 1000000)}`,
      email: 'lead@whatsapp-bot.com',
      requestedAmount: Math.floor(Math.random() * 15) * 100000 + 500000,
      monthlyIncome: Math.floor(Math.random() * 20000 + 8000),
      creditScore: 0, // Needs checking
      status: MortgageStatus.NEW,
      joinedDate: new Date().toISOString().split('T')[0],
      documents: [],
      reminders: [],
      notes: 'ליד אוטומטי שהתקבל דרך הבוט בוואטסאפ (Simulated)'
    };

    setClients(prev => [botClient, ...prev]);
    showNotification(`🤖 ליד חדש התקבל מהבוט: ${randomName} ${randomLastName}`);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard clients={clients} />;
      case View.CLIENTS:
        return <ClientList clients={clients} onSelectClient={handleClientSelect} />;
      case View.CLIENT_DETAIL:
        return selectedClient ? (
          <ClientDetail 
            client={selectedClient} 
            onBack={() => setCurrentView(View.CLIENTS)} 
            onUpdateClient={handleUpdateClient}
          />
        ) : <Dashboard clients={clients} />;
      case View.ADD_CLIENT:
        return <AddClientForm onSave={handleAddClient} onCancel={() => setCurrentView(View.CLIENTS)} />;
      default:
        return <Dashboard clients={clients} />;
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
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-blue-900">וואן משכנתאות</h1>
            <p className="text-xs text-slate-500">מערכת ניהול לקוחות</p>
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

        <div className="p-4 border-t border-slate-100">
           <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600">
             <LogOut size={18} />
             <span className="text-sm font-medium">התנתק</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex items-center justify-between sticky top-0 z-20">
             <div className="font-bold text-blue-900">וואן משכנתאות</div>
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