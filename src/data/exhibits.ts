export type OptionQuestion = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type Exhibit = {
  id: string;
  name: string;
  planet: "Moon" | "Mars";
  mission: string;
  dates: string;
  location: string;
  objective: string;
  contribution: string;
  ending: string;
  personality: string;
  color: number;
  symbol: string;
  intro: string;
  story: string[];
  hook: OptionQuestion;
  memory: OptionQuestion[];
  sources: { label: string; url: string }[];
  galleryName?: string;
  characterImage?: string;
  characterImageAlt?: string;
  characterImageCredit?: string;
  imageWarning?: string;
};

const eagleCharacterImage = "/images/moon/eagle_ai_character.jpg";
const lunarRoverCharacterImage = "/images/moon/lrv_ai_character.jpg";
const alsepCharacterImage = "/images/moon/alsep_ai_character_REPLACE.jpg";

export const EXHIBIT_ID_ALIASES: Record<string, string> = {
  // Preserve stamps saved under the previous Moon exhibit name.
  "surveyor-3": "apollo-11-eagle"
};

export const EXHIBITS: Exhibit[] = [
  {
    id: "apollo-11-eagle",
    name: "Apollo 11 Eagle Lunar Module",
    planet: "Moon",
    mission: "Apollo 11",
    dates: "Landed July 20, 1969",
    location: "Sea of Tranquility, Moon (descent stage only)",
    objective: "Land the first crew on the Moon and return them safely to Earth.",
    contribution: "Carried Neil Armstrong and Buzz Aldrin from lunar orbit to the Apollo 11 landing site.",
    ending: "The ascent stage lifted off to rejoin Columbia. Only Eagle's descent stage remained at the lunar landing site.",
    personality: "Steady, historic, and ready for a careful landing",
    color: 0x7ce4f1,
    symbol: "E",
    galleryName: "Apollo 11 Eagle",
    intro: "The Apollo 11 Lunar Module that carried Armstrong and Aldrin to the Sea of Tranquility. Its descent stage—not the whole Eagle—remained at the landing site.",
    characterImage: eagleCharacterImage,
    characterImageAlt: "AI-generated artistic interpretation of the Apollo 11 Eagle Lunar Module supplied for ASTRALIS; not an authentic NASA photograph.",
    characterImageCredit: "AI-generated character image supplied for ASTRALIS; not an authentic NASA photograph or NASA engineering diagram.",
    story: [
      "Hello, explorer. I am Eagle, the Lunar Module flown on Apollo 11.",
      "On July 20, 1969, I brought Neil Armstrong and Buzz Aldrin down to the Sea of Tranquility.",
      "Michael Collins stayed above in Columbia while my crew began their work on the lunar surface.",
      "Armstrong and Aldrin stepped outside to explore, photograph the site, and collect lunar samples.",
      "After their surface stay, my ascent stage lifted off and carried them back to lunar orbit.",
      "They rendezvoused with Columbia and continued their journey home to Earth.",
      "Only my descent stage remained at the landing site after my crew departed."
    ],
    hook: {
      prompt: "What part of Eagle remained at the Apollo 11 landing site after the crew left the Moon?",
      options: ["The command module", "The Lunar Module descent stage", "The ascent stage", "The launch escape tower"],
      answer: 1,
      explanation: "The ascent stage lifted off with Armstrong and Aldrin. The descent stage was left at the Sea of Tranquility."
    },
    memory: [
      { prompt: "What was the Apollo 11 Lunar Module called?", options: ["Columbia", "Eagle", "Challenger", "Discovery"], answer: 1, explanation: "Eagle was the Apollo 11 Lunar Module; Columbia was the Command Module." },
      { prompt: "Where did Eagle land?", options: ["The Sea of Tranquility", "Oceanus Procellarum", "Hadley–Apennine", "Ares Vallis"], answer: 0, explanation: "Apollo 11 landed at the Sea of Tranquility on July 20, 1969." },
      { prompt: "Which part of Eagle remained at the landing site?", options: ["The descent stage", "The ascent stage", "The Command Module", "The launch escape tower"], answer: 0, explanation: "Only the Lunar Module's descent stage remained at the lunar landing site." }
    ],
    sources: [
      { label: "NASA — Apollo 11 Mission Overview", url: "https://www.nasa.gov/missions/apollo/apollo-11-mission-overview/" },
      { label: "NASA — Apollo 11: The Journey Home", url: "https://www.nasa.gov/history/50-years-ago-apollo-11-the-journey-home/" }
    ]
  },
  {
    id: "apollo-rover",
    name: "Apollo Lunar Roving Vehicle",
    planet: "Moon",
    mission: "Apollo 15, Apollo 16, and Apollo 17",
    dates: "Driven on the Moon in 1971 and 1972",
    location: "Apollo 15, 16, and 17 landing sites",
    objective: "Extend astronaut mobility during lunar surface exploration.",
    contribution: "Three separate battery-powered LRVs carried crews and equipment on lunar traverses.",
    ending: "One LRV was used on each of Apollo 15, 16, and 17; each remained at its mission's lunar site.",
    personality: "Practical, dependable, and happiest on the move",
    color: 0xffbc79,
    symbol: "R",
    galleryName: "Lunar Roving Vehicle",
    intro: "A battery-powered lunar vehicle. Three separate LRVs were driven on the Moon—one each on Apollo 15, 16, and 17.",
    characterImage: lunarRoverCharacterImage,
    characterImageAlt: "AI-generated artistic interpretation of an Apollo Lunar Roving Vehicle supplied for ASTRALIS; not an authentic NASA photograph.",
    characterImageCredit: "AI-generated character image supplied for ASTRALIS; not an authentic NASA photograph or NASA engineering diagram.",
    story: [
      "Hey, explorer. I am the Lunar Roving Vehicle, or LRV.",
      "Apollo crews did not share one rover: a separate LRV flew on each of Apollo 15, 16, and 17.",
      "I was a battery-powered electric vehicle designed to carry astronauts farther across the lunar surface.",
      "For launch, my chassis folded into a storage bay on the Lunar Module.",
      "After landing, astronauts deployed and drove me on surface traverses with science equipment aboard.",
      "My wire-mesh wheels and electric drive motors were built for lunar travel.",
      "Each mission left its own rover at its landing site when the crew headed home."
    ],
    hook: {
      prompt: "Why did NASA send a Lunar Roving Vehicle with Apollo 15?",
      options: ["To help astronauts travel farther on the Moon", "To fly astronauts back to Earth", "To dig a tunnel under the Moon", "To map Mars from orbit"],
      answer: 0,
      explanation: "The LRV extended the distance Apollo astronauts could explore on the lunar surface."
    },
    memory: [
      { prompt: "How many separate LRVs were driven on the Moon?", options: ["One", "Two", "Three", "Six"], answer: 2, explanation: "One separate LRV was used on each of Apollo 15, Apollo 16, and Apollo 17." },
      { prompt: "What powered the Lunar Roving Vehicle?", options: ["Gasoline", "Steam", "Batteries", "Solar wind"], answer: 2, explanation: "The LRV was an electric vehicle powered by onboard batteries." },
      { prompt: "How was the LRV carried to the lunar surface?", options: ["Folded into a Lunar Module storage bay", "Flying independently from Earth", "Built on the Moon", "Carried outside the Saturn V rocket"], answer: 0, explanation: "The rover folded into a Lunar Module bay for transport and was deployed by the astronauts." }
    ],
    sources: [
      { label: "NASA — The Apollo Lunar Roving Vehicle (NSSDCA)", url: "https://nssdc.gsfc.nasa.gov/planetary/lunar/apollo_lrv.html" },
      { label: "NASA — Apollo 15", url: "https://www.nasa.gov/missions/apollo/apollo-15" },
      { label: "NASA — Apollo 16 Mission Details", url: "https://www.nasa.gov/mission_pages/apollo/missions/apollo16.html" },
      { label: "NASA — Apollo 17 Mission Details", url: "https://www.nasa.gov/missions/apollo/apollo-17-mission-details/" }
    ]
  },
  {
    id: "alsep",
    name: "Apollo Lunar Surface Experiments Package (ALSEP)",
    planet: "Moon",
    mission: "Apollo 12, 14, 15, 16, and 17",
    dates: "Deployed from 1969 to 1972; operations ended September 30, 1977",
    location: "Multiple Apollo landing sites",
    objective: "Collect scientific measurements at lunar sites after astronauts departed.",
    contribution: "ALSEP experiments included seismic measurements and other studies of the lunar environment, including heat flow.",
    ending: "Mission Control ended ALSEP operations on September 30, 1977. The packages remained at their lunar sites.",
    personality: "Patient, observant, and full of questions",
    color: 0xc5a6ff,
    symbol: "A",
    galleryName: "ALSEP Science Package",
    intro: "ALSEP was a family of stationary Apollo science instruments—not a rover and not a Surveyor lander.",
    characterImage: alsepCharacterImage,
    characterImageAlt: "Temporary AI-generated ALSEP concept art supplied for ASTRALIS; not an authentic NASA photograph. Replace before release.",
    characterImageCredit: "Temporary AI-generated concept art supplied for ASTRALIS; not an authentic NASA photograph or engineering diagram. Replace with a NASA-verified stationary ALSEP depiction before release.",
    story: [
      "Greetings, explorer. I am ALSEP, the Apollo Lunar Surface Experiments Package.",
      "I am a collection of scientific instruments, not a rover or a Surveyor lander.",
      "Apollo crews deployed ALSEP packages at the Apollo 12, 14, 15, 16, and 17 landing sites.",
      "My instruments gathered information about the Moon after the astronauts returned to their spacecraft.",
      "Seismic experiments listened for lunar ground motion, while other instruments investigated different properties such as heat flow.",
      "Mission Control ended ALSEP operations on September 30, 1977, after packages operated for years.",
      "The instruments stayed at their sites; the measurements they sent became part of the record of lunar science."
    ],
    hook: {
      prompt: "What does ALSEP describe?",
      options: ["A family of Apollo lunar science instruments", "A Mars landing capsule", "A crewed lunar car", "A telescope in Earth orbit"],
      answer: 0,
      explanation: "ALSEP was a family of Apollo scientific instruments deployed on the Moon; it was separate from Surveyor landers."
    },
    memory: [
      { prompt: "What was ALSEP?", options: ["A collection of Apollo lunar science experiments", "A crewed Moon rover", "A Surveyor lander", "A Mars weather station"], answer: 0, explanation: "ALSEP was a collection of scientific instruments deployed at Apollo landing sites." },
      { prompt: "Which instrument type in ALSEP measured lunar seismic activity?", options: ["Seismometers", "Barometers", "Thermal cameras", "Radar altimeters"], answer: 0, explanation: "ALSEP included seismic experiments with instruments that recorded lunar ground motion." },
      { prompt: "When did Mission Control end ALSEP operations?", options: ["September 30, 1977", "July 20, 1969", "December 7, 1972", "April 20, 1967"], answer: 0, explanation: "ALSEP operations were terminated on September 30, 1977." }
    ],
    sources: [
      { label: "NASA — Apollo 12: The Pinpoint Mission", url: "https://www.nasa.gov/missions/apollo/apollo-12-the-pinpoint-mission" },
      { label: "NASA — Apollo Lunar Surface Journal: ALSEP", url: "https://www.nasa.gov/history/alsj/HamishALSEP.html" },
      { label: "NASA — Apollo 17 Mission Details", url: "https://www.nasa.gov/missions/apollo/apollo-17-mission-details/" }
    ]
  },
  {
    id: "sojourner", name: "Sojourner", planet: "Mars", mission: "Mars Pathfinder", dates: "Landed July 4, 1997", location: "Ares Vallis, Mars", objective: "Demonstrate a small mobile rover and investigate rocks and soil near the Pathfinder lander.", contribution: "Became the first rover to operate on Mars and examined nearby rocks and soil.", ending: "The Pathfinder mission ended after communication with the lander was lost.", personality: "Small, brave, and endlessly curious", color: 0xffb27e, symbol: "S", intro: "A small Mars rover that explored near the Pathfinder lander. This is DEMO CONTENT awaiting team research.", story: [
      "I am Sojourner, the small rover that traveled with the Mars Pathfinder mission.",
      "My spacecraft landed on Mars in July 1997, at a place called Ares Vallis.",
      "I rolled out from the lander to investigate nearby rocks and soil.",
      "My mobility experiment showed how a compact rover could move across another world.",
      "I sent observations through the lander, which relayed information back to Earth.",
      "When communication with Pathfinder was lost, my mission came to an end.",
      "I was small, but my journey helped open the way for later Mars rovers."
    ], hook: { prompt: "Sojourner explored which world?", options: ["Mars", "The Moon", "Venus", "Europa"], answer: 0, explanation: "Sojourner was the rover of NASA's Mars Pathfinder mission." }, memory: [
      { prompt: "Which mission carried Sojourner to Mars?", options: ["Mars Pathfinder", "Apollo 15", "Surveyor 3", "Mars 2020"], answer: 0, explanation: "Sojourner traveled to Mars aboard the Pathfinder mission." },
      { prompt: "Where did Pathfinder land?", options: ["Ares Vallis", "Hadley–Apennine", "Oceanus Procellarum", "Jezero Crater"], answer: 0, explanation: "Pathfinder and Sojourner landed at Ares Vallis." },
      { prompt: "What did Sojourner investigate nearby?", options: ["Martian rocks and soil", "Lunar ice beneath the poles", "Saturn's rings", "Earth's ocean floor"], answer: 0, explanation: "Sojourner examined rocks and soil near the Pathfinder lander." }
    ], sources: [{ label: "NASA — Mars Pathfinder", url: "https://science.nasa.gov/mission/mars-pathfinder/" }, { label: "NASA — Sojourner Rover", url: "https://mars.nasa.gov/MPF/rover/sojourner.html" }]
  },
  {
    id: "spirit", name: "Spirit", planet: "Mars", mission: "Mars Exploration Rover mission", dates: "Landed January 4, 2004", location: "Gusev Crater, Mars", objective: "Search for evidence about past water activity and study Martian geology.", contribution: "Explored Gusev Crater and examined rocks and soils for clues about Mars's history.", ending: "Spirit became stuck in soft soil; NASA ended attempts to regain contact in 2011.", personality: "Determined, observant, and quietly optimistic", color: 0xf7a982, symbol: "S", intro: "One of the twin Mars Exploration Rovers, sent to investigate the Red Planet. This is DEMO CONTENT awaiting team research.", story: [
      "I am Spirit, one of NASA's twin Mars Exploration Rovers.",
      "I landed in Gusev Crater in January 2004, ready to investigate the rocks and soil.",
      "My mission looked for clues that could help scientists understand past water activity on Mars.",
      "I explored the crater and later climbed a nearby hill, sending observations home.",
      "A rover's cameras and instruments turn distant landscapes into evidence scientists can study.",
      "Soft soil eventually left me unable to drive. NASA's attempts to regain contact ended in 2011.",
      "My route across Gusev remains a trail of questions and discoveries for future explorers."
    ], hook: { prompt: "Spirit was part of which NASA mission?", options: ["Mars Exploration Rover mission", "Apollo program", "Surveyor program", "Viking 1 only"], answer: 0, explanation: "Spirit and Opportunity were NASA's Mars Exploration Rovers." }, memory: [
      { prompt: "In which Martian crater did Spirit land?", options: ["Gusev Crater", "Jezero Crater", "Gale Crater", "Endeavour Crater"], answer: 0, explanation: "Spirit landed in Gusev Crater in January 2004." },
      { prompt: "What kind of clues did Spirit help scientists investigate?", options: ["Evidence related to past water activity", "Signals from Earth's oceans", "The age of Saturn's rings", "The Moon's volcanic ash only"], answer: 0, explanation: "Spirit's mission investigated Martian geology and evidence of past water." },
      { prompt: "What eventually prevented Spirit from continuing to drive?", options: ["It became stuck in soft soil", "It was collected by astronauts", "It ran out of wheels at launch", "It landed in the ocean"], answer: 0, explanation: "Spirit became stuck in soft soil and could not move free." }
    ], sources: [{ label: "NASA — Spirit Rover", url: "https://science.nasa.gov/mission/mer-spirit/" }, { label: "NASA — Spirit's Final Communication", url: "https://www.nasa.gov/news-release/nasa-concludes-attempts-to-contact-mars-rover-spirit/" }]
  },
  {
    id: "opportunity", name: "Opportunity", planet: "Mars", mission: "Mars Exploration Rover mission", dates: "Landed January 25, 2004", location: "Meridiani Planum, Mars", objective: "Study Martian rocks and soil for clues about the planet's environmental history.", contribution: "Examined rocks and soil that provided evidence of past water-related environments.", ending: "A planet-wide dust storm obscured sunlight; NASA concluded the mission in 2019 after contact was lost.", personality: "Bright, resilient, and wonderfully persistent", color: 0xffcc82, symbol: "O", intro: "Spirit's twin rover, built to explore Mars from the ground. This is DEMO CONTENT awaiting team research.", story: [
      "I am Opportunity, Spirit's twin and a Mars rover with a long road behind me.",
      "I landed on Meridiani Planum in January 2004 to study rocks and soil.",
      "My instruments examined the landscape for clues about how Mars had changed over time.",
      "The rocks I investigated provided evidence of past water-related environments.",
      "I kept working through many seasons, sending images and measurements back to Earth.",
      "A planet-wide dust storm blocked sunlight. After contact was lost, NASA concluded my mission in 2019.",
      "My journey showed how patient robotic explorers can help us read another world's history."
    ], hook: { prompt: "What did Opportunity investigate on Mars?", options: ["Rocks and soil for clues about Mars's history", "The Moon's south pole", "Earth's atmosphere from orbit", "The rings of Jupiter"], answer: 0, explanation: "Opportunity studied Martian rocks and soil to learn about the planet's past." }, memory: [
      { prompt: "Where did Opportunity land?", options: ["Meridiani Planum", "Gusev Crater", "Ares Vallis", "Oceanus Procellarum"], answer: 0, explanation: "Opportunity landed on Meridiani Planum in January 2004." },
      { prompt: "What did Opportunity's studied rocks provide evidence of?", options: ["Past water-related environments", "Recent forests on Mars", "A human settlement", "Active oceans today"], answer: 0, explanation: "The rocks provided evidence about water-related environments in Mars's past." },
      { prompt: "What event preceded the end of Opportunity's mission?", options: ["A planet-wide dust storm blocked sunlight", "A lunar eclipse damaged its antenna", "It was brought to Earth", "A rover drove it into orbit"], answer: 0, explanation: "A dust storm obscured sunlight and Opportunity stopped communicating." }
    ], sources: [{ label: "NASA — Opportunity Rover", url: "https://science.nasa.gov/mission/mer-opportunity/" }, { label: "NASA — Opportunity Mission Ends", url: "https://www.nasa.gov/news-release/nasas-opportunity-rover-mission-on-mars-comes-to-end/" }]
  }
];

export const ASTRONAUTS = [
  { id: "blue", name: "Blue Explorer", color: "#77dce8", description: "Calm under pressure. Sees every detail." },
  { id: "orange", name: "Orange Explorer", color: "#ffb477", description: "Curious by nature. Always moving forward." },
  { id: "purple", name: "Purple Explorer", color: "#b8a3ff", description: "A thoughtful wanderer with a big imagination." }
] as const;
