import { useEffect, useRef, useState } from "react";
import { ASTRONAUTS, AVATAR_CREDIT, getAstronaut } from "../data/astronauts";
import "./astronaut-selection.css";

type AstronautSelectionProps = {
  selectedId: string;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onBack: () => void;
};

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return direction === "left" ? (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 4.5 7 10l5.5 5.5M7.5 10H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="m4.5 10.3 3.6 3.5 7.4-7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function AstronautSelection({ selectedId, onSelect, onConfirm, onBack }: AstronautSelectionProps) {
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const selected = getAstronaut(selectedId);
  const meetingAstronaut = meetingId ? getAstronaut(meetingId) : null;

  useEffect(() => {
    if (!meetingAstronaut) return;

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMeetingId(null);
      }
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>("[data-astronaut-dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>("button, a[href]");
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [meetingAstronaut]);

  return (
    <section className="astronaut-selection">
      <div className="astronaut-selection__inner">
        <div className="astronaut-selection__topline">
          <button className="astronaut-selection__back" type="button" onClick={onBack}>
            <ArrowIcon direction="left" />
            <span>Main menu</span>
          </button>
          <span className="astronaut-selection__step">01 / Choose your explorer</span>
        </div>

        <header className="astronaut-selection__intro">
          <span className="astronaut-selection__eyebrow">Your field partner</span>
          <h1 className="astronaut-selection__title">Who will walk the halls?</h1>
          <p className="astronaut-selection__lede">
            Two Artemis explorers. One journey through the memories of Moon and Mars.
          </p>
        </header>

        <section className="astronaut-selection__cards" aria-label="Choose an astronaut">
          {ASTRONAUTS.map((astronaut, index) => {
            const isSelected = selected.id === astronaut.id;
            return (
              <article className={`astronaut-profile${isSelected ? " is-selected" : ""}`} key={astronaut.id}>
                <div className="astronaut-profile__portrait">
                  <img src={astronaut.portrait} alt={`Official NASA portrait of ${astronaut.name}`} />
                  <span className="astronaut-profile__photo-label">Official NASA portrait</span>
                  <span className="astronaut-profile__number">ASTRONAUT / 0{index + 1}</span>
                </div>
                <div className="astronaut-profile__body">
                  <h2 className="astronaut-profile__name">{astronaut.name}</h2>
                  <p className="astronaut-profile__role">{astronaut.role}</p>
                  <p className="astronaut-profile__summary">{astronaut.biography}</p>
                  <div className="astronaut-profile__actions">
                    <button
                      className="astronaut-profile__select"
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(astronaut.id)}
                    >
                      {isSelected ? <><CheckIcon /> Selected</> : "Select"}
                    </button>
                    <button
                      className="astronaut-profile__meet"
                      type="button"
                      aria-haspopup="dialog"
                      onClick={() => setMeetingId(astronaut.id)}
                    >
                      Meet
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="astronaut-selection__lower" aria-label="Selected explorer and expedition controls">
          <div className="astronaut-selection__preview" aria-live="polite">
            <div className="astronaut-selection__avatar">
              <img src={selected.idle} alt={`AI-generated game character artwork of ${selected.name}`} />
            </div>
            <div className="astronaut-selection__preview-copy">
              <span className="astronaut-selection__serial">Your expedition avatar</span>
              <strong className="astronaut-selection__preview-name">{selected.name}</strong>
              <span className="astronaut-selection__avatar-note">AI game artwork · not a NASA photograph</span>
            </div>
          </div>
          <button className="astronaut-selection__confirm" type="button" onClick={onConfirm}>
            <span>Begin expedition</span>
            <ArrowIcon />
          </button>
        </section>
        <p className="astronaut-selection__footnote">Your adventure begins at the Moon Museum</p>
      </div>

      {meetingAstronaut && (
        <div className="astronaut-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setMeetingId(null);
        }}>
          <section
            className="astronaut-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="astronaut-dialog-title"
            data-astronaut-dialog
          >
            <button
              ref={closeButtonRef}
              className="astronaut-dialog__close"
              type="button"
              aria-label={`Close ${meetingAstronaut.name} biography`}
              onClick={() => setMeetingId(null)}
            >
              <CloseIcon />
            </button>
            <div className="astronaut-dialog__banner">
              <img src={meetingAstronaut.portrait} alt="" />
            </div>
            <div className="astronaut-dialog__content">
              <span className="astronaut-dialog__eyebrow">Meet your explorer</span>
              <h2 className="astronaut-dialog__title" id="astronaut-dialog-title">{meetingAstronaut.name}</h2>
              <p className="astronaut-dialog__role">{meetingAstronaut.role}</p>
              <p className="astronaut-dialog__bio">{meetingAstronaut.biography}</p>
              <h3 className="astronaut-dialog__section-title">Flight highlights</h3>
              <ul className="astronaut-dialog__achievements">
                {meetingAstronaut.achievements.map((achievement) => <li key={achievement}>{achievement}</li>)}
              </ul>
              <div className="astronaut-dialog__sources" aria-label="NASA sources">
                <a href={meetingAstronaut.biographySource} target="_blank" rel="noreferrer">NASA biography ↗</a>
                <a href={meetingAstronaut.portraitSource} target="_blank" rel="noreferrer">Portrait record · NASA / CSA ↗</a>
              </div>
              <div className="astronaut-dialog__credits">
                <span><strong>Photograph:</strong> {meetingAstronaut.photoCredit}</span>
                <span><strong>Playable avatar:</strong> {AVATAR_CREDIT}</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

export default AstronautSelection;
