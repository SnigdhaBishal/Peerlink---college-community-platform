import { PostItem, PollItem, BuzzItem, ProjectItem, VibeCandidate, MutualVibe, NoteFolder, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_123',
  name: 'Snigdha Patel',
  email: 'snigdha634.official@gmail.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGz1NFCsUB7FuqeyPO3EfIsDSL3yh9wAorSLt5NcoX_5FL1yvORDqXsE2RtQ1IcGi20x9_WqQPejqCbTG8u0RPsY5B_dUZJD3yj_Baj4-QRbcJuvMe8m6J8oTgJ6uKgheITtNCaIdvF9jsgwmYbGixekalGiYIVEkRk-M5tshGHT6fvHRaqSeAz00hN_Ml16n4ZT0DrU_XFXbTuCcRy6FJloFKeQyp4raNRbpEZXN5czmCIN5fRU6R',
  major: 'Computer Science',
  gradYear: 2026,
  uploadedFilesCount: 24,
  peersHelpedCount: 156
};

export const INITIAL_POSTS: PostItem[] = [
  {
    id: 'post_1',
    type: 'featured',
    category: 'Campus News',
    categoryColor: 'primary',
    title: 'New Tech Hub Opens in the Heart of the Science Quad',
    summary: 'The long-awaited innovation center is finally open to all students, offering state-of-the-art collaborative spaces, AR labs, and 24/7 study pods designed for deep focus.',
    fullContent: 'The long-awaited innovation center is finally open to all students! Featuring top-notch hardware, 24/7 quiet study pods, 3D printing stations, and high-speed fiber internet, the new Tech Hub aims to bring interdisciplinary projects to life. Reservations for private study pods can be made via the PeerLink app.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9c0isO6ynLJHSMGG2Gt9jka9Gcfpt4T_fRt1IcN-war63bAUlkJJ87yZaL4s_yyM_ZgldMUBmYcv0zQl9wuoY_YUVan9ZAtzjV4sKQSKE_oIiReGu82QmFIEVeDiVYaR9glg_-l3mC4El9CXTwYsuRd5JDp-_Xf4lNQmzgqs3LBSDqTF6oioxBBncievSCq3HDckcOAZaKq9675R1FC_7s0QuC66jEhgTQBb9vUuuctzyTEpimvnG',
    author: 'Student Affairs',
    authorAvatar: 'SA',
    createdAt: '2h ago',
    likes: 124,
    commentsCount: 32,
    userLiked: false,
    commentsList: [
      { id: 'c1', author: 'Alex M.', text: 'Are the study pods equipped with monitors?', createdAt: '1h ago' },
      { id: 'c2', author: 'Student Affairs', text: 'Yes, every pod features dual 27-inch 4K displays!', createdAt: '45m ago' }
    ]
  },
  {
    id: 'post_2',
    type: 'secondary',
    category: 'Student Life',
    categoryColor: 'secondary',
    title: 'Surviving Midterms: My Top 5 Study Cafes Off-Campus',
    summary: 'Need a break from the library? Here are the best local spots with reliable Wi-Fi and great coffee.',
    fullContent: 'Studying in the library during midterms can get overwhelming. Here are my favorite off-campus spots with cozy seating, fast Wi-Fi, and delicious oat lattes: 1. The Grind House 2. Bean & Byte 3. Campus Roasters 4. Quiet Corner Cafe 5. Nook & Books.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCL5SIME_cXWT6myM7xxheybOLZT7hv8Pmm4jkQ-Cwt4zFRvR7WD5JhvR-bGcFyEXG6K2YhSbPaHs_8CP-3OWhmMY1O6VgDmdqQ7MhDF8llxVxRcmhv_jx2B96KMiTDJgSipM_kRve7N_sFGmwUE4nJGnY5ana8QC3fxqcxX9Qo0-dNoqZALyRowe8CII88EPgcfWLA6zUMRTMF4792d0bRfNhZheYHzuKBNGfB5dgHKS3Cxs_2oixU',
    author: 'Mia L.',
    authorAvatar: 'ML',
    createdAt: '5h ago',
    likes: 89,
    commentsCount: 14,
    userLiked: false,
    commentsList: [
      { id: 'c3', author: 'Jordan K.', text: 'Bean & Byte has the best croissants!', createdAt: '3h ago' }
    ]
  },
  {
    id: 'post_3',
    type: 'standard',
    category: 'Arts & Culture',
    categoryColor: 'tertiary',
    title: 'Annual Fine Arts Showcase Opens This Friday',
    summary: 'Join us in the gallery to celebrate the creative achievements of our senior arts cohort. Refreshments provided.',
    fullContent: 'The Fine Arts department is excited to unveil this year’s senior showcase featuring interactive installations, modern sculptures, and original oil paintings. The opening reception begins Friday at 6:00 PM in the Quad Gallery.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPAqF__2k-Y5kPG3xnQAa796t9OknjliUp-t2ZFpGsk5KkndJkYjBvJJm5tyVHeO6H9AvgnjC1jYcIein-PZ-zOMy_PaxGTNpCIMs0TBtXUZFvv7-Z43rrPAhvvI8hQa4AUSQyRWzL8erz6wj2E1fOrjJUSbxk2_-OFV1IwzjSFinH27-l4qUe_1eLU7mBrYCVNpFEi7N9m68rtN6YosHlm2wbZXLvVTsfWgRqC8kMWbSEDYLdtFsA',
    author: 'Art Dept',
    authorAvatar: 'AD',
    createdAt: '1d ago',
    likes: 45,
    commentsCount: 12,
    userLiked: false,
    commentsList: []
  }
];

export const INITIAL_POLL: PollItem = {
  id: 'poll_spring_gala',
  title: "What should be the theme for this year's Spring Gala?",
  options: [
    { id: 'opt_1', text: 'Roaring 20s', votes: 142 },
    { id: 'opt_2', text: 'Enchanted Forest', votes: 210 },
    { id: 'opt_3', text: 'Cyberpunk Future', votes: 188 }
  ],
  totalVotes: 540
};

export const INITIAL_BUZZ: BuzzItem[] = [
  {
    id: 'buzz_1',
    title: 'Midnight Breakfast at Dining Hall',
    content: 'Line is already out the door for finals week midnight pancakes. They ran out of syrup last semester, hopefully they stocked up this time!',
    category: 'trending',
    icon: 'local_fire_department',
    iconBgColor: 'bg-error-container text-on-error-container',
    timeAgo: '2m ago',
    tags: ['#Food', '#FinalsWeek']
  },
  {
    id: 'buzz_2',
    title: 'Library 3rd Floor - Quiet Zone Violation',
    content: 'Who is having a full blown Zoom meeting without headphones on the 3rd floor right now? Pls respect the quiet zone during midterms.',
    category: 'campaign',
    icon: 'campaign',
    iconBgColor: 'bg-secondary-container text-on-secondary-container',
    timeAgo: '15m ago',
    tags: ['#Library']
  },
  {
    id: 'buzz_3',
    title: 'Free Coffee at the Quad',
    content: 'Student union is handing out free iced lattes by the main fountain until 2PM. Go get caffeinated!',
    category: 'event',
    icon: 'event_available',
    iconBgColor: 'bg-tertiary-container text-on-tertiary-container',
    timeAgo: '1h ago',
    tags: ['#Freebies', '#Quad']
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj_1',
    title: 'CS101 Study Group',
    code: 'CS',
    description: 'Preparing for the midterm. Sharing notes and discussing algorithms.',
    membersCount: 42,
    subjectTag: 'Comp Sci',
    subjectColor: 'secondary',
    joined: false
  },
  {
    id: 'proj_2',
    title: 'Art History Final Prep',
    code: 'AH',
    description: 'Flashcard exchange for Renaissance period painters.',
    membersCount: 18,
    subjectTag: 'Arts',
    subjectColor: 'tertiary',
    joined: false
  },
  {
    id: 'proj_3',
    title: 'Econ 301 Case Study',
    code: 'EC',
    description: 'Looking for 2 more people to join our group project on macro trends.',
    membersCount: 8,
    subjectTag: 'Economics',
    subjectColor: 'secondary',
    joined: false
  }
];

export const INITIAL_VIBE_CANDIDATES: VibeCandidate[] = [
  {
    id: 'vibe_1',
    name: 'Elena Rodriguez',
    age: 20,
    major: 'Computer Science Major',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAB9eMK3dIm_ITpZCSodcMsfK9XO3FzM2LviKOqARABYkU4tjgFiQwt1VWgoY7lrAjsF2OgmTz0aFIShAJLmSeYjyIbZZPyVbMGHM5Jw0LMhocdD4W-GcUTo1LW80LF1evZ24m7VZgyCngIrTIVrWpaH7ieUQ9i0BWvrcbE6B9Jr4m9LbBr9rZpuzrJ5V6qIFrDWEgEzuHav4ZMWlsveydoKkKNYz22oUT47f636ByEqh0v8uXVlTRx',
    isVerified: true,
    quote: '"Looking for study buddies who also enjoy indie coffee shops and debating algorithmic efficiency over lattes."',
    tags: ['#MachineLearning', '#CoffeeSnob', '#CS101']
  },
  {
    id: 'vibe_2',
    name: 'David Kim',
    age: 21,
    major: 'Electrical Engineering',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    isVerified: true,
    quote: '"Building IoT gadgets by night, grinding physics equations by day. Let\'s collaborate on robotics projects!"',
    tags: ['#Robotics', '#IoT', '#Physics']
  },
  {
    id: 'vibe_3',
    name: 'Sofia Chen',
    age: 19,
    major: 'Biochemistry',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
    isVerified: true,
    quote: '"Pre-med student looking for study partners for organic chemistry labs and weekend hiking sessions."',
    tags: ['#PreMed', '#Chemistry', '#Hiking']
  }
];

export const INITIAL_MUTUAL_VIBES: MutualVibe[] = [
  {
    id: 'mut_1',
    name: 'Marcus Chen',
    major: 'Architecture',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7hxjmuVMjEgvAl7z-2g_Q3LmdtteNpmNlhS8o8pNHbcRtyjbc5tsD5x6kolUXISG2cb3St9J-KuZJAkXXtF9QpSQ0hYXytp6jzQPi9uTeQYQQe1KMCgzA3MGi5xxHuHoVgnVfReX20ERMrLn8GmmvpcSt3_oybqaAPfKqGI0AxXmt0XWG1SVADw03PXTu-wm6MYVGOvmMWkAyTtxGKG-oCid9mwb9YNyH5qL1yEURvYEfFbXPHuQd',
    lastMessage: 'Hey! Are you working on the design studio model today?'
  },
  {
    id: 'mut_2',
    name: 'Sarah Jenkins',
    major: 'Psychology',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0Yo8LJHbiKRzo-ec22TgFzEoDyHnFzKWfdsoIPM_gLHdG_0szq0JjbKIf7_pvmifenn7fCGigBjWq2q3wnOZBIaVdLWpiZiKdYT7r4sU8aB84VjHZ6j63cmdU_-3WBLKsuklM87FeW97ahJsrqSHdqOhA_uf0NVvQXCoEMdS2ZF3A28WhLVRW_1CgUj7NuZTWhsLPws2z4PKPKFKHKqf4FAB0QJ1_cDkKF8wharnFqdp1V__EyfZj6D',
    lastMessage: 'Thanks for sharing the cognitive psychology flashcards!'
  }
];

export const INITIAL_NOTE_FOLDERS: NoteFolder[] = [
  {
    id: 'folder_cs201',
    title: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    professor: 'Prof. Alan Turing',
    filesCount: 18,
    updatedTag: 'Updated Today',
    isFeatured: true,
    documents: [
      { id: 'doc_1', title: 'Week 4: Binary Trees Summary', type: 'pdf', size: '2.4 MB', uploadedAt: '2h ago', fileUrl: '#' },
      { id: 'doc_2', title: 'Lecture 8 Whiteboard Snaps', type: 'image', size: '4.1 MB', uploadedAt: 'Today', fileUrl: '#' }
    ]
  },
  {
    id: 'folder_hist310',
    title: 'Modern European History',
    courseCode: 'HIST310',
    professor: 'Prof. E. Hobsbawm',
    filesCount: 12,
    documents: [
      { id: 'doc_3', title: 'History_Ch4_Industrial_Transition.pdf', type: 'pdf', size: '3.1 MB', uploadedAt: 'Yesterday', fileUrl: '#' }
    ]
  },
  {
    id: 'folder_psych101',
    title: 'Intro to Psychology',
    courseCode: 'PSYCH101',
    professor: 'Dr. Jean Piaget',
    filesCount: 8,
    documents: [
      { id: 'doc_4', title: 'Behavioral_Cognitive_Frameworks.docx', type: 'doc', size: '1.2 MB', uploadedAt: '3 days ago', fileUrl: '#' }
    ]
  },
  {
    id: 'folder_chem202',
    title: 'Organic Chemistry II',
    courseCode: 'CHEM202',
    professor: 'Dr. Marie Curie',
    filesCount: 45,
    documents: [
      { id: 'doc_5', title: 'Reaction_Mechanisms_CheatSheet.pdf', type: 'pdf', size: '5.8 MB', uploadedAt: '4 days ago', fileUrl: '#' }
    ]
  }
];
