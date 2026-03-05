// Mock data for initial frontend display

export const mockProfiles = [
  { id: "p1", display_name: "هەژار ئەحمەد", avatar_url: null, bio: "گەشەپێدەری زیرەکی دەستکرد" },
  { id: "p2", display_name: "ژیان محەمەد", avatar_url: null, bio: "توێژەری فێرکاری ئامێری" },
  { id: "p3", display_name: "دانا عەلی", avatar_url: null, bio: "دیزاینەری UI/UX" },
  { id: "p4", display_name: "سارا حوسێن", avatar_url: null, bio: "ئەندازیاری داتا" },
];

export const mockProjects = [
  {
    id: "pr1",
    title: "کوردی GPT",
    description: "مۆدێلێکی زمانی گەورە بۆ زمانی کوردی کە لە سەر داتای کوردی ڕاهێنراوە و دەتوانێت وەڵامی پرسیارەکان بداتەوە بە کوردی.",
    category: "ai_tool" as const,
    tags: ["NLP", "GPT", "کوردی"],
    author: mockProfiles[0],
    views_count: 342,
    created_at: "2026-02-15",
  },
  {
    id: "pr2",
    title: "بینایی ئامێری بۆ ناسینەوەی ڕووی خەڵک",
    description: "سیستەمێکی ناسینەوەی ڕووی خەڵک بە بەکارهێنانی تۆڕی نیوڕۆنی قووڵ کە دەتوانێت کەسەکان بناسێتەوە.",
    category: "ai_solution" as const,
    tags: ["Computer Vision", "Deep Learning"],
    author: mockProfiles[1],
    views_count: 218,
    created_at: "2026-02-20",
  },
  {
    id: "pr3",
    title: "وەرگێڕی زیرەکی کوردی-ئینگلیزی",
    description: "ئەپلیکەیشنێکی وەرگێڕانی ئۆتۆماتیکی لە نێوان کوردی و ئینگلیزیدا بە بەکارهێنانی مۆدێلی Transformer.",
    category: "ai_website" as const,
    tags: ["Translation", "NLP", "Transformer"],
    author: mockProfiles[2],
    views_count: 567,
    created_at: "2026-01-10",
  },
  {
    id: "pr4",
    title: "ئەپی ناسینەوەی دەنگی کوردی",
    description: "ئەپلیکەیشنێکی مۆبایل بۆ گۆڕینی دەنگ بۆ تێکست بە زمانی کوردی سۆرانی.",
    category: "ai_mobile_app" as const,
    tags: ["Speech Recognition", "Mobile", "کوردی"],
    author: mockProfiles[3],
    views_count: 891,
    created_at: "2026-03-01",
  },
];

export const mockQuestions = [
  {
    id: "q1",
    title: "چۆن دەتوانم مۆدێلی GPT ڕاهێنان بکەم لەسەر داتای کوردی؟",
    body: "من دەمەوێت مۆدێلێکی زمانی بچووک بۆ زمانی کوردی دروست بکەم. کام ڕێگا باشترە؟",
    tags: ["GPT", "NLP", "ڕاهێنان"],
    author: mockProfiles[0],
    votes_count: 24,
    answers_count: 5,
    is_solved: true,
    created_at: "2026-02-28",
  },
  {
    id: "q2",
    title: "باشترین فرەیمۆرک بۆ بینایی ئامێری چییە؟",
    body: "من پڕۆژەیەکی بینایی ئامێری دەستپێ دەکەم و پێویستم بە ئامۆژگارییە لەسەر هەڵبژاردنی فرەیمۆرک.",
    tags: ["Computer Vision", "Framework"],
    author: mockProfiles[1],
    votes_count: 18,
    answers_count: 3,
    is_solved: false,
    created_at: "2026-03-02",
  },
  {
    id: "q3",
    title: "چۆن داتای کوردی بۆ فێرکاری ئامێری کۆبکەمەوە؟",
    body: "من لە کۆکردنەوەی داتاسێتی کوردیدا کێشەم هەیە. کام سەرچاوەکان باشن؟",
    tags: ["داتا", "Dataset", "کوردی"],
    author: mockProfiles[3],
    votes_count: 31,
    answers_count: 7,
    is_solved: true,
    created_at: "2026-02-25",
  },
];

export const mockBlogPosts = [
  {
    id: "b1",
    title: "داهاتووی زیرەکی دەستکرد لە کوردستان",
    excerpt: "لەم بابەتەدا سەیری ئەو ئاراستانە دەکەین کە زیرەکی دەستکرد لە کوردستان بەرەو پێشی دەبات.",
    cover_image_url: null,
    tags: ["AI", "کوردستان", "داهاتوو"],
    author: mockProfiles[2],
    views_count: 1204,
    created_at: "2026-03-01",
  },
  {
    id: "b2",
    title: "١٠ ئامرازی زیرەکی دەستکرد کە پێویستە بیانزانیت",
    excerpt: "ناسینی ئامرازە گرنگەکانی زیرەکی دەستکرد کە هەموو گەشەپێدەرێک دەبێت بیانزانێت.",
    cover_image_url: null,
    tags: ["ئامراز", "AI Tools"],
    author: mockProfiles[0],
    views_count: 892,
    created_at: "2026-02-20",
  },
  {
    id: "b3",
    title: "فێرکاری PyTorch بۆ سەرەتاکاران بە کوردی",
    excerpt: "فێرکارییەکی تەواو بۆ دەستپێکردن لەگەڵ PyTorch بە زمانی کوردی.",
    cover_image_url: null,
    tags: ["PyTorch", "فێرکاری", "سەرەتاکاران"],
    author: mockProfiles[1],
    views_count: 2341,
    created_at: "2026-02-10",
  },
];

export const communityStats = {
  members: 1247,
  projects: 89,
  questions: 432,
  blog_posts: 156,
};

export const projectCategories = [
  { value: "ai_website", label: "ماڵپەڕی AI" },
  { value: "ai_mobile_app", label: "ئەپی مۆبایلی AI" },
  { value: "ai_tool", label: "ئامرازی AI" },
  { value: "ai_solution", label: "چارەسەری AI" },
  { value: "other", label: "هیتر" },
];
