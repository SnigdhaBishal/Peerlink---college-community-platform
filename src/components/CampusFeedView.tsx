import React, { useState } from 'react';
import { PostItem, PollItem } from '../types';

interface CampusFeedViewProps {
  posts: PostItem[];
  poll: PollItem;
  onLikePost: (postId: string) => void;
  onVotePoll: (optionId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onCreatePost: (newPost: { title: string; summary: string; fullContent: string; category: string }) => void;
}

export const CampusFeedView: React.FC<CampusFeedViewProps> = ({
  posts,
  poll,
  onLikePost,
  onVotePoll,
  onAddComment,
  onCreatePost
}) => {
  const [activePostModal, setActivePostModal] = useState<PostItem | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTitle, setComposeTitle] = useState('');
  const [composeSummary, setComposeSummary] = useState('');
  const [composeCategory, setComposeCategory] = useState('Campus News');

  const featuredPost = posts.find(p => p.type === 'featured') || posts[0];
  const secondaryPost = posts.find(p => p.type === 'secondary') || posts[1];
  const standardPosts = posts.filter(p => p.id !== featuredPost?.id && p.id !== secondaryPost?.id);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeSummary.trim()) return;
    onCreatePost({
      title: composeTitle.trim(),
      summary: composeSummary.trim(),
      fullContent: composeSummary.trim(),
      category: composeCategory
    });
    setComposeTitle('');
    setComposeSummary('');
    setIsComposeOpen(false);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePostModal || !commentInput.trim()) return;
    onAddComment(activePostModal.id, commentInput.trim());
    setCommentInput('');
    // Refresh active post modal instance
    const updated = posts.find(p => p.id === activePostModal.id);
    if (updated) setActivePostModal({ ...updated });
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 md:px-12 py-8 pb-28 md:pb-12">
      {/* Header Title */}
      <div className="mb-8">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-3xl md:text-4xl text-on-surface mb-2 font-bold">
          Campus Feed
        </h1>
        <p className="text-on-surface-variant font-body-md text-base md:text-lg">
          Stay updated with the latest news, blogs, and events around the modern campus.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Featured Post (Large - 8 cols) */}
        {featuredPost && (
          <article
            onClick={() => setActivePostModal(featuredPost)}
            className="md:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-variant ambient-shadow card-hover transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
          >
            <div className="relative h-64 md:h-80 w-full bg-surface-container overflow-hidden">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-primary/90 text-on-primary font-label-sm px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                {featuredPost.category}
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h2 className="font-headline-md text-xl md:text-2xl text-on-surface mb-3 line-clamp-2 font-bold group-hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-on-surface-variant font-body-md line-clamp-3 mb-6">
                  {featuredPost.summary}
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-surface-variant/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-label-md font-bold">
                    {featuredPost.authorAvatar || 'SA'}
                  </div>
                  <span className="text-on-surface-variant font-label-sm">
                    {featuredPost.author} • {featuredPost.createdAt}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikePost(featuredPost.id);
                    }}
                    className={`flex items-center gap-1 transition-colors ${
                      featuredPost.userLiked ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${featuredPost.userLiked ? 'fill' : ''}`}>
                      favorite
                    </span>
                    <span className="font-label-sm">{featuredPost.likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="font-label-sm">{featuredPost.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        )}

        {/* Secondary Post (Small - 4 cols) */}
        {secondaryPost && (
          <article
            onClick={() => setActivePostModal(secondaryPost)}
            className="md:col-span-4 bg-surface-container-lowest rounded-xl border border-surface-variant ambient-shadow card-hover transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
          >
            <div className="relative h-48 w-full bg-surface-container overflow-hidden">
              <img
                src={secondaryPost.image}
                alt={secondaryPost.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-secondary/90 text-on-secondary font-label-sm px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                {secondaryPost.category}
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-lg md:text-xl text-on-surface mb-2 line-clamp-2 font-bold group-hover:text-primary transition-colors">
                  {secondaryPost.title}
                </h3>
                <p className="text-on-surface-variant font-body-md line-clamp-2 mb-4 text-sm">
                  {secondaryPost.summary}
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-surface-variant/50 mt-auto">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-on-tertiary-container font-label-sm text-[10px]">
                    {secondaryPost.authorAvatar || 'ML'}
                  </div>
                  <span className="text-on-surface-variant font-label-sm text-[11px]">
                    {secondaryPost.author} • {secondaryPost.createdAt}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLikePost(secondaryPost.id);
                  }}
                  className={`flex items-center gap-1 ${
                    secondaryPost.userLiked ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${secondaryPost.userLiked ? 'fill' : ''}`}>
                    favorite
                  </span>
                  <span className="font-label-sm text-[11px]">{secondaryPost.likes}</span>
                </button>
              </div>
            </div>
          </article>
        )}

        {/* Interactive Quick Poll Card (Campus Pulse - 4 cols) */}
        <div className="md:col-span-4 bg-primary-container/10 rounded-xl border border-primary-fixed-dim p-6 ambient-shadow flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">poll</span>
            <span className="font-label-md text-primary font-bold uppercase tracking-wider text-xs">
              Campus Pulse
            </span>
          </div>
          <h3 className="font-headline-md text-lg md:text-xl text-on-surface mb-4 font-bold">
            {poll.title}
          </h3>
          <div className="space-y-3">
            {poll.options.map(option => {
              const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
              const isSelected = poll.userVotedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => onVotePoll(option.id)}
                  className={`relative w-full text-left px-4 py-3 bg-surface-container-lowest border rounded-lg transition-all font-body-md text-on-surface flex items-center justify-between overflow-hidden cursor-pointer ${
                    isSelected ? 'border-primary ring-1 ring-primary font-bold' : 'border-surface-variant hover:border-primary hover:bg-primary-fixed/20'
                  }`}
                >
                  {/* Progress Fill Background */}
                  {poll.userVotedOptionId && (
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-primary-container/20 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                  <span className="relative z-10">{option.text}</span>
                  {poll.userVotedOptionId && (
                    <span className="relative z-10 font-label-sm text-xs font-bold text-primary">
                      {percentage}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-right font-label-sm text-xs text-outline">
            {poll.totalVotes} total votes
          </p>
        </div>

        {/* Standard Posts (8 cols) */}
        {standardPosts.map(post => (
          <article
            key={post.id}
            onClick={() => setActivePostModal(post)}
            className="md:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-variant ambient-shadow card-hover transition-all duration-300 flex flex-col md:flex-row overflow-hidden cursor-pointer group"
          >
            <div className="relative h-48 md:h-auto md:w-1/3 bg-surface-container shrink-0 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-tertiary/90 text-on-tertiary font-label-sm px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
                {post.category}
              </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface mb-2 font-bold group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-on-surface-variant font-body-md line-clamp-2 mb-4">
                  {post.summary}
                </p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-surface-variant/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-label-md font-bold">
                    {post.authorAvatar || 'AD'}
                  </div>
                  <span className="text-on-surface-variant font-label-sm">
                    {post.author} • {post.createdAt}
                  </span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLikePost(post.id);
                    }}
                    className={`flex items-center gap-1 ${
                      post.userLiked ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${post.userLiked ? 'fill' : ''}`}>
                      favorite
                    </span>
                    <span className="font-label-sm">{post.likes}</span>
                  </button>
                  <div className="flex items-center gap-1 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                    <span className="font-label-sm">{post.commentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Floating Action Button for Compose Post */}
      <button
        onClick={() => setIsComposeOpen(true)}
        className="fixed bottom-20 md:bottom-8 right-4 md:right-12 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 z-40 ambient-shadow cursor-pointer"
        title="Compose Post"
      >
        <span className="material-symbols-outlined text-[28px]">edit</span>
      </button>

      {/* Compose Post Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-surface-variant animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-xl text-on-surface font-bold">Compose Campus Post</h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-outline hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block font-label-md text-on-surface mb-1">Category</label>
                <select
                  value={composeCategory}
                  onChange={e => setComposeCategory(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="Campus News">Campus News</option>
                  <option value="Student Life">Student Life</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                  <option value="Academics">Academics</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Hackathon Registration Now Open"
                  value={composeTitle}
                  onChange={e => setComposeTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-label-md text-on-surface mb-1">Summary / Body</label>
                <textarea
                  rows={4}
                  placeholder="Share details about news, events, or student life..."
                  value={composeSummary}
                  onChange={e => setComposeSummary(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 font-body-md focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-5 py-2.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container font-label-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-primary text-on-primary font-label-md hover:bg-primary/90 shadow-sm"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Details & Comments Modal */}
      {activePostModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-surface-variant">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/10 text-primary font-label-sm px-3 py-1 rounded-full">
                {activePostModal.category}
              </span>
              <button
                onClick={() => setActivePostModal(null)}
                className="text-outline hover:text-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <h2 className="font-headline-md text-2xl text-on-surface mb-3 font-bold">
              {activePostModal.title}
            </h2>
            <div className="flex items-center gap-3 text-on-surface-variant font-label-sm mb-4">
              <span>By {activePostModal.author}</span>
              <span>•</span>
              <span>{activePostModal.createdAt}</span>
            </div>
            {activePostModal.image && (
              <img
                src={activePostModal.image}
                alt={activePostModal.title}
                className="w-full h-64 object-cover rounded-xl mb-4"
              />
            )}
            <p className="font-body-md text-on-surface leading-relaxed mb-6">
              {activePostModal.fullContent || activePostModal.summary}
            </p>

            {/* Comments Section */}
            <div className="border-t border-surface-variant pt-4">
              <h4 className="font-headline-md text-lg text-on-surface font-bold mb-3">
                Comments ({activePostModal.commentsList.length})
              </h4>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                {activePostModal.commentsList.length === 0 ? (
                  <p className="text-outline font-body-md text-sm italic">
                    No comments yet. Be the first to start the conversation!
                  </p>
                ) : (
                  activePostModal.commentsList.map(c => (
                    <div key={c.id} className="bg-surface-container-low p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-label-md font-bold text-on-surface">{c.author}</span>
                        <span className="font-label-sm text-xs text-outline">{c.createdAt}</span>
                      </div>
                      <p className="font-body-md text-sm text-on-surface-variant">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  className="flex-grow bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 font-body-md text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md hover:bg-primary/90"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
