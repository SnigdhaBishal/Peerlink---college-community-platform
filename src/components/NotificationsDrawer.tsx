import React from 'react';
import { NotificationItem } from '../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="bg-surface w-full max-w-sm h-full p-6 shadow-2xl flex flex-col border-l border-surface-variant animate-in slide-in-from-right duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-surface-variant">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Campus Signals</h3>
          </div>
          <button onClick={onClose} className="text-outline p-1 rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {notifications.length === 0 ? (
            <p className="text-center text-outline text-sm py-8">No new notifications</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-sm transition-all ${
                  n.read
                    ? 'bg-surface-container-low border-surface-variant/40 opacity-75'
                    : 'bg-surface-container-lowest border-primary/30 font-semibold shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-on-surface font-label-md text-xs">{n.title}</span>
                  <span className="text-[10px] text-outline">{n.time}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-surface-variant flex justify-between items-center">
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-label-md text-primary hover:underline cursor-pointer"
          >
            Mark all as read
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
