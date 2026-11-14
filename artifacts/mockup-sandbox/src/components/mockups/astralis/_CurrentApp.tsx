import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { ASTRONAUTS, EXHIBITS, EXHIBIT_ID_ALIASES } from "./_exhibits";
import type { Exhibit } from "./_exhibits";
import MuseumCanvas from "./_MuseumCanvas";
import type { MuseumScene } from "./_MuseumScene";

type Planet = "Moon" | "Mars";
type Screen = "welcome" | "select" | "game" | "failed" | "legacy";
type Progress = { astronaut: string; planet: Planet; oxygen: number; completed: string[]; stamps: string[] };
type Modal = "how" | "credits" | "inspect" | "hook" | "story" | "memory" | "stamp" | "passport" | "travel" | null;
const SAVE_KEY = "astralis-design-baseline-only";
const emptyProgress = (): Progress => ({ astronaut: "blue", planet: "Moon", oxygen: 60, completed: [], stamps: [] });

function loadProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Progress>;
    if (!value.astronaut || !["Moon", "Mars"].includes(value.planet ?? "") || typeof value.oxygen !== "number") return null;
    const normalizeIds = (ids: unknown) => Array.isArray(ids)
      ? [...new Set(ids
        .filter((id): id is string => typeof id === "string")
        .map((id) => EXHIBIT_ID_ALIASES[id] ?? id)
        .filter((id) => EXHIBITS.some((exhibit) => exhibit.id === id)))]
      : [];
    return {
      astronaut: value.astronaut,
      planet: value.planet as Planet,
      oxygen: Math.max(0, Math.min(100, value.oxygen)),
      completed: normalizeIds(value.completed),
      stamps: normalizeIds(value.stamps)
    };
  } catch { return null; }
}

function Icon({ name, size = 18 }: { name: "arrow" | "passport" | "close" | "star" | "moon" | "mars" | "book" | "sound" | "check"; size?: number }) {
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M4 12h15" /><path d="m13 5 7 7-7 7" /></>,
    passport: <><rect x="4" y="3" width="16" height="18" rx="3" /><circle cx="12" cy="12" r="4" /><path d="M8 7h8" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    star: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
    moon: <path d="M19 15.2A8 8 0 0 1 8.8 5 8.5 8.5 0 1 0 19 15.2Z" />,
    mars: <><circle cx="10" cy="14" r="6" /><path d="m14.5 9.5 6-6M15 3h6v6" /><path d="M7 14h6M10 11v6" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" /><path d="M4 5v17M8 7h8M8 11h7" /></>,
    sound: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M17 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12" /></>,
    check: <path d="m5 12 4 4L19 6" />
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Suit({ color, size = 96, name }: { color: string; size?: number; name?: string }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={name ?? "Astronaut character"}>
    <ellipse cx="60" cy="107" rx="31" ry="7" fill="#050d1c" opacity=".45" />
    <path d="M34 68c0-9 8-15 26-15s26 6 26 15v26H34z" fill={color} stroke="#eaf7ff" strokeWidth="3" />
    <path d="M27 72h10v20H27zm56 0h10v20H83z" fill="#e6f4ff" stroke="#c4d9ed" strokeWidth="2" />
    <path d="M45 93h11v14H45zm19 0h11v14H64z" fill="#d9e9f8" />
    <circle cx="60" cy="37" r="29" fill="#ecf5ff" stroke="#d0e3f2" strokeWidth="3" />
    <path d="M39 32c3-10 12-16 21-16s18 6 21 16v16H39z" fill="#355174" stroke="#c0e8f1" strokeWidth="2" />
    <path d="M46 29c4-6 10-9 15-9" stroke="#d4f6fa" strokeWidth="3" strokeLinecap="round" opacity=".8" />
    <circle cx="53" cy="35" r="2" fill="#effbff" opacity=".9" />
    <rect x="72" y="69" width="11" height="15" rx="3" fill="#d8f4f6" opacity=".9" />
    <path d="M75 73h5" stroke={color} strokeWidth="2" />
  </svg>;
}

function HardwareArt({ exhibit, size = 112 }: { exhibit: Exhibit; size?: number }) {
  if (exhibit.characterImage) {
    return <div className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40" style={{ width: size, height: size }} role="img" aria-label={exhibit.characterImageAlt ?? `AI-generated character illustration of ${exhibit.name}`}>
      <img src={exhibit.characterImage} alt="" className="h-full w-full object-cover" />
      {exhibit.imageWarning && <span className="absolute inset-x-0 bottom-0 bg-rose-950/90 px-1 py-1 text-center font-mono text-[7px] font-bold leading-tight tracking-wide text-rose-100">TEMP ART · REPLACE</span>}
    </div>;
  }
  const fill = `#${exhibit.color.toString(16).padStart(6, "0")}`;
  return <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={`Illustration of ${exhibit.name}`}>
    <circle cx="60" cy="60" r="54" fill={fill} opacity=".13" />
    <circle cx="60" cy="60" r="46" fill="none" stroke={fill} strokeOpacity=".22" strokeDasharray="2 5" />
    {exhibit.symbol === "R" || exhibit.symbol === "O" ? <>
      <path d="M31 63h58l-7 18H38z" fill={fill} stroke="#eaf6ff" strokeWidth="2" />
      <path d="m38 63 5-17h31l9 17" fill="#d8f1f4" stroke={fill} strokeWidth="3" />
      <circle cx="43" cy="84" r="8" fill="#243a59" stroke={fill} strokeWidth="3" /><circle cx="79" cy="84" r="8" fill="#243a59" stroke={fill} strokeWidth="3" />
      <circle cx="67" cy="53" r="10" fill="#e8f4ff" stroke={fill} strokeWidth="3" /><circle cx="67" cy="53" r="5" fill="#536d91" />
      <path d="M67 43V33l11-7" fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round" />
      <circle cx="78" cy="25" r="4" fill="#ffcf84" />
    </> : exhibit.symbol === "A" ? <>
      <path d="M60 29 34 77h52z" fill={fill} opacity=".9" stroke="#eaf6ff" strokeWidth="2" />
      <path d="M60 42v34M41 67h38" stroke="#f4fbff" strokeWidth="3" />
      <circle cx="60" cy="58" r="10" fill="#263e5c" stroke="#d9f4f7" strokeWidth="2" />
      <path d="M34 78 25 92m61-14 9 14M60 78v14" stroke={fill} strokeWidth="4" strokeLinecap="round" />
      <circle cx="25" cy="94" r="4" fill="#ffcf84" /><circle cx="95" cy="94" r="4" fill="#ffcf84" />
    </> : <>
      <path d="M34 56 60 36l26 20v27H34z" fill="#d7e9f7" stroke={fill} strokeWidth="3" />
      <path d="m30 57 30-24 30 24" fill="none" stroke={fill} strokeWidth="5" strokeLinecap="round" />
      <rect x="44" y="58" width="32" height="20" rx="5" fill="#405d81" />
      <circle cx="52" cy="67" r="3" fill="#b8f3f2" /><circle cx="68" cy="67" r="3" fill="#b8f3f2" />
      <path d="M37 81 29 91m54-10 8 10" stroke={fill} strokeWidth="4" strokeLinecap="round" />
    </>}
  </svg>;
}

function MoonSourcesCredits({ exhibit }: { exhibit: Exhibit }) {
  if (exhibit.planet !== "Moon") return null;
  return <section className="mt-5 rounded-xl border border-cyan-100/15 bg-cyan-100/[.035] p-4" aria-labelledby={`sources-${exhibit.id}`}>
    <h3 id={`sources-${exhibit.id}`} className="mono text-[10px] font-medium tracking-[.2em] text-cyan-100">SOURCES &amp; CREDITS</h3>
    <div className="mt-3">
      <p className="mono text-[8px] tracking-[.16em] text-slate-500">NASA-REFERENCED FACTS</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">Mission facts are cross-checked against the linked NASA references. The character personality and first-person dialogue are creative storytelling, not quotations.</p>
      <ul className="mt-2 space-y-1.5">{exhibit.sources.map((source) => <li key={source.url}>
        <a href={source.url} target="_blank" rel="noreferrer" className="text-xs text-cyan-200 underline decoration-cyan-200/30 underline-offset-4 hover:text-white">{source.label} ↗</a>
      </li>)}</ul>
    </div>
    <div className="mt-3 border-t border-white/10 pt-3">
      <p className="mono text-[8px] tracking-[.16em] text-slate-500">CHARACTER ILLUSTRATION</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-300">{exhibit.characterImageCredit}</p>
      {exhibit.imageWarning && <p className="mt-2 rounded-lg border border-rose-200/25 bg-rose-300/[.08] p-2 text-xs font-semibold leading-relaxed text-rose-100">{exhibit.imageWarning}</p>}
    </div>
  </section>;
}

function MoonMemoryReview({ exhibit }: { exhibit: Exhibit }) {
  if (exhibit.planet !== "Moon") return null;
  return <details className="mt-5 rounded-xl border border-white/10 bg-white/[.035] p-3 text-left">
    <summary className="cursor-pointer text-xs font-semibold text-cyan-100">Memory answers &amp; explanations</summary>
    <ol className="mt-3 space-y-3">{exhibit.memory.map((question, index) => <li key={question.prompt} className="text-xs leading-relaxed text-slate-300">
      <p className="font-semibold">{index + 1}. {question.prompt}</p>
      <p className="mt-1 text-cyan-100">Correct answer: {question.options[question.answer]}</p>
      <p className="mt-1">{question.explanation}</p>
    </li>)}</ol>
  </details>;
}

function Stamp({ exhibit, done }: { exhibit?: Exhibit; done: boolean }) {
  if (!done || !exhibit) return <div className="stamp-empty"><span>OPEN</span><small>STAMP SLOT</small></div>;
  return <div className="stamp-full" style={{ borderColor: `#${exhibit.color.toString(16).padStart(6, "0")}`, color: `#${exhibit.color.toString(16).padStart(6, "0")}` }}>
    <Icon name="star" size={16} /><strong>{exhibit.symbol}</strong><small>{exhibit.planet.toUpperCase()} · RESTORED</small>
  </div>;
}

function Passport({ progress, close, onTravel }: { progress: Progress; close: () => void; onTravel: () => void }) {
  const moonComplete = EXHIBITS.filter(e => e.planet === "Moon").every(e => progress.stamps.includes(e.id));
  return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
    <div className="passport-book screen-in w-full max-w-3xl overflow-hidden rounded-3xl border p-5 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="passport-title">
      <header className="flex items-start justify-between gap-4">
        <div><div className="mono text-[10px] tracking-[.24em] text-cyan-200/70">ASTRALIS TRAVEL DOCUMENT</div><h2 id="passport-title" className="display mt-2 text-3xl font-bold sm:text-4xl">Space passport</h2><p className="mt-1 text-sm text-slate-400">Two worlds. Six quiet legacies.</p></div>
        <button onClick={close} className="btn-secondary grid h-10 w-10 place-items-center rounded-full" aria-label="Close passport"><Icon name="close" /></button>
      </header>
      <div className="passport-spread mt-6 grid gap-3 sm:grid-cols-2">
        {(["Moon", "Mars"] as Planet[]).map((planet) => (
          <section key={planet} className={`passport-page ${planet.toLowerCase()}`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3"><div className="flex items-center gap-2 text-sm font-bold"><Icon name={planet === "Moon" ? "moon" : "mars"} />{planet} page</div><span className="mono text-[9px] tracking-widest text-slate-400">{planet === "Mars" && progress.stamps.filter(id => EXHIBITS.find(e => e.id === id)?.planet === "Moon").length < 3 ? "NOT YET OPEN" : "FIELD RECORD"}</span></div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {EXHIBITS.filter(e => e.planet === planet).map(e => <div key={e.id} className="min-w-0 text-center"><Stamp exhibit={e} done={progress.stamps.includes(e.id)} /><p className="mt-2 text-[10px] leading-tight text-slate-300">{e.name}</p></div>)}
            </div>
            <div className="mt-4 flex justify-between mono text-[9px] tracking-wider text-slate-500"><span>ASTRALIS / {planet.toUpperCase()}</span><span>PAGE 0{planet === "Moon" ? 1 : 2}</span></div>
          </section>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3"><span className="text-xs text-slate-400">MEMORIES RESTORED</span><span className="mono text-sm text-cyan-100">{progress.stamps.length} <span className="text-slate-500">/ 6</span></span></div>
      {moonComplete && progress.planet === "Moon" && <button onClick={onTravel} className="btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold">Travel to Mars <Icon name="arrow" /></button>}
    </div>
  </div>;
}

function GameModal({ modal, exhibit, progress, storyIndex, memoryIndex, onClose, onAction, onAnswer, onNextStory, onTravel, onPassport }: {
  modal: Modal; exhibit: Exhibit | null; progress: Progress; storyIndex: number; memoryIndex: number;
  onClose: () => void; onAction: () => void; onAnswer: (index: number) => void; onNextStory: () => void; onTravel: () => void; onPassport: () => void;
}) {
  const [hookAnswer, setHookAnswer] = useState<number | null>(null);
  const [memoryAnswer, setMemoryAnswer] = useState<number | null>(null);
  useEffect(() => { setHookAnswer(null); setMemoryAnswer(null); }, [modal, exhibit?.id, memoryIndex]);
  if (!modal || modal === "passport") return modal === "passport" ? <Passport progress={progress} close={onClose} onTravel={onTravel} /> : null;
  if (modal === "how" || modal === "credits") return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="exhibit-card screen-in w-full max-w-xl rounded-3xl p-6 sm:p-8" role="dialog" aria-modal="true">
      <div className="flex justify-between"><span className="mono text-[10px] tracking-[.2em] text-cyan-200">{modal === "how" ? "FIELD GUIDE" : "CREDITS / SOURCES"}</span><button onClick={onClose} aria-label="Close dialog" className="text-slate-400 hover:text-white"><Icon name="close" /></button></div>
      {modal === "how" ? <><h2 className="display mt-3 text-3xl font-bold">Explore at your own pace.</h2><div className="mt-5 grid gap-3 text-sm leading-relaxed text-slate-300">
        <p><b className="text-cyan-100">Move:</b> WASD or arrow keys. On touchscreens, use the directional pad.</p><p><b className="text-cyan-100">Inspect:</b> Walk near a display and press E, or tap Inspect.</p><p><b className="text-cyan-100">Restore:</b> Answer one curiosity question, listen to the story, then answer all three memory questions. Correct answers add 20 oxygen; wrong answers use 20. There is no timer.</p><p><b className="text-cyan-100">Travel:</b> Collect all three Moon stamps to open the Mars gallery. Check your passport at any time.</p>
      </div></> : <><h2 className="display mt-3 text-3xl font-bold">A note from the archive.</h2><p className="mt-4 text-sm leading-relaxed text-slate-300">An independent educational project created by Team Astralis for NASA Space Apps Challenge 2026. Not an official NASA website.</p><p className="mt-4 text-xs leading-relaxed text-slate-400">Moon mission facts link to NASA references in each exhibit; character dialogue and personalities are creative storytelling, not quotations. Mars exhibits remain DEMO CONTENT awaiting team research. Character illustrations are artistic interpretations, not NASA photographs.</p><div className="mt-5 max-h-48 space-y-2 overflow-y-auto pr-2 scrollbar-thin">{EXHIBITS.flatMap(e => e.sources).map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block text-xs text-cyan-200 underline decoration-cyan-200/30 underline-offset-4 hover:text-white">{s.label} ↗</a>)}</div></>}
      <button className="btn-secondary mt-7 rounded-xl px-5 py-3 text-sm" onClick={onClose}>Back to the museum</button>
    </div>
  </div>;
  if (modal === "travel") return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"><div className="exhibit-card screen-in w-full max-w-lg rounded-3xl p-6 text-center sm:p-9" role="dialog" aria-modal="true" aria-labelledby="travel-title">
    <span className="mono text-[10px] tracking-[.25em] text-cyan-200">THREE MOON STAMPS COLLECTED</span><h2 id="travel-title" className="display mt-3 text-4xl font-bold">Mars Unlocked!</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-300">Your passport has a new destination. The next gallery is ready when you are.</p>
    <div className="route-graphic my-7 flex items-center justify-center gap-5"><span className="route-planet lunar"><Icon name="moon" size={22} /></span><span className="route-line" /><span className="route-planet martian"><Icon name="mars" size={22} /></span></div>
    <button className="btn-primary flex w-full items-center justify-center gap-3 rounded-xl px-5 py-4 font-bold" onClick={onTravel}>Travel to Mars <Icon name="arrow" /></button>
    <button className="mt-3 text-xs text-slate-400 underline underline-offset-4 hover:text-white" onClick={onPassport}>Open passport first</button>
  </div></div>;
  if (!exhibit) return null;
  return <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget && modal === "inspect") onClose(); }}>
    <div className="exhibit-card screen-in relative my-auto w-full max-w-xl overflow-hidden rounded-3xl p-5 sm:p-8" role="dialog" aria-modal="true">
      <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: `#${exhibit.color.toString(16).padStart(6, "0")}` }} />
      <div className="relative">
        <div className="flex items-center justify-between"><span className="mono text-[10px] tracking-[.2em] text-cyan-100/75">{exhibit.planet === "Moon" ? "NASA-REFERENCED FACTS · CREATIVE STORY" : "DEMO CONTENT · AWAITING TEAM RESEARCH"}</span><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close exhibit"><Icon name="close" /></button></div>
        {modal === "inspect" && <><div className="mt-5 flex items-center gap-4"><div className="rounded-2xl border border-white/10 bg-slate-950/30 p-1"><HardwareArt exhibit={exhibit} size={106} /></div><div><div className="mono text-[10px] tracking-[.18em] text-slate-400">{exhibit.planet.toUpperCase()} / {exhibit.mission.toUpperCase()}</div><h2 className="display mt-1 text-2xl font-bold leading-tight sm:text-3xl">{exhibit.name}</h2><p className="mt-1 text-xs text-slate-400">{exhibit.dates}</p></div></div><div className="mt-5 rounded-xl border border-white/10 bg-white/[.035] p-4"><p className="text-sm leading-relaxed text-slate-300">{exhibit.intro}</p><p className="mt-3 text-xs text-slate-500">Character note: {exhibit.personality}.</p></div><MoonSourcesCredits exhibit={exhibit} /><button onClick={onAction} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold">Meet the exhibit <Icon name="arrow" /></button></>}
        {modal === "hook" && <><div className="flex items-center gap-3"><HardwareArt exhibit={exhibit} size={74} /><div><span className="mono text-[10px] tracking-[.2em] text-cyan-100/70">FIRST, A CURIOSITY</span><h2 className="display mt-1 text-2xl font-bold">{exhibit.name}</h2></div></div><p className="mt-4 text-lg font-semibold leading-snug">{exhibit.hook.prompt}</p><div className="mt-4 grid gap-2">{exhibit.hook.options.map((option, i) => <button key={option} onClick={() => setHookAnswer(i)} className={`answer-option ${hookAnswer === i ? (i === exhibit.hook.answer ? "answer-correct" : "answer-wrong") : ""}`}>{String.fromCharCode(65 + i)}<span>{option}</span></button>)}</div>{hookAnswer !== null && <div className="mt-4 rounded-xl border border-cyan-200/20 bg-cyan-200/[.06] p-3 text-sm text-slate-200"><b className="text-cyan-100">{hookAnswer === exhibit.hook.answer ? "That is it." : `Correct answer: ${exhibit.hook.options[exhibit.hook.answer]}.`}</b> {exhibit.hook.explanation}</div>}<button onClick={onAction} disabled={hookAnswer === null} className="btn-primary mt-5 w-full rounded-xl px-4 py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-40">Continue to the story <Icon name="arrow" size={16} /></button></>}
        {modal === "story" && <><div className="mono text-[10px] tracking-[.2em] text-cyan-100/70">STORY / {String(storyIndex + 1).padStart(2, "0")} OF {String(exhibit.story.length).padStart(2, "0")}</div><div className="mt-5 flex gap-4 sm:gap-5"><div className="shrink-0 rounded-2xl border border-white/10 bg-white/[.04] p-1"><HardwareArt exhibit={exhibit} size={92} /></div><div className="min-w-0"><div className="mono text-[10px] tracking-wider text-slate-400">A VOICE FROM THE ARCHIVE</div>{exhibit.planet === "Moon" && <div className="mt-1 text-[10px] text-cyan-100/70">Creative character dialogue · not a NASA quotation</div>}<h2 className="display mt-1 text-xl font-bold">{exhibit.name}</h2><p className="mt-3 text-[15px] leading-relaxed text-slate-200 sm:text-base">{exhibit.story[storyIndex]}</p></div></div><div className="mt-6 flex items-center justify-between"><div className="flex gap-1.5">{exhibit.story.map((_, i) => <span key={i} className={`h-1.5 rounded-full ${i === storyIndex ? "w-6 bg-cyan-200" : "w-1.5 bg-slate-600"}`} />)}</div><button className="btn-primary flex items-center gap-2 rounded-xl px-5 py-3 font-bold" onClick={onNextStory}>{storyIndex === exhibit.story.length - 1 ? "Restore memories" : "Next"} <Icon name="arrow" size={16} /></button></div></>}
        {modal === "memory" && (() => { const question = exhibit.memory[memoryIndex]; return <><div className="flex items-center justify-between"><div><div className="mono text-[10px] tracking-[.2em] text-cyan-100/70">MEMORY RESTORATION / {memoryIndex + 1} OF 3</div><h2 className="display mt-2 text-2xl font-bold">Help me restore my memories!</h2></div><div className="oxygen-mini">{progress.oxygen}%<small>OXYGEN</small></div></div><div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] p-3"><HardwareArt exhibit={exhibit} size={62} /><p className="text-base font-semibold leading-snug">{question.prompt}</p></div><div className="mt-4 grid gap-2">{question.options.map((option, i) => <button key={option} disabled={memoryAnswer !== null} onClick={() => { setMemoryAnswer(i); onAnswer(i); }} className={`answer-option ${memoryAnswer === i ? (i === question.answer ? "answer-correct" : "answer-wrong") : ""}`}>{String.fromCharCode(65 + i)}<span>{option}</span></button>)}</div>{memoryAnswer !== null && <div className={`mt-4 rounded-xl border p-3 text-sm ${memoryAnswer === question.answer ? "border-emerald-200/20 bg-emerald-200/[.06]" : "border-rose-200/20 bg-rose-200/[.06]"}`}><b className={memoryAnswer === question.answer ? "text-emerald-100" : "text-rose-100"}>{memoryAnswer === question.answer ? "Memory restored. +20 oxygen" : "Not quite. −20 oxygen"}</b><p className="mt-1 text-slate-300">{question.explanation}{memoryAnswer !== question.answer ? " Try this same memory again." : ""}</p>{memoryAnswer !== question.answer && <button onClick={() => setMemoryAnswer(null)} className="btn-secondary mt-3 rounded-lg px-4 py-2 text-xs font-semibold">Retry this memory</button>}</div>}</>; })()}
        {modal === "stamp" && <div className="py-4 text-center"><div className="celebration-orbit mx-auto grid h-32 w-32 place-items-center rounded-full"><HardwareArt exhibit={exhibit} size={104} /></div><div className="mono mt-4 text-[10px] tracking-[.25em] text-cyan-100">PASSPORT STAMP ISSUED</div><h2 className="display mt-2 text-4xl font-bold">Memory Restored!</h2><p className="mt-2 text-sm text-slate-300">A new mark for {exhibit.name}.</p><div className="mx-auto mt-5 max-w-xs"><Stamp exhibit={exhibit} done /></div><MoonMemoryReview exhibit={exhibit} /><button onClick={onAction} className="btn-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-bold">Return to the gallery <Icon name="arrow" /></button></div>}
      </div>
    </div>
  </div>;
}

function VirtualPad({ onMove }: { onMove: (x: number, y: number) => void }) {
  const padRef = useRef<HTMLDivElement>(null);
  const update = (event: PointerEvent<HTMLDivElement>) => {
    const rect = padRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dx = event.clientX - cx, dy = event.clientY - cy;
    const max = rect.width * .32, distance = Math.hypot(dx, dy), factor = Math.min(1, max / (distance || 1));
    onMove(dx / max * factor, dy / max * factor);
  };
  return <div ref={padRef} className="virtual-pad" role="application" aria-label="Virtual movement joystick"
    onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); update(e); }}
    onPointerMove={(e) => { if (e.buttons) update(e); }} onPointerUp={() => onMove(0, 0)} onPointerCancel={() => onMove(0, 0)}>
    <div className="pad-ring" /><div className="pad-center" /><span className="pad-n">N</span><span className="pad-s">S</span><span className="pad-e">E</span><span className="pad-w">W</span>
  </div>;
}

export default function App({ initialScreen = "game" }: { initialScreen?: Screen }) {
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [progress, setProgress] = useState<Progress>(() => loadProgress() ?? emptyProgress());
  const [hasSave, setHasSave] = useState(() => Boolean(loadProgress()));
  const [modal, setModal] = useState<Modal>(null);
  const [nearbyId, setNearbyId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const sceneRef = useRef<MuseumScene | null>(null);
  const exhibit = useMemo(() => EXHIBITS.find(e => e.id === activeId) ?? null, [activeId]);
  const allMoon = EXHIBITS.filter(e => e.planet === "Moon").every(e => progress.stamps.includes(e.id));
  const allDone = EXHIBITS.every(e => progress.stamps.includes(e.id));

  useEffect(() => {
    if ((screen === "game" || screen === "legacy") && progress.astronaut && progress.oxygen > 0) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); setHasSave(true); } catch { setHasSave(false); }
    }
  }, [progress, screen]);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.setJoystick(joystick.x, joystick.y);
    sceneRef.current.setMovementEnabled(modal === null);
  }, [joystick, modal, screen]);

  const continueGame = () => {
    setScreen(progress.stamps.length === 6 ? "legacy" : "game");
    if (progress.stamps.length === 3 && progress.planet === "Moon") setModal("travel");
  };
  const confirmAstronaut = () => { setProgress(p => ({ ...emptyProgress(), astronaut: p.astronaut })); setScreen("game"); };
  const interact = useCallback((id: string) => {
    const target = EXHIBITS.find(e => e.id === id);
    if (!target || target.planet !== progress.planet || progress.stamps.includes(id)) return;
    setActiveId(id); setModal("inspect");
  }, [progress.planet, progress.stamps]);
  const failMission = () => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* no-op */ }
    setHasSave(false); setProgress(emptyProgress()); setModal(null); setActiveId(null); setScreen("failed");
  };
  const handleMemoryAnswer = (index: number) => {
    if (!exhibit) return;
    const correct = index === exhibit.memory[memoryIndex].answer;
    const nextOxygen = Math.max(0, Math.min(100, progress.oxygen + (correct ? 20 : -20)));
    if (nextOxygen === 0) { failMission(); return; }
    setProgress(p => ({ ...p, oxygen: nextOxygen }));
    if (correct) {
      if (memoryIndex === 2) {
        const next = { ...progress, oxygen: nextOxygen, completed: [...new Set([...progress.completed, exhibit.id])], stamps: [...new Set([...progress.stamps, exhibit.id])] };
        setProgress(next); setModal("stamp");
      } else setMemoryIndex(i => i + 1);
    }
  };
  const advanceStory = () => {
    if (!exhibit) return;
    if (storyIndex + 1 < exhibit.story.length) setStoryIndex(i => i + 1);
    else { setMemoryIndex(0); setModal("memory"); }
  };
  const startStorySequence = () => { setStoryIndex(0); setModal("hook"); };
  const nextAfterStamp = () => {
    const doneCount = progress.stamps.length;
    setActiveId(null);
    if (doneCount >= 6 || allDone) { setModal(null); setScreen("legacy"); return; }
    if (allMoon && progress.planet === "Moon") { setModal("travel"); return; }
    setModal(null);
  };
  const travelMars = () => { setProgress(p => ({ ...p, planet: "Mars" })); setNearbyId(null); setJoystick({ x: 0, y: 0 }); setModal(null); };
  const newAdventure = () => { setProgress(emptyProgress()); setHasSave(false); setActiveId(null); setModal(null); setScreen("select"); try { localStorage.removeItem(SAVE_KEY); } catch { /* no-op */ } };

  return <main className="app-shell min-h-[100dvh] text-slate-100">
    <div className="stars" aria-hidden="true" />
    {screen === "welcome" && <section className="relative z-10 flex min-h-[100dvh] flex-col px-5 py-6 sm:px-10 sm:py-8">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="brand-mark"><Icon name="star" size={17} /></span><span className="mono text-[10px] tracking-[.24em] text-slate-300">TEAM ASTRALIS <i className="mx-1 text-cyan-200">/</i> FIELD ARCHIVE</span></div><button onClick={() => setModal("credits")} className="btn-secondary rounded-full px-4 py-2 text-xs">Credits & sources</button></header>
      <div className="welcome-grid mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 py-12 lg:grid-cols-[1.05fr_.95fr]">
        <div className="screen-in relative z-10">
          <div className="mono inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-100/[.05] px-3 py-2 text-[9px] tracking-[.18em] text-cyan-100/80"><span className="h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_12px_#7ce4f1]" /> AN INTERACTIVE SPACE MUSEUM</div>
          <p className="mono mt-7 text-[10px] tracking-[.31em] text-slate-500">A JOURNEY THROUGH QUIET WORLDS</p>
          <h1 className="display mt-1 text-[clamp(4rem,11vw,8.5rem)] font-bold leading-[.84] tracking-[-.085em] text-[#f1f6ff]">ASTRALIS<span className="text-cyan-200">.</span></h1>
          <h2 className="display mt-6 max-w-xl text-2xl font-medium leading-tight text-slate-200 sm:text-3xl">The Museum of<br className="hidden sm:block" /> NASA's Silent Missions</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-400">Their missions may have ended,<br className="hidden sm:block" /> but their discoveries live on.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={hasSave ? continueGame : () => setScreen("select")} className="btn-primary flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-bold">{hasSave ? "Continue Exploring" : "Start Exploring"} <Icon name="arrow" /></button>
            <button onClick={() => setModal("how")} className="btn-secondary rounded-xl px-6 py-4 font-semibold">How to play</button>
          </div>
          <p className="mt-7 max-w-lg text-[10px] leading-relaxed text-slate-500">An independent educational project created by Team Astralis for NASA Space Apps Challenge 2026. Not an official NASA website.</p>
        </div>
        <div className="hero-art relative mx-auto aspect-square w-full max-w-[490px]">
          <div className="hero-halo" /><div className="hero-orbit orbit" /><div className="hero-planet"><div className="planet-crater crater-one" /><div className="planet-crater crater-two" /><div className="planet-crater crater-three" /></div>
          <div className="hero-stars"><i /><i /><i /><i /><i /><i /></div>
          <div className="astronaut-float float"><Suit color="#79dce9" size={160} /></div>
          <div className="satellite float"><div className="satellite-core" /><span /><b /></div>
          <div className="hero-caption mono"><span>MISSION ARCHIVE</span><strong>THE QUIET<br />WORLDS</strong><small>MOON / MARS · 06 EXHIBITS</small></div>
          <div className="hero-coordinates mono">LUNAR GALLERY<br />00° 40′ N — 23° 28′ W</div>
          <div className="hero-dot dot-a twinkle" /><div className="hero-dot dot-b twinkle" /><div className="hero-dot dot-c twinkle" />
        </div>
      </div>
      <footer className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[.08] pt-4 mono text-[9px] tracking-[.16em] text-slate-600"><span>INDEPENDENT EDUCATIONAL EXPERIENCE</span><span>MOON 01 — MARS 02</span><span>© TEAM ASTRALIS · 2026</span></footer>
    </section>}

    {screen === "select" && <section className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl screen-in"><div className="flex items-center justify-between"><button onClick={() => setScreen("welcome")} className="text-xs text-slate-400 hover:text-white">← Main menu</button><span className="mono text-[9px] tracking-[.2em] text-slate-500">01 / CHOOSE YOUR EXPLORER</span></div>
        <div className="mt-8 text-center"><span className="mono text-[10px] tracking-[.22em] text-cyan-200/75">YOUR FIELD PARTNER</span><h1 className="display mt-2 text-4xl font-bold sm:text-5xl">Who will walk the halls?</h1><p className="mt-3 text-sm text-slate-400">Every explorer has the same abilities. Choose the color that feels like you.</p></div>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">{ASTRONAUTS.map(a => <button key={a.id} onClick={() => setProgress(p => ({ ...p, astronaut: a.id }))} className={`astronaut-choice ${progress.astronaut === a.id ? "selected" : ""}`} aria-pressed={progress.astronaut === a.id}><div className="absolute right-3 top-3">{progress.astronaut === a.id && <span className="grid h-6 w-6 place-items-center rounded-full bg-cyan-200 text-slate-900"><Icon name="check" size={14} /></span>}</div><div className="mx-auto w-fit"><Suit color={a.color} size={116} name={a.name} /></div><h2 className="display mt-2 text-xl font-bold">{a.name}</h2><p className="mt-2 min-h-10 text-xs leading-relaxed text-slate-400">{a.description}</p><div className="mx-auto mt-3 h-1 w-10 rounded-full" style={{ background: a.color }} /></button>)}</div>
        <div className="mt-7 flex flex-col items-center gap-3"><button className="btn-primary flex w-full max-w-sm items-center justify-center gap-3 rounded-xl px-6 py-4 font-bold" onClick={confirmAstronaut}>Confirm selection <Icon name="arrow" /></button><p className="mono text-[9px] tracking-wider text-slate-600">YOUR ADVENTURE BEGINS AT THE MOON MUSEUM</p></div>
      </div>
    </section>}

    {screen === "failed" && <section className="relative z-10 flex min-h-[100dvh] items-center justify-center px-5 py-10"><div className="screen-in max-w-md text-center"><div className="failure-mark mx-auto grid h-24 w-24 place-items-center rounded-full"><span className="display text-4xl">0%</span></div><span className="mono mt-7 block text-[10px] tracking-[.24em] text-rose-200/80">EXPEDITION COMPLETE</span><h1 className="display mt-2 text-4xl font-bold">Mission Failed</h1><p className="mt-4 text-sm leading-relaxed text-slate-400">Oxygen depleted. The expedition has ended. Your passport and saved progress have been cleared. A fresh start is waiting back at astronaut selection.</p><button onClick={() => { setProgress(emptyProgress()); setScreen("select"); }} className="btn-primary mt-7 rounded-xl px-6 py-4 font-bold">Return to astronaut selection <Icon name="arrow" size={16} /></button></div></section>}

    {screen === "game" && <section className="relative z-10 flex min-h-[100dvh] flex-col px-3 py-3 sm:px-6 sm:py-5">
      <header className="game-header mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3"><button aria-label="Main menu" onClick={() => { setModal(null); setScreen("welcome"); }} className="brand-mark shrink-0"><Icon name="star" size={16} /></button><div className="min-w-0"><div className="mono truncate text-[9px] tracking-[.2em] text-slate-500">ASTRALIS / {progress.planet.toUpperCase()} ARCHIVE</div><h1 className="display truncate text-lg font-bold sm:text-xl">{progress.planet} Museum</h1></div></div>
        <div className="flex items-center gap-2 sm:gap-3"><div className="oxygen-pill"><span className="oxygen-icon">O₂</span><span className="mono text-sm">{progress.oxygen}%</span><span className="oxygen-meter"><i style={{ width: `${progress.oxygen}%` }} /></span></div><button className="btn-secondary passport-trigger flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold sm:px-4" onClick={() => setModal("passport")}><Icon name="passport" /><span className="hidden sm:inline">Passport</span><span className="passport-count">{progress.stamps.length}/6</span></button></div>
      </header>
      <div className="mx-auto mt-3 flex w-full max-w-7xl flex-1 flex-col">
        <div className="game-instructions flex items-center justify-between gap-2 pb-2"><p className="mono text-[9px] tracking-wider text-slate-500 sm:text-[10px]">WASD / ARROWS <span className="mx-1 text-cyan-200/60">·</span> E TO INSPECT</p><div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /><span className="mono text-[9px] tracking-wider text-slate-500">{progress.stamps.length} / 6 MEMORIES RESTORED</span></div></div>
        <div className="game-frame relative mx-auto w-full max-w-[1000px] flex-1"><MuseumCanvas planet={progress.planet} astronaut={progress.astronaut} completed={progress.completed} onNearby={setNearbyId} onInteract={interact} sceneRef={sceneRef} />
          <div className="game-overlay-label mono"><span className="h-1.5 w-1.5 rounded-full bg-cyan-200" /> LIVE FIELD VIEW</div>
          {nearbyId && <button className="inspect-prompt btn-primary absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full px-5 py-3 text-xs font-bold shadow-xl" onClick={() => interact(nearbyId)}>Press E to Inspect</button>}
          {!nearbyId && <div className="walk-hint absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-[#0a1730]/75 px-4 py-2 text-center mono text-[9px] tracking-wider text-slate-400">WANDER THE HALL · FIND A DISPLAY</div>}
        </div>
        <div className="mobile-controls mt-3 flex items-center justify-between gap-3">
          <VirtualPad onMove={(x, y) => { setJoystick({ x, y }); sceneRef.current?.setJoystick(x, y); }} />
          <div className="flex flex-1 flex-col items-end gap-2"><button onClick={() => nearbyId && interact(nearbyId)} disabled={!nearbyId} className="btn-primary inspect-touch flex min-h-14 items-center justify-center gap-2 rounded-2xl px-7 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-35">Inspect <span className="mono text-xs">E</span></button><span className="mono text-[9px] tracking-wider text-slate-500">TOUCH CONTROLS</span></div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-white/[.07] pt-3"><span className="mono text-[9px] tracking-wider text-slate-600">{progress.planet === "Mars" ? "MISSION: MARS EXPLORATION ROVERS" : "MISSION: LUNAR SURFACE ARCHIVE"}</span><button onClick={() => setModal("how")} className="text-[10px] text-slate-500 hover:text-cyan-100">Field guide</button></div>
      </div>
    </section>}

    {screen === "legacy" && <section className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8">
      <div className="legacy-scene screen-in w-full max-w-5xl"><div className="text-center"><span className="mono text-[10px] tracking-[.25em] text-cyan-100">ASTRALIS ARCHIVE / COMPLETE</span><h1 className="display mt-3 text-4xl font-bold sm:text-6xl">All Memories Restored!</h1><p className="mt-3 text-sm text-slate-400">Six journeys, held in one constellation.</p></div>
        <div className="legacy-wall mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4">{EXHIBITS.map((e, i) => <article key={e.id} className="legacy-item" style={{ animationDelay: `${i * 180}ms` }}><div className="legacy-art"><HardwareArt exhibit={e} size={96} /></div><h2 className="display text-sm font-bold sm:text-base">{e.name}</h2><p className="legacy-contribution">{e.contribution}</p><span className="mono text-[8px] tracking-wider text-slate-600">{e.planet.toUpperCase()} / {e.planet === "Moon" ? "NASA SOURCES · AI ART" : "DEMO CONTENT"}</span></article>)}</div>
        <p className="display mx-auto mt-8 max-w-xl text-center text-xl font-medium text-cyan-100 sm:text-2xl">“Their missions may have ended, but their discoveries live on.”</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><button onClick={() => { setModal(null); setScreen("welcome"); }} className="btn-secondary rounded-xl px-6 py-3.5 font-semibold">Return to Main Menu</button><button onClick={newAdventure} className="btn-primary rounded-xl px-6 py-3.5 font-bold">Start a New Adventure <Icon name="arrow" size={16} /></button></div>
      </div>
    </section>}

    {modal && <GameModal modal={modal} exhibit={exhibit} progress={progress} storyIndex={storyIndex} memoryIndex={memoryIndex} onClose={() => { setModal(null); if (modal === "inspect") setActiveId(null); }} onAction={() => {
      if (modal === "inspect") startStorySequence();
      else if (modal === "hook") { setStoryIndex(0); setModal("story"); }
      else if (modal === "stamp") nextAfterStamp();
    }} onAnswer={handleMemoryAnswer} onNextStory={advanceStory} onTravel={travelMars} onPassport={() => setModal("passport")} />}
  </main>;
}
