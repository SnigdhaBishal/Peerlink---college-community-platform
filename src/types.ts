export type TabType = 'chat' | 'feed' | 'hub' | 'vibe' | 'notes';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  major: string;
  gradYear: number;
  uploadedFilesCount: number;
  peersHelpedCount: number;
  role?: string;
  university?: string;
}

export interface PostComment {
  id: string;
  author: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface PostItem {
  id: string;
  type: 'featured' | 'secondary' | 'standard';
  category: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary';
  title: string;
  summary: string;
  fullContent?: string;
  image: string;
  author: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  userLiked?: boolean;
  commentsList: PostComment[];
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollItem {
  id: string;
  title: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface BuzzItem {
  id: string;
  title: string;
  content: string;
  category: 'trending' | 'campaign' | 'event';
  icon: string;
  iconBgColor: string;
  timeAgo: string;
  tags: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  code: string;
  description: string;
  membersCount: number;
  subjectTag: string;
  subjectColor: 'primary' | 'secondary' | 'tertiary';
  joined?: boolean;
}

export interface VibeCandidate {
  id: string;
  name: string;
  age: number;
  major: string;
  avatar: string;
  isVerified: boolean;
  quote: string;
  tags: string[];
}

export interface MutualVibe {
  id: string;
  name: string;
  major: string;
  avatar: string;
  lastMessage?: string;
}

export interface NoteDocument {
  id: string;
  title: string;
  type: 'pdf' | 'image' | 'doc';
  size?: string;
  uploadedAt: string;
  fileUrl?: string;
}

export interface NoteFolder {
  id: string;
  title: string;
  courseCode: string;
  professor?: string;
  filesCount: number;
  updatedTag?: string;
  isFeatured?: boolean;
  documents: NoteDocument[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  referencedDoc?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'like' | 'poll' | 'vibe' | 'chat';
}
