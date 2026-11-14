import type { Exhibit } from "../../data/exhibits";
import { MARS_ART_CREDIT, MARS_AUDIO_CREDIT, MARS_ENVIRONMENT } from "../../data/marsExhibits";
import "./mars.css";

type MarsDialogueProps = {
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

function MarsSourcesCredits({ exhibit }: { exhibit: Exhibit }) {
  return <section className="mars-sources" aria-labelledby={`mars-sources-${exhibit.id}`}>
    <div className="mars-sources-head">
      <span className="mars-kicker">FIELD RECORD</span>
      <h3 id={`mars-sources-${exhibit.id}`}>Sources &amp; Credits</h3>
      <p>Mission facts below are NASA-referenced. The original character voice is educational storytelling, not a quotation.</p>
    </div>
    <div className="mars-source-block">
      <span>VERIFIED MISSION REFERENCES</span>
      <ul>{exhibit.sources.map((source, index) => <li key={`${source.url}-${index}`}>
        <a href={source.url} target="_blank" rel="noreferrer">{source.label}<span aria-hidden="true"> ↗</span></a>
      </li>)}</ul>
    </div>
    <div className="mars-source-block mars-photo-credit">
      <img src={exhibit.referenceImage} alt={exhibit.referenceImageAlt ?? `NASA reference photograph for ${exhibit.name}`} />
      <div>
        <span>NASA HISTORICAL REFERENCE</span>
        <p>{exhibit.referenceImageCredit}. Image displayed as a reference, not as the playable character.</p>
        {exhibit.referenceImageSource && <a href={exhibit.referenceImageSource} target="_blank" rel="noreferrer">Open image source page ↗</a>}
      </div>
    </div>
    <div className="mars-credit-notes">
      <p><b>Character art:</b> {exhibit.characterImageCredit ?? MARS_ART_CREDIT}</p>
      <p><b>Story and quiz:</b> First-person dialogue and educational questions are original ASTRALIS writing, not NASA quotations.</p>
      <p><b>Audio:</b> {MARS_AUDIO_CREDIT}</p>
      <p><b>Environment:</b> {MARS_ENVIRONMENT.title}. {MARS_ENVIRONMENT.credit}. <a href={MARS_ENVIRONMENT.sourcePage} target="_blank" rel="noreferrer">NASA image record ↗</a></p>
      <p className="mars-independent-note">ASTRALIS is an independent educational project and is not an official NASA website.</p>
    </div>
  </section>;
}

function Answers({
  options, selected, correct, disabled = false, onSelect
}: {
  options: string[];
  selected: number | null;
  correct: number;
  disabled?: boolean;
  onSelect: (index: number) => void;
}) {
  return <div className="mars-answer-list">
    {options.map((option, index) => <button
      key={option}
      type="button"
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={`mars-answer${selected === index ? (index === correct ? " is-correct" : " is-wrong") : ""}`}
    ><span className="mars-answer-letter">{String.fromCharCode(65 + index)}</span>{option}</button>)}
  </div>;
}

function StampArt({ exhibit }: { exhibit: Exhibit }) {
  const color = `#${exhibit.color.toString(16).padStart(6, "0")}`;
  return <div className="mars-stamp" style={{ borderColor: color, color }} aria-label={`${exhibit.name} passport stamp`}>
    <span>ASTRALIS</span><strong>{exhibit.symbol}</strong><small>MARS · RESTORED</small>
  </div>;
}

export function MarsDialogue({
  phase, exhibit, oxygen, storyIndex, memoryIndex, hookAnswer, memoryAnswer,
  onClose, onAction, onHookAnswer, onMemoryAnswer, onRetryMemory, onNextStory
}: MarsDialogueProps) {
  const memory = exhibit.memory[memoryIndex];
  const heroArt = phase === "story" ? exhibit.characterTalkImage ?? exhibit.characterImage : exhibit.characterImage;
  return <div className="mars-dialogue-backdrop" onMouseDown={event => { if (event.target === event.currentTarget && phase === "inspect") onClose(); }}>
    <article className="mars-dialogue" role="dialog" aria-modal="true" aria-labelledby="mars-dialogue-title">
      <header className="mars-dialogue-header">
        <div><span className="mars-kicker">ASTRALIS · MARS FIELD NOTES</span><span className="mars-phase">{phase === "inspect" ? "EXHIBIT / INSPECT" : phase === "hook" ? "01 / HOOK QUESTION" : phase === "story" ? `02 / STORY ${storyIndex + 1} OF ${exhibit.story.length}` : phase === "memory" ? `03 / MEMORY QUESTION ${memoryIndex + 1} OF ${exhibit.memory.length}` : "04 / PASSPORT STAMP"}</span></div>
        <button type="button" className="mars-close" onClick={onClose} aria-label="Close exhibit">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>

      {phase === "inspect" && <div className="mars-inspect">
        <div className="mars-inspect-intro">
          <div className="mars-character-card">
            <img src={exhibit.characterImage} alt={exhibit.characterImageAlt ?? exhibit.name} />
            <span>ORIGINAL ASTRALIS VECTOR ART</span>
          </div>
          <div className="mars-inspect-copy">
            <span className="mars-kicker">{exhibit.mission.toUpperCase()} · NASA-REFERENCED FACTS</span>
            <h2 id="mars-dialogue-title">{exhibit.name}</h2>
            <p className="mars-dates">{exhibit.dates}</p>
            <p className="mars-intro-copy">{exhibit.intro}</p>
            <p className="mars-personality">Character voice: {exhibit.personality} · creative storytelling, not a NASA quotation.</p>
          </div>
        </div>
        <MarsSourcesCredits exhibit={exhibit} />
        <button type="button" className="mars-primary" onClick={onAction}>Meet the exhibit <span aria-hidden="true">→</span></button>
      </div>}

      {phase === "hook" && <div className="mars-question-phase">
        <div className="mars-question-hero">
          <img src={heroArt} alt={exhibit.characterImageAlt ?? exhibit.name} />
          <div><span className="mars-kicker">FIRST · CURIOSITY</span><h2 id="mars-dialogue-title">{exhibit.name}</h2></div>
        </div>
        <p className="mars-prompt">{exhibit.hook.prompt}</p>
        <Answers options={exhibit.hook.options} selected={hookAnswer} correct={exhibit.hook.answer} onSelect={onHookAnswer} />
        {hookAnswer !== null && <div className="mars-explanation is-hook">
          <b>{hookAnswer === exhibit.hook.answer ? "That is it." : `Correct answer: ${exhibit.hook.options[exhibit.hook.answer]}.`}</b>
          <p>{exhibit.hook.explanation} This question does not change oxygen.</p>
        </div>}
        <button type="button" className="mars-primary" disabled={hookAnswer === null} onClick={onAction}>Continue to the story <span aria-hidden="true">→</span></button>
      </div>}

      {phase === "story" && <div className="mars-story-phase">
        <div className="mars-story-head">
          <div className="mars-character-card is-story"><img src={heroArt} alt={exhibit.characterImageAlt ?? exhibit.name} /><span>CREATIVE FIRST-PERSON STORY</span></div>
          <div><span className="mars-kicker">A VOICE FROM THE ARCHIVE</span><h2 id="mars-dialogue-title">{exhibit.name}</h2><p className="mars-story-note">Historical details are based on the NASA links in this exhibit. This dialogue is not a NASA quotation.</p></div>
        </div>
        <blockquote className="mars-story-line">{exhibit.story[storyIndex]}</blockquote>
        <div className="mars-story-progress" aria-label={`Story line ${storyIndex + 1} of ${exhibit.story.length}`}>
          {exhibit.story.map((line, index) => <i key={`${index}-${line}`} className={index === storyIndex ? "active" : ""} />)}
        </div>
        <button type="button" className="mars-primary" onClick={onNextStory}>{storyIndex === exhibit.story.length - 1 ? "Restore memories" : "Next story box"} <span aria-hidden="true">→</span></button>
      </div>}

      {phase === "memory" && memory && <div className="mars-question-phase">
        <div className="mars-question-header">
          <div><span className="mars-kicker">MEMORY RESTORATION · {memoryIndex + 1} OF {exhibit.memory.length}</span><h2 id="mars-dialogue-title">Restore a mission memory</h2></div>
          <div className="mars-oxygen">{oxygen}%<small>OXYGEN</small></div>
        </div>
        <p className="mars-prompt">{memory.prompt}</p>
        <Answers options={memory.options} selected={memoryAnswer} correct={memory.answer} disabled={memoryAnswer !== null} onSelect={onMemoryAnswer} />
        {memoryAnswer !== null && <div className={`mars-explanation${memoryAnswer === memory.answer ? " is-right" : " is-wrong"}`}>
          <b>{memoryAnswer === memory.answer ? "Memory restored. +20 oxygen" : "Not quite. −20 oxygen"}</b>
          <p>{memory.explanation}{memoryAnswer !== memory.answer ? " Try this same question again." : ""}</p>
          {memoryAnswer !== memory.answer && <button type="button" className="mars-secondary" onClick={onRetryMemory}>Try this memory again</button>}
        </div>}
      </div>}

      {phase === "stamp" && <div className="mars-stamp-phase">
        <div className="mars-celebration">
          <img src={exhibit.characterImage} alt="" />
          <span className="mars-celebration-orbit" />
        </div>
        <span className="mars-kicker">PASSPORT STAMP ISSUED</span>
        <h2 id="mars-dialogue-title">Memory Restored!</h2>
        <p className="mars-stamp-caption">{exhibit.name} · {exhibit.mission}</p>
        <StampArt exhibit={exhibit} />
        <section className="mars-answer-review" aria-label="Correct answers and explanations">
          <h3>Memory answers &amp; explanations</h3>
          <ol>{exhibit.memory.map((question, index) => <li key={question.prompt}>
            <strong>{index + 1}. {question.prompt}</strong>
            <span>Correct answer: {question.options[question.answer]}</span>
            <p>{question.explanation}</p>
          </li>)}</ol>
        </section>
        <button type="button" className="mars-primary" onClick={onAction}>Return to the gallery <span aria-hidden="true">→</span></button>
      </div>}
    </article>
  </div>;
}
