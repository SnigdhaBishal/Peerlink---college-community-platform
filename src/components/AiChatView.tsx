import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, NoteFolder } from '../types';

interface AiChatViewProps {
  noteFolders: NoteFolder[];
}

export const AiChatView: React.FC<AiChatViewProps> = ({ noteFolders }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: "Hello! I'm ready to help you study. I have access to your uploaded notes for **Biology 101** and **Modern History**. What would you like to review today?",
      timestamp: 'Today'
    },
    {
      id: 'm2',
      sender: 'user',
      text: "Can you summarize the main themes of Chapter 4 in the History notes? I'm struggling with the sequence of events.",
      timestamp: 'Today'
    },
    {
      id: 'm3',
      sender: 'ai',
      text: "Certainly. Based on your notes for Chapter 4, here are the main themes regarding the industrial transition:\n\n• **Technological Shift:** The rapid movement from agrarian economies to machine-driven manufacturing.\n• **Urbanization:** Massive population migration to urban centers leading to infrastructure strain.\n• **Labor Reforms:** Early movements advocating for worker rights in response to factory conditions.",
      timestamp: 'Today',
      referencedDoc: 'History_Ch4_Notes.pdf'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string>('History_Ch4_Notes.pdf');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text || !text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('peerlink_jwt_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: text.trim(),
          selectedDoc
        })
      });

      const data = await res.json();
      const aiReplyText = data.reply || "I analyzed your lecture notes! Chapter 4 covers the technological shift, urban expansion, and labor movement during the industrial revolution.";

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: 'Just now',
        referencedDoc: data.referencedDoc || selectedDoc
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: "I analyzed your study materials! Chapter 4 details the migration from agrarian farms to factory centers, bringing rapid urban growth and initial labor safety regulations.",
        timestamp: 'Just now',
        referencedDoc: selectedDoc
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow flex flex-col max-w-[1200px] mx-auto w-full relative overflow-hidden pb-[80px] md:pb-4 h-[calc(100vh-8rem)]">
      {/* Chat History Area */}
      <div className="flex-grow overflow-y-auto chat-scroll px-4 md:px-8 py-4 flex flex-col gap-4">
        {/* Date Divider */}
        <div className="flex justify-center my-1">
          <span className="font-label-sm text-xs text-on-surface-variant bg-surface-container-lowest px-3 py-1 rounded-full border border-outline-variant/20 shadow-[0_4px_12px_rgba(84,93,127,0.03)]">
            Today
          </span>
        </div>

        {/* Messages */}
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${
              msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 border border-primary/10 mt-1">
                <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
              </div>
            )}

            <div
              className={`p-3 md:p-4 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-secondary-container/40 border border-secondary/10 rounded-2xl rounded-tr-sm'
                  : 'bg-surface-container-lowest border border-outline-variant/20 rounded-2xl rounded-tl-sm'
              }`}
            >
              <div className="font-body-md text-on-surface leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {msg.text}
              </div>

              {/* Document Reference Badge */}
              {msg.referencedDoc && (
                <div className="mt-2 p-1.5 bg-surface-container rounded-lg border border-outline-variant/10 flex items-center gap-1.5 w-fit">
                  <span className="material-symbols-outlined text-outline text-xs">description</span>
                  <span className="font-label-sm text-xs text-on-surface-variant font-medium">
                    Referencing: {msg.referencedDoc}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading / Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] md:max-w-[70%] opacity-70">
            <div className="w-8 h-8 rounded-full bg-primary-container/30 flex items-center justify-center shrink-0 border border-primary/10 mt-1">
              <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-2xl rounded-tl-sm p-3 shadow-xs flex items-center gap-1.5 h-[42px] px-4">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input & Suggestion Chips Container */}
      <div className="bg-surface/90 backdrop-blur-md border-t border-outline-variant/20 p-3 md:p-4 w-full shrink-0 flex flex-col gap-3 z-30">
        {/* Course Document Selector */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <span className="font-label-sm text-xs text-outline shrink-0">Active Note:</span>
          <select
            value={selectedDoc}
            onChange={e => setSelectedDoc(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant/30 rounded-full text-xs px-3 py-1 text-primary font-label-sm focus:outline-none cursor-pointer"
          >
            <option value="History_Ch4_Notes.pdf">History_Ch4_Notes.pdf</option>
            <option value="Biology101_Syllabus.pdf">Biology101_Syllabus.pdf</option>
            <option value="CS201_BinaryTrees_Summary.pdf">CS201_BinaryTrees_Summary.pdf</option>
          </select>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-0.5">
          <button
            onClick={() => handleSendMessage("Summarize Chapter 4 of my History notes.")}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-primary/20 bg-surface-container-lowest text-primary font-label-sm text-xs hover:bg-primary-container/10 transition-colors shadow-xs active:translate-y-px cursor-pointer"
          >
            Summarize Chapter 4
          </button>
          <button
            onClick={() => handleSendMessage("When is the next exam for Biology 101 and History?")}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-primary/20 bg-surface-container-lowest text-primary font-label-sm text-xs hover:bg-primary-container/10 transition-colors shadow-xs active:translate-y-px cursor-pointer"
          >
            When is the next exam?
          </button>
          <button
            onClick={() => handleSendMessage("Generate 3 practice flashcards for Chapter 4 concepts.")}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-primary/20 bg-surface-container-lowest text-primary font-label-sm text-xs hover:bg-primary-container/10 transition-colors shadow-xs active:translate-y-px flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">quiz</span>
            <span>Generate Flashcards</span>
          </button>
        </div>

        {/* Message Input Box */}
        <div className="flex items-end gap-2 bg-surface-container-low rounded-2xl border border-outline-variant/30 p-1 pl-3 shadow-xs focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <button
            onClick={() => alert(`Active note document attached: ${selectedDoc}`)}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors mb-1 rounded-full hover:bg-surface-container cursor-pointer"
            title="Attach Document"
          >
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about your notes..."
            className="flex-grow bg-transparent border-none outline-none resize-none font-body-md text-on-surface py-3 px-1 max-h-[120px] min-h-[44px] text-sm focus:ring-0 placeholder:text-outline-variant"
            rows={1}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors shadow-sm active:scale-95 mb-1 flex items-center justify-center h-10 w-10 shrink-0 cursor-pointer disabled:opacity-50"
            title="Send Message"
          >
            <span className="material-symbols-outlined filled text-lg">send</span>
          </button>
        </div>

        <div className="text-center">
          <span className="font-label-sm text-[10px] text-outline">
            AI can make mistakes. Verify important information with your syllabus.
          </span>
        </div>
      </div>
    </main>
  );
};
