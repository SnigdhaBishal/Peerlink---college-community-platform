import React, { useState } from 'react';
import { MutualVibe } from '../types';

interface DirectMessageDrawerProps {
  peer: MutualVibe | null;
  projectChatTitle?: string | null;
  onClose: () => void;
}

export const DirectMessageDrawer: React.FC<DirectMessageDrawerProps> = ({
  peer,
  projectChatTitle,
  onClose
}) => {
  const [messages, setMessages] = useState<string[]>([
    peer ? `Hey! Ready to study together?` : `Welcome to the ${projectChatTitle || 'Project'} group chat!`
  ]);
  const [text, setText] = useState('');

  if (!peer && !projectChatTitle) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setMessages(prev => [...prev, text.trim()]);
    setText('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="bg-surface w-full max-w-md h-full p-6 shadow-2xl flex flex-col border-l border-surface-variant animate-in slide-in-from-right duration-200">
        <div className="flex justify-between items-center pb-4 border-b border-surface-variant">
          <div className="flex items-center gap-3">
            {peer ? (
              <>
                <img src={peer.avatar} alt={peer.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">{peer.name}</h3>
                  <p className="font-label-sm text-xs text-outline">{peer.major}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">groups</span>
                <div>
                  <h3 className="font-headline-md text-base font-bold text-on-surface">{projectChatTitle}</h3>
                  <p className="font-label-sm text-xs text-outline">Group Project Chat</p>
                </div>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-outline p-1 rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Message area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                idx % 2 === 0
                  ? 'bg-surface-container-low text-on-surface border border-outline-variant/20 self-start'
                  : 'bg-primary text-on-primary ml-auto self-end'
              }`}
            >
              {m}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="pt-3 border-t border-surface-variant flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-label-md text-xs hover:bg-primary/90 font-bold"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
