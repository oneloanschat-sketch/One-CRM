import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { SystemNotification } from '../types';

interface NotificationCenterProps {
  notifications: SystemNotification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onNotificationClick: (clientId?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onClearAll,
  onNotificationClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (notification: SystemNotification) => {
      onMarkAsRead(notification.id);
      if (notification.clientId) {
          onNotificationClick(notification.clientId);
          setIsOpen(false);
      }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors relative"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden origin-top-left animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
                <h3 className="font-bold text-slate-800">התראות</h3>
                <p className="text-xs text-slate-500">
                    {unreadCount > 0 ? `יש לך ${unreadCount} עדכונים חדשים` : 'אין עדכונים חדשים'}
                </p>
            </div>
            {notifications.length > 0 && (
                <button 
                    onClick={onClearAll}
                    className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                    <Trash2 size={12} /> נקה הכל
                </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">אין התראות כרגע</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-50">
                    {notifications.map(n => (
                        <div 
                            key={n.id} 
                            onClick={() => handleItemClick(n)}
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                        >
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                            <div className="flex-1">
                                <h4 className={`text-sm ${!n.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                    {n.title}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    {n.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-2 block">
                                    {new Date(n.timestamp).toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})} • {new Date(n.timestamp).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            {!n.isRead && (
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkAsRead(n.id);
                                    }}
                                    className="self-start text-slate-300 hover:text-blue-500 p-1"
                                    title="סמן כנקרא"
                                >
                                    <Check size={14} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};