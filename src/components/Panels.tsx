import { useState } from "react";
import { useApp } from "../store";
import { t } from "../lib/i18n";
import {
  CONTACT,
  EDUCATION,
  HONORS,
  PROJECTS,
  PUBLISHED,
} from "../data/resume";

const TAG: Record<string, string> = {
  Vocabulary: "#d6336c",
  Writing: "#1f3a93",
  "Assessment & Motivation": "#0ca678",
  "Curriculum Design": "#e8590c",
  Review: "#868e96",
};

const SHEET: Record<string, string> = {
  education: "sheet-edu",
  publication: "sheet-pub",
  projects: "sheet-proj",
  contact: "sheet-contact",
};

export function OverlayRoot() {
  const panel = useApp((s) => s.panel);
  const poster = useApp((s) => s.poster);
  const introCard = useApp((s) => s.introCard);
  const close = useApp((s) => s.closePanel);
  const resetToStart = useApp((s) => s.resetToStart);
  const setPoster = useApp((s) => s.setPoster);
  if (!panel) {
    if (introCard) return <IntroCard />;
    return null;
  }
  const noScroll = panel === "projects" || panel === "contact";
  const onClose = panel === "contact" ? resetToStart : close;
  const card = panel === "contact";
  const sheetClass = card
    ? "glass-card"
    : panel === "projects"
      ? "glass-sheet glass-sheet-flat"
      : "glass-sheet";
  return (
    <div className={`pointer-events-none absolute inset-0 z-40 flex items-center ${card ? "justify-center" : "justify-end"} p-4 pb-24 sm:pr-10 sm:pl-6`}>
      <div className={`pointer-events-auto absolute inset-0 z-0 ${card ? "bg-black/10" : "bg-black/18"}`} onClick={onClose} />
      <div
        className={`sheet-stage pointer-events-auto relative z-10 ${SHEET[panel] || ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${sheetClass} relative z-10 h-full w-full rounded-[24px] overflow-visible`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/75 text-lg text-slate-700 shadow hover:bg-white"
            aria-label="close"
          >
            ×
          </button>
          <div className={`relative z-10 ${card ? "h-full p-4 sm:p-5" : "p-5 sm:p-6"} text-slate-900 ${noScroll ? "overflow-hidden" : "no-scrollbar max-h-[82vh] overflow-y-auto"}`}>
            {panel === "education" && <EducationBody />}
            {panel === "publication" && <PublicationBody />}
            {panel === "projects" && <ProjectsBody />}
            {panel === "contact" && <ContactBody />}
          </div>
        </div>
      </div>
      {poster && (
        <div
          className="pointer-events-auto absolute inset-0 z-30 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setPoster(null)}
        >
          <img
            src={poster}
            alt="research poster"
            className="max-h-[88vh] max-w-[92vw] rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-6 top-6 h-10 w-10 rounded-full bg-white/85 text-xl"
            onClick={() => setPoster(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function SectionHead({
  store,
  title,
  sub,
  inline,
}: {
  store: string;
  title: string;
  sub?: string;
  inline?: boolean;
}) {
  if (inline && sub) {
    return (
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-roseink">{store}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-2xl leading-none">{title}</h2>
          <p className="text-[13px] text-slate-500">{sub}</p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-roseink">{store}</p>
      <h2 className="font-display mt-1 text-2xl">{title}</h2>
    </div>
  );
}

function EducationBody() {
  const lang = useApp((s) => s.lang);
  return (
    <div>
      <SectionHead store={t(lang, "school")} title={t(lang, "education")} sub={t(lang, "eduSub")} inline />
      <div className="edu-map relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-50 to-rose-50/30 shadow-inner">
        <img src="/map.png" alt="education journey map" className="block h-full w-full object-contain" />
        {EDUCATION.map((e) => (
          <div key={e.school}>
            <div className="map-dot" style={{ left: `${e.mx * 100}%`, top: `${e.my * 100}%` }} />
            <div
              className={`map-card ${e.side === "left" ? "map-card-left" : "map-card-right"}`}
              style={{
                left: `${e.mx * 100}%`,
                top: `${e.my * 100}%`,
                transform:
                  e.side === "left"
                    ? `translate(calc(-100% - 22px), ${e.cardDy}px)`
                    : `translate(28px, ${e.cardDy}px)`,
              }}
            >
              <div className="text-lg leading-none">{e.flag}</div>
              <div className="min-w-0">
                <div className="line-clamp-1 text-[12px] font-semibold leading-tight">{e.school}</div>
                <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                  {lang === "zh" ? `${e.degreeZh} · ${e.year}` : `${e.degree} (${e.year})`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublicationBody() {
  const setPoster = useApp((s) => s.setPoster);
  const lang = useApp((s) => s.lang);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHead store={t(lang, "library")} title={t(lang, "publications")} />
        <a
          href={CONTACT.scholar}
          target="_blank"
          rel="noreferrer"
          className="mb-0.5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow ring-1 ring-slate-200 hover:bg-slate-50"
        >
          🎓 {t(lang, "scholar")} →
        </a>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {PUBLISHED.map((p) => (
          <div key={p.title} className="rounded-xl bg-white/55 p-3 ring-1 ring-white/60">
            <div className="flex gap-2.5">
              {p.cover ? (
                <button
                  onClick={() => p.poster && setPoster(p.poster)}
                  className="h-[92px] w-[68px] shrink-0 overflow-hidden rounded-lg bg-white/40"
                >
                  <img src={p.cover} alt="" className="h-full w-full object-cover" />
                </button>
              ) : null}
              <div className="min-w-0">
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
                  style={{ background: TAG[p.tag] || "#888" }}
                >
                  {p.tag}
                </span>
                <div className="mt-1 line-clamp-3 text-[12px] font-semibold leading-snug">{p.title}</div>
                <div className="mt-1 line-clamp-2 text-[10px] text-slate-500">
                  {p.underReview ? t(lang, "underReview") : p.venue}
                  {p.award && <span className="ml-1 text-amber-700">🏆</span>}
                </div>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.doi && (
                <a
                  href={p.doi}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] text-white"
                >
                  {t(lang, "viewDoi")}
                </a>
              )}
              {p.poster && (
                <button
                  onClick={() => setPoster(p.poster!)}
                  className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] ring-1 ring-slate-200"
                >
                  {t(lang, "poster")}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MacbookShot({ src }: { src: string }) {
  return (
    <div className="device-macbook">
      <div className="device-macbook-top">
        <div className="device-macbook-cam" />
        <img src={src} alt="project screenshot" />
      </div>
      <div className="device-macbook-base">
        <div className="device-macbook-notch" />
      </div>
    </div>
  );
}

function PhoneShot({ src, variant }: { src: string; variant: "iphone" | "watch" }) {
  if (variant === "watch") {
    return (
      <div className="device-watch">
        <div className="device-watch-crown" />
        <img src={src} alt="watch app" />
      </div>
    );
  }
  return (
    <div className="device-iphone">
      <div className="device-iphone-notch">9:41</div>
      <img src={src} alt="iphone app" />
    </div>
  );
}

function ProjectsBody() {
  const [idx, setIdx] = useState(0);
  const [mediaIdx, setMediaIdx] = useState(0);
  const lang = useApp((s) => s.lang);
  const p = PROJECTS[idx];
  const media = p.media[mediaIdx] ?? p.media[0];
  const next = (d: number) => {
    setIdx((i) => (i + d + PROJECTS.length) % PROJECTS.length);
    setMediaIdx(0);
  };
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SectionHead store={t(lang, "techCompany")} title={t(lang, "projects")} />
      <div className="mt-2 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_220px] gap-4">
        <div className="flex min-h-0 items-center justify-center">
          {p.device === "iphone" ? (
            <PhoneShot src={media} variant="iphone" />
          ) : p.device === "watch" ? (
            <PhoneShot src={media} variant="watch" />
          ) : (
            <MacbookShot src={media} />
          )}
        </div>
        <div className="flex min-h-0 flex-col gap-2">
          <div className="text-[11px] text-roseink">{p.num}</div>
          <h3 className="font-display text-lg leading-tight">{lang === "zh" ? p.titleZh : p.title}</h3>
          <p className="text-[12px] leading-relaxed text-slate-600 line-clamp-5">
            {lang === "zh" ? p.descZh : p.desc}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {(lang === "zh" ? p.awardsZh ?? p.awards : p.awards).map((a) => (
              <span key={a} className="rounded-full bg-white/70 px-2 py-0.5 text-[10px]">
                {a}
              </span>
            ))}
          </div>
          {p.link && (
            <a
              href={p.link}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex w-fit rounded-full bg-slate-900 px-3 py-1 text-[11px] text-white"
            >
              {t(lang, "openProject")}
            </a>
          )}
          <div className="mt-auto flex gap-2">
            <button
              type="button"
              onClick={() => next(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow ring-1 ring-slate-200"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => next(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow ring-1 ring-slate-200"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      <div className="relative z-30 mt-3 grid shrink-0 grid-cols-6 grid-rows-2 gap-2">
        {PROJECTS.map((item, i) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              setIdx(i);
              setMediaIdx(0);
            }}
            className={`h-[78px] cursor-pointer overflow-hidden rounded-xl ring-2 ${
              i === idx ? "ring-roseink" : "ring-white/50 hover:ring-white"
            }`}
            title={item.title}
          >
            <img src={item.media[0]} alt="" className="pointer-events-none h-full w-full object-cover object-center" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ContactBody() {
  const lang = useApp((s) => s.lang);
  return (
    <div className="card-body grid h-full grid-cols-[minmax(0,0.95fr)_1px_minmax(0,1.15fr)] items-center gap-5 overflow-hidden px-2 py-1">
      <div className="portrait-wrap">
        <img src="/photos/zhihui.gif" alt={CONTACT.name} className="portrait-gif" />
      </div>
      <div className="h-[72%] w-px self-center bg-[#3d2b22]/45" />
      <div className="flex min-w-0 flex-col justify-center pr-4 text-[#3d2b22]">
        <h2 className="font-card-name text-[28px] font-medium tracking-[0.18em]">
          {lang === "zh" ? CONTACT.nameZh : CONTACT.name.toUpperCase()}
        </h2>
        <p className="mt-1 text-[12px] italic tracking-[0.28em] text-[#5c4638]/80">
          {lang === "zh" ? CONTACT.roleZh : CONTACT.role.toUpperCase()}
        </p>
        <div className="mt-8 space-y-3 text-[13.5px] tracking-[0.04em] text-[#4a372c]">
          <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="flex items-center justify-end gap-2.5">
            <span>{CONTACT.phone}</span>
            <PhoneIcon />
          </a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center justify-end gap-2.5">
            <span className="truncate">{CONTACT.email}</span>
            <MailIcon />
          </a>
          <a
            href={CONTACT.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-end gap-2.5 underline decoration-[#4a372c]/40 underline-offset-4"
          >
            <span>{CONTACT.webLabel}</span>
            <WebIcon />
          </a>
        </div>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M22 16.9v2.2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h2.2a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L7.1 9.7a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.1z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}
function WebIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function IntroCard() {
  const lang = useApp((s) => s.lang);
  const close = useApp((s) => s.closeIntroCard);
  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-end p-6 pb-28 sm:pr-16">
      <div className="sheet-stage pointer-events-auto relative max-w-[520px]" style={{ perspective: "1100px" }}>
      <div className="intro-card relative">
        <button
          onClick={close}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-lg text-slate-700 shadow hover:bg-white"
          aria-label="close"
        >
          ×
        </button>
        <p className="font-intro-hi leading-none text-[#2c2430]">Hi</p>
        <h2 className="mt-1 font-display text-[28px] leading-tight text-[#2c2430] sm:text-[32px]">
          {t(lang, "hello")} {lang === "zh" ? CONTACT.nameZh : CONTACT.name}.
        </h2>
        <p className="mt-4 text-center text-[13px] tracking-[0.04em] text-[#4a372c]">
          {t(lang, "contactTitle")}
        </p>
        <p className="mt-2 text-center text-[13px] leading-relaxed text-[#4a372c]">
          {lang === "en" ? (
            <>
              Exploring how <span className="font-semibold">generative AI</span> sparks creativity &amp; motivation in
              language learners.
            </>
          ) : (
            t(lang, "contactBio")
          )}
        </p>
        <ul className="mt-6 space-y-1.5 text-center text-[12px] tracking-[0.02em] text-[#4a372c]/90">
          {HONORS.map((h) => (
            <li key={h.en}>· {lang === "zh" ? h.zh : h.en}</li>
          ))}
        </ul>
      </div>
      </div>
    </div>
  );
}
