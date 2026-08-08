import React, { useState, useEffect } from 'react';
import { TabType, UserProfile, PostItem, PollItem, BuzzItem, ProjectItem, VibeCandidate, MutualVibe, NoteFolder, NotificationItem } from './types';
import { TopHeader } from './components/TopHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CampusFeedView } from './components/CampusFeedView';
import { CampusHubView } from './components/CampusHubView';
import { VibeCheckView } from './components/VibeCheckView';
import { AiChatView } from './components/AiChatView';
import { NotesLibraryView } from './components/NotesLibraryView';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { AuthModal } from './components/AuthModal';
import { DirectMessageDrawer } from './components/DirectMessageDrawer';

import {
  INITIAL_USER,
  INITIAL_POSTS,
  INITIAL_POLL,
  INITIAL_BUZZ,
  INITIAL_PROJECTS,
  INITIAL_VIBE_CANDIDATES,
  INITIAL_MUTUAL_VIBES,
  INITIAL_NOTE_FOLDERS
} from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [posts, setPosts] = useState<PostItem[]>(INITIAL_POSTS);
  const [poll, setPoll] = useState<PollItem>(INITIAL_POLL);
  const [buzzList, setBuzzList] = useState<BuzzItem[]>(INITIAL_BUZZ);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [vibeCandidates, setVibeCandidates] = useState<VibeCandidate[]>(INITIAL_VIBE_CANDIDATES);
  const [mutualVibes, setMutualVibes] = useState<MutualVibe[]>(INITIAL_MUTUAL_VIBES);
  const [noteFolders, setNoteFolders] = useState<NoteFolder[]>(INITIAL_NOTE_FOLDERS);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'n1', title: 'Marcus Chen liked your CS201 note upload', time: '10m ago', read: false, type: 'like' },
    { id: 'n2', title: 'New vote on Spring Gala Campus Pulse poll', time: '1h ago', read: false, type: 'poll' },
    { id: 'n3', title: 'Elena Rodriguez matched with you on Vibe Check!', time: '2h ago', read: true, type: 'vibe' }
  ]);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [activeDirectPeer, setActiveDirectPeer] = useState<MutualVibe | null>(null);
  const [activeProjectChat, setActiveProjectChat] = useState<string | null>(null);

  // Helper to attach JWT authorization headers to requests
  const authFetch = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('peerlink_jwt_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Fetch state from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [uRes, pRes, pollRes, bRes, prRes, vRes, nRes] = await Promise.all([
          authFetch('/api/auth/me'),
          authFetch('/api/posts'),
          authFetch('/api/poll'),
          authFetch('/api/buzz'),
          authFetch('/api/projects'),
          authFetch('/api/vibes'),
          authFetch('/api/notes')
        ]);

        if (uRes.ok) setCurrentUser(await uRes.json());
        if (pRes.ok) setPosts(await pRes.json());
        if (pollRes.ok) setPoll(await pollRes.json());
        if (bRes.ok) setBuzzList(await bRes.json());
        if (prRes.ok) setProjectsList(await prRes.json());
        if (vRes.ok) {
          const vData = await vRes.json();
          if (vData.candidates) setVibeCandidates(vData.candidates);
          if (vData.mutualVibes) setMutualVibes(vData.mutualVibes);
        }
        if (nRes.ok) {
          const nData = await nRes.json();
          if (nData.folders) setNoteFolders(nData.folders);
        }
      } catch (err) {
        console.warn('Initial server fetch using local state fallback:', err);
      }
    };
    fetchData();
  }, []);

  // Post Actions
  const handleLikePost = async (postId: string) => {
    try {
      const res = await authFetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const userLiked = !p.userLiked;
          return { ...p, userLiked, likes: userLiked ? p.likes + 1 : p.likes - 1 };
        }
        return p;
      }));
    }
  };

  const handleAddComment = async (postId: string, text: string) => {
    try {
      const res = await authFetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      }
    } catch {
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          const newComm = { id: `c_${Date.now()}`, author: currentUser.name, text, createdAt: 'Just now' };
          const commentsList = [...p.commentsList, newComm];
          return { ...p, commentsList, commentsCount: commentsList.length };
        }
        return p;
      }));
    }
  };

  const handleCreatePost = async (newPostData: { title: string; summary: string; fullContent: string; category: string }) => {
    try {
      const res = await authFetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPostData)
      });
      if (res.ok) {
        const created = await res.json();
        setPosts(prev => [created, ...prev]);
      }
    } catch {
      const created: PostItem = {
        id: `p_${Date.now()}`,
        type: 'standard',
        category: newPostData.category,
        categoryColor: 'primary',
        title: newPostData.title,
        summary: newPostData.summary,
        fullContent: newPostData.fullContent,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
        author: currentUser.name,
        authorAvatar: 'SP',
        createdAt: 'Just now',
        likes: 0,
        commentsCount: 0,
        userLiked: false,
        commentsList: []
      };
      setPosts(prev => [created, ...prev]);
    }
  };

  // Poll Action
  const handleVotePoll = async (optionId: string) => {
    try {
      const res = await authFetch('/api/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      if (res.ok) {
        const updatedPoll = await res.json();
        setPoll(updatedPoll);
      }
    } catch {
      setPoll(prev => {
        const options = prev.options.map(o => {
          if (o.id === optionId) return { ...o, votes: o.votes + 1 };
          return o;
        });
        return { ...prev, options, totalVotes: prev.totalVotes + 1, userVotedOptionId: optionId };
      });
    }
  };

  // Buzz Action
  const handleCreateBuzz = async (newBuzzData: { title: string; content: string; tags: string[] }) => {
    try {
      const res = await authFetch('/api/buzz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBuzzData)
      });
      if (res.ok) {
        const created = await res.json();
        setBuzzList(prev => [created, ...prev]);
      }
    } catch {
      const created: BuzzItem = {
        id: `buzz_${Date.now()}`,
        title: newBuzzData.title,
        content: newBuzzData.content,
        category: 'trending',
        icon: 'campaign',
        iconBgColor: 'bg-primary-container text-on-primary-container',
        timeAgo: 'Just now',
        tags: newBuzzData.tags
      };
      setBuzzList(prev => [created, ...prev]);
    }
  };

  // Project Actions
  const handleCreateProject = async (newProjData: { title: string; subjectTag: string; description: string }) => {
    try {
      const res = await authFetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProjData)
      });
      if (res.ok) {
        const created = await res.json();
        setProjectsList(prev => [...prev, created]);
      }
    } catch {
      const code = newProjData.title.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'CS';
      const created: ProjectItem = {
        id: `proj_${Date.now()}`,
        title: newProjData.title,
        code,
        description: newProjData.description,
        membersCount: 1,
        subjectTag: newProjData.subjectTag,
        subjectColor: 'primary',
        joined: true
      };
      setProjectsList(prev => [...prev, created]);
    }
  };

  const handleJoinProject = async (projectId: string) => {
    try {
      const res = await authFetch(`/api/projects/${projectId}/join`, { method: 'POST' });
      if (res.ok) {
        const updated = await res.json();
        setProjectsList(prev => prev.map(p => p.id === projectId ? updated : p));
      }
    } catch {
      setProjectsList(prev => prev.map(p => {
        if (p.id === projectId) {
          const joined = !p.joined;
          return { ...p, joined, membersCount: joined ? p.membersCount + 1 : Math.max(0, p.membersCount - 1) };
        }
        return p;
      }));
    }
  };

  // Vibe Actions
  const handleVibeAction = async (candidateId: string, action: 'vibe' | 'skip') => {
    try {
      const res = await authFetch('/api/vibes/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, action })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.candidates) setVibeCandidates(data.candidates);
        if (data.mutualVibes) setMutualVibes(data.mutualVibes);
      }
    } catch {
      setVibeCandidates(prev => prev.filter(c => c.id !== candidateId));
    }
  };

  // Upload Notes Action
  const handleUploadNotes = async (folderId: string, title: string, type: 'pdf' | 'image' | 'doc') => {
    try {
      const res = await authFetch('/api/notes/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, title, type })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.folders) setNoteFolders(data.folders);
        if (data.userStats) {
          setCurrentUser(prev => ({
            ...prev,
            uploadedFilesCount: data.userStats.uploadedFilesCount,
            peersHelpedCount: data.userStats.peersHelpedCount
          }));
        }
      }
    } catch {
      setNoteFolders(prev => prev.map(f => {
        if (f.id === folderId) {
          const newDoc = { id: `doc_${Date.now()}`, title, type, size: '1.8 MB', uploadedAt: 'Just now', fileUrl: '#' };
          return { ...f, documents: [newDoc, ...f.documents], filesCount: f.filesCount + 1 };
        }
        return f;
      }));
      setCurrentUser(prev => ({
        ...prev,
        uploadedFilesCount: prev.uploadedFilesCount + 1,
        peersHelpedCount: prev.peersHelpedCount + 3
      }));
    }
  };

  // Update Profile
  const handleUpdateProfile = async (updated: { name: string; major: string; email: string }) => {
    try {
      const res = await authFetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const u = await res.json();
        setCurrentUser(u);
      }
    } catch {
      setCurrentUser(prev => ({ ...prev, ...updated }));
    }
  };

  const handleAuthSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md flex flex-col">
      {/* Sticky Top AppBar */}
      <TopHeader
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={() => setIsAuthOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'feed' && (
          <CampusFeedView
            posts={posts}
            poll={poll}
            onLikePost={handleLikePost}
            onVotePoll={handleVotePoll}
            onAddComment={handleAddComment}
            onCreatePost={handleCreatePost}
          />
        )}

        {activeTab === 'hub' && (
          <CampusHubView
            buzzList={buzzList}
            projectsList={projectsList}
            onCreateBuzz={handleCreateBuzz}
            onCreateProject={handleCreateProject}
            onJoinProject={handleJoinProject}
            onOpenProjectChat={(title) => setActiveProjectChat(title)}
          />
        )}

        {activeTab === 'vibe' && (
          <VibeCheckView
            candidates={vibeCandidates}
            mutualVibes={mutualVibes}
            onVibeAction={handleVibeAction}
            onOpenDirectMessage={(peer) => setActiveDirectPeer(peer)}
          />
        )}

        {activeTab === 'chat' && (
          <AiChatView noteFolders={noteFolders} />
        )}

        {activeTab === 'notes' && (
          <NotesLibraryView
            folders={noteFolders}
            userStats={{
              uploadedFilesCount: currentUser.uploadedFilesCount,
              peersHelpedCount: currentUser.peersHelpedCount
            }}
            onUploadNotes={handleUploadNotes}
          />
        )}
      </div>

      {/* Mobile Responsive Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Drawers and Modals */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUpdateProfile={handleUpdateProfile}
        onAuthSuccess={handleAuthSuccess}
      />

      <DirectMessageDrawer
        peer={activeDirectPeer}
        projectChatTitle={activeProjectChat}
        onClose={() => {
          setActiveDirectPeer(null);
          setActiveProjectChat(null);
        }}
      />
    </div>
  );
}
