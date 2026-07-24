import React from 'react';
import { Bell, X, CheckCircle2, XCircle, Info, AlertCircle, Check } from 'lucide-react';
import { Notification } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-slate-50/50';
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-100';
      case 'error':
        return 'bg-red-50 border-red-100';
      case 'warning':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-16 right-4 w-96 max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-600" />
            <h3 className="font-display text-base font-bold text-slate-900">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mark All as Read */}
        {unreadCount > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={onMarkAllAsRead}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Tümünü Okundu İşaretle
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Henüz bildirim yok</p>
              <p className="text-xs text-slate-400 mt-1">Yeni bildirimler burada görünecek</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative rounded-xl border p-3.5 transition-all ${getBgColor(notification.type, notification.isRead)} ${!notification.isRead ? 'shadow-sm' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight mb-1">
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.relatedCompany && (
                      <p className="text-[10px] font-semibold text-emerald-600 mt-1.5">
                        {notification.relatedCompany}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {notification.createdAt}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => onMarkAsRead(notification.id)}
                      className="shrink-0 text-slate-400 hover:text-emerald-600 rounded-full p-1 hover:bg-white transition"
                      title="Okundu işaretle"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
