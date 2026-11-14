import type { Exhibit } from "./exhibits";
import { publicAsset } from "../utils/publicAsset";

const originalCharacterCredit =
  "Original ASTRALIS cartoon vector character artwork created for this project; not a NASA photograph, NASA engineering diagram, or NASA endorsement.";

const MARS_EXHIBIT_CATALOG: Exhibit[] = [
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
    characterImage: publicAsset("/images/mars/sojourner.webp"),
    characterTalkImage: publicAsset("/images/mars/sojourner-talking.webp"),
    characterImageAlt: "Original cartoon vector character inspired by the six-wheeled Sojourner Mars rover.",
    characterImageCredit: originalCharacterCredit,
    referenceImage: publicAsset("/images/mars/sojourner.webp"),
    referenceImageAlt: "ASTRALIS cartoon character illustration of Sojourner; not a NASA photograph.",
    referenceImageCredit: originalCharacterCredit,
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
    id: "spirit",
    name: "Spirit Rover",
    galleryName: "Spirit",
    planet: "Mars",
    mission: "Mars Exploration Rover mission",
    dates: "Landed January 3, 2004 · mission ended May 25, 2011",
    location: "Gusev Crater, Mars",
    objective: "Investigate Martian rocks and soil for evidence of past water and changing environments.",
    contribution: "Found strong evidence that ancient Mars was much wetter than it is today.",
    ending: "Spirit became stuck in soft soil in 2009. NASA ended recovery efforts in 2011 after contact was lost.",
    personality: "Persistent Field Geologist",
    color: 0xf2a981,
    symbol: "S",
    intro: "I was one of NASA's twin Mars Exploration Rovers. At Gusev Crater, I examined rocks and soil for clues to Mars's watery past.",
    characterImage: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia05/pia05240/PIA05240.jpg?w=1024&h=768&fit=clip&crop=faces%2Cfocalpoint",
    characterImageAlt: "NASA photograph PIA05240 showing Spirit's tracks in Martian soil at Gusev Crater.",
    characterImageCredit: "NASA/JPL, PIA05240, “Spirit Self-motivates.” NASA Photojournal identifies this as a Spirit rover image.",
    referenceImage: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia05/pia05240/PIA05240.jpg?w=1024&h=768&fit=clip&crop=faces%2Cfocalpoint",
    referenceImageAlt: "Spirit's tracks in Martian soil at Gusev Crater.",
    referenceImageCredit: "NASA/JPL",
    referenceImageSource: "https://science.nasa.gov/photojournal/spirit-self-motivates/",
    story: [
      "I am Spirit, one of two Mars Exploration Rovers sent to study the planet's rocks and soil.",
      "I landed inside Gusev Crater on January 3, 2004, for a mission planned to last 90 Martian days.",
      "My instruments examined rocks, soil, and the traces left by water and wind.",
      "In the Columbia Hills, I found signs that ancient Mars had been much wetter than it is now.",
      "I kept working for more than six years and traveled about 7.73 kilometers.",
      "Soft soil eventually trapped my wheels. NASA ended efforts to contact me in May 2011."
    ],
    hook: {
      prompt: "What did Spirit's discoveries reveal about ancient Mars?",
      options: [
        "Mars was once much wetter than it is today",
        "Mars has a forest growing now",
        "Spirit found proof of living fish",
        "The planet has always been completely dry"
      ],
      answer: 0,
      explanation: "Spirit uncovered strong evidence that Mars was once much wetter. That evidence does not prove life existed."
    },
    memory: [
      {
        prompt: "Where did Spirit land?",
        options: ["Gale Crater", "Gusev Crater", "Jezero Crater", "Ares Vallis"],
        answer: 1,
        explanation: "Spirit landed in Gusev Crater on January 3, 2004."
      },
      {
        prompt: "How long was Spirit's planned mission?",
        options: ["Seven sols", "Thirty sols", "Ninety sols", "One thousand sols"],
        answer: 2,
        explanation: "Spirit's primary mission was planned for 90 Martian days, or sols."
      },
      {
        prompt: "About how far did Spirit travel?",
        options: ["0.77 kilometers", "7.73 kilometers", "45.16 kilometers", "100 kilometers"],
        answer: 1,
        explanation: "NASA reports Spirit traveled about 7.73 kilometers across Mars."
      }
    ],
    sources: [
      { label: "NASA — Spirit Rover Mission Overview", url: "https://science.nasa.gov/mission/mer-spirit/" },
      { label: "NASA/JPL — Spirit Rover Completes Mission", url: "https://www.jpl.nasa.gov/news/nasas-spirit-rover-completes-mission-on-mars" },
      { label: "NASA Photojournal — Spirit Self-motivates (PIA05240)", url: "https://science.nasa.gov/photojournal/spirit-self-motivates/" }
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
    characterImage: publicAsset("/images/mars/opportunity.webp"),
    characterTalkImage: publicAsset("/images/mars/opportunity-talking.webp"),
    characterImageAlt: "Original cartoon vector character inspired by the six-wheeled Opportunity Mars rover.",
    characterImageCredit: originalCharacterCredit,
    referenceImage: publicAsset("/images/mars/opportunity.webp"),
    referenceImageAlt: "ASTRALIS cartoon character illustration of Opportunity; not a NASA photograph.",
    referenceImageCredit: originalCharacterCredit,
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
    id: "curiosity",
    name: "Curiosity Mars Rover",
    galleryName: "Curiosity",
    planet: "Mars",
    mission: "Mars Science Laboratory",
    dates: "Landed August 6, 2012 · active mission",
    location: "Gale Crater and Mount Sharp, Mars",
    objective: "Determine whether Mars ever had environmental conditions that could support microbial life.",
    contribution: "Found chemical and mineral evidence of ancient habitable environments and continues to study Mars's rock record.",
    ending: "Curiosity is still exploring Gale Crater and the slopes of Mount Sharp.",
    personality: "Patient Rock Detective",
    color: 0xe7bf8c,
    symbol: "C",
    intro: "I am Curiosity, NASA's mobile laboratory in Gale Crater. I study layers of rock to learn how Mars's environment changed over time.",
    characterImage: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia18/pia18390/PIA18390.jpg?w=1153&h=1536&fit=clip&crop=faces%2Cfocalpoint",
    characterImageAlt: "NASA photograph PIA18390, Curiosity's self-portrait at the Windjana drilling site.",
    characterImageCredit: "NASA/JPL-Caltech/MSSS, PIA18390, “Curiosity Self-Portrait at Windjana Drilling Site.”",
    referenceImage: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia18/pia18390/PIA18390.jpg?w=1153&h=1536&fit=clip&crop=faces%2Cfocalpoint",
    referenceImageAlt: "Curiosity beside a drilled sandstone target at the Windjana site.",
    referenceImageCredit: "NASA/JPL-Caltech/MSSS",
    referenceImageSource: "https://science.nasa.gov/photojournal/curiosity-self-portrait-at-windjana-drilling-site",
    story: [
      "I am Curiosity, a mobile science laboratory exploring Gale Crater.",
      "I landed on August 6, 2012, to investigate whether Mars once had conditions that could support microbial life.",
      "My cameras, laser, drill, and onboard instruments help me examine rocks up close.",
      "Early in my mission, my science tools found chemical and mineral evidence of past habitable environments.",
      "I climb through layers on Mount Sharp, reading a record of environmental change.",
      "My mission is still active, and I continue exploring Mars one careful measurement at a time."
    ],
    hook: {
      prompt: "What question was Curiosity sent to investigate?",
      options: [
        "Whether Mars once had conditions that could support microbes",
        "Whether forests grow on Mars today",
        "How to bring astronauts home from Mars",
        "Whether Mars has a ring system"
      ],
      answer: 0,
      explanation: "Curiosity's mission asks whether ancient Mars had environmental conditions that could support microbial life."
    },
    memory: [
      {
        prompt: "When did Curiosity land on Mars?",
        options: ["January 3, 2004", "August 6, 2012", "February 18, 2021", "July 4, 1997"],
        answer: 1,
        explanation: "Curiosity landed in Gale Crater on August 6, 2012."
      },
      {
        prompt: "Where does Curiosity explore?",
        options: ["Ares Vallis", "Gusev Crater", "Gale Crater", "Jezero Crater"],
        answer: 2,
        explanation: "Curiosity explores Gale Crater, including the layered slopes of Mount Sharp."
      },
      {
        prompt: "What did Curiosity find early in its mission?",
        options: [
          "Chemical and mineral evidence of past habitable environments",
          "Living microbes in a sample",
          "A present-day Martian ocean",
          "A forest preserved under the soil"
        ],
        answer: 0,
        explanation: "NASA reports chemical and mineral evidence of past habitable environments; this is not a discovery of life."
      }
    ],
    sources: [
      { label: "NASA — Mars Science Laboratory: Curiosity Rover", url: "https://science.nasa.gov/mission/msl-curiosity/" },
      { label: "NASA — Curiosity Celebrates 10 Years on Mars", url: "https://www.nasa.gov/history/curiosity-celebrates-10-years-on-mars/" },
      { label: "NASA Photojournal — Curiosity Self-Portrait at Windjana (PIA18390)", url: "https://science.nasa.gov/photojournal/curiosity-self-portrait-at-windjana-drilling-site" }
    ]
  },
  {
    id: "perseverance",
    name: "Perseverance Mars Rover",
    galleryName: "Perseverance",
    planet: "Mars",
    mission: "Mars 2020",
    dates: "Landed February 18, 2021 · active mission",
    location: "Jezero Crater, Mars",
    objective: "Search for signs of ancient microbial life and collect rock and regolith samples for possible Earth return.",
    contribution: "Explores an ancient river delta and caches samples that record Jezero Crater's history.",
    ending: "Perseverance remains active; a future mission may retrieve its stored samples for study on Earth.",
    personality: "Careful Sample Seeker",
    color: 0xf1a47e,
    symbol: "P",
    intro: "I am Perseverance, exploring Jezero Crater's ancient lake and river-delta landscape while collecting carefully selected samples.",
    characterImage: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26344/PIA26344.jpg?w=1536&h=1091&fit=clip&crop=faces%2Cfocalpoint",
    characterImageAlt: "NASA photograph PIA26344, Perseverance's selfie beside the rock nicknamed Cheyava Falls.",
    characterImageCredit: "NASA/JPL-Caltech/MSSS, PIA26344, “Perseverance's Selfie With Cheyava Falls.”",
    referenceImage: "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/photojournal/pia/pia26/pia26344/PIA26344.jpg?w=1536&h=1091&fit=clip&crop=faces%2Cfocalpoint",
    referenceImageAlt: "Perseverance beside the rock nicknamed Cheyava Falls in Jezero Crater.",
    referenceImageCredit: "NASA/JPL-Caltech/MSSS",
    referenceImageSource: "https://science.nasa.gov/photojournal/perseverances-selfie-with-cheyava-falls/",
    story: [
      "I am Perseverance, a rover exploring Jezero Crater for clues to Mars's ancient past.",
      "I landed on February 18, 2021, near the remains of an ancient river delta.",
      "My instruments study rocks and regolith as I search for signs of past microbial life.",
      "I collect and seal selected cores so they can be studied in detail.",
      "The samples record Jezero's geology and water history; they are not proof that life existed.",
      "My mission is active, and a future mission may bring some stored samples to Earth."
    ],
    hook: {
      prompt: "What is Perseverance searching for in Jezero Crater?",
      options: [
        "Signs of ancient microbial life and useful rock samples",
        "A place to land Apollo astronauts",
        "Evidence that Mars has forests today",
        "A route to fly a crewed spacecraft"
      ],
      answer: 0,
      explanation: "Perseverance searches for signs of ancient microbial life and collects samples of rock and regolith for possible return to Earth."
    },
    memory: [
      {
        prompt: "When did Perseverance land on Mars?",
        options: ["August 6, 2012", "February 18, 2021", "January 3, 2004", "July 30, 2020"],
        answer: 1,
        explanation: "Perseverance landed on Mars on February 18, 2021."
      },
      {
        prompt: "Where is Perseverance exploring?",
        options: ["Gale Crater", "Gusev Crater", "Jezero Crater", "Meridiani Planum"],
        answer: 2,
        explanation: "Perseverance landed in Jezero Crater, where scientists study an ancient delta and lake environment."
      },
      {
        prompt: "What does Perseverance collect?",
        options: [
          "Rock and regolith samples for possible Earth return",
          "Lunar soil for an Apollo mission",
          "Martian air for a crewed return capsule",
          "Only panoramic photographs"
        ],
        answer: 0,
        explanation: "The rover collects and stores selected rock and regolith samples for possible pickup by a future mission."
      }
    ],
    sources: [
      { label: "NASA — Mars 2020: Perseverance Rover", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
      { label: "NASA — Perseverance Science Objectives", url: "https://science.nasa.gov/mission/mars-2020-perseverance/science/" },
      { label: "NASA Photojournal — Perseverance's Selfie With Cheyava Falls (PIA26344)", url: "https://science.nasa.gov/photojournal/perseverances-selfie-with-cheyava-falls/" }
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
    characterImage: publicAsset("/images/mars/ingenuity.webp"),
    characterTalkImage: publicAsset("/images/mars/ingenuity-talking.webp"),
    characterImageAlt: "Original cartoon vector character inspired by NASA's Ingenuity Mars Helicopter.",
    characterImageCredit: originalCharacterCredit,
    referenceImage: publicAsset("/images/mars/ingenuity.webp"),
    referenceImageAlt: "ASTRALIS cartoon character illustration of Ingenuity; not a NASA photograph.",
    referenceImageCredit: originalCharacterCredit,
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

// Restore the original three-stop Mars route; removed mission stamps remain archived in Passport.
const ACTIVE_MARS_EXHIBIT_IDS = new Set(["sojourner", "opportunity", "ingenuity"]);
export const MARS_EXHIBITS = MARS_EXHIBIT_CATALOG.filter(exhibit => ACTIVE_MARS_EXHIBIT_IDS.has(exhibit.id));

export const MARS_ART_CREDIT =
  "The existing Mars character artwork is original ASTRALIS cartoon vector artwork created for this project; it is not NASA photography or official engineering art.";
export const MARS_AUDIO_CREDIT =
  "ASTRALIS's ambient score and interface effects are code-synthesized with Web Audio. No NASA mission recordings or third-party audio samples are used.";
export const MARS_ENVIRONMENT = {
  nasaId: "PIA24921",
  title: "Detailed Panorama of Mars' Jezero Crater Delta",
  sourcePage: "https://science.nasa.gov/photojournal/detailed-panorama-of-mars-jezero-crater-delta/",
  localImage: publicAsset("/images/mars/jezero.webp"),
  credit: "NASA/JPL-Caltech/ASU/MSSS",
  note: "NASA panorama shown as a real Martian landscape. The game adds interface overlays and original cartoon equipment characters."
};
