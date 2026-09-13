export interface EduItem {
  flag: string;
  school: string;
  degree: string;
  degreeZh: string;
  year: string;
  /** 0..1 相对 map.png 的 x（从左） */
  mx: number;
  /** 0..1 相对 map.png 的 y（从上） */
  my: number;
  /** 卡片在点的一侧 */
  side: "left" | "right";
  cardDy: number;
}

export const EDUCATION: EduItem[] = [
  {
    flag: "🇺🇸",
    school: "University of Southern California",
    degree: "M.A. · 文学硕士",
    degreeZh: "文学硕士",
    year: "2018",
    mx: 0.18,
    my: 0.36,
    side: "right",
    cardDy: -78,
  },
  {
    flag: "🇪🇸",
    school: "Universidad de Salamanca",
    degree: "B.A. · 文学学士",
    degreeZh: "文学学士",
    year: "2014",
    mx: 0.48,
    my: 0.33,
    side: "right",
    cardDy: -96,
  },
  {
    flag: "🇭🇰",
    school: "The Chinese University of Hong Kong",
    degree: "PhD Candidate · 博士在读",
    degreeZh: "博士在读",
    year: "2024",
    mx: 0.72,
    my: 0.50,
    side: "left",
    cardDy: 36,
  },
];

export interface Paper {
  title: string;
  venue: string;
  tag: string;
  award?: string;
  doi?: string;
  underReview?: boolean;
  cover?: string;
  poster?: string;
}

export const BRANCHES = [
  "Vocabulary",
  "Writing",
  "Assessment & Motivation",
  "Curriculum Design",
  "Review",
] as const;

export const PAPERS: Paper[] = [
  {
    title:
      "The impact of chatbots based on large language models on second language vocabulary acquisition",
    venue: "Heliyon",
    tag: "Vocabulary",
    award: "AERA 2024 · Division C Award",
    doi: "https://doi.org/10.1016/j.heliyon.2024.e25370",
    cover: "/papers/paper1.jpg",
    poster: "/posters/research1.png",
  },
  {
    title: "How L2 Learners Negotiate Meaning in GenAI-Supported Creative Writing",
    venue: "International Journal of Applied Linguistics",
    tag: "Writing",
    doi: "https://doi.org/10.1111/ijal.70256",
    cover: "/papers/paper2.jpg",
    poster: "/posters/research4.png",
  },
  {
    title:
      "The role of generative AI and hybrid feedback in improving L2 writing skills: A comparative study",
    venue: "Innovation in Language Learning and Teaching",
    tag: "Writing",
    award: "BERA 2025",
    doi: "https://doi.org/10.1080/17501229.2025.2503890",
    cover: "/papers/paper3.jpg",
    poster: "/posters/research2.png",
  },
  {
    title: "EFL learners' motivation in a gamified formative assessment: The case of Quizizz",
    venue: "Education and Information Technologies",
    tag: "Assessment & Motivation",
    doi: "https://doi.org/10.1007/s10639-023-12034-7",
    cover: "/papers/paper4.jpg",
    poster: "/posters/research3.png",
  },
  {
    title: "Exploring the impact of the adaptive gamified assessment on learners in blended learning",
    venue: "Education and Information Technologies, 29:21869–21889",
    tag: "Assessment & Motivation",
    doi: "https://doi.org/10.1007/s10639-024-12708-w",
    cover: "/papers/paper5.jpg",
    poster: "/posters/research6.png",
  },
  {
    title:
      "How Does Learner Prior Language Knowledge Play in GenAI-Assisted Project-Based Learning for Creative Thinking?",
    venue: "Technology, Knowledge and Learning, 1–31",
    tag: "Curriculum Design",
    doi: "https://doi.org/10.1007/s10758-026-09984-5",
    cover: "/papers/paper6.jpg",
    poster: "/posters/research5.png",
  },
];

export const PUBLISHED = PAPERS.filter((p) => !p.underReview && p.cover && p.poster);

export interface Project {
  id: string;
  num: string;
  title: string;
  titleZh: string;
  desc: string;
  descZh: string;
  media: string[];
  awards: string[];
  awardsZh?: string[];
  link?: string;
  device?: "iphone" | "watch" | "web" | "mix" | "macbook";
}

export const PROJECTS: Project[] = [
  {
    id: "ai-journey",
    num: "01",
    title: "AI Journey: Gamified AI Learning Adventure",
    titleZh: "AI Journey：游戏化 AI 学习冒险",
    desc: "A gamified adventure that guides students through core AI knowledge — with a special focus on AI ethics.",
    descZh: "带学生走进核心 AI 知识的游戏化冒险，重点关注 AI 伦理。",
    media: ["/projects/project_new.gif"],
    awards: ["📜 Software Invention Patent No. 2026SR0577734"],
    awardsZh: ["📜 软件著作权 2026SR0577734"],
    device: "macbook",
  },
  {
    id: "postcard",
    num: "02",
    title: "GenAI-Powered Postcard Dialogue System",
    titleZh: "生成式 AI 明信片对话系统",
    desc: "A GenAI-powered postcard dialogue system grounded in Self-Determination Theory.",
    descZh: "基于自我决定理论的生成式 AI 明信片对话系统，提供个性化语言学习反馈。",
    media: ["/projects/project1.gif"],
    awards: ["📜 Software Invention Patent No. 2025R11L2331073"],
    awardsZh: ["📜 软件著作权 2025R11L2331073"],
    link: "https://picecho.top",
    device: "macbook",
  },
  {
    id: "vocab-test",
    num: "03",
    title: "Gamified Vocabulary Testing System",
    titleZh: "游戏化词汇测试系统",
    desc: "A gamified vocabulary testing system based on cognitive theory, dynamically adapting to learners' levels.",
    descZh: "基于认知理论的游戏化词汇测试，动态适配学习者水平。",
    media: ["/projects/project2.gif"],
    awards: [
      "📜 Patent Invention No. 2022120701917470",
      "🏆 Baidu AI Vibe Coding Best Communication Award | 2025",
    ],
    awardsZh: ["📜 发明专利 2022120701917470", "🏆 百度 AI Vibe Coding 最佳传播奖 | 2025"],
    link: "https://www.miaoda.cn/apps/app-6nwcjdhgv20x?s=s",
    device: "macbook",
  },
  {
    id: "ielts",
    num: "04",
    title: "AI-Powered IELTS Writing Evaluation & Learning Planner",
    titleZh: "AI 雅思写作评测与学习规划",
    desc: "AI-delivered criterion-based IELTS writing feedback with actionable revisions and personalized study plans.",
    descZh: "按评分标准给出雅思写作反馈，并生成可执行的修改建议与个性化学习计划。",
    media: ["/projects/project3.gif"],
    awards: [],
    link: "http://www.test-writing.top/",
    device: "macbook",
  },
  {
    id: "autoworksheet",
    num: "05",
    title: "AutoWorksheet: Gamified Printables in One Click",
    titleZh: "AutoWorksheet：一键生成游戏化练习纸",
    desc: "Upload any audio/text, instantly generate bingo, board-game or flash-card worksheets.",
    descZh: "上传音频或文本，一键生成 bingo、桌游或闪卡练习纸。",
    media: ["/projects/project4.gif"],
    awards: ["🏆 RedBook AI Vibe Coding Best Developer Award | 2025"],
    awardsZh: ["🏆 小红书 AI Vibe Coding 最佳开发者奖 | 2025"],
    device: "macbook",
  },
  {
    id: "booktail",
    num: "06",
    title: "BookTail – AI Pet Reading Companion",
    titleZh: "BookTail：AI 宠物阅读伙伴",
    desc: "An AI pet that grows and unlocks features as elementary students read better.",
    descZh: "小学生读得越好，AI 宠物就越成长、解锁更多功能。",
    media: ["/projects/project5.gif"],
    awards: ["🏆 TAL AI Vibe Coding Best Creativity Award | 2025"],
    awardsZh: ["🏆 好未来 AI Vibe Coding 最佳创意奖 | 2025"],
    device: "macbook",
  },
  {
    id: "3d-word",
    num: "07",
    title: "3D Word Memorization Display Product",
    titleZh: "3D 单词记忆展示产品",
    desc: "A 3D word memorization display product that enhances memory through spatial association.",
    descZh: "通过空间联想与可视化提升单词记忆的 3D 展示产品。",
    media: ["/projects/project6_1.png", "/projects/project6_2.png"],
    awards: [
      "📜 Patent Invention No. 202111409594.8",
      "🏆 NYBPC: 2nd Place NY District & Best Female Entrepreneurship Award | 2020",
      "🏆 Pride Pitch Canada Finals: 1st Place | 2020",
    ],
    awardsZh: [
      "📜 发明专利 202111409594.8",
      "🏆 NYBPC 纽约赛区亚军 & 最佳女性创业奖 | 2020",
      "🏆 Pride Pitch Canada 决赛冠军 | 2020",
    ],
    device: "macbook",
  },
  {
    id: "journal-baidu",
    num: "08",
    title: "Personal Journal Résumé",
    titleZh: "个人手帐简历",
    desc: "An interactive journal-style résumé with motion and visual storytelling.",
    descZh: "可交互的在线手帐式简历，视觉与动效一体。",
    media: ["/projects/journal-baidu.gif"],
    awards: ["🏆 Baidu App Aesthetics Best Design Award"],
    awardsZh: ["🏆 百度应用美学最佳设计奖"],
    device: "macbook",
  },
  {
    id: "portfolio-3d",
    num: "09",
    title: "Interactive 3D Personal Portfolio",
    titleZh: "可交互 3D 个人简历",
    desc: "An interactive 3D personal homepage: spiral-town navigation plus drive-to-explore.",
    descZh: "可交互的 3D 个人主页：螺旋小镇式导航 + 驾驶式浏览。",
    media: ["/projects/portfolio-3d.gif"],
    awards: ["🏆 The Bund Hackathon · 3rd Prize"],
    awardsZh: ["🏆 外滩黑客松 · 三等奖"],
    device: "macbook",
  },
  {
    id: "mobile-app",
    num: "10",
    title: "Mobile Learning App",
    titleZh: "手机学习应用",
    desc: "A mobile learning and interaction interface for on-the-go use.",
    descZh: "随身的学习与交互界面。",
    media: ["/projects/mobile-phone-1.gif", "/projects/mobile-phone-2.gif"],
    awards: [],
    device: "iphone",
  },
  {
    id: "pizza-bunny",
    num: "11",
    title: "Bunny Pizza Shop",
    titleZh: "兔兔披萨店",
    desc: "A playful mobile mini-game: run a countryside pizza shop with a bunny.",
    descZh: "轻松的手机小游戏：开一家乡间兔兔披萨店。",
    media: ["/projects/mobile-pizza.gif"],
    awards: [],
    device: "iphone",
  },
  {
    id: "watch-app",
    num: "12",
    title: "Watch Companion",
    titleZh: "手表伴侣",
    desc: "A lightweight watch-face interaction, glanceable at a wrist raise.",
    descZh: "抬腕即看的轻量手表交互。",
    media: ["/projects/mobile-watch.gif"],
    awards: [],
    device: "watch",
  },
];

export const CONTACT = {
  name: "Zhihui Zhang",
  nameZh: "张淽卉",
  role: "PhD Student",
  roleZh: "博士研究生",
  phone: "+852 60905092",
  email: "zhihuiz@link.cuhk.edu.hk",
  web: "https://github.com/sirazhang",
  webLabel: "github.com/sirazhang",
  linkedin: "https://linkedin.com/in/zhihui-zhang-077824183",
  scholar: "https://scholar.google.com/citations?user=UZLg1a4AAAAJ&hl=zh-CN",
  github: "https://github.com/sirazhang",
};

export const HONORS = [
  { en: "Postgraduate Research Output Award 2026", zh: "研究生科研成果奖 · 2026" },
  { en: "Duolingo Research Grant · 2025", zh: "Duolingo 研究基金 · 2025" },
  { en: "Vice-Chancellor's Scholarship, CUHK · 2024", zh: "港中大校长奖学金 · 2024" },
  { en: "Mandarin · English · Spanish · French", zh: "中文 · 英语 · 西语 · 法语" },
];

export const ABOUT = "";
