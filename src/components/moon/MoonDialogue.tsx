import { useEffect, useRef } from "react";
import type { Exhibit } from "../../data/exhibits";
import { MOON_EQUIPMENT_PHOTOS } from "../../data/moonAssets";
import { MoonCharacterPortrait } from "./MoonCharacterPortrait";
import { MoonCredits } from "./MoonCredits";
import "./moon.css";

type MoonDialogueProps = {
  phase: "inspect" | "hook" | "story" | "memory" | "stamp";
  exhibit: Exhibit;
  oxygen: number;
  storyIndex: number;
  memoryIndex: number;
  hookAnswer: number | null;
  memoryAnswer: number | null;
  onClose: () => void;
  onAction: () => void;
  onHookAnswer: (i: number) => void;
  onMemoryAnswer: (i: number) => void;
  onRetryMemory: () => void;
  onNextStory: () => void;
};

function ArrowIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>;
}

function StageLabel({ phase, index, total }: { phase: string; index?: number; total?: number }) {
  return <div className="moon-eyebrow">{phase}{index !== undefined && total !== undefined ? ` / ${String(index + 1).padStart(2, "0")} OF ${String(total).padStart(2, "0")}` : ""}</div>;
}

function Answers({
  options, selected, correct, disabled, onSelect,
}: { options: string[]; selected: number | null; correct: number; disabled?: boolean; onSelect: (index: number) => void }) {
  return <div className="moon-answers">
    {options.map((option, index) => <button
      key={`${index}-${option}`}
      type="button"
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={`moon-answer${selected === index ? (index === correct ? " is-correct" : " is-wrong") : ""}`}
      aria-pressed={selected === index}
    >
      <span className="moon-answer-key">{String.fromCharCode(65 + index)}</span><span>{option}</span>
    </button>)}
  </div>;
}

export function MoonDialogue({
  phase, exhibit, oxygen, storyIndex, memoryIndex, hookAnswer, memoryAnswer,
  onClose, onAction, onHookAnswer, onMemoryAnswer, onRetryMemory, onNextStory,
}: MoonDialogueProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (phase !== "inspect") {
      dialogRef.current?.querySelectorAll<HTMLDetailsElement>(".moon-credits-disclosure").forEach(disclosure => {
        disclosure.open = false;
      });
    }
    const focusFrame = window.requestAnimationFrame(() => closeRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])',
      )].filter(element => element.offsetParent !== null);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [phase, exhibit.id]);
  const photo = MOON_EQUIPMENT_PHOTOS[exhibit.id];
  const currentMemory = exhibit.memory[memoryIndex];
  const story = exhibit.story[storyIndex];
  const isMoon = exhibit.planet === "Moon";
  const heading = phase === "inspect" ? exhibit.name
    : phase === "hook" ? "A small question, first."
      : phase === "story" ? (exhibit.galleryName ?? exhibit.name)
        : phase === "memory" ? "Help me remember."
          : "Memory, carried forward.";

  return <div className="moon-dialogue-backdrop" onMouseDown={event => { if (phase === "inspect" && event.target === event.currentTarget) onClose(); }}>
    <article ref={dialogRef} className="moon-dialogue" tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="moon-dialogue-title">
      <header className="moon-dialogue-head">
        <span className="moon-eyebrow">ASTRALIS / PERSONAL LOG</span>
        <button ref={closeRef} className="moon-close" type="button" onClick={onClose} aria-label="Close dialogue">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>
      <div className="moon-dialogue-content">
        <div className="moon-dialogue-grid">
          <div className="moon-character-panel">
            {exhibit.characterImage
              ? <img className={`moon-character-reference${phase === "story" ? " is-speaking" : ""}`} src={exhibit.characterImage} alt={exhibit.characterImageAlt ?? `${exhibit.name} character illustration`} />
              : <MoonCharacterPortrait exhibitId={exhibit.id} size={270} speaking={phase === "story"} />}
          </div>
          <div className="moon-dialogue-copy">
            <StageLabel phase={phase === "inspect" ? "FIELD RECORD" : phase === "hook" ? "FIRST · CURIOSITY" : phase === "story" ? "CHARACTER STORY" : phase === "memory" ? `MEMORY RESTORATION / ${memoryIndex + 1} OF ${exhibit.memory.length} · O₂ ${oxygen}%` : "PASSPORT / RESTORED"} index={phase === "story" ? storyIndex : undefined} total={phase === "story" ? exhibit.story.length : undefined} />
            <h2 className="moon-dialogue-title" id="moon-dialogue-title">{heading}</h2>
            <div className="moon-dialogue-meta">{exhibit.mission} <span aria-hidden="true">·</span> {exhibit.dates}</div>
            {phase === "inspect" && <>
              <p className="moon-dialogue-intro">{exhibit.intro}</p>
              <p className="moon-dialogue-intro">Location: {exhibit.location}. {exhibit.personality}.</p>
            </>}
            {phase === "hook" && <>
              <p className="moon-dialogue-intro">{exhibit.hook.prompt}</p>
              <Answers options={exhibit.hook.options} selected={hookAnswer} correct={exhibit.hook.answer} onSelect={onHookAnswer} />
              {hookAnswer !== null && <div className="moon-explanation"><strong>{hookAnswer === exhibit.hook.answer ? "That is it." : `The answer is ${exhibit.hook.options[exhibit.hook.answer]}.`}</strong> {exhibit.hook.explanation}</div>}
            </>}
            {phase === "story" && <>
              <div className="moon-fact-label">Creative first-person storytelling · not a NASA quotation</div>
              <blockquote className="moon-quote">{story}</blockquote>
              <div className="moon-story-progress" aria-label={`Story line ${storyIndex + 1} of ${exhibit.story.length}`}>
                {exhibit.story.map((line, i) => <i key={`${line}-${i}`} className={i === storyIndex ? "is-active" : ""} />)}
              </div>
            </>}
            {phase === "memory" && currentMemory && <>
              <p className="moon-dialogue-intro">{currentMemory.prompt}</p>
              <Answers options={currentMemory.options} selected={memoryAnswer} correct={currentMemory.answer} disabled={memoryAnswer !== null} onSelect={onMemoryAnswer} />
              {memoryAnswer !== null && <div className="moon-explanation">
                <strong>{memoryAnswer === currentMemory.answer ? "Memory restored. +20 oxygen" : "Not quite. −20 oxygen"}</strong>
                <div>{currentMemory.explanation}{memoryAnswer !== currentMemory.answer ? " Try this same memory again." : ""}</div>
                {memoryAnswer !== currentMemory.answer && <button type="button" className="moon-action secondary" style={{ marginTop: 12, minHeight: 38 }} onClick={onRetryMemory}>Try this memory again</button>}
              </div>}
            </>}
            {phase === "stamp" && <div className="moon-stamp-mark" aria-label={`${exhibit.name} Moon passport stamp`}>MOON<br />MEMORY<br />RESTORED</div>}
          </div>
        </div>
        {phase === "inspect" && photo && <div className="moon-source-context">
          <img src={photo.localImage} alt={photo.caption} />
          <p className="moon-photo-caption">NASA PHOTO / {photo.nasaId.toUpperCase()} · {photo.credit}</p>
          <p>{photo.caption}</p>
        </div>}
        {isMoon && <details className="moon-credits-disclosure">
          <summary>Sources &amp; credits <span aria-hidden="true">+</span></summary>
          <MoonCredits exhibit={exhibit} />
        </details>}
        {phase === "stamp" && <div className="moon-memory-review">
          <h3>Memory answers &amp; explanations</h3>
          <ol>{exhibit.memory.map(question => <li key={question.prompt}>
            <strong>{question.prompt}</strong>
            <div>Correct answer: {question.options[question.answer]}</div>
            <div>{question.explanation}</div>
          </li>)}</ol>
        </div>}
        <div className="moon-dialogue-actions">
          {phase === "inspect" && <button type="button" className="moon-action" onClick={onAction}>Meet {exhibit.galleryName ?? exhibit.name.split(" ")[0]} <ArrowIcon /></button>}
          {phase === "hook" && <button type="button" className="moon-action" disabled={hookAnswer === null} onClick={onAction}>Continue to the story <ArrowIcon /></button>}
          {phase === "story" && <button type="button" className="moon-action" onClick={onNextStory}>{storyIndex + 1 === exhibit.story.length ? "Restore memories" : "Next line"} <ArrowIcon /></button>}
          {phase === "stamp" && <button type="button" className="moon-action" onClick={onAction}>Return to the lunar surface <ArrowIcon /></button>}
        </div>
      </div>
    </article>
  </div>;
}
