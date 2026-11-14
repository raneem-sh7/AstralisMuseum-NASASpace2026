import Phaser from "phaser";
import { getAstronaut } from "../data/astronauts";

type Direction = "down" | "left" | "right" | "up";
const directions: Direction[] = ["down", "left", "right", "up"];

export function preloadAstronaut(scene: Phaser.Scene, astronautId: string) {
  const profile = getAstronaut(astronautId);
  scene.load.image(`${profile.id}-idle`, profile.idle);
  scene.load.spritesheet(`${profile.id}-walk`, profile.walkSheet, { frameWidth: 256, frameHeight: 256 });
}

export class AstronautActor {
  readonly container: Phaser.GameObjects.Container;
  readonly sprite: Phaser.GameObjects.Sprite;
  private direction: Direction = "down";
  private walking = false;
  private readonly id: string;
  private readonly idleTween: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, astronautId: string, size = 90) {
    this.id = getAstronaut(astronautId).id;
    this.container = scene.add.container(x, y).setDepth(y + 20).setName(`player-${this.id}`);
    const shadow = scene.add.ellipse(0, 28, 36, 10, 0x080d12, .38);
    this.sprite = scene.add.sprite(0, 28, `${this.id}-idle`).setOrigin(.5, .97).setDisplaySize(size, size);
    this.container.add([shadow, this.sprite]);
    for (const [row, direction] of directions.entries()) {
      const key = `${this.id}-walk-${direction}`;
      if (!scene.anims.exists(key)) scene.anims.create({
        key, frames: scene.anims.generateFrameNumbers(`${this.id}-walk`, { start: row * 4, end: row * 4 + 3 }),
        frameRate: 7, repeat: -1
      });
    }
    this.idleTween = scene.tweens.add({ targets: this.sprite, y: 27, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  update(dx: number, dy: number) {
    const moving = Math.hypot(dx, dy) > .08;
    if (moving) {
      this.direction = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down";
      this.idleTween.pause();
      this.sprite.y = 28;
      this.sprite.play(`${this.id}-walk-${this.direction}`, true);
    } else if (this.walking) {
      this.sprite.stop();
      if (this.direction === "down") this.sprite.setTexture(`${this.id}-idle`);
      else this.sprite.setTexture(`${this.id}-walk`, directions.indexOf(this.direction) * 4);
      this.idleTween.resume();
    }
    this.walking = moving;
  }
}
