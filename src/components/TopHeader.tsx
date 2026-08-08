import React from 'react';
import { UserProfile, TabType } from '../types';

interface TopHeaderProps {
  currentUser: UserProfile;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenProfile
}) => {
  return (
    <header className="w-full top-0 sticky bg-surface shadow-[0_20px_20px_-15px_rgba(84,93,127,0.05)] shadow-sm z-40 border-b border-surface-variant/30">
      <div className="flex justify-between items-center px-4 md:px-12 py-3 w-full max-w-[1200px] mx-auto">
        {/* Left: User Profile Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/40 hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer focus:outline-none"
            title="View Profile"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>

        {/* Center: Brand Title */}
        <button
          onClick={() => onTabChange('feed')}
          className="font-headline-md text-2xl font-bold text-primary cursor-pointer hover:opacity-90 transition-opacity"
        >
          PeerLink
        </button>

        {/* Right: Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-surface-container-high transition-colors active:scale-95 duration-200"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[24px]">notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface animate-pulse" />
          )}
        </button>
      </div>

      {/* Desktop Navigation Links (Hidden on Mobile) */}
      <div className="hidden md:flex justify-center border-t border-surface-variant/40 bg-surface-container-lowest">
        <nav className="flex gap-6 px-12 py-2">
          <button
            onClick={() => onTabChange('chat')}
            className={`px-4 py-2 rounded-full font-label-md transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-primary-container/20 text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => onTabChange('feed')}
            className={`px-4 py-2 rounded-full font-label-md transition-colors cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-primary-container/20 text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Feed
          </button>
          <button
            onClick={() => onTabChange('hub')}
            className={`px-4 py-2 rounded-full font-label-md transition-colors cursor-pointer ${
              activeTab === 'hub'
                ? 'bg-primary-container/20 text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Hub
          </button>
          <button
            onClick={() => onTabChange('vibe')}
            className={`px-4 py-2 rounded-full font-label-md transition-colors cursor-pointer ${
              activeTab === 'vibe'
                ? 'bg-primary-container/20 text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Vibe
          </button>
          <button
            onClick={() => onTabChange('notes')}
            className={`px-4 py-2 rounded-full font-label-md transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-primary-container/20 text-on-primary-container font-bold'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Notes
          </button>
        </nav>
      </div>
    </header>
  );
};
