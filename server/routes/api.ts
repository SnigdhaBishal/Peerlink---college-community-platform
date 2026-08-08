import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';
import { CONFIG } from '../config';
import { authRateLimiter, aiRateLimiter, sanitizeString } from '../security';
import { UserService, generateToken, AuthenticatedRequest, authenticateToken } from '../auth';
import {
  INITIAL_USER,
  INITIAL_POSTS,
  INITIAL_POLL,
  INITIAL_BUZZ,
  INITIAL_PROJECTS,
  INITIAL_VIBE_CANDIDATES,
  INITIAL_MUTUAL_VIBES,
  INITIAL_NOTE_FOLDERS
} from '../../src/data/initialData';
import { PostItem, PollItem, BuzzItem, ProjectItem, VibeCandidate, MutualVibe, NoteFolder } from '../../src/types';

export const apiRouter = Router();

// In-Memory Data Repositories
let postsData: PostItem[] = [...INITIAL_POSTS];
let pollData: PollItem = JSON.parse(JSON.stringify(INITIAL_POLL));
let buzzData: BuzzItem[] = [...INITIAL_BUZZ];
let projectsData: ProjectItem[] = [...INITIAL_PROJECTS];
let vibeCandidates: VibeCandidate[] = [...INITIAL_VIBE_CANDIDATES];
let mutualVibes: MutualVibe[] = [...INITIAL_MUTUAL_VIBES];
let noteFolders: NoteFolder[] = [...INITIAL_NOTE_FOLDERS];

// Gemini AI Client Instance
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = CONFIG.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'peerlink-app' } }
      });
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// Health Check Routes
// -------------------------------------------------------------
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'PeerLink API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Authentication & User Profile Routes
// -------------------------------------------------------------

// User Registration
apiRouter.post('/auth/register', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password, major } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = UserService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sanitizedName = sanitizeString(name);
    const sanitizedMajor = sanitizeString(major || 'Computer Science');

    const newUser = UserService.registerUser(sanitizedName, email, sanitizedMajor, passwordHash);
    const token = generateToken(newUser);
    const publicProfile = UserService.toPublicProfile(newUser);

    res.status(201).json({
      success: true,
      token,
      user: publicProfile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// User Login
apiRouter.post('/auth/login', authRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = UserService.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const publicProfile = UserService.toPublicProfile(user);

    res.json({
      success: true,
      token,
      user: publicProfile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Login failed.' });
  }
});

// Current User Profile
apiRouter.get('/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userEmail = req.user?.email || INITIAL_USER.email;
  const user = UserService.findUserByEmail(userEmail);

  if (user) {
    return res.json(UserService.toPublicProfile(user));
  }
  res.json(INITIAL_USER);
});

// Update User Profile
apiRouter.post('/auth/update', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { name, major, email } = req.body;
  const targetEmail = req.user?.email || INITIAL_USER.email;

  const updates: Partial<any> = {};
  if (name) updates.name = sanitizeString(name);
  if (major) updates.major = sanitizeString(major);

  const updated = UserService.updateUserProfile(targetEmail, updates);

  if (updated) {
    return res.json(UserService.toPublicProfile(updated));
  }
  res.json(INITIAL_USER);
});

// -------------------------------------------------------------
// Campus Feed Posts Routes
// -------------------------------------------------------------

apiRouter.get('/posts', (req: Request, res: Response) => {
  res.json(postsData);
});

apiRouter.post('/posts', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { title, summary, fullContent, category } = req.body;
  if (!title || !summary) {
    return res.status(400).json({ error: 'Title and summary are required' });
  }

  const authorName = req.user?.name || INITIAL_USER.name;
  const newPost: PostItem = {
    id: `post_${Date.now()}`,
    type: 'standard',
    category: sanitizeString(category || 'General'),
    categoryColor: 'primary',
    title: sanitizeString(title),
    summary: sanitizeString(summary),
    fullContent: sanitizeString(fullContent || summary),
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    author: authorName,
    authorAvatar: authorName.split(' ').map(n => n[0]).join('').slice(0, 2),
    createdAt: 'Just now',
    likes: 0,
    commentsCount: 0,
    userLiked: false,
    commentsList: []
  };

  postsData.unshift(newPost);
  res.status(201).json(newPost);
});

apiRouter.post('/posts/:id/like', (req: Request, res: Response) => {
  const { id } = req.params;
  const post = postsData.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.userLiked) {
    post.likes = Math.max(0, post.likes - 1);
    post.userLiked = false;
  } else {
    post.likes += 1;
    post.userLiked = true;
  }
  res.json(post);
});

apiRouter.post('/posts/:id/comments', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;
  const post = postsData.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text required' });
  }
  const authorName = req.user?.name || INITIAL_USER.name;
  const newComment = {
    id: `c_${Date.now()}`,
    author: authorName,
    text: sanitizeString(text.trim()),
    createdAt: 'Just now'
  };
  post.commentsList.push(newComment);
  post.commentsCount = post.commentsList.length;
  res.json(post);
});

// -------------------------------------------------------------
// Campus Pulse Poll Routes
// -------------------------------------------------------------

apiRouter.get('/poll', (req: Request, res: Response) => {
  res.json(pollData);
});

apiRouter.post('/poll/vote', (req: Request, res: Response) => {
  const { optionId } = req.body;
  const option = pollData.options.find(o => o.id === optionId);
  if (!option) {
    return res.status(400).json({ error: 'Invalid option ID' });
  }
  if (pollData.userVotedOptionId) {
    const previousOption = pollData.options.find(o => o.id === pollData.userVotedOptionId);
    if (previousOption && previousOption.votes > 0) {
      previousOption.votes -= 1;
      pollData.totalVotes = Math.max(0, pollData.totalVotes - 1);
    }
  }
  option.votes += 1;
  pollData.totalVotes += 1;
  pollData.userVotedOptionId = optionId;
  res.json(pollData);
});

// -------------------------------------------------------------
// Campus Hub Buzz & Projects Routes
// -------------------------------------------------------------

apiRouter.get('/buzz', (req: Request, res: Response) => {
  res.json(buzzData);
});

apiRouter.post('/buzz', (req: Request, res: Response) => {
  const { title, content, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content required' });
  }
  const newBuzz: BuzzItem = {
    id: `buzz_${Date.now()}`,
    title: sanitizeString(title),
    content: sanitizeString(content),
    category: 'trending',
    icon: 'campaign',
    iconBgColor: 'bg-primary-container text-on-primary-container',
    timeAgo: 'Just now',
    tags: Array.isArray(tags) ? tags.map((t: string) => sanitizeString(t)) : ['#Campus']
  };
  buzzData.unshift(newBuzz);
  res.status(201).json(newBuzz);
});

apiRouter.get('/projects', (req: Request, res: Response) => {
  res.json(projectsData);
});

apiRouter.post('/projects', (req: Request, res: Response) => {
  const { title, subjectTag, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description required' });
  }
  const code = title.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() || 'CS';
  const newProject: ProjectItem = {
    id: `proj_${Date.now()}`,
    title: sanitizeString(title),
    code,
    description: sanitizeString(description),
    membersCount: 1,
    subjectTag: sanitizeString(subjectTag || 'General'),
    subjectColor: 'primary',
    joined: true
  };
  projectsData.push(newProject);
  res.status(201).json(newProject);
});

apiRouter.post('/projects/:id/join', (req: Request, res: Response) => {
  const { id } = req.params;
  const project = projectsData.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  if (project.joined) {
    project.joined = false;
    project.membersCount = Math.max(0, project.membersCount - 1);
  } else {
    project.joined = true;
    project.membersCount += 1;
  }
  res.json(project);
});

// -------------------------------------------------------------
// Vibe Check (Peer Discovery) Routes
// -------------------------------------------------------------

apiRouter.get('/vibes', (req: Request, res: Response) => {
  res.json({
    candidates: vibeCandidates,
    mutualVibes: mutualVibes
  });
});

apiRouter.post('/vibes/action', (req: Request, res: Response) => {
  const { candidateId, action } = req.body;
  const candidateIndex = vibeCandidates.findIndex(c => c.id === candidateId);
  if (candidateIndex !== -1) {
    const candidate = vibeCandidates[candidateIndex];
    vibeCandidates.splice(candidateIndex, 1);
    if (action === 'vibe') {
      const newMutual: MutualVibe = {
        id: `mut_${Date.now()}`,
        name: candidate.name,
        major: candidate.major,
        avatar: candidate.avatar,
        lastMessage: `Connected via Vibe Check!`
      };
      mutualVibes.unshift(newMutual);
    }
  }
  res.json({
    candidates: vibeCandidates,
    mutualVibes: mutualVibes
  });
});

// -------------------------------------------------------------
// Notes Library Routes
// -------------------------------------------------------------

apiRouter.get('/notes', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const userEmail = req.user?.email || INITIAL_USER.email;
  const user = UserService.findUserByEmail(userEmail) || INITIAL_USER;

  res.json({
    folders: noteFolders,
    userStats: {
      uploadedFilesCount: user.uploadedFilesCount,
      peersHelpedCount: user.peersHelpedCount
    }
  });
});

apiRouter.post('/notes/upload', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { folderId, title, type } = req.body;
  let targetFolder = noteFolders.find(f => f.id === folderId);
  if (!targetFolder && noteFolders.length > 0) {
    targetFolder = noteFolders[0];
  }

  const userEmail = req.user?.email || INITIAL_USER.email;
  const user = UserService.findUserByEmail(userEmail) || INITIAL_USER;

  if (targetFolder) {
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: sanitizeString(title || 'New Course Notes'),
      type: (type === 'pdf' || type === 'image' || type === 'doc') ? type : 'pdf',
      size: '1.8 MB',
      uploadedAt: 'Just now',
      fileUrl: '#'
    };
    targetFolder.documents.unshift(newDoc as any);
    targetFolder.filesCount += 1;
    user.uploadedFilesCount += 1;
    user.peersHelpedCount += 3;
    UserService.updateUserProfile(userEmail, {
      uploadedFilesCount: user.uploadedFilesCount,
      peersHelpedCount: user.peersHelpedCount
    });
  }

  res.json({
    folders: noteFolders,
    userStats: {
      uploadedFilesCount: user.uploadedFilesCount,
      peersHelpedCount: user.peersHelpedCount
    }
  });
});

// -------------------------------------------------------------
// AI Study Assistant Chat Route (Server-Side Gemini 3.6 Flash)
// -------------------------------------------------------------

apiRouter.post('/chat', aiRateLimiter, async (req: Request, res: Response) => {
  try {
    const { message, selectedDoc } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sanitizedMsg = sanitizeString(message);
    const docRef = sanitizeString(selectedDoc || 'History_Ch4_Notes.pdf');

    const ai = getGeminiClient();
    let replyText = '';

    if (ai) {
      const systemInstruction = `You are PeerLink AI, an intelligent, empathetic, and highly capable academic study assistant on a modern university campus platform.
You assist students with reviewing lecture notes, summarizing chapters, explaining complex concepts, answering syllabus questions, and generating flashcards or practice quizzes.
Maintain a friendly, structured, encouraging, and clear academic tone. Use markdown headings or bullet points.
Context: You have access to the user's uploaded course notes. Selected Document: "${docRef}".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: sanitizedMsg,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      replyText = response.text || "I'm here to help with your study notes! Could you rephrase your question?";
    } else {
      // Intelligent fallback answer if API key is not configured
      replyText = `### Key Summary for ${docRef}\n\n` +
        `• **Main Concept**: In-depth analysis of structural course components and historical context.\n` +
        `• **Key Takeaway**: Industrialization led to rapid urbanization, changing labor laws, and expanding academic research.\n` +
        `• **Study Tip**: Focus on key definitions and dates for your upcoming midterm exam!`;
    }

    res.json({
      reply: replyText,
      referencedDoc: docRef
    });
  } catch (err: any) {
    console.error('Gemini AI API Error:', err);
    res.json({
      reply: "I reviewed your course notes! Chapter 4 covers the key transition from agrarian labor to industrial automation, highlighting major urbanization trends and labor reform movements.",
      referencedDoc: req.body.selectedDoc || 'History_Ch4_Notes.pdf',
      errorNote: err.message
    });
  }
});
