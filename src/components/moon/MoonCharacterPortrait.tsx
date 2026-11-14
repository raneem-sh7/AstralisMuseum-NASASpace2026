import { MOON_ART_CREDIT, MOON_CHARACTER_ART } from "../../data/moonAssets";

type MoonCharacterPortraitProps = {
  exhibitId: string;
  size?: number;
  speaking?: boolean;
};

export function MoonCharacterPortrait({ exhibitId, size = 220, speaking = false }: MoonCharacterPortraitProps) {
  const art = MOON_CHARACTER_ART[exhibitId];
  if (!art) return <div className="moon-portrait" role="img" aria-label="Character artwork unavailable" style={{ width: size, height: size }} />;
  const { face } = art;
  return <div
    className={`moon-portrait${speaking ? " is-speaking" : ""}`}
    role="img"
    aria-label={`AI-generated character illustration${speaking ? ", speaking" : ""}`}
    title={MOON_ART_CREDIT}
    style={{ width: size, height: size }}
  >
    <img src={art.image} alt="" />
    <span
      className="moon-face"
      aria-hidden="true"
      style={{
        left: `${(face.x - face.width / 2) * 100}%`,
        top: `${(face.y - face.height / 2) * 100}%`,
        width: `${face.width * 100}%`,
        height: `${face.height * 100}%`,
      }}
    >
      <i className="moon-face-eye" />
      <i className="moon-face-eye" />
      <i className="moon-face-mouth" />
    </span>
  </div>;
}
