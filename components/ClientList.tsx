import React, { useState } from 'react';
import { Client, MortgageStatus } from '../types';
import { Search, Filter, ChevronLeft, Phone, Calendar, ArrowRight, Trash2, SlidersHorizontal, X, UserPlus } from 'lucide-react';

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
      case MortgageStatus.APPROVED: return 'bg-emerald-100 text-emerald-700';
      case MortgageStatus.REJECTED: return 'bg-red-100 text-red-700';
      case MortgageStatus.IN_PROCESS: return 'bg-amber-100 text-amber-800';
      case MortgageStatus.NEW: return 'bg-slate-100 text-slate-700';
      case MortgageStatus.PAID: return 'bg-blue-100 text-blue-700';
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
    <div className="flex flex-col h-full animate-fade-in max-w-full overflow-hidden">
      {/* Header Section (Fixed) */}
      <div className="shrink-0 p-4 md:p-6 pb-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900 self-start sm:self-auto">ניהול לקוחות</h2>
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">{filteredClients.length}</span>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial w-full sm:w-64">
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="חיפוש שם או טלפון..." 
                      className="pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 w-full bg-white text-slate-800 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-colors shrink-0 ${showFilters || activeFiltersCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <SlidersHorizontal size={18} />
                    <span className="hidden sm:inline">סינון</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                  </button>
                </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-fade-in-down mb-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">סטטוס</label>
                            <div className="relative">
                                <Filter className="absolute right-3 top-2.5 text-slate-400" size={16} />
                                <select 
                                    className="w-full pl-4 pr-9 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 appearance-none text-sm"
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
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 text-sm"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-500 mb-1 block">עד תאריך</label>
                            <input 
                                type="date" 
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 text-sm"
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
                                    className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 text-sm"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                 />
                                 <input 
                                    type="number" 
                                    placeholder="עד" 
                                    className="w-1/2 px-2 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white text-slate-800 text-sm"
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
      </div>

      {/* Content Section (Scrollable) */}
      <div className="flex-1 overflow-hidden p-4 md:p-6 pt-0">
          
          {/* Desktop Table View */}
          <div className="hidden md:flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-right relative border-collapse">
                <thead className="bg-slate-50 text-slate-600 text-sm font-semibold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white first:rounded-tr-xl">שם הלקוח</th>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white">טלפון</th>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white">סכום מבוקש</th>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white">הכנסה חודשית</th>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white">תאריך הצטרפות</th>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white">סטטוס</th>
                    <th className="p-4 whitespace-nowrap bg-slate-900 text-white last:rounded-tl-xl">פעולה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClients.map((client, index) => (
                    <tr 
                        key={client.id} 
                        className={`hover:bg-amber-50/50 transition-colors group cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                        onClick={() => onSelectClient(client)}
                    >
                      <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                             {client.firstName[0]}
                         </div>
                         {client.firstName} {client.lastName}
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-sm">{client.phone}</td>
                      <td className="p-4 text-slate-800 font-medium">₪{client.requestedAmount.toLocaleString()}</td>
                      <td className="p-4 text-slate-600">₪{client.monthlyIncome.toLocaleString()}</td>
                      <td className="p-4 text-slate-500 text-sm">{formatDate(client.joinedDate)}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-md text-xs font-bold border ${getStatusColor(client.status).replace('bg-', 'border-').replace('text-', 'text-')} bg-opacity-10`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2">
                        <button 
                            className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-50 transition-colors"
                            title="צפה בפרטים"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={(e) => handleDelete(e, client.id)}
                            className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="מחק לקוח"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                   <UserPlus size={48} className="mb-4 opacity-20" />
                   <p className="text-lg font-medium text-slate-500">לא נמצאו לקוחות</p>
                   <p className="text-sm">נסה לשנות את תנאי הסינון או הוסף לקוח חדש</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Card View (Scrollable) */}
          <div className="md:hidden h-full overflow-y-auto custom-scrollbar pb-20 space-y-3">
            {filteredClients.length === 0 ? (
               <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-100">
                 לא נמצאו לקוחות התואמים את החיפוש.
               </div>
            ) : (
              filteredClients.map(client => (
                <div 
                  key={client.id}
                  onClick={() => onSelectClient(client)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden"
                >
                   {/* Left Accent Border */}
                   <div className={`absolute right-0 top-0 bottom-0 w-1 ${getStatusColor(client.status).split(' ')[0]}`}></div>
                   
                   <div className="flex justify-between items-start mb-3 gap-2 pr-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-lg truncate">{client.firstName} {client.lastName}</h3>
                        <p className="text-xs text-slate-400">#{client.id}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={(e) => handleDelete(e, client.id)}
                            className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                          >
                             <Trash2 size={18} />
                          </button>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-slate-600 pr-3">
                      <div className="flex items-center gap-2 min-w-0">
                         <Phone size={14} className="text-slate-400 shrink-0" />
                         <span className="truncate font-mono">{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                         <Calendar size={14} className="text-slate-400 shrink-0" />
                         <span className="truncate">{formatDate(client.joinedDate)}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-50 flex justify-between items-center">
                         <div className="flex flex-col">
                             <span className="text-[10px] text-slate-400 uppercase font-bold">סכום מבוקש</span>
                             <span className="font-bold text-slate-800 text-base">₪{client.requestedAmount.toLocaleString()}</span>
                         </div>
                         <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(client.status).replace('bg-', 'border-').replace('text-', 'text-')} bg-white`}>
                              {client.status}
                         </span>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
      </div>
    </div>
  );
};