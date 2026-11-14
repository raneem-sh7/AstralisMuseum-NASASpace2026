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
};

// Demo copy is intentionally conservative. Team Astralis should replace/approve
// this material with its research before presenting it as final educational content.
export const EXHIBITS: Exhibit[] = [
  {
    id: "surveyor-3", name: "Surveyor 3", planet: "Moon", mission: "Surveyor program", dates: "Landed April 20, 1967", location: "Oceanus Procellarum", objective: "Send an uncrewed spacecraft to the lunar surface and examine its local terrain.", contribution: "Returned television images and used a surface sampler to investigate lunar soil.", ending: "Apollo 12 astronauts visited the spacecraft in 1969 and returned selected components to Earth for examination.", personality: "Curious, patient, and a little dusty", color: 0x7ce4f1, symbol: "S", intro: "A lunar lander with three long legs and a story that crossed paths with Apollo 12. This is DEMO CONTENT awaiting team research.", story: [
      "Hello, Earth visitor. I am Surveyor 3, one of NASA's uncrewed lunar landers.",
      "I touched down on the Moon in April 1967, in a region called Oceanus Procellarum.",
      "My cameras sent television images home, while my surface sampler helped investigate the ground nearby.",
      "I was part of a program that gathered information about the lunar surface before crewed landings.",
      "Two years later, Apollo 12 astronauts landed close by and visited me.",
      "They brought selected parts of me back to Earth for scientists to examine. My mission became part of another mission's story.",
      "I am quiet now, but those images and returned components still help tell the story of lunar exploration."
    ], hook: { prompt: "What kind of spacecraft was Surveyor 3?", options: ["A crewed Moon rover", "An uncrewed lunar lander", "A Mars orbiter", "A communications satellite"], answer: 1, explanation: "Surveyor 3 was an uncrewed spacecraft that landed on the Moon." }, memory: [
      { prompt: "Where did Surveyor 3 land?", options: ["Oceanus Procellarum on the Moon", "Jezero Crater on Mars", "Earth's Pacific Ocean", "The far side of the Moon"], answer: 0, explanation: "Surveyor 3 landed in Oceanus Procellarum, a lunar mare region." },
      { prompt: "Which tool helped Surveyor 3 investigate the nearby surface?", options: ["A sample-return rocket", "A surface sampler", "A submarine drill", "A weather balloon"], answer: 1, explanation: "Surveyor 3 carried a surface sampler to investigate lunar soil." },
      { prompt: "What happened to selected Surveyor 3 components in 1969?", options: ["Apollo 12 astronauts returned them to Earth", "They were launched toward Mars", "They were buried by a rover", "They were carried to orbit by Surveyor 3"], answer: 0, explanation: "Apollo 12 astronauts visited Surveyor 3 and brought selected components home." }
    ], sources: [{ label: "NASA — Surveyor 3", url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A" }, { label: "NASA — Apollo 12", url: "https://www.nasa.gov/mission/apollo-12/" }]
  },
  {
    id: "apollo-rover", name: "Apollo 15 Lunar Roving Vehicle", planet: "Moon", mission: "Apollo 15", dates: "First used on the Moon in 1971", location: "Hadley–Apennine region", objective: "Extend astronaut mobility and help crews explore farther from their lunar landing site.", contribution: "Carried astronauts and equipment across the lunar surface during Apollo 15.", ending: "The rover remained at the mission's lunar site after the astronauts departed.", personality: "Ready to roll, steady, and practical", color: 0xffbc79, symbol: "R", intro: "A battery-powered lunar car that carried astronauts on Apollo 15. This is DEMO CONTENT awaiting team research.", story: [
      "Greetings, explorer. I am the Lunar Roving Vehicle used by the Apollo 15 crew.",
      "NASA designed me to let astronauts travel farther over the Moon than they could on foot.",
      "I folded for the journey and was deployed on the lunar surface at Hadley–Apennine.",
      "Astronauts drove me, while I carried people and equipment across the terrain.",
      "My wheels, seats, and navigation equipment helped make surface traverses possible.",
      "When the crew left the Moon, I stayed at the site. No engine sound followed them home.",
      "My tracks and the work done on those journeys remain part of the record of lunar exploration."
    ], hook: { prompt: "Why did NASA send a Lunar Roving Vehicle with Apollo 15?", options: ["To help astronauts travel farther on the Moon", "To fly astronauts back to Earth", "To dig a tunnel under the Moon", "To map Mars from orbit"], answer: 0, explanation: "The rover extended the distance astronauts could explore on the lunar surface." }, memory: [
      { prompt: "Who drove the Apollo 15 Lunar Roving Vehicle?", options: ["Astronauts on the lunar surface", "A remote team from Mars", "The rover drove itself home", "It was towed by Surveyor 3"], answer: 0, explanation: "Apollo astronauts operated the rover during their lunar surface exploration." },
      { prompt: "What was the rover designed to improve?", options: ["Astronaut mobility on the Moon", "Deep-space radio reception", "The lunar lander's fuel supply", "Earth's weather forecasts"], answer: 0, explanation: "The Lunar Roving Vehicle helped astronauts cover more ground." },
      { prompt: "Where did the rover remain after the crew departed?", options: ["At its lunar mission site", "In lunar orbit", "On a Mars landing pad", "Inside the Apollo command module"], answer: 0, explanation: "The rover was left behind at the Apollo 15 lunar site." }
    ], sources: [{ label: "NASA — Apollo 15", url: "https://www.nasa.gov/mission/apollo-15/" }, { label: "NASA — Lunar Roving Vehicle", url: "https://www.nasa.gov/history/alsj/a15/a15lr.html" }]
  },
  {
    id: "alsep", name: "Apollo Lunar Surface Experiments Package", planet: "Moon", mission: "Apollo lunar surface experiments", dates: "Deployed during Apollo surface missions", location: "Multiple Apollo landing sites", objective: "Operate scientific instruments on the lunar surface to study its environment and interior.", contribution: "ALSEP instruments collected data on topics including moonquakes, heat flow, and the lunar environment.", ending: "The Apollo ALSEP instruments were shut down in 1977; their collected data remains a scientific record.", personality: "Thoughtful, observant, and full of questions", color: 0xc5a6ff, symbol: "A", intro: "A family of lunar science instruments, not a single rover. This is DEMO CONTENT awaiting team research.", story: [
      "I am ALSEP: the Apollo Lunar Surface Experiments Package, a set of scientific instruments.",
      "Apollo crews deployed packages of instruments at several lunar landing sites.",
      "Different instruments studied different parts of the Moon and its environment.",
      "Among the investigations were measurements related to moonquakes and heat flow.",
      "The instruments sent information back after the astronauts had returned to their spacecraft.",
      "ALSEP operations ended in 1977, after years of collecting data from the lunar surface.",
      "A quiet instrument can leave a long echo: the measurements remain part of lunar science history."
    ], hook: { prompt: "What does ALSEP describe?", options: ["A family of Apollo lunar science instruments", "A Mars landing capsule", "A crewed lunar car", "A telescope in Earth orbit"], answer: 0, explanation: "ALSEP was a package of scientific instruments deployed by Apollo crews." }, memory: [
      { prompt: "What was ALSEP's main role?", options: ["Conduct scientific measurements on the Moon", "Transport astronauts to Mars", "Broadcast television from Earth", "Return a lunar rover to Earth"], answer: 0, explanation: "ALSEP instruments investigated the Moon and its environment." },
      { prompt: "Which topics were studied by ALSEP instruments?", options: ["Moonquakes and heat flow", "Ocean tides and clouds", "Mars seasons and dust", "Earth's magnetic poles only"], answer: 0, explanation: "ALSEP included investigations of lunar seismic activity and heat flow." },
      { prompt: "When did Apollo ALSEP operations end?", options: ["1977", "1961", "1997", "2018"], answer: 0, explanation: "The Apollo ALSEP instruments were shut down in 1977." }
    ], sources: [{ label: "NASA — Apollo Lunar Surface Journal: ALSEP", url: "https://www.nasa.gov/history/alsj/alsj-ALSEP.html" }, { label: "NASA — Apollo 17", url: "https://www.nasa.gov/mission/apollo-17/" }]
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
