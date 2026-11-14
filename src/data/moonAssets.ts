export type MoonImageSource = {
  nasaId: string;
  title: string;
  sourcePage: string;
  originalImage: string;
  localImage: string;
  credit: string;
  caption: string;
  processing: string;
};

export const NASA_MEDIA_GUIDELINES = "https://www.nasa.gov/nasa-brand-center/images-and-media/";

// Source records and photo metadata checked against NASA's Image and Video
// Library on 2026-11-14. No third-party photographic copyright was identified
// in the descriptions or image metadata. NASA's media guidelines permit
// educational/informational use, with acknowledgement and no endorsement.
// These are image-source acknowledgements, not claims of NASA approval.
export const MOON_SURFACE_PHOTO: MoonImageSource = {
  nasaId: "jsc2004e52772",
  title: "Panorama view of Apollo 17 Lunar surface photos",
  sourcePage: "https://images.nasa.gov/details/jsc2004e52772",
  originalImage: "https://images-assets.nasa.gov/image/jsc2004e52772/jsc2004e52772~orig.jpg",
  localImage: "/images/moon/lunar-surface.webp",
  credit: "NASA / Johnson Space Center. Individual photographer not named in this panorama's library record.",
  caption: "Apollo 17 ALSEP-station panorama, assembled from frames AS17-147-22572 through AS17-147-22600.",
  processing: "Cropped from the 29,524 × 3,000 NASA panorama at x=13,500, y=0, width=4,800, height=3,000; resized to 1,600 × 1,000 and converted to WebP. No AI-generated terrain."
};

export const MOON_EQUIPMENT_PHOTOS: Record<string, MoonImageSource> = {
  "apollo-11-eagle": {
    nasaId: "as11-40-5927",
    title: "View Apollo 11 Lunar Module as it rested on lunar surface",
    sourcePage: "https://images.nasa.gov/details/as11-40-5927",
    originalImage: "https://images-assets.nasa.gov/image/as11-40-5927/as11-40-5927~medium.jpg",
    localImage: "/images/moon/eagle-nasa.webp",
    credit: "NASA. Photograph by Neil Armstrong, as identified in NASA's description.",
    caption: "Eagle before the crew departed, with both stages still assembled. Only its descent stage remained at the landing site.",
    processing: "Resized to 640 × 640 and converted to WebP."
  },
  "apollo-rover": {
    nasaId: "as15-86-11603",
    title: "Astronaut James Irwin works at Lunar Roving Vehicle during Apollo 15 EVA",
    sourcePage: "https://images.nasa.gov/details/as15-86-11603",
    originalImage: "https://images-assets.nasa.gov/image/as15-86-11603/as15-86-11603~medium.jpg",
    localImage: "/images/moon/lrv-nasa.webp",
    credit: "NASA. Photograph by David Scott, as identified in NASA's description.",
    caption: "Apollo 15's LRV at Hadley–Apennine. Apollo 16 and 17 each used a separate vehicle.",
    processing: "Resized to 640 × 640 and converted to WebP."
  },
  "alsep": {
    nasaId: "as12-47-6918",
    title: "Apollo 12 Mission image — View of part of the deployed Apollo Lunar Surface Experiment Package (ALSEP)",
    sourcePage: "https://images.nasa.gov/details/as12-47-6918",
    originalImage: "https://images-assets.nasa.gov/image/as12-47-6918/as12-47-6918~medium.jpg",
    localImage: "/images/moon/alsep-nasa.webp",
    credit: "NASA. Photograph by Alan Bean, as identified in NASA's description.",
    caption: "Apollo 12's stationary ALSEP instruments: passive seismic experiment, central station and SIDE. Not a rover.",
    processing: "Resized to 640 × 619 and converted to WebP."
  }
};

export const MOON_CHARACTER_ART: Record<string, {
  image: string;
  face: { x: number; y: number; width: number; height: number };
}> = {
  "apollo-11-eagle": { image: "/images/moon/eagle-character.svg", face: { x: .5, y: .418, width: .14, height: .1 } },
  "apollo-rover": { image: "/images/moon/lrv-character.svg", face: { x: .59, y: .52, width: .17, height: .095 } },
  "alsep": { image: "/images/moon/alsep-character.svg", face: { x: .46, y: .625, width: .16, height: .11 } }
};

export const MOON_ART_CREDIT = "AI-generated vector character illustrations created for ASTRALIS with QuiverAI, inspired by the supplied concept images. Animated faces are original game graphics. Artistic interpretations, not NASA photographs or engineering diagrams. Eagle depicts a descent-stage-inspired character; ALSEP is stationary and has no wheels.";
export const MOON_AUDIO_CREDIT = "Original, code-synthesized ambient score and stylized suit, radio and interface effects created for ASTRALIS using Web Audio. No NASA recordings or third-party audio samples are used. The Moon has no atmosphere to carry ordinary outdoor sound.";
export const MOON_WORLD_NOTE = "Educational composite: these characters represent different Apollo landing sites. Their placement is not a map of one real site.";
