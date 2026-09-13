import type { Lang } from "../store";

export const T = {
  title: { en: "Zhihui Zhang", zh: "张淽卉" },
  subtitle: { en: "Spiral Town · 3D Portfolio", zh: "螺旋小镇 · 3D 作品集" },
  day: { en: "Day", zh: "白天" },
  night: { en: "Night", zh: "夜晚" },
  langBtn: { en: "中文", zh: "EN" },

  controlsTitle: { en: "Controls", zh: "Controls" },
  controlsHint: { en: "Click the car or press ↑ / W to start · Space to pause", zh: "点击小车或按 ↑ / W 上路 · 空格随时暂停" },
  controlsIdle: { en: "The car is waiting on the left. Drag to look around.", zh: "小车停在左侧等待出发，可拖动环视" },
  controlsFollow: { en: "Third-person follow", zh: "第三人称跟随中" },
  startDrive: { en: "Start Driving", zh: "开始驾驶" },
  pause: { en: "Pause", zh: "暂停" },
  resume: { en: "Resume", zh: "继续" },

  school: { en: "School", zh: "学校" },
  artStudio: { en: "Art Studio", zh: "艺术工作室" },
  education: { en: "Education", zh: "教育经历" },
  library: { en: "Library", zh: "图书馆" },
  publications: { en: "Publications", zh: "论文发表" },
  techCompany: { en: "Tech Company", zh: "科技公司" },
  projects: { en: "Projects", zh: "项目" },
  movie: { en: "Movie", zh: "电影院" },
  contact: { en: "Contact", zh: "联系我" },

  eduSub: { en: "Three campuses on one map.", zh: "三段求学经历，落在同一张地图上。" },

  pubHint: { en: "Six published papers. Covers open the matching posters.", zh: "六篇已发表论文。封面可点开对应研究海报。" },
  clickPoster: { en: "Open poster", zh: "点开海报" },
  underReview: { en: "Under Review", zh: "审稿中" },
  viewDoi: { en: "View / DOI", zh: "查看 / DOI" },
  poster: { en: "Poster", zh: "海报" },
  scholar: { en: "Google Scholar", zh: "Google Scholar" },

  projSub: { en: "Card-style project window, web + mobile.", zh: "卡片式项目橱窗，含网页与手机项目。" },
  openProject: { en: "Open project →", zh: "打开项目 →" },
  nextShot: { en: "Next shot", zh: "下一张截图" },

  hello: { en: "Hi, I'm", zh: "你好，我是" },
  hiShort: { en: "Hi", zh: "你好" },
  contactTitle: { en: "PhD Candidate · CUHK, Dept. of Curriculum & Instruction", zh: "香港中文大学 课程与教学系 博士在读" },
  contactBio: { en: "Exploring how generative AI sparks creativity & motivation in language learners.", zh: "研究生成式 AI 如何激发语言学习者的创造力与动机。" },
  emailLabel: { en: "Email", zh: "邮箱" },
  leaveNote: { en: "Leave a note", zh: "留个言" },
  yourName: { en: "Your name", zh: "你的名字" },
  sayHi: { en: "Say hi…", zh: "想说点什么…" },
  send: { en: "Send", zh: "发送" },
  pinned: { en: "Pinned 📌", zh: "已记下 📌" },
} as const;

export type TKey = keyof typeof T;

export function t(lang: Lang, key: TKey): string {
  return T[key][lang];
}
