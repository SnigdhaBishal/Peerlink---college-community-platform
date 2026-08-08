import React, { useState } from 'react';
import { BuzzItem, ProjectItem } from '../types';

interface CampusHubViewProps {
  buzzList: BuzzItem[];
  projectsList: ProjectItem[];
  onCreateBuzz: (newBuzz: { title: string; content: string; tags: string[] }) => void;
  onCreateProject: (newProject: { title: string; subjectTag: string; description: string }) => void;
  onJoinProject: (projectId: string) => void;
  onOpenProjectChat: (projectTitle: string) => void;
}

export const CampusHubView: React.FC<CampusHubViewProps> = ({
  buzzList,
  projectsList,
  onCreateBuzz,
  onCreateProject,
  onJoinProject,
  onOpenProjectChat
}) => {
  const [hubTab, setHubTab] = useState<'buzz' | 'projects'>('buzz');
  const [isAddBuzzOpen, setIsAddBuzzOpen] = useState(false);
  const [buzzTitle, setBuzzTitle] = useState('');
  const [buzzContent, setBuzzContent] = useState('');
  const [buzzTags, setBuzzTags] = useState('#Campus');

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projSubject, setProjSubject] = useState('Comp Sci');
  const [projDesc, setProjDesc] = useState('');

  const handlePublishBuzz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buzzTitle.trim() || !buzzContent.trim()) return;
    const tagArray = buzzTags
      .split(' ')
      .filter(t => t.startsWith('#'))
      .map(t => t.trim());
    onCreateBuzz({
      title: buzzTitle.trim(),
      content: buzzContent.trim(),
      tags: tagArray.length > 0 ? tagArray : ['#Campus']
    });
    setBuzzTitle('');
    setBuzzContent('');
    setIsAddBuzzOpen(false);
  };

  const handlePublishProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim()) return;
    onCreateProject({
      title: projTitle.trim(),
      subjectTag: projSubject,
      description: projDesc.trim()
    });
    setProjTitle('');
    setProjDesc('');
    setIsAddProjectOpen(false);
  };

  return (
    <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-12 py-6 md:py-8 flex flex-col md:flex-row gap-6 md:gap-12 pb-28 md:pb-12">
      {/* Desktop SideNav (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 gap-2 sticky top-24 h-[calc(100vh-6rem)]">
        <div className="font-headline-sm text-lg font-semibold text-on-surface mb-2 px-4">
          Navigation
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container/20 text-primary font-bold">
            <span className="material-symbols-outlined fill">groups</span>
            <span className="font-label-md">Campus Hub</span>
          </div>
          <p className="px-4 text-xs text-outline mt-4">
            Connect in real-time with live campus buzz and collaborative study groups.
          </p>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Page Header & Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl text-on-surface font-bold">
            Campus Hub
          </h1>

          {/* Custom Segmented Control */}
          <div className="flex bg-surface-container-low p-1 rounded-xl shadow-inner inline-flex self-start md:self-auto border border-surface-variant/40">
            <button
              onClick={() => setHubTab('buzz')}
              className={`px-6 py-2 rounded-lg font-label-md transition-all duration-300 cursor-pointer ${
                hubTab === 'buzz'
                  ? 'bg-surface text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Buzz
            </button>
            <button
              onClick={() => setHubTab('projects')}
              className={`px-6 py-2 rounded-lg font-label-md transition-all duration-300 cursor-pointer ${
                hubTab === 'projects'
                  ? 'bg-surface text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        {/* BUZZ VIEW */}
        {hubTab === 'buzz' && (
          <div className="flex flex-col gap-4 transition-all duration-300">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-sm text-outline uppercase tracking-wider text-xs">
                Live Campus Whispers & Signals
              </span>
              <button
                onClick={() => setIsAddBuzzOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Post Buzz</span>
              </button>
            </div>

            {buzzList.map((item, idx) => (
              <div
                key={item.id}
                className={`rounded-xl p-6 flex flex-col md:flex-row gap-4 items-start transition-all duration-300 cursor-pointer ${
                  idx === 0
                    ? 'glass-card card-shadow border border-surface-variant hover:-translate-y-0.5'
                    : 'bg-surface-container-lowest border border-surface-variant card-shadow hover:-translate-y-0.5'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    item.iconBgColor || 'bg-primary-container text-on-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-label-md text-on-surface text-lg font-bold">
                      {item.title}
                    </h3>
                    <span className="font-label-sm text-xs text-outline">{item.timeAgo}</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-3 line-clamp-2 text-sm leading-relaxed">
                    {item.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROJECTS VIEW */}
        {hubTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300">
            {projectsList.map(proj => (
              <div
                key={proj.id}
                className="bg-surface-container-lowest border border-surface-variant card-shadow rounded-xl p-6 flex flex-col hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold font-headline-sm">
                    {proj.code}
                  </div>
                  <span className="flex items-center gap-1 text-on-surface-variant font-label-sm text-xs">
                    <span className="material-symbols-outlined text-[16px]">group</span>
                    {proj.membersCount}
                  </span>
                </div>
                <h3 className="font-label-md text-on-surface text-lg font-bold mb-1">
                  {proj.title}
                </h3>
                <p className="font-body-md text-on-surface-variant mb-4 flex-1 text-sm line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded bg-secondary/10 text-secondary font-label-sm text-[11px] uppercase tracking-wider font-bold">
                    {proj.subjectTag}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onJoinProject(proj.id)}
                    className={`flex-1 py-2 rounded-lg font-label-md transition-colors duration-200 cursor-pointer ${
                      proj.joined
                        ? 'bg-secondary-container text-on-secondary-container font-bold'
                        : 'bg-primary text-on-primary hover:bg-primary/90'
                    }`}
                  >
                    {proj.joined ? 'Joined' : 'Join'}
                  </button>
                  <button
                    onClick={() => onOpenProjectChat(proj.title)}
                    className="p-2 rounded-lg border border-outline-variant text-primary hover:bg-primary/5 cursor-pointer"
                    title="Open Group Chat"
                  >
                    <span className="material-symbols-outlined text-[20px]">chat</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Create New Project Card */}
            <div
              onClick={() => setIsAddProjectOpen(true)}
              className="bg-surface-container-lowest border-2 border-dashed border-surface-variant hover:border-primary card-shadow rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-all duration-200 min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-2xl">add</span>
              </div>
              <h3 className="font-label-md text-on-surface font-bold text-base mb-1">
                Create New Project
              </h3>
              <p className="font-body-md text-on-surface-variant text-xs max-w-xs">
                Start a new study group, project chat, or exam preparation circle.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Buzz Modal */}
      {isAddBuzzOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-variant">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-xl text-on-surface font-bold">Share Campus Buzz</h3>
              <button onClick={() => setIsAddBuzzOpen(false)} className="text-outline p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePublishBuzz} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Free Pizza at Engineering Hall"
                  value={buzzTitle}
                  onChange={e => setBuzzTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Details</label>
                <textarea
                  rows={3}
                  placeholder="What is happening right now?"
                  value={buzzContent}
                  onChange={e => setBuzzContent(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Hashtags (space separated)</label>
                <input
                  type="text"
                  placeholder="#Food #Quad"
                  value={buzzTags}
                  onChange={e => setBuzzTags(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBuzzOpen(false)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90"
                >
                  Post Buzz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-variant">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-xl text-on-surface font-bold">New Study Project</h3>
              <button onClick={() => setIsAddProjectOpen(false)} className="text-outline p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePublishProject} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Machine Learning Lab Team"
                  value={projTitle}
                  onChange={e => setProjTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Subject Tag</label>
                <select
                  value={projSubject}
                  onChange={e => setProjSubject(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Comp Sci">Comp Sci</option>
                  <option value="Arts">Arts</option>
                  <option value="Economics">Economics</option>
                  <option value="Biology">Biology</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe goal, meeting times, or topics..."
                  value={projDesc}
                  onChange={e => setProjDesc(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
