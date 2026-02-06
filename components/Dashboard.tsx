import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Client, MortgageStatus } from '../types';
import { Users, FileCheck, TrendingUp, AlertCircle, CreditCard, Percent, Activity } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const trendData = [
  { month: 'ינואר', leads: 4, sales: 2400 },
  { month: 'פברואר', leads: 7, sales: 1398 },
  { month: 'מרץ', leads: 5, sales: 9800 },
  { month: 'אפריל', leads: 12, sales: 3908 },
  { month: 'מאי', leads: 18, sales: 4800 },
  { month: 'יוני', leads: 24, sales: 3800 },
];

export const Dashboard: React.FC<DashboardProps> = ({ clients }) => {

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


  // Data for Charts
  const statusCounts = Object.values(MortgageStatus).map(status => ({
    name: status,
    value: clients.filter(c => c.status === status).length
  })).filter(item => item.value > 0);

  const incomeVsLoanData = clients.slice(0, 7).map(c => ({
    name: c.firstName,
    הכנסה: c.monthlyIncome,
    משכנתא: c.requestedAmount / 100 // Scaled down for visualization
  }));

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

  return (
    <div className="p-6 space-y-8 animate-fade-in pb-20">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard
          title="סה״כ לקוחות"
          value={totalClients.toString()}
          trend="+12% החודש"
          icon={<Users className="text-blue-600" size={24} />}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
        />
        <KpiCard
          title="תיקים פעילים"
          value={activeProcesses.toString()}
          trend="יציב"
          icon={<TrendingUp className="text-emerald-600" size={24} />}
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <KpiCard
          title="נפח עסקאות שאושר"
          value={`₪${(approvedVolume / 1000000).toFixed(1)}M`}
          trend="+5% החודש"
          icon={<FileCheck className="text-purple-600" size={24} />}
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <KpiCard
          title="מסמכים ממתינים לחתימה"
          value={pendingDocs.toString()}
          trend="נדרשת פעולה"
          trendColor="text-orange-500"
          icon={<AlertCircle className="text-orange-600" size={24} />}
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
        <KpiCard
          title="דירוג אשראי ממוצע"
          value={avgCreditScore.toString()}
          trend="גבוה מהממוצע"
          icon={<CreditCard className="text-indigo-600" size={24} />}
          bgColor="bg-indigo-50"
          textColor="text-indigo-600"
        />
        <KpiCard
          title="אחוז אישורים"
          value={`${approvalRate}%`}
          trend="מתוך תיקים סגורים"
          icon={<Percent className="text-teal-600" size={24} />}
          bgColor="bg-teal-50"
          textColor="text-teal-600"
        />
      </div>

      {/* Main Trend Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" />
                מגמת גיוס לקוחות (חצי שנה אחרונה)
            </h3>
        </div>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
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
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">התפלגות סטטוס תיקים</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCounts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">יחס הכנסה למשכנתא (מדגם לקוחות)</h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeVsLoanData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Bar dataKey="הכנסה" fill="#818cf8" name="הכנסה חודשית" radius={[4, 4, 0, 0]} />
                <Bar dataKey="משכנתא" fill="#34d399" name="משכנתא (באלפים / 100)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, trend, trendColor = 'text-green-500', icon, bgColor, textColor }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bgColor} ${textColor}`}>
            {icon}
        </div>
        {trend && (
             <span className={`text-xs font-medium px-2 py-1 rounded-full bg-slate-50 ${trendColor}`}>
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