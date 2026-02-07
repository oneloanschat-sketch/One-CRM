import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, Label
} from 'recharts';
import { Client, MortgageStatus } from '../types';
import { Users, FileCheck, TrendingUp, AlertCircle, CreditCard, Percent, Activity } from 'lucide-react';
import { KpiDrillDownModal } from './KpiDrillDownModal';

interface DashboardProps {
  clients: Client[];
  onClientSelect: (client: Client) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type KpiType = 'TOTAL' | 'ACTIVE' | 'VOLUME' | 'DOCS' | 'CREDIT' | 'RATES' | null;

export const Dashboard: React.FC<DashboardProps> = ({ clients, onClientSelect }) => {
  const [selectedKpi, setSelectedKpi] = useState<KpiType>(null);
  const [customDrillDown, setCustomDrillDown] = useState<{title: string, data: Client[], type: any} | null>(null);

  // KPI Calculations
  const totalClients = clients.length;
  const activeProcesses = clients.filter(c => c.status === MortgageStatus.IN_PROCESS || c.status === MortgageStatus.NEW).length;
  const approvedVolume = clients
    .filter(c => c.status === MortgageStatus.APPROVED)
    .reduce((acc, curr) => acc + curr.requestedAmount, 0);

  const pendingDocs = clients.reduce((acc, c) => acc + c.documents.filter(d => !d.isSigned).length, 0);

  const avgCreditScore = clients.length > 0
    ? Math.round(clients.reduce((acc, c) => acc + c.creditScore, 0) / clients.length)
    : 0;

  const decidedClients = clients.filter(c => c.status === MortgageStatus.APPROVED || c.status === MortgageStatus.REJECTED).length;
  const approvalRate = decidedClients > 0
    ? Math.round((clients.filter(c => c.status === MortgageStatus.APPROVED).length / decidedClients) * 100)
    : 0;


  // --- Dynamic Data for Charts ---

  // 1. Dynamic Trend Data (Group by Month)
  const trendData = useMemo(() => {
    const monthsMap = new Map<string, { month: string, leads: number, sortKey: number }>();
    const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    clients.forEach(client => {
      const date = new Date(client.joinedDate);
      if (!isNaN(date.getTime())) {
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];
        
        if (!monthsMap.has(monthName)) {
            monthsMap.set(monthName, { month: monthName, leads: 0, sortKey: monthIndex });
        }
        const current = monthsMap.get(monthName)!;
        current.leads += 1;
      }
    });

    // Fill in at least some data if empty to show the graph structure or ensure specific months exist
    if (monthsMap.size === 0) {
        return [
            { month: 'ינואר', leads: 0 },
            { month: 'פברואר', leads: 0 },
            { month: 'מרץ', leads: 0 },
        ];
    }

    return Array.from(monthsMap.values()).sort((a, b) => a.sortKey - b.sortKey);
  }, [clients]);

  // 2. Status Counts for Pie Chart
  const statusCounts = Object.values(MortgageStatus).map(status => ({
    name: status,
    value: clients.filter(c => c.status === status).length
  })).filter(item => item.value > 0);

  // 3. Bar Chart Data
  const incomeVsLoanData = clients.slice(0, 7).map(c => ({
    name: c.firstName + ' ' + c.lastName,
    fullName: c.firstName + ' ' + c.lastName, // For tooltip
    clientId: c.id, // For click handler
    הכנסה: c.monthlyIncome,
    משכנתא: c.requestedAmount / 100 // Scaled down for visualization
  }));

  // --- Handlers ---

  const handleAreaChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
        const monthName = data.activePayload[0].payload.month;
        const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        const monthIndex = monthNames.indexOf(monthName);
        
        if (monthIndex >= 0) {
            const relevantClients = clients.filter(c => {
                const d = new Date(c.joinedDate);
                return d.getMonth() === monthIndex;
            });
            setCustomDrillDown({
                title: `מצטרפים חדשים - חודש ${monthName}`,
                data: relevantClients,
                type: 'TOTAL'
            });
        }
    }
  };

  const handlePieChartClick = (data: any) => {
      // Recharts passes the clicked cell data differently depending on version, 
      // sometimes directly or via event. We check 'name' or 'payload.name'.
      const statusName = data?.name || data?.payload?.name;
      if (statusName) {
          const relevantClients = clients.filter(c => c.status === statusName);
          setCustomDrillDown({
              title: `לקוחות בסטטוס: ${statusName}`,
              data: relevantClients,
              type: 'ACTIVE'
          });
      }
  };

  const handleBarChartClick = (data: any) => {
      if (data && data.activePayload && data.activePayload.length > 0) {
          const payload = data.activePayload[0].payload;
          const client = clients.find(c => c.id === payload.clientId);
          if (client) {
              onClientSelect(client);
          }
      }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl text-right dir-rtl">
          <p className="font-bold text-slate-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-500">{entry.name}:</span>
              <span className="font-semibold text-slate-700">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Helper to filter clients for the modal based on selected KPI
  const getModalData = () => {
    if (customDrillDown) return customDrillDown;

    switch (selectedKpi) {
        case 'TOTAL':
            return { title: 'כל הלקוחות במערכת', data: clients, type: 'TOTAL' as const };
        case 'ACTIVE':
            return { 
                title: 'תיקים בתהליך פעיל', 
                data: clients.filter(c => c.status === MortgageStatus.IN_PROCESS || c.status === MortgageStatus.NEW),
                type: 'ACTIVE' as const
            };
        case 'VOLUME':
            return { 
                title: 'תיקים שאושרו (נפח עסקאות)', 
                data: clients.filter(c => c.status === MortgageStatus.APPROVED),
                type: 'VOLUME' as const
            };
        case 'DOCS':
            return { 
                title: 'לקוחות עם מסמכים לחתימה', 
                data: clients.filter(c => c.documents.some(d => !d.isSigned)),
                type: 'DOCS' as const
            };
        case 'CREDIT':
            return { 
                title: 'דירוג אשראי לקוחות', 
                data: [...clients].sort((a, b) => b.creditScore - a.creditScore),
                type: 'CREDIT' as const
            };
        case 'RATES':
            return { 
                title: 'לקוחות בסטטוס סופי (אושר/נדחה)', 
                data: clients.filter(c => c.status === MortgageStatus.APPROVED || c.status === MortgageStatus.REJECTED),
                type: 'RATES' as const
            };
        default:
            return { title: '', data: [], type: 'TOTAL' as const };
    }
  };

  const modalInfo = getModalData();
  const showModal = selectedKpi !== null || customDrillDown !== null;

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20 relative">
      
      {/* Modal Drill Down */}
      {showModal && (
          <KpiDrillDownModal 
            title={modalInfo.title}
            clients={modalInfo.data}
            type={modalInfo.type}
            onClose={() => {
                setSelectedKpi(null);
                setCustomDrillDown(null);
            }}
            onClientSelect={onClientSelect}
          />
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="סה״כ לקוחות"
          value={totalClients.toString()}
          trend="צפה בכולם"
          icon={<Users className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          onClick={() => setSelectedKpi('TOTAL')}
        />
        <KpiCard
          title="תיקים פעילים"
          value={activeProcesses.toString()}
          trend="טיפול נדרש"
          icon={<TrendingUp className="text-emerald-600" size={24} />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
          onClick={() => setSelectedKpi('ACTIVE')}
        />
        <KpiCard
          title="נפח עסקאות שאושר"
          value={`₪${(approvedVolume / 1000000).toFixed(1)}M`}
          trend="הצטברות שנתית"
          icon={<FileCheck className="text-purple-600" size={24} />}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
          onClick={() => setSelectedKpi('VOLUME')}
        />
        <KpiCard
          title="מסמכים ממתינים לחתימה"
          value={pendingDocs.toString()}
          trend="דחוף"
          trendColor="text-orange-500 bg-orange-100"
          icon={<AlertCircle className="text-orange-600" size={24} />}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
          onClick={() => setSelectedKpi('DOCS')}
        />
        <KpiCard
          title="דירוג אשראי ממוצע"
          value={avgCreditScore.toString()}
          trend="איכות תיק"
          icon={<CreditCard className="text-indigo-600" size={24} />}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
          onClick={() => setSelectedKpi('CREDIT')}
        />
        <KpiCard
          title="אחוז אישורים"
          value={`${approvalRate}%`}
          trend="יחס המרה"
          icon={<Percent className="text-teal-600" size={24} />}
          bgColor="bg-teal-50"
          textColor="text-teal-600"
          onClick={() => setSelectedKpi('RATES')}
        />
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 cursor-pointer transition-shadow hover:shadow-md">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                מגמת גיוס לקוחות (לפי חודשי הצטרפות)
            </h3>
        </div>
        {/* Added min-w-0 to prevent Recharts resize warning */}
        <div className="h-64 w-full min-w-0" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
                data={trendData} 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                onClick={handleAreaChartClick}
            >
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="leads"
                name="לקוחות חדשים"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorLeads)"
                activeDot={{ r: 8 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">התפלגות סטטוס תיקים</h3>
          {/* Added min-w-0 to prevent Recharts resize warning */}
          <div className="h-80 w-full min-w-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={handlePieChartClick}
                  className="cursor-pointer focus:outline-none"
                  label={({ name, percent }: any) => `${name} ${(percent ? percent * 100 : 0).toFixed(0)}%`}
                  labelLine={true}
                >
                  {statusCounts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                  ))}
                  
                  {/* Total in Center */}
                  <Label 
                    value={totalClients} 
                    position="center" 
                    className="text-3xl font-bold fill-slate-800"
                    dy={-5}
                  />
                  <Label 
                    value="תיקים" 
                    position="center" 
                    className="text-sm fill-slate-400 font-medium" 
                    dy={20}
                  />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">יחס הכנסה למשכנתא (מדגם לקוחות)</h3>
          {/* Added min-w-0 to prevent Recharts resize warning */}
          <div className="h-80 w-full min-w-0" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeVsLoanData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={20}
                onClick={handleBarChartClick}
                className="cursor-pointer"
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11}} interval={0} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Bar dataKey="הכנסה" fill="#818cf8" name="הכנסה חודשית" radius={[4, 4, 0, 0]} className="hover:opacity-80" />
                <Bar dataKey="משכנתא" fill="#34d399" name="משכנתא (באלפים / 100)" radius={[4, 4, 0, 0]} className="hover:opacity-80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, trend, trendColor = 'text-green-600 bg-green-50', icon, bgColor, textColor, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-lg hover:border-blue-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgColor} ${textColor} group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        {trend && (
             <span className={`text-xs font-medium px-2 py-1 rounded-full ${trendColor}`}>
                {trend}
             </span>
        )}
    </div>
    <div>
      <h4 className="text-3xl font-bold text-slate-800 mb-1">{value}</h4>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
    </div>
  </div>
);