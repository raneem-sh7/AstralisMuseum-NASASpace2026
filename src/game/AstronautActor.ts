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
  private readonly scene: Phaser.Scene;
  private readonly idleTween: Phaser.Tweens.Tween;
  private walkAnimationsReady = false;
  private missingWalkWarningLogged = false;

  constructor(scene: Phaser.Scene, x: number, y: number, astronautId: string, size = 90) {
    this.scene = scene;
    this.id = getAstronaut(astronautId).id;
    this.container = scene.add.container(x, y).setDepth(y + 20).setName(`player-${this.id}`);
    const shadow = scene.add.ellipse(0, 28, 36, 10, 0x080d12, .38);
    this.sprite = scene.add.sprite(0, 28, `${this.id}-idle`).setOrigin(.5, .97).setDisplaySize(size, size);
    this.container.add([shadow, this.sprite]);
    this.ensureWalkAnimations();
    this.idleTween = scene.tweens.add({ targets: this.sprite, y: 27, duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  private ensureWalkAnimations() {
    const textureKey = `${this.id}-walk`;
    if (!this.scene.textures.exists(textureKey)) {
      this.walkAnimationsReady = false;
      if (!this.missingWalkWarningLogged) {
        console.warn(`Astronaut walk sheet "${textureKey}" is not ready; keeping the idle pose until it loads.`);
        this.missingWalkWarningLogged = true;
      }
      return false;
    }
    if (this.walkAnimationsReady) return true;

    const allFrames = this.scene.anims.generateFrameNumbers(textureKey, { start: 0, end: 15 });
    if (allFrames.length !== 16) {
      console.warn(`Astronaut walk sheet "${textureKey}" has ${allFrames.length} frames; expected 16.`);
      return false;
    }
    for (const [row, direction] of directions.entries()) {
      const key = `${this.id}-walk-${direction}`;
      const existing = this.scene.anims.get(key);
      if (existing && existing.frames.length !== 4) this.scene.anims.remove(key);
      if (!this.scene.anims.exists(key)) this.scene.anims.create({
        key,
        frames: allFrames.slice(row * 4, row * 4 + 4),
        frameRate: 7,
        repeat: -1
      });
      const animation = this.scene.anims.get(key);
      if (!animation || animation.frames.length !== 4 || !Number.isFinite(animation.frames[0]?.duration)) {
        console.warn(`Astronaut walk animation "${key}" is incomplete; keeping the idle pose.`);
        return false;
      }
    }
    this.walkAnimationsReady = true;
    this.missingWalkWarningLogged = false;
    return true;
  }

  update(dx: number, dy: number) {
    const moving = Math.hypot(dx, dy) > .08;
    if (moving) {
      this.direction = Math.abs(dx) > Math.abs(dy) ? dx < 0 ? "left" : "right" : dy < 0 ? "up" : "down";
      this.idleTween.pause();
      this.sprite.y = 28;
      if (this.ensureWalkAnimations()) this.sprite.play(`${this.id}-walk-${this.direction}`, true);
      else this.sprite.setTexture(`${this.id}-idle`);
    } else if (this.walking) {
      this.sprite.stop();
      if (!this.ensureWalkAnimations() || this.direction === "down") this.sprite.setTexture(`${this.id}-idle`);
      else this.sprite.setTexture(`${this.id}-walk`, directions.indexOf(this.direction) * 4);
      this.idleTween.resume();
    }
    this.walking = moving;
  }
}
