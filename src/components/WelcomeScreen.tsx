import type { ReactNode } from "react";
import {
  TARANTULA_NEBULA_CREDIT,
  TARANTULA_NEBULA_IMAGE,
  TARANTULA_NEBULA_NOTE,
  TARANTULA_NEBULA_SOURCE,
  TARANTULA_NEBULA_TITLE,
} from "../data/welcomeAssets";
import "./welcome-screen.css";

export type WelcomeScreenProps = {
  hasSave: boolean;
  onEnter: () => void;
  onNewAdventure: () => void;
  onMarsPreview: () => void;
  onHowToPlay: () => void;
  onCredits: () => void;
  audioControls: ReactNode;
};

export function WelcomeScreen({
  hasSave,
  onEnter,
  onNewAdventure,
  onMarsPreview,
  onHowToPlay,
  onCredits,
  audioControls,
}: WelcomeScreenProps) {
  return (
    <section className="astralis-welcome" aria-labelledby="astralis-welcome-title">
      <img
        className="astralis-welcome__image"
        src={TARANTULA_NEBULA_IMAGE}
        alt=""
        aria-hidden="true"
      />
      <div className="astralis-welcome__shade" aria-hidden="true" />

      <header className="astralis-welcome__nav">
        <div className="astralis-welcome__wordmark" aria-label="Team Astralis">
          <span className="astralis-welcome__sigil" aria-hidden="true">
            A
          </span>
          <span>ASTRALIS</span>
        </div>
        <div className="astralis-welcome__nav-actions">
          {audioControls}
          <button
            className="astralis-welcome__credits"
            type="button"
            onClick={onCredits}
          >
            Credits &amp; Sources
          </button>
        </div>
      </header>

      <section className="astralis-welcome__content">
        <p className="astralis-welcome__eyebrow">
          <span aria-hidden="true" />
          TEAM ASTRALIS PRESENTS
        </p>
        <h1 id="astralis-welcome-title" className="astralis-welcome__title">
          ASTRALIS
        </h1>
        <p className="astralis-welcome__subtitle">
          THE MUSEUM OF NASA&apos;S
          <br />
          SILENT MISSIONS
        </p>
        <div className="astralis-welcome__rule" aria-hidden="true">
          <span />
        </div>
        <p className="astralis-welcome__description">
          Some missions may have ended, but
          <br className="astralis-welcome__desktop-break" /> their discoveries
          live on.
        </p>
        <div className="astralis-welcome__actions">
          <button
            className="astralis-welcome__enter"
            type="button"
            onClick={onEnter}
            aria-label={
              hasSave
                ? "Enter the museum and resume your saved exploration"
                : "Enter the museum"
            }
          >
            <span>ENTER THE MUSEUM</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15m-6-6 6 6-6 6" />
            </svg>
          </button>
          <button
            className="astralis-welcome__how"
            type="button"
            onClick={onHowToPlay}
          >
            HOW TO PLAY
          </button>
          <button
            className="astralis-welcome__mars-preview"
            type="button"
            onClick={onMarsPreview}
            aria-label="Preview the Mars expedition without saving progress"
          >
            PREVIEW MARS
          </button>
          {hasSave && (
            <button
              className="astralis-welcome__new"
              type="button"
              onClick={onNewAdventure}
              aria-label="Start a new adventure and choose an astronaut"
            >
              NEW ADVENTURE
            </button>
          )}
        </div>
      </section>

      <footer className="astralis-welcome__footer">
        <span className="astralis-welcome__footer-mark" aria-hidden="true" />
        <span>AN INDEPENDENT EDUCATIONAL PROJECT</span>
        <span className="astralis-welcome__footer-divider" aria-hidden="true" />
        <span>NOT AN OFFICIAL NASA WEBSITE</span>
      </footer>
      <p className="astralis-welcome__image-credit">
        <a href={TARANTULA_NEBULA_SOURCE} target="_blank" rel="noreferrer">
          {TARANTULA_NEBULA_TITLE}
        </a>
        <span aria-hidden="true"> / </span>
        {TARANTULA_NEBULA_CREDIT}
        <span className="astralis-welcome__science-note">{TARANTULA_NEBULA_NOTE}</span>
      </p>
    </section>
  );
}
