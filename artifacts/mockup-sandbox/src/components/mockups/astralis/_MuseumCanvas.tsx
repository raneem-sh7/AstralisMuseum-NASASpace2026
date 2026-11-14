import { useEffect, useRef } from "react";
import type { MutableRefObject } from "react";
import Phaser from "phaser";
import { MuseumScene } from "./_MuseumScene";

type Props = {
  planet: "Moon" | "Mars";
  astronaut: string;
  completed: string[];
  onNearby: (id: string | null) => void;
  onInteract: (id: string) => void;
  sceneRef: MutableRefObject<MuseumScene | null>;
};

export default function MuseumCanvas({ planet, astronaut, completed, onNearby, onInteract, sceneRef }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const nearbyRef = useRef(onNearby);
  const interactRef = useRef(onInteract);
  nearbyRef.current = onNearby;
  interactRef.current = onInteract;
  const completedKey = completed.join(",");

  useEffect(() => {
    if (!parentRef.current) return;
    const scene = new MuseumScene();
    scene.configure({
      planet, astronaut, completed: completedKey ? completedKey.split(",") : [],
      onNearby: (id) => nearbyRef.current(id),
      onInteract: (id) => interactRef.current(id)
    });
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: parentRef.current,
      width: 1000,
      height: 620,
      backgroundColor: "#101e39",
      transparent: false,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      render: { antialias: true, pixelArt: false, roundPixels: true },
      scene
    });
    sceneRef.current = scene;
    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, [planet, astronaut, completedKey, sceneRef]);

  return <div ref={parentRef} className="game-canvas" aria-label={`${planet} museum exploration game`} role="img" />;
}
