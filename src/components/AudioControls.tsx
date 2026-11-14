import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audioManager } from "../audio/AudioManager";
import "./audio-controls.css";

export default function AudioControls({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const settings = useSyncExternalStore(audioManager.subscribe, audioManager.getSnapshot);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { onOpenChange?.(open); return () => { onOpenChange?.(false); }; }, [open, onOpenChange]);
  useEffect(() => {
    if (!open) return;
    const close = (event: globalThis.PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, [open]);
  return <div ref={root} className="audio-controls">
    <button className="audio-icon-button" aria-label={settings.muted ? "Unmute audio" : "Mute audio"} aria-pressed={settings.muted}
      onClick={() => { void audioManager.unlock(); audioManager.setMuted(!settings.muted); }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />{settings.muted ? <path d="m17 9 5 6m0-6-5 6" /> : <><path d="M17 8a6 6 0 0 1 0 8M20 5a10 10 0 0 1 0 14" /></>}
      </svg>
    </button>
    <button className="audio-settings-button" aria-expanded={open} aria-controls="astralis-audio-panel" onClick={() => setOpen(value => !value)} aria-label="Audio settings">
      Audio <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" aria-hidden="true"><path d="m3 4 3 3 3-3" /></svg>
    </button>
    {open && <div id="astralis-audio-panel" className="audio-panel" role="dialog" aria-label="Audio settings">
      <div className="audio-panel-title"><strong>Suit audio</strong><button onClick={() => setOpen(false)} aria-label="Close audio settings">×</button></div>
      <p>Original ambient music and stylized suit / interface sounds.</p>
      <label htmlFor="music-volume">Music <output>{Math.round(settings.musicVolume * 100)}%</output></label>
      <input id="music-volume" type="range" min="0" max="100" value={Math.round(settings.musicVolume * 100)} onChange={event => audioManager.setMusicVolume(Number(event.target.value) / 100)} />
      <label htmlFor="sfx-volume">Sound effects <output>{Math.round(settings.sfxVolume * 100)}%</output></label>
      <input id="sfx-volume" type="range" min="0" max="100" value={Math.round(settings.sfxVolume * 100)} onChange={event => audioManager.setSfxVolume(Number(event.target.value) / 100)} />
      <button className="audio-mute-control" onClick={() => { void audioManager.unlock(); audioManager.setMuted(!settings.muted); }}>{settings.muted ? "Unmute all audio" : "Mute all audio"}</button>
      <small>{settings.status === "unavailable" ? "Audio is unavailable in this browser. The game remains fully playable." : settings.muted ? "Audio muted. All gameplay remains available." : "No natural wind or outdoor lunar footsteps. Sound is heard through your imagined suit."}</small>
    </div>}
  </div>;
}
