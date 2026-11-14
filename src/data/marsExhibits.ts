import type { Exhibit } from "./exhibits";

const originalCharacterCredit =
  "Original ASTRALIS cartoon vector illustration, drawn for this project. It is not a NASA photograph, NASA engineering diagram, or NASA endorsement.";

export const MARS_EXHIBITS: Exhibit[] = [
  {
    id: "sojourner",
    name: "Sojourner Rover",
    galleryName: "Sojourner",
    planet: "Mars",
    mission: "Mars Pathfinder",
    dates: "Arrived July 4, 1997 · operated 83 days",
    location: "Ares Vallis, Mars",
    objective: "Demonstrate a small mobile rover and investigate nearby Martian rocks and soil.",
    contribution: "NASA's first rover to operate on Mars used APXS and returned images and scientific measurements.",
    ending: "Sojourner operated for 83 days, far beyond its planned seven-day mission.",
    personality: "Curious Explorer",
    color: 0xffb27e,
    symbol: "S",
    intro: "I was the first rover to operate on Mars. I arrived with Mars Pathfinder at Ares Vallis on July 4, 1997.",
    characterImage: "/images/mars/sojourner.svg",
    characterTalkImage: "/images/mars/sojourner-talking.svg",
    characterImageAlt: "Original cartoon vector character inspired by the six-wheeled Sojourner Mars rover.",
    characterImageCredit: originalCharacterCredit,
    referenceImage: "/images/mars/sojourner.webp",
    referenceImageAlt: "NASA photograph of the deployed Sojourner rover on the Martian surface.",
    referenceImageCredit: "NASA/JPL",
    referenceImageSource: "https://science.nasa.gov/photojournal/newly-deployed-sojourner-rover/",
    story: [
      "Hello, explorer! I am Sojourner, NASA's first rover to operate on Mars.",
      "I arrived with Mars Pathfinder at Ares Vallis on July 4, 1997.",
      "My team planned a seven-day mission, but I kept working for 83 days.",
      "My Alpha Proton X-ray Spectrometer, or APXS, helped analyze rocks and soil.",
      "I also took pictures and made scientific measurements as I explored nearby terrain.",
      "A small rover could do real field science on another planet—and I helped show how."
    ],
    hook: {
      prompt: "What made Sojourner special in Mars exploration?",
      options: [
        "It was NASA's first rover to operate on Mars",
        "It was the first spacecraft to orbit Mars",
        "It carried the first people to Mars",
        "It was the first rover to return Martian samples to Earth"
      ],
      answer: 0,
      explanation: "Sojourner was the first rover to operate on Mars, as part of NASA's Mars Pathfinder mission."
    },
    memory: [
      {
        prompt: "When did Sojourner arrive on Mars?",
        options: ["July 4, 1997", "January 25, 2004", "February 18, 2021", "July 20, 1969"],
        answer: 0,
        explanation: "Mars Pathfinder and Sojourner arrived at Ares Vallis on July 4, 1997."
      },
      {
        prompt: "Which instrument helped Sojourner analyze rocks and soil?",
        options: ["APXS", "Mastcam-Z", "Pancam", "Seismometer"],
        answer: 0,
        explanation: "The Alpha Proton X-ray Spectrometer (APXS) measured the elemental composition of rocks and soil."
      },
      {
        prompt: "How long did Sojourner operate?",
        options: ["7 days", "30 days", "83 days", "14 years"],
        answer: 2,
        explanation: "Sojourner operated for 83 days—well beyond its planned seven-day mission."
      }
    ],
    sources: [
      { label: "NASA — Mars Pathfinder", url: "https://science.nasa.gov/mission/mars-pathfinder/" },
      { label: "NASA — Sojourner's Farthest Journey", url: "https://science.nasa.gov/photojournal/sojourners-farthest-journey/" },
      { label: "NASA — Rover Touchdown on Martian Surface", url: "https://science.nasa.gov/resource/rover-touchdown-on-martian-surface/" },
      { label: "NASA Photojournal — Newly Deployed Sojourner Rover (PIA01551)", url: "https://science.nasa.gov/photojournal/newly-deployed-sojourner-rover/" }
    ]
  },
  {
    id: "opportunity",
    name: "Opportunity Rover",
    galleryName: "Opportunity",
    planet: "Mars",
    mission: "Mars Exploration Rover mission",
    dates: "Landed January 25, 2004 · traveled about 45.16 km",
    location: "Meridiani Planum, Mars",
    objective: "Investigate Martian geology and search for evidence of ancient water.",
    contribution: "Found geological evidence that liquid water had existed in the past and traveled about 45.16 kilometers.",
    ending: "A global dust storm blocked sunlight from its solar panels; after communication was lost, NASA declared the mission complete in February 2019.",
    personality: "Determined Explorer",
    color: 0xffcc82,
    symbol: "O",
    intro: "I was one of NASA's twin Mars Exploration Rovers. My long journey helped scientists investigate Mars's watery past.",
    characterImage: "/images/mars/opportunity.svg",
    characterTalkImage: "/images/mars/opportunity-talking.svg",
    characterImageAlt: "Original cartoon vector character inspired by the six-wheeled Opportunity Mars rover.",
    characterImageCredit: originalCharacterCredit,
    referenceImage: "/images/mars/opportunity.webp",
    referenceImageAlt: "NASA Opportunity rover final panorama of Martian terrain, shown in true color.",
    referenceImageCredit: "NASA/JPL-Caltech/Cornell/ASU",
    referenceImageSource: "https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/",
    story: [
      "I am Opportunity, one of the twin Mars Exploration Rovers sent with Spirit.",
      "I landed on Meridiani Planum on January 25, 2004, for a mission planned to last about 90 Martian days.",
      "My cameras, robotic arm, and instruments helped me examine the rocks around me.",
      "Those rocks provided evidence that liquid water had existed on Mars in the past.",
      "I traveled about 45.16 kilometers and worked for more than 14 Earth years.",
      "A global dust storm blocked sunlight from my solar panels; after contact was lost, NASA declared my mission complete in February 2019."
    ],
    hook: {
      prompt: "What was Opportunity searching for on Mars?",
      options: [
        "Evidence that liquid water had existed in the past",
        "Signs of active forests growing today",
        "A landing site for the Apollo Lunar Module",
        "A way to fly through the Martian atmosphere"
      ],
      answer: 0,
      explanation: "Opportunity studied rocks and soil for geological evidence of past water on Mars."
    },
    memory: [
      {
        prompt: "When did Opportunity land on Mars?",
        options: ["January 25, 2004", "July 4, 1997", "February 18, 2021", "January 18, 2024"],
        answer: 0,
        explanation: "Opportunity landed on Mars on January 25, 2004."
      },
      {
        prompt: "What led to the end of Opportunity's mission?",
        options: [
          "A global dust storm blocked sunlight, followed by loss of communication",
          "A crash destroyed the rover during a traverse",
          "The rover was launched back to Earth",
          "A rotor blade broke during a flight"
        ],
        answer: 0,
        explanation: "The 2018 global dust storm reduced sunlight reaching the solar panels. Communication was lost, and NASA declared the mission complete in February 2019; the storm did not physically destroy the rover."
      },
      {
        prompt: "Approximately how far did Opportunity travel?",
        options: ["4.5 kilometers", "14 kilometers", "45.16 kilometers", "145 kilometers"],
        answer: 2,
        explanation: "Opportunity traveled approximately 45.16 kilometers (28.06 miles) across Mars."
      }
    ],
    sources: [
      { label: "NASA — Opportunity's Record-Setting Mission", url: "https://www.nasa.gov/image-article/taking-look-back-opportunitys-record-setting-mission/" },
      { label: "NASA — Opportunity Rover's Final Mars Images", url: "https://science.nasa.gov/resource/opportunity-rovers-final-mars-images/" },
      { label: "NASA Photojournal — Opportunity's Final Traverse Map", url: "https://science.nasa.gov/photojournal/opportunitys-final-traverse-map/" }
    ]
  },
  {
    id: "ingenuity",
    name: "Ingenuity Mars Helicopter",
    galleryName: "Ingenuity",
    planet: "Mars",
    mission: "Mars 2020 / Perseverance technology demonstration",
    dates: "First flight April 19, 2021 · completed 72 flights",
    location: "Jezero Crater, Mars",
    objective: "Demonstrate that powered, controlled flight was possible in the thin Martian atmosphere.",
    contribution: "Achieved the first powered, controlled flight on another planet and completed 72 flights.",
    ending: "Rotor blade damage during landing after flight 72 left Ingenuity unable to fly.",
    personality: "Brave Inventor",
    color: 0xe8d5a4,
    symbol: "I",
    intro: "I was a small technology demonstrator carried to Mars with Perseverance to test powered flight in the thin Martian atmosphere.",
    characterImage: "/images/mars/ingenuity.svg",
    characterTalkImage: "/images/mars/ingenuity-talking.svg",
    characterImageAlt: "Original cartoon vector character inspired by NASA's Ingenuity Mars Helicopter.",
    characterImageCredit: originalCharacterCredit,
    referenceImage: "/images/mars/ingenuity.webp",
    referenceImageAlt: "NASA photograph of the Ingenuity Mars Helicopter flight model.",
    referenceImageCredit: "NASA/JPL-Caltech",
    referenceImageSource: "https://science.nasa.gov/photojournal/nasas-ingenuity-mars-helicopter/",
    story: [
      "I am Ingenuity, a small technology demonstrator that traveled to Mars with Perseverance.",
      "My first flight on April 19, 2021, was the first powered, controlled flight on another planet.",
      "My team planned five test flights, but I completed 72.",
      "Across those flights, I spent more than two hours in the Martian sky.",
      "During my 72nd flight on January 18, 2024, one or more rotor blades were damaged during landing.",
      "I could no longer fly, but my flights proved that powered aircraft can work on another world."
    ],
    hook: {
      prompt: "What was Ingenuity designed to demonstrate?",
      options: [
        "Powered, controlled flight on Mars",
        "A crewed landing on Mars",
        "Sample return to Earth",
        "A rover that could drill through bedrock"
      ],
      answer: 0,
      explanation: "Ingenuity was a technology demonstration designed to test powered, controlled flight in Mars's thin atmosphere."
    },
    memory: [
      {
        prompt: "How many flights did Ingenuity complete?",
        options: ["5", "18", "52", "72"],
        answer: 3,
        explanation: "Ingenuity completed 72 flights, far more than the five demonstration flights originally planned."
      },
      {
        prompt: "What made Ingenuity's achievement historic?",
        options: [
          "It achieved powered, controlled flight on another planet",
          "It became the first rover to roll on Mars",
          "It returned the first Mars samples to Earth",
          "It carried astronauts through the Martian sky"
        ],
        answer: 0,
        explanation: "Its April 19, 2021 flight was the first powered, controlled flight on a world beyond Earth."
      },
      {
        prompt: "What happened during Ingenuity's final flight?",
        options: [
          "Rotor blade damage during landing left it unable to fly",
          "A dust storm physically destroyed its solar panels",
          "It landed safely and was recovered by Perseverance",
          "Its landing legs were intentionally released"
        ],
        answer: 0,
        explanation: "One or more rotor blades were damaged during landing after flight 72, so Ingenuity could no longer fly."
      }
    ],
    sources: [
      { label: "NASA — Ingenuity Mission Ends", url: "https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/" },
      { label: "NASA — Ingenuity Mars Helicopter", url: "https://science.nasa.gov/mission/mars-2020/ingenuity/" },
      { label: "NASA Photojournal — Ingenuity Spots the Shadow of Its Damaged Rotor Blade (PIA26243)", url: "https://science.nasa.gov/photojournal/ingenuity-spots-the-shadow-of-its-damaged-rotor-blade/" },
      { label: "NASA Photojournal — Ingenuity Flight Model (PIA23882)", url: "https://science.nasa.gov/photojournal/nasas-ingenuity-mars-helicopter/" }
    ]
  }
];

export const MARS_ART_CREDIT =
  "The Mars characters are original cartoon vector illustrations made for ASTRALIS; they are not NASA photographs or official engineering illustrations.";
export const MARS_AUDIO_CREDIT =
  "ASTRALIS's ambient score and interface effects are code-synthesized with Web Audio. No NASA mission recordings or third-party audio samples are used.";
export const MARS_ENVIRONMENT = {
  nasaId: "PIA24921",
  title: "Detailed Panorama of Mars' Jezero Crater Delta",
  sourcePage: "https://science.nasa.gov/photojournal/detailed-panorama-of-mars-jezero-crater-delta/",
  localImage: "/images/mars/jezero.webp",
  credit: "NASA/JPL-Caltech/ASU/MSSS",
  note: "NASA panorama shown as a real Martian landscape. The game adds interface overlays and original cartoon equipment characters."
};
