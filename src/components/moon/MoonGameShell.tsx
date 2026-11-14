import type { ReactNode } from "react";
import "./moon.css";

type MoonGameShellProps = {
  children: ReactNode;
  movementControls: ReactNode;
  audioControls: ReactNode;
  oxygen: number;
  stampCount: number;
  planet?: "Moon" | "Mars";
  planetStampCount?: number;
  totalStamps?: number;
  moonStampCount?: number;
  previewMode?: boolean;
  nearbyName: string | null;
  onMenu: () => void;
  onPassport: () => void;
  onGuide: () => void;
  onCredits: () => void;
  onInteract: () => void;
};

function MoonIcon({ name }: { name: "moon" | "mars" | "passport" | "menu" | "guide" | "sound" | "talk" }) {
  const shapes = {
    moon: <path d="M19.6 15.5A8.3 8.3 0 0 1 8.5 4.7 8.7 8.7 0 1 0 19.6 15.5Z" />,
    mars: <><circle cx="10" cy="14" r="6" /><path d="m14.5 9.5 6-6M15 3h6v6" /></>,
    passport: <><rect x="4" y="3" width="16" height="18" rx="3" /><circle cx="12" cy="12" r="4" /><path d="M8 7h8" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    guide: <><circle cx="12" cy="12" r="9" /><path d="M9.6 9a2.5 2.5 0 1 1 4.8 1c-.7 1.1-2.4 1.5-2.4 3M12 17h.01" /></>,
    sound: <><path d="M4 10v4h4l5 4V6l-5 4z" /><path d="M17 9a5 5 0 0 1 0 6" /></>,
    talk: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-3 2v-6.5A7.5 7.5 0 1 1 20 11.5Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
  };
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>;
}

export function MoonGameShell({
  children, movementControls, audioControls, oxygen, stampCount, planet = "Moon",
  planetStampCount, totalStamps = 6, moonStampCount, previewMode = false, nearbyName,
  onMenu, onPassport, onGuide, onCredits, onInteract,
}: MoonGameShellProps) {
  const oxygenValue = Math.max(0, Math.min(100, oxygen));
  const localStamps = planetStampCount ?? moonStampCount ?? 0;
  return <div className="moon-shell">
    <section className="moon-stage" aria-label={`${planet} exploration mission`}>
      <div className="moon-game-window">{children}</div>
      <header className="moon-topbar">
        <div className="moon-brand">
          <span className="moon-brand-mark"><MoonIcon name={planet === "Moon" ? "moon" : "mars"} /></span>
          <span className="moon-brand-copy"><small>ASTRALIS / FIELD ARCHIVE</small><strong>{planet} expedition</strong></span>
        </div>
        <nav className="moon-hud-actions" aria-label="Mission controls">
          <button className="moon-hud-button" type="button" onClick={onMenu} aria-label="Open main menu"><MoonIcon name="menu" /><span className="moon-desktop-label">Menu</span></button>
          <button className="moon-hud-button" type="button" onClick={onGuide} aria-label="Open field guide"><MoonIcon name="guide" /><span className="moon-desktop-label">Field guide</span></button>
          <button className="moon-hud-button" type="button" onClick={onPassport} aria-label={`Open passport, ${localStamps} of ${planet === "Moon" ? 3 : 6} ${planet} stamps`}>
            <MoonIcon name="passport" /><span className="moon-desktop-label">Passport</span><span className="moon-count">{stampCount} / {totalStamps}</span>
          </button>
          <div className="moon-o2" aria-label={`Oxygen ${oxygenValue} percent`}>
            <span className="moon-o2-info"><small>O₂</small><strong>{oxygenValue}%</strong></span>
            <span className="moon-o2-track"><i style={{ width: `${oxygenValue}%` }} /></span>
          </div>
          {audioControls}
        </nav>
      </header>
      <div className="moon-world-label">
          <div className="moon-eyebrow">{planet === "Moon" ? "LUNAR" : "MARTIAN"} SURFACE / EDUCATIONAL COMPOSITE</div>
        <h1>Quiet ground.<br />Long memory.</h1>
        <p>{previewMode ? "Preview only · progress is not saved." : planet === "Moon" ? "Apollo hardware, remembered here." : "Mars missions, remembered here."}</p>
      </div>
      {nearbyName && <div className="moon-nearby" role="status"><i />Within radio range <span aria-hidden="true">·</span> {nearbyName}</div>}
      <footer className="moon-footer">
        <div className="moon-controls-copy">
          <span className="moon-kicker">Movement · four directions</span>
          <strong className="moon-desktop-label">W A S D <span aria-hidden="true">/</span> arrow keys <span aria-hidden="true">·</span> move to explore</strong>
          <strong className="moon-mobile-label">Use the pad to explore</strong>
          <span className="moon-desktop-label">{nearbyName ? "Press E to Talk" : "Walk toward a signal to meet its keeper"}</span>
          <span className="moon-mobile-label">{nearbyName ? "A voice is waiting nearby." : "Listen for a nearby signal."}</span>
        </div>
        <div className="moon-control-side">
          <div className="moon-pad-slot">{movementControls}</div>
          <button className="moon-mobile-interact" type="button" onClick={onInteract} disabled={!nearbyName} aria-label={nearbyName ? `Interact with ${nearbyName}` : "No character nearby"}>
            <MoonIcon name="talk" /> Interact
          </button>
          <button className="moon-credit-link" type="button" onClick={onCredits}>Sources &amp; credits</button>
        </div>
      </footer>
    </section>
  </div>;
}
