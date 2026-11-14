import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import Phaser from "phaser";
import type { MuseumSceneController } from "./MuseumScene";
import { MoonScene } from "./MoonScene";
import { MarsScene } from "./MarsScene";
import { getAstronaut } from "../data/astronauts";

type Props = {
  planet: "Moon" | "Mars";
  astronaut: string;
  completed: string[];
  onNearby: (id: string | null) => void;
  onInteract: (id: string) => void;
  sceneRef: MutableRefObject<MuseumSceneController | null>;
};

export default function MuseumCanvas({ planet, astronaut, completed, onNearby, onInteract, sceneRef }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const nearbyRef = useRef(onNearby);
  const interactRef = useRef(onInteract);
  const [ready, setReady] = useState(false);
  const [sceneViewport, setSceneViewport] = useState<{ width: number; height: number } | null>(null);
  nearbyRef.current = onNearby;
  interactRef.current = onInteract;
  const completedKey = completed.join(",");
  const viewport = sceneViewport;

  useLayoutEffect(() => {
    if (!parentRef.current) return;
    const resize = () => {
      const bounds = parentRef.current?.getBoundingClientRect();
      if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;
      const width = bounds.width < 768 ? 620 : 1000;
      const height = Math.max(360, Math.round(width * bounds.height / bounds.width));
      setSceneViewport(current => current?.width === width && current.height === height ? current : { width, height });
    };
    resize();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (observer && parentRef.current) observer.observe(parentRef.current);
    else window.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      if (!observer) window.removeEventListener("resize", resize);
    };
  }, [planet]);

  useEffect(() => {
    if (!mountRef.current || !viewport) return;
    setReady(false);
    const scene = planet === "Moon" ? new MoonScene() : new MarsScene();
    scene.configure({
      planet, astronaut, completed: completedKey ? completedKey.split(",") : [],
      onNearby: (id) => nearbyRef.current(id),
      onInteract: (id) => interactRef.current(id),
      onReady: () => setReady(true)
    });
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: mountRef.current,
      width: viewport.width,
      height: viewport.height,
      backgroundColor: "#101e39",
      transparent: false,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, pixelArt: false, roundPixels: true },
      audio: { noAudio: true },
      scene
    });
    sceneRef.current = scene;
    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, [planet, astronaut, completedKey, sceneRef, viewport?.width, viewport?.height]);

  return <div ref={parentRef} className="game-canvas" aria-label={`${planet} museum exploration game as ${getAstronaut(astronaut).name}`} role="img" aria-busy={!ready} data-ready={ready} data-astronaut={getAstronaut(astronaut).id}>
    <div ref={mountRef} className="phaser-mount" />
    {!ready && <div className="canvas-loading" role="status">Preparing {planet === "Moon" ? "lunar field instruments" : "Mars field archive"}…</div>}
  </div>;
}
