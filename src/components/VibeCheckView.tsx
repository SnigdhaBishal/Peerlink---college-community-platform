import React, { useState } from 'react';
import { VibeCandidate, MutualVibe } from '../types';

interface VibeCheckViewProps {
  candidates: VibeCandidate[];
  mutualVibes: MutualVibe[];
  onVibeAction: (candidateId: string, action: 'vibe' | 'skip') => void;
  onOpenDirectMessage: (peer: MutualVibe) => void;
}

export const VibeCheckView: React.FC<VibeCheckViewProps> = ({
  candidates,
  mutualVibes,
  onVibeAction,
  onOpenDirectMessage
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCandidate = candidates[currentIndex % candidates.length];

  const handleAction = (action: 'vibe' | 'skip') => {
    if (currentCandidate) {
      onVibeAction(currentCandidate.id, action);
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-6 md:pt-8 pb-28 md:pb-12 flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Left Column: Vibe Check */}
      <section className="w-full md:w-2/3 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl text-on-surface font-bold">
            Vibe Check
          </h2>
          <p className="font-body-md text-on-surface-variant text-base">
            Discover peers who share your interests.
          </p>
        </div>

        {/* Vibe Request Card */}
        {currentCandidate ? (
          <div className="glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6 ambient-shadow border border-surface-variant transition-all duration-300">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-surface shadow-md">
                  <img
                    src={currentCandidate.avatar}
                    alt={currentCandidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {currentCandidate.isVerified && (
                  <div className="absolute bottom-1 right-1 bg-secondary-container text-on-secondary-container rounded-full p-1.5 border-2 border-surface shadow-sm" title="Verified Campus Peer">
                    <span className="material-symbols-outlined text-sm font-bold">verified</span>
                  </div>
                )}
              </div>

              {/* Bio Details */}
              <div className="flex flex-col items-center md:items-start gap-2 flex-grow text-center md:text-left">
                <div>
                  <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">
                    {currentCandidate.name}, {currentCandidate.age}
                  </h3>
                  <p className="font-body-md text-primary font-medium text-sm md:text-base">
                    {currentCandidate.major}
                  </p>
                </div>
                <p className="font-body-md text-on-surface-variant max-w-md italic text-sm md:text-base leading-relaxed mt-1">
                  {currentCandidate.quote}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                  {currentCandidate.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-primary-container/15 text-primary px-3 py-1 rounded-full font-label-md text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 md:gap-6 mt-2 border-t border-surface-variant/60 pt-6">
              <button
                onClick={() => handleAction('skip')}
                className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary/5 transition-all font-label-md active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
                <span>Not Now</span>
              </button>
              <button
                onClick={() => handleAction('vibe')}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-md font-label-md active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined">diversity_1</span>
                <span>Vibe?</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center text-on-surface-variant border border-surface-variant">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">check_circle</span>
            <h3 className="font-headline-md text-xl font-bold text-on-surface mb-1">All Caught Up!</h3>
            <p className="font-body-md text-sm">You have reviewed all available peer profiles for today. Check back soon for new campus connections!</p>
          </div>
        )}
      </section>

      {/* Right Column: Mutual Vibes */}
      <section className="w-full md:w-1/3 flex flex-col gap-4">
        <h3 className="font-headline-md text-xl text-on-surface font-bold pb-2 border-b border-surface-variant">
          Mutual Vibes
        </h3>
        <div className="flex flex-col gap-3">
          {mutualVibes.map(peer => (
            <div
              key={peer.id}
              onClick={() => onOpenDirectMessage(peer)}
              className="bg-surface rounded-xl p-3 flex items-center justify-between ambient-shadow border border-surface-variant cursor-pointer hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0 border border-surface-variant"
                />
                <div className="overflow-hidden">
                  <p className="font-label-md text-on-surface font-bold text-sm group-hover:text-primary transition-colors">
                    {peer.name}
                  </p>
                  <p className="font-label-sm text-on-surface-variant text-xs truncate">
                    {peer.major}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDirectMessage(peer);
                }}
                className="text-primary hover:bg-primary-container/20 p-2 rounded-full transition-colors shrink-0"
                title="Message Peer"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => alert(`You have ${mutualVibes.length} active campus peer connections.`)}
          className="w-full py-2 text-center text-primary font-label-md hover:underline mt-2 text-sm cursor-pointer"
        >
          View all connections
        </button>
      </section>
    </main>
  );
};
