import React from 'react';
import { TabType } from '../types';

interface MobileBottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'chat', label: 'AI Chat', icon: 'smart_toy' },
    { id: 'feed', label: 'Feed', icon: 'dynamic_feed' },
    { id: 'hub', label: 'Hub', icon: 'groups' },
    { id: 'vibe', label: 'Vibe', icon: 'diversity_1' },
    { id: 'notes', label: 'Notes', icon: 'folder_open' }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-4 pt-2 bg-surface-container-lowest shadow-[0_-10px_20px_rgba(84,93,127,0.05)] shadow-lg rounded-t-xl border-t border-surface-variant/40">
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-primary-container/20 text-on-primary-container rounded-full font-bold px-4'
                : 'text-on-surface-variant hover:bg-surface-container rounded-lg'
            }`}
          >
            <span
              className={`material-symbols-outlined mb-0.5 text-[22px] ${
                isActive ? 'fill' : ''
              }`}
            >
              {tab.icon}
            </span>
            <span className={`font-label-sm text-[11px] ${isActive ? 'font-bold' : ''}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
