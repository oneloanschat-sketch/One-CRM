import React, { useState } from 'react';
import { Client, MortgageStatus } from '../types';
import { Search, Filter, ChevronLeft, Phone, Calendar, ArrowRight, Trash2, SlidersHorizontal, X } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onDeleteClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Advanced Filters State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const filteredClients = clients.filter(client => {
    // 1. Text Search
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchLower) || client.phone.includes(searchLower);
    
    // 2. Status Filter
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    
    // 3. Date Range Filter
    let matchesDate = true;
    if (fromDate) matchesDate = matchesDate && client.joinedDate >= fromDate;
    if (toDate) matchesDate = matchesDate && client.joinedDate <= toDate;

    // 4. Amount Range Filter
    let matchesAmount = true;
    if (minAmount) matchesAmount = matchesAmount && client.requestedAmount >= Number(minAmount);
    if (maxAmount) matchesAmount = matchesAmount && client.requestedAmount <= Number(maxAmount);

    return matchesSearch && matchesStatus && matchesDate && matchesAmount;
  });

  const getStatusColor = (status: MortgageStatus) => {
    switch (status) {
      case MortgageStatus.APPROVED: return 'bg-green-100 text-green-700';
      case MortgageStatus.REJECTED: return 'bg-red-100 text-red-700';
      case MortgageStatus.IN_PROCESS: return 'bg-blue-100 text-blue-700';
      case MortgageStatus.NEW: return 'bg-purple-100 text-purple-700';
      case MortgageStatus.PAID: return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDelete = (e: React.MouseEvent, clientId: string) => {
      e.stopPropagation();
      onDeleteClient(clientId);
  };

  const formatDate = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`; // Convert YYYY-MM-DD to DD-MM-YYYY
      }
      return dateStr;
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    fromDate !== '',
    toDate !== '',
    minAmount !== '',
    maxAmount !== ''
  ].filter(Boolean).length;

  return (
    <div className="p-4 md:p-6 animate-fade-in pb-20">
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 self-start sm:self-auto">ניהול לקוחות</h2>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
                <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="חיפוש שם או טלפון..." 
                  className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white text-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showFilters || activeFiltersCount > 0 ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden sm:inline">סינון מתקדם</span>
                {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {activeFiltersCount}
                    </span>
                )}
              </button>
            </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in-down">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Status Filter */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">סטטוס</label>
                        <div className="relative">
                            <Filter className="absolute right-3 top-2.5 text-slate-400" size={16} />
                            <select 
                                className="w-full pl-4 pr-9 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 appearance-none text-sm"
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

                    {/* Date Range */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">מתאריך</label>
                        <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-sm"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">עד תאריך</label>
                        <input 
                            type="date" 
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-sm"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>

                    {/* Amount Range */}
                    <div>
                         <label className="text-xs font-semibold text-slate-500 mb-1 block">טווח סכומים (₪)</label>
                         <div className="flex gap-2">
                             <input 
                                type="number" 
                                placeholder="מ-" 
                                className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-sm"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                             />
                             <input 
                                type="number" 
                                placeholder="עד" 
                                className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-800 text-sm"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                             />
                         </div>
                    </div>
                </div>
                
                <div className="flex justify-end mt-4 pt-3 border-t border-slate-50">
                    <button 
                        onClick={clearFilters}
                        className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <X size={14} /> נקה סינון
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
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
                  <td className="p-4 text-slate-500">{formatDate(client.joinedDate)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4 flex items-center gap-2">
                    <button 
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                        title="צפה בפרטים"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={(e) => handleDelete(e, client.id)}
                        className="text-slate-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="מחק לקוח"
                    >
                      <Trash2 size={18} />
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredClients.length === 0 ? (
           <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">
             לא נמצאו לקוחות התואמים את החיפוש.
           </div>
        ) : (
          filteredClients.map(client => (
            <div 
              key={client.id}
              onClick={() => onSelectClient(client)}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer relative"
            >
               <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{client.firstName} {client.lastName}</h3>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                      <button 
                        onClick={(e) => handleDelete(e, client.id)}
                        className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                      >
                         <Trash2 size={18} />
                      </button>
                      <div className="bg-slate-50 p-2 rounded-full text-slate-400">
                        <ArrowRight size={18} className="rotate-180" />
                      </div>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                     <Phone size={14} className="text-slate-400" />
                     {client.phone}
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar size={14} className="text-slate-400" />
                     {formatDate(client.joinedDate)}
                  </div>
                  <div className="col-span-2 mt-1 pt-2 border-t border-slate-50 flex justify-between items-center">
                     <span className="text-slate-400 text-xs">סכום מבוקש:</span>
                     <span className="font-bold text-slate-800">₪{client.requestedAmount.toLocaleString()}</span>
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};