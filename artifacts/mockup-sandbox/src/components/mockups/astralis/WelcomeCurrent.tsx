import "./_group.css";
import CurrentApp from "./_CurrentApp";

// The original welcome screen, extracted directly from the existing app.
export function WelcomeCurrent() {
  return <CurrentApp initialScreen="welcome" />;
}
