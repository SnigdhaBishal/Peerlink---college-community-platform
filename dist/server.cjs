var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express2 = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/config.ts
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var CONFIG = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "peerlink_super_secure_jwt_secret_key_2026_x987123",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  RATE_LIMIT: {
    GLOBAL_WINDOW_MS: 15 * 60 * 1e3,
    // 15 minutes
    GLOBAL_MAX: 300,
    // 300 requests per 15 min
    AUTH_WINDOW_MS: 15 * 60 * 1e3,
    // 15 minutes
    AUTH_MAX: 15,
    // 15 auth attempts per 15 min
    AI_WINDOW_MS: 1 * 60 * 1e3,
    // 1 minute
    AI_MAX: 20
    // 20 requests per minute
  }
};

// server/security.ts
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_cors = __toESM(require("cors"), 1);
var corsMiddleware = (0, import_cors.default)({
  origin: CONFIG.CORS_ORIGIN === "*" ? true : CONFIG.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
});
var helmetMiddleware = (0, import_helmet.default)({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://ai.google.dev"],
      connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
});
var globalRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: CONFIG.RATE_LIMIT.GLOBAL_WINDOW_MS,
  max: CONFIG.RATE_LIMIT.GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again after 15 minutes."
  }
});
var authRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: CONFIG.RATE_LIMIT.AUTH_WINDOW_MS,
  max: CONFIG.RATE_LIMIT.AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many authentication attempts. Please try again in 15 minutes."
  }
});
var aiRateLimiter = (0, import_express_rate_limit.default)({
  windowMs: CONFIG.RATE_LIMIT.AI_WINDOW_MS,
  max: CONFIG.RATE_LIMIT.AI_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "AI request limit reached. Please wait a minute before sending another message."
  }
});
var requestLogger = (req, res, next) => {
  const reqId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  req.id = reqId;
  res.setHeader("X-Request-ID", reqId);
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] [${reqId}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
};
function sanitizeString(input) {
  if (typeof input !== "string") return "";
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").trim();
}
var sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};

// server/routes/api.ts
var import_express = require("express");
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_genai = require("@google/genai");

// server/auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);

// src/data/initialData.ts
var INITIAL_USER = {
  id: "usr_123",
  name: "Snigdha Patel",
  email: "snigdha634.official@gmail.com",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGz1NFCsUB7FuqeyPO3EfIsDSL3yh9wAorSLt5NcoX_5FL1yvORDqXsE2RtQ1IcGi20x9_WqQPejqCbTG8u0RPsY5B_dUZJD3yj_Baj4-QRbcJuvMe8m6J8oTgJ6uKgheITtNCaIdvF9jsgwmYbGixekalGiYIVEkRk-M5tshGHT6fvHRaqSeAz00hN_Ml16n4ZT0DrU_XFXbTuCcRy6FJloFKeQyp4raNRbpEZXN5czmCIN5fRU6R",
  major: "Computer Science",
  gradYear: 2026,
  uploadedFilesCount: 24,
  peersHelpedCount: 156
};
var INITIAL_POSTS = [
  {
    id: "post_1",
    type: "featured",
    category: "Campus News",
    categoryColor: "primary",
    title: "New Tech Hub Opens in the Heart of the Science Quad",
    summary: "The long-awaited innovation center is finally open to all students, offering state-of-the-art collaborative spaces, AR labs, and 24/7 study pods designed for deep focus.",
    fullContent: "The long-awaited innovation center is finally open to all students! Featuring top-notch hardware, 24/7 quiet study pods, 3D printing stations, and high-speed fiber internet, the new Tech Hub aims to bring interdisciplinary projects to life. Reservations for private study pods can be made via the PeerLink app.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9c0isO6ynLJHSMGG2Gt9jka9Gcfpt4T_fRt1IcN-war63bAUlkJJ87yZaL4s_yyM_ZgldMUBmYcv0zQl9wuoY_YUVan9ZAtzjV4sKQSKE_oIiReGu82QmFIEVeDiVYaR9glg_-l3mC4El9CXTwYsuRd5JDp-_Xf4lNQmzgqs3LBSDqTF6oioxBBncievSCq3HDckcOAZaKq9675R1FC_7s0QuC66jEhgTQBb9vUuuctzyTEpimvnG",
    author: "Student Affairs",
    authorAvatar: "SA",
    createdAt: "2h ago",
    likes: 124,
    commentsCount: 32,
    userLiked: false,
    commentsList: [
      { id: "c1", author: "Alex M.", text: "Are the study pods equipped with monitors?", createdAt: "1h ago" },
      { id: "c2", author: "Student Affairs", text: "Yes, every pod features dual 27-inch 4K displays!", createdAt: "45m ago" }
    ]
  },
  {
    id: "post_2",
    type: "secondary",
    category: "Student Life",
    categoryColor: "secondary",
    title: "Surviving Midterms: My Top 5 Study Cafes Off-Campus",
    summary: "Need a break from the library? Here are the best local spots with reliable Wi-Fi and great coffee.",
    fullContent: "Studying in the library during midterms can get overwhelming. Here are my favorite off-campus spots with cozy seating, fast Wi-Fi, and delicious oat lattes: 1. The Grind House 2. Bean & Byte 3. Campus Roasters 4. Quiet Corner Cafe 5. Nook & Books.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCL5SIME_cXWT6myM7xxheybOLZT7hv8Pmm4jkQ-Cwt4zFRvR7WD5JhvR-bGcFyEXG6K2YhSbPaHs_8CP-3OWhmMY1O6VgDmdqQ7MhDF8llxVxRcmhv_jx2B96KMiTDJgSipM_kRve7N_sFGmwUE4nJGnY5ana8QC3fxqcxX9Qo0-dNoqZALyRowe8CII88EPgcfWLA6zUMRTMF4792d0bRfNhZheYHzuKBNGfB5dgHKS3Cxs_2oixU",
    author: "Mia L.",
    authorAvatar: "ML",
    createdAt: "5h ago",
    likes: 89,
    commentsCount: 14,
    userLiked: false,
    commentsList: [
      { id: "c3", author: "Jordan K.", text: "Bean & Byte has the best croissants!", createdAt: "3h ago" }
    ]
  },
  {
    id: "post_3",
    type: "standard",
    category: "Arts & Culture",
    categoryColor: "tertiary",
    title: "Annual Fine Arts Showcase Opens This Friday",
    summary: "Join us in the gallery to celebrate the creative achievements of our senior arts cohort. Refreshments provided.",
    fullContent: "The Fine Arts department is excited to unveil this year\u2019s senior showcase featuring interactive installations, modern sculptures, and original oil paintings. The opening reception begins Friday at 6:00 PM in the Quad Gallery.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPAqF__2k-Y5kPG3xnQAa796t9OknjliUp-t2ZFpGsk5KkndJkYjBvJJm5tyVHeO6H9AvgnjC1jYcIein-PZ-zOMy_PaxGTNpCIMs0TBtXUZFvv7-Z43rrPAhvvI8hQa4AUSQyRWzL8erz6wj2E1fOrjJUSbxk2_-OFV1IwzjSFinH27-l4qUe_1eLU7mBrYCVNpFEi7N9m68rtN6YosHlm2wbZXLvVTsfWgRqC8kMWbSEDYLdtFsA",
    author: "Art Dept",
    authorAvatar: "AD",
    createdAt: "1d ago",
    likes: 45,
    commentsCount: 12,
    userLiked: false,
    commentsList: []
  }
];
var INITIAL_POLL = {
  id: "poll_spring_gala",
  title: "What should be the theme for this year's Spring Gala?",
  options: [
    { id: "opt_1", text: "Roaring 20s", votes: 142 },
    { id: "opt_2", text: "Enchanted Forest", votes: 210 },
    { id: "opt_3", text: "Cyberpunk Future", votes: 188 }
  ],
  totalVotes: 540
};
var INITIAL_BUZZ = [
  {
    id: "buzz_1",
    title: "Midnight Breakfast at Dining Hall",
    content: "Line is already out the door for finals week midnight pancakes. They ran out of syrup last semester, hopefully they stocked up this time!",
    category: "trending",
    icon: "local_fire_department",
    iconBgColor: "bg-error-container text-on-error-container",
    timeAgo: "2m ago",
    tags: ["#Food", "#FinalsWeek"]
  },
  {
    id: "buzz_2",
    title: "Library 3rd Floor - Quiet Zone Violation",
    content: "Who is having a full blown Zoom meeting without headphones on the 3rd floor right now? Pls respect the quiet zone during midterms.",
    category: "campaign",
    icon: "campaign",
    iconBgColor: "bg-secondary-container text-on-secondary-container",
    timeAgo: "15m ago",
    tags: ["#Library"]
  },
  {
    id: "buzz_3",
    title: "Free Coffee at the Quad",
    content: "Student union is handing out free iced lattes by the main fountain until 2PM. Go get caffeinated!",
    category: "event",
    icon: "event_available",
    iconBgColor: "bg-tertiary-container text-on-tertiary-container",
    timeAgo: "1h ago",
    tags: ["#Freebies", "#Quad"]
  }
];
var INITIAL_PROJECTS = [
  {
    id: "proj_1",
    title: "CS101 Study Group",
    code: "CS",
    description: "Preparing for the midterm. Sharing notes and discussing algorithms.",
    membersCount: 42,
    subjectTag: "Comp Sci",
    subjectColor: "secondary",
    joined: false
  },
  {
    id: "proj_2",
    title: "Art History Final Prep",
    code: "AH",
    description: "Flashcard exchange for Renaissance period painters.",
    membersCount: 18,
    subjectTag: "Arts",
    subjectColor: "tertiary",
    joined: false
  },
  {
    id: "proj_3",
    title: "Econ 301 Case Study",
    code: "EC",
    description: "Looking for 2 more people to join our group project on macro trends.",
    membersCount: 8,
    subjectTag: "Economics",
    subjectColor: "secondary",
    joined: false
  }
];
var INITIAL_VIBE_CANDIDATES = [
  {
    id: "vibe_1",
    name: "Elena Rodriguez",
    age: 20,
    major: "Computer Science Major",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAB9eMK3dIm_ITpZCSodcMsfK9XO3FzM2LviKOqARABYkU4tjgFiQwt1VWgoY7lrAjsF2OgmTz0aFIShAJLmSeYjyIbZZPyVbMGHM5Jw0LMhocdD4W-GcUTo1LW80LF1evZ24m7VZgyCngIrTIVrWpaH7ieUQ9i0BWvrcbE6B9Jr4m9LbBr9rZpuzrJ5V6qIFrDWEgEzuHav4ZMWlsveydoKkKNYz22oUT47f636ByEqh0v8uXVlTRx",
    isVerified: true,
    quote: '"Looking for study buddies who also enjoy indie coffee shops and debating algorithmic efficiency over lattes."',
    tags: ["#MachineLearning", "#CoffeeSnob", "#CS101"]
  },
  {
    id: "vibe_2",
    name: "David Kim",
    age: 21,
    major: "Electrical Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    isVerified: true,
    quote: `"Building IoT gadgets by night, grinding physics equations by day. Let's collaborate on robotics projects!"`,
    tags: ["#Robotics", "#IoT", "#Physics"]
  },
  {
    id: "vibe_3",
    name: "Sofia Chen",
    age: 19,
    major: "Biochemistry",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    isVerified: true,
    quote: '"Pre-med student looking for study partners for organic chemistry labs and weekend hiking sessions."',
    tags: ["#PreMed", "#Chemistry", "#Hiking"]
  }
];
var INITIAL_MUTUAL_VIBES = [
  {
    id: "mut_1",
    name: "Marcus Chen",
    major: "Architecture",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7hxjmuVMjEgvAl7z-2g_Q3LmdtteNpmNlhS8o8pNHbcRtyjbc5tsD5x6kolUXISG2cb3St9J-KuZJAkXXtF9QpSQ0hYXytp6jzQPi9uTeQYQQe1KMCgzA3MGi5xxHuHoVgnVfReX20ERMrLn8GmmvpcSt3_oybqaAPfKqGI0AxXmt0XWG1SVADw03PXTu-wm6MYVGOvmMWkAyTtxGKG-oCid9mwb9YNyH5qL1yEURvYEfFbXPHuQd",
    lastMessage: "Hey! Are you working on the design studio model today?"
  },
  {
    id: "mut_2",
    name: "Sarah Jenkins",
    major: "Psychology",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA0Yo8LJHbiKRzo-ec22TgFzEoDyHnFzKWfdsoIPM_gLHdG_0szq0JjbKIf7_pvmifenn7fCGigBjWq2q3wnOZBIaVdLWpiZiKdYT7r4sU8aB84VjHZ6j63cmdU_-3WBLKsuklM87FeW97ahJsrqSHdqOhA_uf0NVvQXCoEMdS2ZF3A28WhLVRW_1CgUj7NuZTWhsLPws2z4PKPKFKHKqf4FAB0QJ1_cDkKF8wharnFqdp1V__EyfZj6D",
    lastMessage: "Thanks for sharing the cognitive psychology flashcards!"
  }
];
var INITIAL_NOTE_FOLDERS = [
  {
    id: "folder_cs201",
    title: "Data Structures & Algorithms",
    courseCode: "CS201",
    professor: "Prof. Alan Turing",
    filesCount: 18,
    updatedTag: "Updated Today",
    isFeatured: true,
    documents: [
      { id: "doc_1", title: "Week 4: Binary Trees Summary", type: "pdf", size: "2.4 MB", uploadedAt: "2h ago", fileUrl: "#" },
      { id: "doc_2", title: "Lecture 8 Whiteboard Snaps", type: "image", size: "4.1 MB", uploadedAt: "Today", fileUrl: "#" }
    ]
  },
  {
    id: "folder_hist310",
    title: "Modern European History",
    courseCode: "HIST310",
    professor: "Prof. E. Hobsbawm",
    filesCount: 12,
    documents: [
      { id: "doc_3", title: "History_Ch4_Industrial_Transition.pdf", type: "pdf", size: "3.1 MB", uploadedAt: "Yesterday", fileUrl: "#" }
    ]
  },
  {
    id: "folder_psych101",
    title: "Intro to Psychology",
    courseCode: "PSYCH101",
    professor: "Dr. Jean Piaget",
    filesCount: 8,
    documents: [
      { id: "doc_4", title: "Behavioral_Cognitive_Frameworks.docx", type: "doc", size: "1.2 MB", uploadedAt: "3 days ago", fileUrl: "#" }
    ]
  },
  {
    id: "folder_chem202",
    title: "Organic Chemistry II",
    courseCode: "CHEM202",
    professor: "Dr. Marie Curie",
    filesCount: 45,
    documents: [
      { id: "doc_5", title: "Reaction_Mechanisms_CheatSheet.pdf", type: "pdf", size: "5.8 MB", uploadedAt: "4 days ago", fileUrl: "#" }
    ]
  }
];

// server/auth.ts
var usersDb = /* @__PURE__ */ new Map();
var defaultPasswordHash = import_bcryptjs.default.hashSync("Password123!", 10);
usersDb.set(INITIAL_USER.email.toLowerCase(), {
  ...INITIAL_USER,
  passwordHash: defaultPasswordHash
});
function generateToken(user) {
  return import_jsonwebtoken.default.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    CONFIG.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    req.user = {
      id: INITIAL_USER.id,
      email: INITIAL_USER.email,
      name: INITIAL_USER.name,
      role: INITIAL_USER.role
    };
    return next();
  }
  try {
    const decoded = import_jsonwebtoken.default.verify(token, CONFIG.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: "Invalid or expired access token."
    });
  }
}
var UserService = {
  findUserByEmail(email) {
    return usersDb.get(email.toLowerCase());
  },
  registerUser(name, email, major, passwordHash) {
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      major,
      gradYear: 2027,
      role: "Student",
      university: "Stanford University",
      avatar: name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      uploadedFilesCount: 0,
      peersHelpedCount: 0,
      passwordHash
    };
    usersDb.set(email.toLowerCase(), newUser);
    return newUser;
  },
  updateUserProfile(email, updates) {
    const existing = usersDb.get(email.toLowerCase());
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    usersDb.set(email.toLowerCase(), updated);
    return updated;
  },
  toPublicProfile(user) {
    const { passwordHash, ...publicProfile } = user;
    return publicProfile;
  }
};

// server/routes/api.ts
var apiRouter = (0, import_express.Router)();
var postsData = [...INITIAL_POSTS];
var pollData = JSON.parse(JSON.stringify(INITIAL_POLL));
var buzzData = [...INITIAL_BUZZ];
var projectsData = [...INITIAL_PROJECTS];
var vibeCandidates = [...INITIAL_VIBE_CANDIDATES];
var mutualVibes = [...INITIAL_MUTUAL_VIBES];
var noteFolders = [...INITIAL_NOTE_FOLDERS];
var aiClient = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = CONFIG.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "peerlink-app" } }
      });
    }
  }
  return aiClient;
}
apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "PeerLink API",
    uptime: process.uptime(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
apiRouter.post("/auth/register", authRateLimiter, async (req, res) => {
  try {
    const { name, email, password, major } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email, and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
    }
    const existingUser = UserService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: "An account with this email already exists." });
    }
    const passwordHash = await import_bcryptjs2.default.hash(password, 10);
    const sanitizedName = sanitizeString(name);
    const sanitizedMajor = sanitizeString(major || "Computer Science");
    const newUser = UserService.registerUser(sanitizedName, email, sanitizedMajor, passwordHash);
    const token = generateToken(newUser);
    const publicProfile = UserService.toPublicProfile(newUser);
    res.status(201).json({
      success: true,
      token,
      user: publicProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Registration failed." });
  }
});
apiRouter.post("/auth/login", authRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }
    const user = UserService.findUserByEmail(email);
    if (!user || !user.passwordHash) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }
    const isMatch = await import_bcryptjs2.default.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }
    const token = generateToken(user);
    const publicProfile = UserService.toPublicProfile(user);
    res.json({
      success: true,
      token,
      user: publicProfile
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || "Login failed." });
  }
});
apiRouter.get("/auth/me", authenticateToken, (req, res) => {
  const userEmail = req.user?.email || INITIAL_USER.email;
  const user = UserService.findUserByEmail(userEmail);
  if (user) {
    return res.json(UserService.toPublicProfile(user));
  }
  res.json(INITIAL_USER);
});
apiRouter.post("/auth/update", authenticateToken, (req, res) => {
  const { name, major, email } = req.body;
  const targetEmail = req.user?.email || INITIAL_USER.email;
  const updates = {};
  if (name) updates.name = sanitizeString(name);
  if (major) updates.major = sanitizeString(major);
  const updated = UserService.updateUserProfile(targetEmail, updates);
  if (updated) {
    return res.json(UserService.toPublicProfile(updated));
  }
  res.json(INITIAL_USER);
});
apiRouter.get("/posts", (req, res) => {
  res.json(postsData);
});
apiRouter.post("/posts", authenticateToken, (req, res) => {
  const { title, summary, fullContent, category } = req.body;
  if (!title || !summary) {
    return res.status(400).json({ error: "Title and summary are required" });
  }
  const authorName = req.user?.name || INITIAL_USER.name;
  const newPost = {
    id: `post_${Date.now()}`,
    type: "standard",
    category: sanitizeString(category || "General"),
    categoryColor: "primary",
    title: sanitizeString(title),
    summary: sanitizeString(summary),
    fullContent: sanitizeString(fullContent || summary),
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    author: authorName,
    authorAvatar: authorName.split(" ").map((n) => n[0]).join("").slice(0, 2),
    createdAt: "Just now",
    likes: 0,
    commentsCount: 0,
    userLiked: false,
    commentsList: []
  };
  postsData.unshift(newPost);
  res.status(201).json(newPost);
});
apiRouter.post("/posts/:id/like", (req, res) => {
  const { id } = req.params;
  const post = postsData.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
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
apiRouter.post("/posts/:id/comments", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  const post = postsData.find((p) => p.id === id);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Comment text required" });
  }
  const authorName = req.user?.name || INITIAL_USER.name;
  const newComment = {
    id: `c_${Date.now()}`,
    author: authorName,
    text: sanitizeString(text.trim()),
    createdAt: "Just now"
  };
  post.commentsList.push(newComment);
  post.commentsCount = post.commentsList.length;
  res.json(post);
});
apiRouter.get("/poll", (req, res) => {
  res.json(pollData);
});
apiRouter.post("/poll/vote", (req, res) => {
  const { optionId } = req.body;
  const option = pollData.options.find((o) => o.id === optionId);
  if (!option) {
    return res.status(400).json({ error: "Invalid option ID" });
  }
  if (pollData.userVotedOptionId) {
    const previousOption = pollData.options.find((o) => o.id === pollData.userVotedOptionId);
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
apiRouter.get("/buzz", (req, res) => {
  res.json(buzzData);
});
apiRouter.post("/buzz", (req, res) => {
  const { title, content, tags } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }
  const newBuzz = {
    id: `buzz_${Date.now()}`,
    title: sanitizeString(title),
    content: sanitizeString(content),
    category: "trending",
    icon: "campaign",
    iconBgColor: "bg-primary-container text-on-primary-container",
    timeAgo: "Just now",
    tags: Array.isArray(tags) ? tags.map((t) => sanitizeString(t)) : ["#Campus"]
  };
  buzzData.unshift(newBuzz);
  res.status(201).json(newBuzz);
});
apiRouter.get("/projects", (req, res) => {
  res.json(projectsData);
});
apiRouter.post("/projects", (req, res) => {
  const { title, subjectTag, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: "Title and description required" });
  }
  const code = title.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase() || "CS";
  const newProject = {
    id: `proj_${Date.now()}`,
    title: sanitizeString(title),
    code,
    description: sanitizeString(description),
    membersCount: 1,
    subjectTag: sanitizeString(subjectTag || "General"),
    subjectColor: "primary",
    joined: true
  };
  projectsData.push(newProject);
  res.status(201).json(newProject);
});
apiRouter.post("/projects/:id/join", (req, res) => {
  const { id } = req.params;
  const project = projectsData.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: "Project not found" });
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
apiRouter.get("/vibes", (req, res) => {
  res.json({
    candidates: vibeCandidates,
    mutualVibes
  });
});
apiRouter.post("/vibes/action", (req, res) => {
  const { candidateId, action } = req.body;
  const candidateIndex = vibeCandidates.findIndex((c) => c.id === candidateId);
  if (candidateIndex !== -1) {
    const candidate = vibeCandidates[candidateIndex];
    vibeCandidates.splice(candidateIndex, 1);
    if (action === "vibe") {
      const newMutual = {
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
    mutualVibes
  });
});
apiRouter.get("/notes", authenticateToken, (req, res) => {
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
apiRouter.post("/notes/upload", authenticateToken, (req, res) => {
  const { folderId, title, type } = req.body;
  let targetFolder = noteFolders.find((f) => f.id === folderId);
  if (!targetFolder && noteFolders.length > 0) {
    targetFolder = noteFolders[0];
  }
  const userEmail = req.user?.email || INITIAL_USER.email;
  const user = UserService.findUserByEmail(userEmail) || INITIAL_USER;
  if (targetFolder) {
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: sanitizeString(title || "New Course Notes"),
      type: type === "pdf" || type === "image" || type === "doc" ? type : "pdf",
      size: "1.8 MB",
      uploadedAt: "Just now",
      fileUrl: "#"
    };
    targetFolder.documents.unshift(newDoc);
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
apiRouter.post("/chat", aiRateLimiter, async (req, res) => {
  try {
    const { message, selectedDoc } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }
    const sanitizedMsg = sanitizeString(message);
    const docRef = sanitizeString(selectedDoc || "History_Ch4_Notes.pdf");
    const ai = getGeminiClient();
    let replyText = "";
    if (ai) {
      const systemInstruction = `You are PeerLink AI, an intelligent, empathetic, and highly capable academic study assistant on a modern university campus platform.
You assist students with reviewing lecture notes, summarizing chapters, explaining complex concepts, answering syllabus questions, and generating flashcards or practice quizzes.
Maintain a friendly, structured, encouraging, and clear academic tone. Use markdown headings or bullet points.
Context: You have access to the user's uploaded course notes. Selected Document: "${docRef}".`;
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: sanitizedMsg,
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });
      replyText = response.text || "I'm here to help with your study notes! Could you rephrase your question?";
    } else {
      replyText = `### Key Summary for ${docRef}

\u2022 **Main Concept**: In-depth analysis of structural course components and historical context.
\u2022 **Key Takeaway**: Industrialization led to rapid urbanization, changing labor laws, and expanding academic research.
\u2022 **Study Tip**: Focus on key definitions and dates for your upcoming midterm exam!`;
    }
    res.json({
      reply: replyText,
      referencedDoc: docRef
    });
  } catch (err) {
    console.error("Gemini AI API Error:", err);
    res.json({
      reply: "I reviewed your course notes! Chapter 4 covers the key transition from agrarian labor to industrial automation, highlighting major urbanization trends and labor reform movements.",
      referencedDoc: req.body.selectedDoc || "History_Ch4_Notes.pdf",
      errorNote: err.message
    });
  }
});

// server/middleware/errorHandler.ts
var errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[Error] [${req.method} ${req.originalUrl}] (${statusCode}):`, err.stack || err.message);
  res.status(statusCode).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? err.details : void 0,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};
var notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
};

// server.ts
async function startServer() {
  const app = (0, import_express2.default)();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(requestLogger);
  app.use(import_express2.default.json({ limit: "10mb" }));
  app.use(import_express2.default.urlencoded({ extended: true, limit: "10mb" }));
  app.use(sanitizeRequestBody);
  app.get("/healthz", (req, res) => {
    res.status(200).send("OK");
  });
  app.use("/api", globalRateLimiter, apiRouter);
  if (CONFIG.NODE_ENV !== "production" && process.env.VITE_DEV !== "false") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express2.default.static(distPath, { maxAge: "1d", etag: true }));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.use(notFoundHandler);
  app.use(errorHandler);
  const server = app.listen(CONFIG.PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} PeerLink Server running on http://0.0.0.0:${CONFIG.PORT} (${CONFIG.NODE_ENV} mode)`);
  });
  const shutdown = (signal) => {
    console.log(`
Received ${signal}. Shutting down server gracefully...`);
    server.close(() => {
      console.log("HTTP server closed. Exiting process.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
