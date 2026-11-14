import type { Exhibit } from "../../data/exhibits";
import { MARS_ART_CREDIT, MARS_AUDIO_CREDIT, MARS_ENVIRONMENT } from "../../data/marsExhibits";

export function MarsCredits({ exhibit }: { exhibit: Exhibit }) {
  const photo = exhibit.referenceImage && exhibit.referenceImage !== exhibit.characterImage ? exhibit.referenceImage : undefined;
  const portraitCredit = exhibit.characterImageCredit ?? MARS_ART_CREDIT;
  const portraitIsNasaPhoto = /NASA\/JPL/i.test(portraitCredit);
  return <section className="moon-credits" aria-label={`${exhibit.name} sources and credits`}>
    <h3>Sources &amp; credits</h3>
    <div className="moon-credits-grid">
      <div className="moon-credit-record">
        <small>Mission facts</small>
        <p>NASA mission references support the historical details. First-person dialogue and character personalities are original ASTRALIS educational storytelling, not NASA quotations.</p>
        {exhibit.sources.map((source, index) => <p key={`${source.url}-${index}`}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></p>)}
      </div>
      {photo && <div className="moon-credit-record">
        <small>NASA historical reference</small>
        <p>{exhibit.referenceImageCredit ?? "NASA"}. {exhibit.referenceImageAlt ?? `Historical reference for ${exhibit.name}.`}</p>
        {exhibit.referenceImageSource && <p><a href={exhibit.referenceImageSource} target="_blank" rel="noreferrer">NASA image record</a></p>}
      </div>}
      <div className="moon-credit-record">
        <small>{portraitIsNasaPhoto ? "NASA mission photograph" : exhibit.characterImage ? "ASTRALIS character illustration" : "Portrait image"}</small>
        <p>{exhibit.characterImage
          ? portraitCredit
          : "The NASA reference image is used as the exhibit portrait because no separate character illustration is supplied."}</p>
      </div>
      <div className="moon-credit-record">
        <small>Audio</small>
        <p>{MARS_AUDIO_CREDIT}</p>
      </div>
      <div className="moon-credit-record">
        <small>Environment photograph</small>
        <p>{MARS_ENVIRONMENT.title}. {MARS_ENVIRONMENT.credit}</p>
        <p><a href={MARS_ENVIRONMENT.sourcePage} target="_blank" rel="noreferrer">NASA image record</a></p>
      </div>
      <div className="moon-credit-record">
        <small>Project note</small>
        <p>ASTRALIS is an independent educational project and is not affiliated with, endorsed by, or an official product of NASA.</p>
      </div>
    </div>
  </section>;
}
