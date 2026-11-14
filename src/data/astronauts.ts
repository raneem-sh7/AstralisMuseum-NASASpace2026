export const ASTRONAUTS = [
  {
    id: "christina-koch",
    name: "Christina Koch",
    role: "Artemis II Mission Specialist",
    portrait: "/images/astronauts/christina-koch-nasa.jpg",
    idle: "/images/astronauts/christina-koch-idle.png",
    walkSheet: "/images/astronauts/christina-koch-walk.png",
    biography: "Christina Koch is an engineer, explorer, and NASA astronaut selected in 2013. Before becoming an astronaut, she worked on space science instruments and conducted research in remote environments, including Antarctica.",
    achievements: [
      "Served as a flight engineer on International Space Station Expeditions 59, 60, and 61.",
      "Completed 328 consecutive days in space on her first spaceflight.",
      "Participated in the first all-female spacewalks.",
      "Served as mission specialist on Artemis II."
    ],
    biographySource: "https://www.nasa.gov/humans-in-space/astronauts/christina-koch/",
    portraitSource: "https://www.asc-csa.gc.ca/eng/multimedia/search/image/18517",
    photoCredit: "NASA. Uploaded portrait; the Canadian Space Agency's April 3, 2023 portrait record credits NASA."
  },
  {
    id: "victor-glover",
    name: "Victor Glover",
    role: "Artemis II Pilot",
    portrait: "/images/astronauts/victor-glover-nasa.jpg",
    idle: "/images/astronauts/victor-glover-idle.png",
    walkSheet: "/images/astronauts/victor-glover-walk.png",
    biography: "Victor J. Glover, Jr. is a NASA astronaut selected in 2013 and a naval aviator and test pilot. His engineering and flight-test experience helped prepare him for spacecraft operations and long-duration spaceflight.",
    achievements: [
      "Piloted NASA's SpaceX Crew-1 spacecraft, Resilience, to the International Space Station.",
      "Served as a flight engineer during ISS Expedition 64/65.",
      "Completed four spacewalks during his first spaceflight.",
      "Served as pilot on Artemis II."
    ],
    biographySource: "https://www.nasa.gov/humans-in-space/astronauts/victor-j-glover/",
    portraitSource: "https://www.asc-csa.gc.ca/eng/multimedia/search/image/18519",
    photoCredit: "NASA. Uploaded portrait; the Canadian Space Agency's April 3, 2023 portrait record credits NASA."
  }
] as const;

export type AstronautId = typeof ASTRONAUTS[number]["id"];
export type AstronautProfile = typeof ASTRONAUTS[number];
export const AVATAR_CREDIT = "AI-generated artistic character interpretation for ASTRALIS. Not a NASA photograph, official spacesuit depiction, or endorsement.";

// Migrate the old suit choices without resetting any expedition progress.
export function normalizeAstronautId(id: string | undefined): AstronautId {
  if (id === "victor-glover" || id === "orange") return "victor-glover";
  return "christina-koch";
}

export function getAstronaut(id: string): AstronautProfile {
  return ASTRONAUTS.find(profile => profile.id === normalizeAstronautId(id))!;
}
