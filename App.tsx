import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientDetail } from './components/ClientDetail';
import { Client, MortgageStatus } from './types';
import { LayoutDashboard, Users, LogOut, Building2 } from 'lucide-react';

// --- MOCK DATA ---
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
  },
  {
    id: '1004',
    firstName: 'מיכל',
    lastName: 'אברהם',
    phone: '053-3334444',
    email: 'michal@example.com',
    requestedAmount: 1100000,
    status: MortgageStatus.REJECTED,
    monthlyIncome: 9000,
    creditScore: 540,
    joinedDate: '2023-08-10',
    notes: 'BDI שלילי. נדחה בשלב זה.',
    documents: [
       { id: 'd4', name: 'דוח נתוני אשראי', type: 'PDF', isSigned: false, uploadDate: '2023-08-12' },
    ],
    reminders: []
  },
];

enum View {
  DASHBOARD,
  CLIENTS,
  CLIENT_DETAIL
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentView(View.CLIENT_DETAIL);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    setSelectedClient(updatedClient);
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
        ) : <Dashboard clients={clients} />; // Fallback
      default:
        return <Dashboard clients={clients} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
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
            label="לקוחות ותיקים" 
            isActive={currentView === View.CLIENTS || currentView === View.CLIENT_DETAIL} 
            onClick={() => setCurrentView(View.CLIENTS)} 
          />
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