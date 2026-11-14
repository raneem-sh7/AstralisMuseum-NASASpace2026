import "./_group.css";
import CurrentApp from "./_CurrentApp";

// Extracted source, not a hand-built approximation. Its save key is isolated
// from the actual game's progress and it opens directly to the Moon view.
export function Current() {
  return <CurrentApp initialScreen="game" />;
}
