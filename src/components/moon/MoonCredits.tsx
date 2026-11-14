import type { Exhibit } from "../../data/exhibits";
import { EXHIBITS } from "../../data/exhibits";
import {
  MOON_ART_CREDIT,
  MOON_AUDIO_CREDIT,
  MOON_EQUIPMENT_PHOTOS,
  MOON_SURFACE_PHOTO,
  MOON_WORLD_NOTE,
  NASA_MEDIA_GUIDELINES,
} from "../../data/moonAssets";

type MoonCreditsProps = { exhibit?: Exhibit };

export function MoonCredits({ exhibit }: MoonCreditsProps) {
  const moonExhibits = EXHIBITS.filter(item => item.planet === "Moon");
  const equipmentPhotos = exhibit
    ? [MOON_EQUIPMENT_PHOTOS[exhibit.id]].filter(Boolean)
    : Object.values(MOON_EQUIPMENT_PHOTOS);
  const scientificExhibits = exhibit ? [exhibit] : moonExhibits;
  return <section className="moon-credits" aria-labelledby="moon-credits-title">
    <h3 id="moon-credits-title">Sources &amp; credits</h3>
    <div className="moon-credits-grid">
      <div className="moon-credit-record">
        <small>Mission facts</small>
        <p>Mission references support verified facts. First-person character dialogue and personalities are Team Astralis educational storytelling, not quotations.</p>
        {scientificExhibits.flatMap(item => item.sources).map((source, index) => <p key={`${source.url}-${index}`}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></p>)}
      </div>
      <div className="moon-credit-record">
        <small>NASA environmental photograph</small>
        <p>{MOON_SURFACE_PHOTO.title}. {MOON_SURFACE_PHOTO.credit}</p>
        <p><a href={MOON_SURFACE_PHOTO.sourcePage} target="_blank" rel="noreferrer">NASA Image Library · {MOON_SURFACE_PHOTO.nasaId}</a></p>
        <p>{MOON_SURFACE_PHOTO.caption}</p>
      </div>
      {equipmentPhotos.map(equipmentPhoto => equipmentPhoto && <div className="moon-credit-record" key={equipmentPhoto.nasaId}>
        <small>NASA equipment photograph · {equipmentPhoto.nasaId}</small>
        <p>{equipmentPhoto.title}. {equipmentPhoto.credit}</p>
        <p><a href={equipmentPhoto.sourcePage} target="_blank" rel="noreferrer">NASA Image Library record</a></p>
        <p>{equipmentPhoto.caption}</p>
      </div>)}
      <div className="moon-credit-record">
        <small>Character illustration</small>
        <p>{MOON_ART_CREDIT}</p>
      </div>
      <div className="moon-credit-record">
        <small>Audio</small>
        <p>{MOON_AUDIO_CREDIT}</p>
      </div>
      <div className="moon-credit-record">
        <small>Project &amp; map note</small>
        <p>ASTRALIS is an independent educational project by Team Astralis. It is not affiliated with, endorsed by, or an official product of NASA.</p>
        <p>{MOON_WORLD_NOTE}</p>
        <p><a href={NASA_MEDIA_GUIDELINES} target="_blank" rel="noreferrer">NASA images and media guidelines</a></p>
      </div>
    </div>
  </section>;
}
