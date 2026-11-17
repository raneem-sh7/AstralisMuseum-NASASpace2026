
# 🚀 ASTRALIS — The Museum of NASA's Silent Missions

### 🌌 Their missions may have ended, but their discoveries live on.

**ASTRALIS** is an interactive educational web game developed by **Team ASTRALIS** for the **NASA Space Apps Challenge 2026**, inspired by the **"Abandoned but Not Forgotten"** challenge.

What if NASA's forgotten space equipment could tell its own stories?

ASTRALIS brings that idea to life by transforming retired space hardware into an immersive storytelling adventure where players explore the Moon and Mars, discover real NASA missions, restore lost memories, and collect space passports.

### 🌐 [Play ASTRALIS](https://raneem-sh7.github.io/AstralisMuseum-NASASpace2026/)

---

## 🎮 How to Play

### 1. Choose Your Destination 🌙 🔴

Begin your expedition by selecting your destination:

- **Moon** — Explore the history of lunar exploration.
- **Mars** — Discover the robotic explorers of the Red Planet.

### 2. Choose Your Astronaut 👨‍🚀

Choose between two real NASA astronauts:

- **Christina Koch**
- **Victor Glover**

Each astronaut has a short biography introducing their real-life achievements.

Your selected astronaut becomes your playable character, guiding you through the museum.

### 3. Explore NASA's Silent Missions 🛰️

Move through the interactive museum and approach historical NASA artifacts.

Each artifact introduces itself through:

1. **Curiosity Question** — A thought-provoking question before discovering the story.
2. **Interactive Storytelling** — Learn about the artifact's mission, discoveries, and legacy.
3. **Memory Restoration Challenge** — Answer three questions based on its story.

Help each artifact recover its memories to continue your journey!

---

## 🪐 Meet the Six NASA Artifacts

### 🌙 Moon Museum

| Artifact | Description |
|---|---|
| **Apollo 11 Eagle** | The lunar module that carried the first humans to the Moon's surface. |
| **Lunar Roving Vehicle** | The electric vehicle that helped Apollo astronauts explore the lunar surface. |
| **ALSEP Science Package** | Scientific instruments deployed to study the Moon and its environment. |

### 🔴 Mars Museum

| Artifact | Description |
|---|---|
| **Sojourner Rover** | NASA's first successful Mars rover, exploring the surface during the Pathfinder mission. |
| **Opportunity Rover** | A robotic explorer that investigated Martian geology and evidence of past water. |
| **Ingenuity Helicopter** | The first aircraft to achieve powered, controlled flight on another planet. |

Each artifact has its own story, educational questions, and passport reward.

---

## ✨ Key Game Features

### 🫧 Oxygen Challenge

Your survival depends on your answers!

Players begin with **60% oxygen**.

| Action | Oxygen |
|---|---|
| ✅ Correct Answer | +20% |
| ❌ Incorrect Answer | -20% |
| 🚨 Oxygen Reaches 0% | Restart Expedition |

Oxygen is capped at 100%.

There is no automatic oxygen drain. Every answer matters!

### 🧠 Memory Restoration

Each artifact shares its story before asking the player to answer **three educational questions**.

The questions are designed to reinforce learning through interactive storytelling.

### 🏅 Space Passport System

Successfully completing an artifact's memory challenge earns a unique **Space Passport stamp**.

- Collect three stamps on one planet.
- Continue your journey to the other planet.
- Collect all six stamps to complete your expedition.

The passport tracks the player's achievements throughout the adventure.

### 🌌 Legacy Wall

After collecting all six passport stamps, players unlock the final **Legacy Wall**.

This final experience celebrates all six NASA artifacts and highlights the scientific legacy each mission left behind.

### 🎮 Interactive Museum Exploration

- Playable astronaut characters
- Interactive Moon and Mars environments
- Artifact proximity interactions
- Educational storytelling and quizzes
- Responsive desktop and touch controls
- Browser-based progress saving

---

## 💻 Tech Stack

| Technology | Purpose |
|---|---|
| **React** | Component-based user interface |
| **TypeScript** | Type-safe application development |
| **Vite** | Development server and production build |
| **Phaser 3** | Interactive game scenes, movement, and interactions |
| **Tailwind CSS** | Styling and responsive interface development |
| **HTML & CSS** | Web structure and visual presentation |
| **LocalStorage** | Saving game progress in the browser |

### 🤖 AI-Assisted Development

**Replit AI Agent** supported the development workflow, helping with implementation, debugging, and iteration.

The project combines web development, interactive game design, educational storytelling, and AI-assisted development.

---

## 🕹️ Game Controls

### Desktop

| Key | Action |
|---|---|
| `W A S D` | Move astronaut |
| `Arrow Keys` | Move astronaut |
| `E` | Inspect nearby artifact |

### Mobile / Touch

- Use the on-screen directional controls.
- Tap the **Inspect** button to interact with artifacts.

Players can also open their **Space Passport** to review collected stamps.

---

## ⚙️ Installation & Local Development

### Prerequisites

- Node.js 20 or newer
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/raneem-sh7/AstralisMuseum-NASASpace2026.git
```

### 2. Navigate to the Project

```bash
cd AstralisMuseum-NASASpace2026
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in your terminal.

### 5. Build for Production

```bash
npm run build
```

Production files are generated in the `dist/` directory.

---

## 📁 Project Structure

Key application files:

```text
src/
├── App.tsx
├── index.css
├── data/
│   └── exhibits.ts
└── game/
    ├── MuseumScene.ts
    └── MuseumCanvas.tsx
```

- **App.tsx:** Main application and gameplay flow.
- **exhibits.ts:** Artifact information, stories, questions, and NASA sources.
- **MuseumScene.ts:** Phaser museum environment and player interactions.
- **MuseumCanvas.tsx:** React and Phaser integration.
- **index.css:** Application styling and responsive design.

Game progress is stored locally in the browser.

The project does not require a backend, user accounts, or paid APIs.

---

## 📚 NASA Educational Resources

ASTRALIS uses NASA mission information and educational resources to introduce players to real space exploration history.

Useful official references:

- [NASA Space Apps Challenge](https://www.spaceappschallenge.org/)
- [NASA Science](https://science.nasa.gov/)
- [NASA Image and Video Library](https://images.nasa.gov/)
- [NASA Space Science Data Coordinated Archive](https://nssdc.gsfc.nasa.gov/)
- [NASA Apollo Missions](https://www.nasa.gov/mission/apollo/)
- [NASA Mars Exploration](https://science.nasa.gov/mars/)

---

## 👥 Team ASTRALIS

Developed by **Team ASTRALIS** as part of the **NASA Space Apps Challenge 2026**.

The project brings together:

- Web development
- Interactive game design
- NASA mission research
- Educational content creation
- Creative storytelling

**Development Contribution — Raneem Shehadeh**

[GitHub](https://github.com/raneem-sh7) | [LinkedIn](https://www.linkedin.com/in/raneemshehadeh/)

---

## 🌍 Project Vision

ASTRALIS aims to make space exploration more accessible and engaging for students through interactive learning.

Instead of simply reading about retired NASA equipment, players experience its history, answer questions, and discover why each mission still matters.

**Because even when a mission ends, its story deserves to be remembered.**

---

## ⚠️ Disclaimer

ASTRALIS is an independent educational project created for the NASA Space Apps Challenge 2026.

It is **not an official NASA website** and is not affiliated with or endorsed by NASA.

NASA-related names, mission information, and educational references are used for informational and educational purposes.

---

### 🚀 Ready to Explore?

**[🌐 Launch ASTRALIS](https://raneem-sh7.github.io/AstralisMuseum-NASASpace2026/)**

*Explore the Moon. Discover Mars. Restore the memories. Preserve the legacy.*
