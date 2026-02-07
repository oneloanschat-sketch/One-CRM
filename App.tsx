import React, { useState, useEffect, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/ClientList';
import { ClientDetail } from './components/ClientDetail';
import { AddClientForm } from './components/AddClientForm';
import { IntegrationSettings } from './components/IntegrationSettings';
import { NotificationCenter } from './components/NotificationCenter';
import { Client, MortgageStatus, SystemNotification } from './types';
import { LayoutDashboard, Users, UserPlus, Bot, MessageCircle, Download, Settings, Loader2, Wifi, WifiOff, Menu, X, AlertTriangle } from 'lucide-react';

// --- Helpers for Fallback Data ---
const hoursAgo = (hours: number) => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

const daysAgoDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

// --- Fallback Data (For Offline Mode - Full 30 Clients) ---
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
    joinedDate: daysAgoDate(2),
    createdAt: hoursAgo(48),
    notes: 'לקוח מחפש משכנתא לדירה ראשונה בראשון לציון.',
    documents: [
      { id: 'd1', name: 'תעודת זהות', type: 'PDF', isSigned: true, uploadDate: daysAgoDate(1) },
      { id: 'd2', name: 'תלושי שכר (3 חודשים)', type: 'PDF', isSigned: false, uploadDate: daysAgoDate(1) },
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
    joinedDate: daysAgoDate(30),
    createdAt: hoursAgo(720),
    notes: 'משכנתא לשיפוץ. אישור עקרוני התקבל.',
    documents: [
      { id: 'd3', name: 'אישור בעלות', type: 'PDF', isSigned: true, uploadDate: daysAgoDate(29) },
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
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(3.5),
    notes: 'פנייה חדשה מאתר האינטרנט.',
    documents: [],
    reminders: []
  },
  {
    id: '1004',
    firstName: 'דניאל',
    lastName: 'גולן',
    phone: '052-2223334',
    email: 'dani@example.com',
    requestedAmount: 1800000,
    status: MortgageStatus.NEW,
    monthlyIncome: 21000,
    creditScore: 710,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(0.5),
    notes: 'ליד טרי מהפייסבוק.',
    documents: [],
    reminders: []
  },
  {
    id: '1005',
    firstName: 'מיכל',
    lastName: 'אברהם',
    phone: '053-1112222',
    email: 'michal@test.com',
    requestedAmount: 3200000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 35000,
    creditScore: 850,
    joinedDate: daysAgoDate(5),
    createdAt: hoursAgo(120),
    notes: 'זוג הייטקיסטים, מחפשים משכנתא לפנטהאוז.',
    documents: [],
    reminders: []
  },
  {
    id: '1006',
    firstName: 'רועי',
    lastName: 'ניר',
    phone: '054-9998887',
    email: 'roi@test.com',
    requestedAmount: 900000,
    status: MortgageStatus.REJECTED,
    monthlyIncome: 9000,
    creditScore: 540,
    joinedDate: daysAgoDate(15),
    createdAt: hoursAgo(360),
    notes: 'BDI שלילי, לא ניתן לקדם כרגע.',
    documents: [],
    reminders: []
  },
  {
    id: '1007',
    firstName: 'ענת',
    lastName: 'שחר',
    phone: '050-7776665',
    email: 'anat@test.com',
    requestedAmount: 1400000,
    status: MortgageStatus.PAID,
    monthlyIncome: 16000,
    creditScore: 780,
    joinedDate: daysAgoDate(45),
    createdAt: hoursAgo(1080),
    notes: 'תיק נסגר בהצלחה! משכנתא שולמה.',
    documents: [],
    reminders: []
  },
  {
    id: '1008',
    firstName: 'איתי',
    lastName: 'ברק',
    phone: '052-3334445',
    email: 'itay@test.com',
    requestedAmount: 2500000,
    status: MortgageStatus.APPROVED,
    monthlyIncome: 28000,
    creditScore: 810,
    joinedDate: daysAgoDate(10),
    createdAt: hoursAgo(240),
    notes: 'אישור עקרוני מבנק לאומי.',
    documents: [],
    reminders: []
  },
  {
    id: '1009',
    firstName: 'נועה',
    lastName: 'פרידמן',
    phone: '053-5554443',
    email: 'noa@test.com',
    requestedAmount: 1100000,
    status: MortgageStatus.NEW,
    monthlyIncome: 14000,
    creditScore: 690,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(5),
    notes: 'השאירה פרטים בבוט, לא חזרנו עדיין.',
    documents: [],
    reminders: []
  },
  {
    id: '1010',
    firstName: 'גיא',
    lastName: 'זוהר',
    phone: '054-2221119',
    email: 'guy@test.com',
    requestedAmount: 1650000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 19500,
    creditScore: 740,
    joinedDate: daysAgoDate(8),
    createdAt: hoursAgo(192),
    notes: 'שלח חלק מהמסמכים, חסר עובר ושב.',
    documents: [],
    reminders: []
  },
  {
    id: '1011',
    firstName: 'אורית',
    lastName: 'וקנין',
    phone: '050-8884441',
    email: 'orit@test.com',
    requestedAmount: 750000,
    status: MortgageStatus.APPROVED,
    monthlyIncome: 11000,
    creditScore: 720,
    joinedDate: daysAgoDate(20),
    createdAt: hoursAgo(480),
    notes: 'מחזור משכנתא.',
    documents: [],
    reminders: []
  },
  {
    id: '1012',
    firstName: 'ירון',
    lastName: 'בלום',
    phone: '052-6667778',
    email: 'yaron@test.com',
    requestedAmount: 4000000,
    status: MortgageStatus.NEW,
    monthlyIncome: 45000,
    creditScore: 880,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(0.1),
    notes: 'לקוח VIP, השאיר פרטים עכשיו.',
    documents: [],
    reminders: []
  },
  {
    id: '1013',
    firstName: 'מאיה',
    lastName: 'רום',
    phone: '053-9991113',
    email: 'maya@test.com',
    requestedAmount: 1300000,
    status: MortgageStatus.NEW,
    monthlyIncome: 15500,
    creditScore: 0,
    joinedDate: daysAgoDate(1),
    createdAt: hoursAgo(26),
    notes: 'ליד שנשכח, דחוף לטיפול.',
    documents: [],
    reminders: []
  },
  {
    id: '1014',
    firstName: 'אלון',
    lastName: 'מזרחי',
    phone: '054-1231234',
    email: 'alon@test.com',
    requestedAmount: 1900000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 20000,
    creditScore: 760,
    joinedDate: daysAgoDate(3),
    createdAt: hoursAgo(72),
    notes: '',
    documents: [],
    reminders: []
  },
  {
    id: '1015',
    firstName: 'תמר',
    lastName: 'גל',
    phone: '050-4567890',
    email: 'tamar@test.com',
    requestedAmount: 2100000,
    status: MortgageStatus.NEW,
    monthlyIncome: 23000,
    creditScore: 790,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(1.5),
    notes: 'מעוניינת בגרירת משכנתא.',
    documents: [],
    reminders: []
  },
  {
    id: '1016',
    firstName: 'בן',
    lastName: 'ארי',
    phone: '052-8765432',
    email: 'ben@test.com',
    requestedAmount: 1250000,
    status: MortgageStatus.APPROVED,
    monthlyIncome: 13500,
    creditScore: 730,
    joinedDate: daysAgoDate(12),
    createdAt: hoursAgo(288),
    notes: 'קיבל אישור עקרוני מבנק מזרחי.',
    documents: [],
    reminders: []
  },
  {
    id: '1017',
    firstName: 'שירה',
    lastName: 'לב',
    phone: '054-3456789',
    email: 'shira@test.com',
    requestedAmount: 1750000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 19000,
    creditScore: 755,
    joinedDate: daysAgoDate(6),
    createdAt: hoursAgo(144),
    notes: 'חסרים תלושי שכר של הבעל.',
    documents: [],
    reminders: []
  },
  {
    id: '1018',
    firstName: 'יוני',
    lastName: 'סלע',
    phone: '053-9871234',
    email: 'yoni@test.com',
    requestedAmount: 880000,
    status: MortgageStatus.PAID,
    monthlyIncome: 12000,
    creditScore: 715,
    joinedDate: daysAgoDate(60),
    createdAt: hoursAgo(1440),
    notes: 'משכנתא לדירה להשקעה בבאר שבע.',
    documents: [],
    reminders: []
  },
  {
    id: '1019',
    firstName: 'דנה',
    lastName: 'מור',
    phone: '050-1122334',
    email: 'dana@test.com',
    requestedAmount: 2800000,
    status: MortgageStatus.NEW,
    monthlyIncome: 31000,
    creditScore: 840,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(4),
    notes: 'פנייה דחופה, צריכה אישור תוך 48 שעות.',
    documents: [],
    reminders: []
  },
  {
    id: '1020',
    firstName: 'אסף',
    lastName: 'טל',
    phone: '052-4455667',
    email: 'asaf@test.com',
    requestedAmount: 1550000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 17500,
    creditScore: 725,
    joinedDate: daysAgoDate(4),
    createdAt: hoursAgo(96),
    notes: 'בתהליך שמאות.',
    documents: [],
    reminders: []
  },
  {
    id: '1021',
    firstName: 'ניר',
    lastName: 'שדה',
    phone: '052-1112233',
    email: 'nir@test.com',
    requestedAmount: 1850000,
    status: MortgageStatus.APPROVED,
    monthlyIncome: 22000,
    creditScore: 780,
    joinedDate: daysAgoDate(25),
    createdAt: hoursAgo(600),
    notes: 'משכנתא לנכס להשקעה בחיפה.',
    documents: [],
    reminders: []
  },
  {
    id: '1022',
    firstName: 'גלית',
    lastName: 'מור',
    phone: '054-6669999',
    email: 'galit@test.com',
    requestedAmount: 600000,
    status: MortgageStatus.REJECTED,
    monthlyIncome: 7500,
    creditScore: 520,
    joinedDate: daysAgoDate(5),
    createdAt: hoursAgo(120),
    notes: 'הכנסה לא מספקת ביחס להחזר החודשי.',
    documents: [],
    reminders: []
  },
  {
    id: '1023',
    firstName: 'אמיר',
    lastName: 'פרץ',
    phone: '050-9998877',
    email: 'amir@test.com',
    requestedAmount: 1450000,
    status: MortgageStatus.NEW,
    monthlyIncome: 16500,
    creditScore: 710,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(2),
    notes: 'פנה דרך הפייסבוק, מתעניין במשכנתא הפוכה.',
    documents: [],
    reminders: []
  },
  {
    id: '1024',
    firstName: 'רונית',
    lastName: 'אלבז',
    phone: '053-4445566',
    email: 'ronit@test.com',
    requestedAmount: 1100000,
    status: MortgageStatus.PAID,
    monthlyIncome: 14000,
    creditScore: 760,
    joinedDate: daysAgoDate(90),
    createdAt: hoursAgo(2160),
    notes: 'תיק סגור, הלקוחה מרוצה.',
    documents: [],
    reminders: []
  },
  {
    id: '1025',
    firstName: 'קובי',
    lastName: 'מלכה',
    phone: '052-7771111',
    email: 'kobi@test.com',
    requestedAmount: 2400000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 29000,
    creditScore: 815,
    joinedDate: daysAgoDate(7),
    createdAt: hoursAgo(168),
    notes: 'ממתינים לתוצאות שמאות.',
    documents: [],
    reminders: []
  },
  {
    id: '1026',
    firstName: 'הילה',
    lastName: 'רון',
    phone: '054-2228888',
    email: 'hila@test.com',
    requestedAmount: 1600000,
    status: MortgageStatus.APPROVED,
    monthlyIncome: 19500,
    creditScore: 795,
    joinedDate: daysAgoDate(14),
    createdAt: hoursAgo(336),
    notes: 'לקראת חתימות בבנק.',
    documents: [],
    reminders: []
  },
  {
    id: '1027',
    firstName: 'מתן',
    lastName: 'כהן',
    phone: '050-3336666',
    email: 'matan@test.com',
    requestedAmount: 3800000,
    status: MortgageStatus.NEW,
    monthlyIncome: 42000,
    creditScore: 890,
    joinedDate: daysAgoDate(0),
    createdAt: hoursAgo(0.2),
    notes: 'לקוח פרימיום, מעוניין בווילה בסביון.',
    documents: [],
    reminders: []
  },
  {
    id: '1028',
    firstName: 'ליאור',
    lastName: 'אשכנזי',
    phone: '053-1110000',
    email: 'lior@test.com',
    requestedAmount: 950000,
    status: MortgageStatus.REJECTED,
    monthlyIncome: 10000,
    creditScore: 580,
    joinedDate: daysAgoDate(3),
    createdAt: hoursAgo(72),
    notes: 'היסטוריית אשראי בעייתית (צ׳קים חוזרים).',
    documents: [],
    reminders: []
  },
  {
    id: '1029',
    firstName: 'קרן',
    lastName: 'פלג',
    phone: '052-5559999',
    email: 'keren@test.com',
    requestedAmount: 1300000,
    status: MortgageStatus.IN_PROCESS,
    monthlyIncome: 15000,
    creditScore: 740,
    joinedDate: daysAgoDate(10),
    createdAt: hoursAgo(240),
    notes: 'בודקים אפשרות לגרייס חלקי.',
    documents: [],
    reminders: []
  },
  {
    id: '1030',
    firstName: 'אבי',
    lastName: 'ביטון',
    phone: '054-8887777',
    email: 'avi@test.com',
    requestedAmount: 1950000,
    status: MortgageStatus.PAID,
    monthlyIncome: 21000,
    creditScore: 805,
    joinedDate: daysAgoDate(55),
    createdAt: hoursAgo(1320),
    notes: 'מחזור משכנתא בוצע בהצלחה.',
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Notification System State
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  
  // Delete Modal State
  const [clientToDeleteId, setClientToDeleteId] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Scroll Ref (Now used for individual component resets if needed, but less critical with sticky layout)
  // We can keep it to be safe, but the layout change is the main fix.
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to add notification
  const addSystemNotification = (title: string, message: string, clientId?: string) => {
      const newNotif: SystemNotification = {
          id: Date.now().toString(),
          title,
          message,
          timestamp: new Date().toISOString(),
          isRead: false,
          type: 'LEAD',
          clientId
      };
      setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
      setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- API Functions ---
  const fetchClients = async (silent = false) => {
    try {
      const response = await fetch('/api/clients');
      if (response.ok) {
        const data: Client[] = await response.json();
        
        // Smart Lead Detection
        if (silent && data.length > clients.length && clients.length > 0) {
            const newCount = data.length - clients.length;
            // Assuming new clients are added to the beginning (unshift on server)
            const newLeads = data.slice(0, newCount);
            
            newLeads.forEach(lead => {
                addSystemNotification(
                    'ליד חדש התקבל',
                    `${lead.firstName} ${lead.lastName} השאיר פרטים. טלפון: ${lead.phone}`,
                    lead.id
                );
            });
            
            showNotification(`🔔 התקבלו ${newCount} לידים חדשים!`);
        }

        setClients(data);
        setIsOfflineMode(false);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      if (!silent) {
          console.warn('Backend unavailable, switching to Offline Mode');
          setClients(FALLBACK_CLIENTS);
          setIsOfflineMode(true);
          showNotification('מצב הדגמה (Offline): הנתונים נטענו מקומית');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchClients();
  }, []);

  // --- POLLING FOR NEW LEADS (Every 30s) ---
  useEffect(() => {
    if (isOfflineMode) return;
    
    const intervalId = setInterval(() => {
        // Silent fetch to check updates
        fetchClients(true);
    }, 30000); 

    return () => clearInterval(intervalId);
  }, [isOfflineMode, clients]); // Use 'clients' dependency to compare lengths inside fetchClients

  // --- URL Query Param Listener ---
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
    setIsMobileMenuOpen(false);
  };

  const handleNotificationClick = (clientId?: string) => {
      if (clientId) {
          const client = clients.find(c => c.id === clientId);
          if (client) {
              handleClientSelect(client);
          }
      } else {
          setCurrentView(View.CLIENTS);
      }
  };

  const handleNavigation = (view: View) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const handleUpdateClient = async (updatedClient: Client) => {
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

  // Step 1: Request Delete (Opens Modal)
  const handleDeleteRequest = (clientId: string) => {
      setClientToDeleteId(clientId);
  };

  // Step 2: Confirm Delete (Executes Action)
  const executeDeleteClient = async () => {
    if (!clientToDeleteId) return;

    const clientId = clientToDeleteId;
    const clientToDelete = clients.find(c => c.id === clientId);
    
    // Optimistic delete
    setClients(prev => prev.filter(c => c.id !== clientId));

    // If we are viewing the deleted client, go back to list
    if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient(null);
        setCurrentView(View.CLIENTS);
    }

    setClientToDeleteId(null); // Close modal
    showNotification(`הלקוח ${clientToDelete?.firstName || ''} נמחק בהצלחה`);

    if (!isOfflineMode) {
        try {
            await fetch(`/api/clients/${clientId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Delete failed, working locally');
            setIsOfflineMode(true);
        }
    }
  };

  const handleAddClient = async (newClient: Client, fromLink = false) => {
    setClients(prev => [newClient, ...prev]);
    
    if (fromLink) {
        // Notification is added via fetch logic if persistent, but here it's immediate
        addSystemNotification('ליד חדש (קישור)', `נקלט לקוח: ${newClient.firstName} ${newClient.lastName}`, newClient.id);
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

  const simulateBotWebhook = async (customData?: any) => {
    let payload;

    if (customData) {
        payload = {
            firstName: customData.firstName,
            lastName: customData.lastName,
            phone: customData.phone,
            email: customData.email || 'manual@test.com',
            requestedAmount: Number(customData.amount),
            source: 'manual_dashboard_simulation',
            notes: 'בדיקה ידנית מהמערכת'
        };
    } else {
        const fakeNames = ['רונית', 'יוסי', 'עומר', 'דניאל', 'נועה'];
        const fakeLastNames = ['חדד', 'אזולאי', 'פרידמן', 'גולן', 'ביטון'];
        const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        const randomLastName = fakeLastNames[Math.floor(Math.random() * fakeLastNames.length)];
        
        payload = {
            firstName: randomName,
            lastName: randomLastName,
            phone: `05${Math.floor(Math.random() * 9)}-${Math.floor(Math.random() * 8999999 + 1000000)}`,
            email: 'lead@whatsapp-bot.com',
            requestedAmount: Math.floor(Math.random() * 15) * 100000 + 500000,
            source: 'whatsapp_bot_simulation'
        };
    }

    console.log('Simulating webhook...', payload);

    let success = false;
    
    if (!isOfflineMode) {
        try {
            const res = await fetch('/api/webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                success = true;
                showNotification(customData ? `✅ נשלח בהצלחה!` : `🤖 הבוט שלח ליד!`);
                fetchClients(true); // Silent fetch to trigger notification logic
            }
        } catch (e) {
            console.warn('Webhook server unreachable');
        }
    }

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
            notes: payload.notes || 'ליד נקלט בסימולציה (מצב מקומי)'
        };
        
        setClients(prev => [newClient, ...prev]);
        addSystemNotification('ליד חדש (סימולציה)', `${payload.firstName} נקלט בהצלחה במערכת`, newClient.id);
        showNotification(`🤖 (מקומי) ליד נוצר: ${payload.firstName} ${payload.lastName}`);
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
        return (
            <ClientList 
                clients={clients} 
                onSelectClient={handleClientSelect} 
                onDeleteClient={handleDeleteRequest}
            />
        );
      case View.CLIENT_DETAIL:
        return selectedClient ? (
          <ClientDetail 
            client={selectedClient} 
            onBack={() => setCurrentView(View.CLIENTS)} 
            onUpdateClient={handleUpdateClient}
            onDeleteClient={handleDeleteRequest}
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
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden" dir="rtl">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 left-6 z-[70] bg-slate-800 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce-in flex items-center gap-3 max-w-[90vw] cursor-pointer" onClick={() => setNotification(null)}>
          <MessageCircle className="text-green-400 shrink-0" />
          <div>
            <p className="font-semibold text-sm">עדכון מערכת</p>
            <p className="text-sm opacity-90">{notification}</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDeleteId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="bg-red-50 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">מחיקת לקוח</h3>
                    <p className="text-slate-500 text-sm">
                        האם אתה בטוח שברצונך למחוק את הלקוח?
                        <br/>
                        פעולה זו אינה הפיכה והמידע יאבד.
                    </p>
                </div>
                <div className="p-4 flex gap-3 bg-white">
                    <button 
                        onClick={() => setClientToDeleteId(null)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        ביטול
                    </button>
                    <button 
                        onClick={executeDeleteClient}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 shadow-lg shadow-red-200 transition-colors"
                    >
                        כן, מחק
                    </button>
                </div>
             </div>
          </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 right-0 z-30 w-64 bg-white border-l border-slate-200 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:shadow-lg ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg transform rotate-3 transition-transform hover:rotate-0 group shrink-0">
                <span className="font-black text-2xl italic pr-1 font-serif group-hover:scale-110 transition-transform">1</span>
            </div>
            <div className="flex flex-col">
                <h1 className="font-bold text-lg leading-tight text-slate-800">
                <span className="text-blue-600">וואן</span> משכנתאות
                </h1>
            </div>
          </div>
          {/* Close Button Mobile */}
          <button 
            className="md:hidden text-slate-400 hover:text-slate-600 p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="דשבורד ראשי" 
            isActive={currentView === View.DASHBOARD} 
            onClick={() => handleNavigation(View.DASHBOARD)} 
          />
          <SidebarItem 
            icon={<Users size={20} />} 
            label="ניהול לקוחות" 
            isActive={currentView === View.CLIENTS || currentView === View.CLIENT_DETAIL} 
            onClick={() => handleNavigation(View.CLIENTS)} 
          />
          <SidebarItem 
            icon={<UserPlus size={20} />} 
            label="הוסף לקוח ידנית" 
            isActive={currentView === View.ADD_CLIENT} 
            onClick={() => handleNavigation(View.ADD_CLIENT)} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="הגדרות וחיבורים" 
            isActive={currentView === View.SETTINGS} 
            onClick={() => handleNavigation(View.SETTINGS)} 
          />
          
          <div className="pt-6 mt-6 border-t border-slate-100">
             <p className="text-xs font-semibold text-slate-400 px-3 mb-2">סימולציות ואינטגרציות</p>
             <button 
               onClick={() => {
                   simulateBotWebhook();
                   if (window.innerWidth < 768) setIsMobileMenuOpen(false);
               }}
               className="w-full flex items-center gap-3 p-3 rounded-xl text-green-600 hover:bg-green-50 transition-all duration-200"
             >
               <Bot size={20} />
               <span>הדמיית ליד מהבוט</span>
             </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50">
           <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${isOfflineMode ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />}
              {isOfflineMode ? 'מצב לא מקוון' : 'מחובר לשרת'}
           </div>

           <button 
             onClick={handleExportData}
             className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
           >
             <Download size={18} />
             <span className="text-sm font-medium">שמור/ייצא נתונים</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-50">
        
        {/* Universal Header (Mobile & Desktop) */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
             <div className="flex items-center gap-3 md:hidden">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center text-white shadow-md">
                    <span className="font-black text-xl italic pr-0.5 font-serif">1</span>
                </div>
                <div>
                   <div className="font-bold text-blue-900 text-base leading-none">וואן משכנתאות</div>
                </div>
             </div>
             
             {/* Desktop Title / Breadcrumb (Visible on MD+) */}
             <div className="hidden md:block">
                <h2 className="text-lg font-bold text-slate-800">
                    {currentView === View.DASHBOARD && 'סקירת מצב כללית'}
                    {currentView === View.CLIENTS && 'רשימת לקוחות'}
                    {currentView === View.CLIENT_DETAIL && 'תיק לקוח'}
                    {currentView === View.ADD_CLIENT && 'הקמת לקוח'}
                    {currentView === View.SETTINGS && 'הגדרות מערכת'}
                </h2>
             </div>

             <div className="flex items-center gap-3">
                <NotificationCenter 
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={markNotificationAsRead}
                    onClearAll={clearAllNotifications}
                    onNotificationClick={handleNotificationClick}
                />
                <button 
                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors md:hidden" 
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <Menu size={24}/>
                </button>
             </div>
        </header>

        {/* 
            CHANGED SCROLL BEHAVIOR:
            Old: overflow-y-auto on this container.
            New: overflow-hidden. Components inside renderContent are responsible for their own internal scrolling.
        */}
        <div className="flex-1 overflow-hidden bg-slate-50 relative flex flex-col">
           <div className="flex-1 h-full w-full max-w-7xl mx-auto flex flex-col overflow-hidden">
               {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
}