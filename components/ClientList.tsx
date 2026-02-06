import React, { useState } from 'react';
import { Client, MortgageStatus } from '../types';
import { Search, Filter, ChevronLeft } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = `${client.firstName} ${client.lastName}`.includes(searchTerm) || client.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: MortgageStatus) => {
    switch (status) {
      case MortgageStatus.APPROVED: return 'bg-green-100 text-green-700';
      case MortgageStatus.REJECTED: return 'bg-red-100 text-red-700';
      case MortgageStatus.IN_PROCESS: return 'bg-blue-100 text-blue-700';
      case MortgageStatus.NEW: return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800">ניהול לקוחות</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="חיפוש לפי שם או טלפון..." 
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute right-3 top-2.5 text-slate-400" size={18} />
            <select 
              className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-slate-800 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">כל הסטטוסים</option>
              {Object.values(MortgageStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-600 text-sm font-semibold">
              <tr>
                <th className="p-4">שם הלקוח</th>
                <th className="p-4">טלפון</th>
                <th className="p-4">סכום מבוקש</th>
                <th className="p-4">הכנסה חודשית</th>
                <th className="p-4">תאריך הצטרפות</th>
                <th className="p-4">סטטוס</th>
                <th className="p-4">פעולה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => onSelectClient(client)}>
                  <td className="p-4 font-medium text-slate-800">{client.firstName} {client.lastName}</td>
                  <td className="p-4 text-slate-500">{client.phone}</td>
                  <td className="p-4 text-slate-700">₪{client.requestedAmount.toLocaleString()}</td>
                  <td className="p-4 text-slate-700">₪{client.monthlyIncome.toLocaleString()}</td>
                  <td className="p-4 text-slate-500">{client.joinedDate}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50">
                      <ChevronLeft size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            לא נמצאו לקוחות התואמים את החיפוש.
          </div>
        )}
      </div>
    </div>
  );
};