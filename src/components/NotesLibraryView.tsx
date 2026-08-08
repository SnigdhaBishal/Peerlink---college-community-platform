import React, { useState } from 'react';
import { NoteFolder, NoteDocument } from '../types';

interface NotesLibraryViewProps {
  folders: NoteFolder[];
  userStats: { uploadedFilesCount: number; peersHelpedCount: number };
  onUploadNotes: (folderId: string, title: string, type: 'pdf' | 'image' | 'doc') => void;
}

export const NotesLibraryView: React.FC<NotesLibraryViewProps> = ({
  folders,
  userStats,
  onUploadNotes
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Subjects');
  const [activeDocPreview, setActiveDocPreview] = useState<NoteDocument | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFolderId, setUploadFolderId] = useState(folders[0]?.id || '');
  const [uploadType, setUploadType] = useState<'pdf' | 'image' | 'doc'>('pdf');

  const filteredFolders = folders.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    if (selectedCategory === 'All Subjects') return matchesSearch;
    if (selectedCategory === 'Engineering') return matchesSearch && (f.courseCode.startsWith('CS') || f.courseCode.startsWith('EE'));
    if (selectedCategory === 'Humanities') return matchesSearch && (f.courseCode.startsWith('HIST') || f.courseCode.startsWith('PSYCH'));
    if (selectedCategory === 'Science') return matchesSearch && (f.courseCode.startsWith('CHEM') || f.courseCode.startsWith('BIO'));
    return matchesSearch;
  });

  const featuredFolder = folders.find(f => f.isFeatured) || folders[0];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) return;
    onUploadNotes(uploadFolderId, uploadTitle.trim(), uploadType);
    setUploadTitle('');
    setIsUploadOpen(false);
  };

  return (
    <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-12 py-8 pb-28 md:pb-12">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl text-on-surface font-bold mb-2">
          Notes Library
        </h2>
        <p className="font-body-lg text-on-surface-variant max-w-2xl text-base md:text-lg">
          Access shared academic resources, lecture notes, and textbook summaries from your peers.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <input
            type="text"
            placeholder="Search for notes, courses, or authors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#F1F3F5] text-on-surface placeholder:text-outline border-none rounded-xl py-3 pl-12 pr-4 font-body-md focus:ring-2 focus:ring-primary focus:outline-none transition-shadow text-sm md:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All Subjects', 'Engineering', 'Humanities', 'Science'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-md text-xs md:text-sm shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Featured / Recent Folder (8 cols) */}
        {featuredFolder && (
          <div className="col-span-1 md:col-span-8 bg-surface-container-lowest rounded-xl p-6 border border-[#E9ECEF] shadow-[0_20px_40px_-15px_rgba(142,151,188,0.08)] hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-container/20 rounded-lg flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined fill text-2xl">folder</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">
                    {featuredFolder.title}
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    {featuredFolder.courseCode} • {featuredFolder.professor}
                  </p>
                </div>
              </div>
              {featuredFolder.updatedTag && (
                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-xs font-bold shrink-0">
                  {featuredFolder.updatedTag}
                </span>
              )}
            </div>

            {/* Documents Inside Featured Folder */}
            <div className="space-y-3">
              {featuredFolder.documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => setActiveDocPreview(doc)}
                  className="flex items-center justify-between p-3.5 bg-background rounded-lg group hover:bg-surface-container-low transition-colors cursor-pointer border border-surface-variant/40"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span
                      className={`material-symbols-outlined ${
                        doc.type === 'pdf'
                          ? 'text-error'
                          : doc.type === 'image'
                          ? 'text-tertiary'
                          : 'text-primary'
                      }`}
                    >
                      {doc.type === 'pdf'
                        ? 'picture_as_pdf'
                        : doc.type === 'image'
                        ? 'image'
                        : 'description'}
                    </span>
                    <span className="font-body-md text-on-surface font-medium text-sm md:text-base truncate">
                      {doc.title}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDocPreview(doc);
                    }}
                    className="text-outline hover:text-primary transition-colors p-1"
                    title="View / Download"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Contribution / Stats Card (4 cols) */}
        <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl p-6 border border-[#E9ECEF] shadow-[0_20px_40px_-15px_rgba(142,151,188,0.08)] flex flex-col justify-between">
          <div>
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-wider text-xs font-bold mb-4">
              Your Contribution
            </h3>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-headline-xl text-primary text-4xl md:text-5xl font-bold">
                {userStats.uploadedFilesCount}
              </span>
              <span className="font-body-md text-on-surface-variant text-sm">
                files uploaded
              </span>
            </div>
            <p className="font-body-sm text-outline text-xs mt-1">
              You've helped {userStats.peersHelpedCount} peers this semester.
            </p>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="mt-6 w-full py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm font-bold text-sm"
          >
            <span className="material-symbols-outlined">upload</span>
            <span>Upload Notes</span>
          </button>
        </div>

        {/* Course Folders Grid */}
        {filteredFolders
          .filter(f => f.id !== featuredFolder?.id)
          .map(folder => (
            <div
              key={folder.id}
              onClick={() => {
                if (folder.documents.length > 0) setActiveDocPreview(folder.documents[0]);
              }}
              className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl p-6 border border-[#E9ECEF] shadow-[0_20px_40px_-15px_rgba(142,151,188,0.05)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary-container/20 transition-colors">
                  <span className="material-symbols-outlined">folder</span>
                </div>
                <span className="text-outline font-label-sm text-xs">
                  {folder.filesCount} files
                </span>
              </div>
              <h4 className="font-label-md text-on-surface font-bold text-base mb-1 group-hover:text-primary transition-colors">
                {folder.title}
              </h4>
              <p className="font-body-sm text-on-surface-variant text-xs">
                {folder.courseCode}
              </p>
            </div>
          ))}
      </div>

      {/* Upload Notes Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl border border-surface-variant">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-xl text-on-surface font-bold">Upload Course Notes</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-outline p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Target Folder / Course</label>
                <select
                  value={uploadFolderId}
                  onChange={e => setUploadFolderId(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.courseCode} - {f.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 5 Summary Notes"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">File Format</label>
                <div className="flex gap-3">
                  {(['pdf', 'image', 'doc'] as const).map(fmt => (
                    <button
                      type="button"
                      key={fmt}
                      onClick={() => setUploadType(fmt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-label-md border uppercase transition-all cursor-pointer ${
                        uploadType === fmt
                          ? 'bg-primary text-on-primary border-primary font-bold'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag & Drop Simulation Zone */}
              <div className="border-2 border-dashed border-outline-variant/50 rounded-xl p-6 text-center bg-surface-container-low/50">
                <span className="material-symbols-outlined text-3xl text-outline mb-1">cloud_upload</span>
                <p className="font-label-sm text-xs text-on-surface font-semibold">
                  Click or drag files here to attach
                </p>
                <p className="font-body-sm text-[11px] text-outline mt-0.5">
                  Supports PDF, PNG, JPG, DOCX up to 25MB
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {activeDocPreview && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-variant">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                <h3 className="font-headline-md text-lg text-on-surface font-bold truncate max-w-xs">
                  {activeDocPreview.title}
                </h3>
              </div>
              <button onClick={() => setActiveDocPreview(null)} className="text-outline p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-6 text-center mb-4">
              <span className="material-symbols-outlined text-5xl text-primary mb-2">article</span>
              <p className="font-label-md text-on-surface font-bold">{activeDocPreview.title}</p>
              <p className="font-body-sm text-xs text-outline mt-1">
                Size: {activeDocPreview.size || '2.4 MB'} • Uploaded {activeDocPreview.uploadedAt}
              </p>
            </div>

            <p className="font-body-md text-xs text-on-surface-variant leading-relaxed mb-6">
              This academic note has been verified for accuracy by peer reviewers. You can reference this document directly in the AI Chat tab.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActiveDocPreview(null)}
                className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading ${activeDocPreview.title}...`);
                  setActiveDocPreview(null);
                }}
                className="px-5 py-2 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 text-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
