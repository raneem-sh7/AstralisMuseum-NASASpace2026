import Phaser from "phaser";
import { MARS_ENVIRONMENT } from "../data/marsExhibits";
import { EXHIBITS } from "../data/exhibits";
import type { SceneOptions } from "./MuseumScene";
import { AstronautActor, preloadAstronaut } from "./AstronautActor";

type MarsExhibitActor = {
  id: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  character: Phaser.GameObjects.Container;
  idle: Phaser.GameObjects.Image;
  talking: Phaser.GameObjects.Image;
};

export class MarsScene extends Phaser.Scene {
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private player!: Phaser.GameObjects.Container;
  private avatar!: AstronautActor;
  private opts!: SceneOptions;
  private joystick = { x: 0, y: 0 };
  private movementEnabled = true;
  private proximityId: string | null = null;
  private lastReported: string | null = null;
  private exhibits: MarsExhibitActor[] = [];
  private bounds = { left: 35, right: 965, top: 34, bottom: 586 };
  private onNearbyCallback: SceneOptions["onNearby"] = () => {};
  private onInteractCallback: SceneOptions["onInteract"] = () => {};
  private reducedMotion = false;

  constructor() { super("mars"); }

  configure(opts: SceneOptions) {
    this.opts = opts;
    this.onNearbyCallback = opts.onNearby;
    this.onInteractCallback = opts.onInteract;
  }

  setJoystick(x: number, y: number) { this.joystick = { x, y }; }
  setMovementEnabled(enabled: boolean) {
    this.movementEnabled = enabled;
    if (!enabled) this.avatar?.update(0, 0);
  }

  interact() {
    if (!this.movementEnabled || !this.proximityId) return;
    if (this.opts.completed.includes(this.proximityId)) return;
    this.onInteractCallback(this.proximityId);
  }

  setTalking(id: string | null, talking: boolean) {
    this.exhibits.forEach(exhibit => {
      const active = talking && id === exhibit.id;
      exhibit.idle.setVisible(!active);
      exhibit.talking.setVisible(active);
    });
  }

  preload() {
    preloadAstronaut(this, this.opts.astronaut);
    this.load.image("mars-jezero-panorama", MARS_ENVIRONMENT.localImage);
    for (const exhibit of EXHIBITS.filter(item => item.planet === "Mars")) {
      if (exhibit.referenceImage) this.load.image(`mars-reference-${exhibit.id}`, exhibit.referenceImage);
      if (exhibit.characterImage) this.load.image(`mars-character-${exhibit.id}`, exhibit.characterImage);
      if (exhibit.characterTalkImage) this.load.image(`mars-character-${exhibit.id}-talking`, exhibit.characterTalkImage);
    }
  }

  create() {
    const width = this.scale.width || 1000;
    const height = this.scale.height || 620;
    this.bounds = { left: width * .035, right: width * .965, top: height * .04, bottom: height * .96 };
    this.reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (this.textures.exists("mars-jezero-panorama")) {
      const panorama = this.add.image(width / 2, height / 2, "mars-jezero-panorama").setDepth(-30);
      const source = panorama.texture.getSourceImage() as { width: number; height: number };
      panorama.setScale(Math.max(width / source.width, height / source.height));
    } else {
      this.add.rectangle(width / 2, height / 2, width, height, 0x772e23).setDepth(-30);
      this.add.text(width / 2, height * .18, "NASA Jezero panorama could not be loaded.", {
        fontFamily: "DM Mono", fontSize: "12px", color: "#ffe1cf"
      }).setOrigin(.5).setDepth(-10);
    }
    this.drawMarsAtmosphere(width, height);
    this.drawTerrainDetails(width, height);
    this.add.text(width / 2, 30, "MARS FIELD ARCHIVE  /  JEZERO CRATER", {
      fontFamily: "DM Mono", fontSize: "12px", color: "#ffe0c5", letterSpacing: 2.4
    }).setOrigin(.5).setDepth(10).setAlpha(.94);
    this.add.text(width / 2, 51, "NASA panorama · original ASTRALIS equipment characters", {
      fontFamily: "Manrope", fontSize: "10px", color: "#f4cec0"
    }).setOrigin(.5).setDepth(10).setAlpha(.8);

    const positions = [
      { id: "sojourner", x: width * .19, y: height * .59 },
      { id: "opportunity", x: width * .5, y: height * .59 },
      { id: "ingenuity", x: width * .81, y: height * .59 }
    ];
    this.exhibits = positions.flatMap((pos, index) => {
      const exhibit = EXHIBITS.find(item => item.id === pos.id);
      if (!exhibit) return [];
      this.drawReferencePanel(pos.x, height * .235, exhibit.id, `mars-reference-${exhibit.id}`, width);
      this.add.text(pos.x, height * .385, exhibit.galleryName ?? exhibit.name, {
        fontFamily: "Manrope", fontSize: width < 700 ? "11px" : "13px", color: "#fff0df",
        align: "center", wordWrap: { width: width * .27 }, stroke: "#291512", strokeThickness: 4
      }).setOrigin(.5).setDepth(12);

      const character = this.add.container(pos.x, pos.y).setDepth(pos.y + 1);
      const shadow = this.add.ellipse(0, 44, 150, 27, 0x230e0c, .45);
      const idle = this.add.image(0, -4, `mars-character-${exhibit.id}`).setDisplaySize(164, 128);
      const talking = this.add.image(0, -4, `mars-character-${exhibit.id}-talking`).setDisplaySize(164, 128).setVisible(false);
      character.add([shadow, idle, talking]);

      if (exhibit.id === "ingenuity") {
        const upperRotor = this.add.rectangle(0, -67, 138, 4, 0xf1d9a5, .94).setStrokeStyle(1, 0x776746, .9);
        const lowerRotor = this.add.rectangle(0, -62, 116, 3, 0xe8d09a, .76).setStrokeStyle(1, 0x776746, .85);
        character.add([lowerRotor, upperRotor]);
        if (!this.reducedMotion) {
          this.tweens.add({ targets: upperRotor, angle: 360, duration: 1700, repeat: -1 });
          this.tweens.add({ targets: lowerRotor, angle: -360, duration: 1450, repeat: -1 });
        }
      }
      if (!this.reducedMotion) {
        this.tweens.add({ targets: character, y: pos.y - (index % 2 ? 4 : 6), duration: 1150 + index * 120, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      this.add.circle(pos.x, pos.y + 48, 13, 0x321811, .76).setStrokeStyle(1, exhibit.color, .72).setDepth(pos.y + 12);
      this.add.text(pos.x, pos.y + 48, this.opts.completed.includes(exhibit.id) ? "✓" : String(index + 1), {
        fontFamily: "DM Mono", fontSize: "10px", color: "#fff4e9"
      }).setOrigin(.5).setDepth(pos.y + 13);
      this.add.text(pos.x, pos.y + 70, this.opts.completed.includes(exhibit.id) ? "MEMORY RESTORED" : "WALK CLOSER · PRESS E", {
        fontFamily: "DM Mono", fontSize: "8px", color: this.opts.completed.includes(exhibit.id) ? "#d7f3df" : "#ffe0c5",
        letterSpacing: .8, stroke: "#291512", strokeThickness: 3
      }).setOrigin(.5).setDepth(pos.y + 12);
      return [{ id: pos.id, x: pos.x, y: pos.y, radius: 112, width: 142, height: 94, character, idle, talking }];
    });

    this.createAstronaut(width / 2, height * .84, this.opts.astronaut);
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E") as Record<string, Phaser.Input.Keyboard.Key>;
      this.input.keyboard.on("keydown-E", () => this.interact());
    }
    this.events.on("shutdown", () => {
      this.proximityId = null;
      this.lastReported = null;
      this.onNearbyCallback(null);
    });
    this.opts.onReady?.();
  }

  private drawMarsAtmosphere(width: number, height: number) {
    const veil = this.add.graphics().setDepth(-20);
    veil.fillStyle(0x5b2017, .22);
    veil.fillRect(0, 0, width, height);
    veil.fillGradientStyle(0x160c13, 0x160c13, 0x230f10, 0x230f10, .5);
    veil.fillRect(0, 0, width, height);

    const vignette = this.add.graphics().setDepth(8);
    vignette.fillStyle(0x170a0b, .24);
    vignette.fillRect(0, 0, width, height);
    const horizon = this.add.graphics().setDepth(-10);
    horizon.fillStyle(0x743126, .28);
    horizon.fillPoints([
      new Phaser.Math.Vector2(0, height * .55),
      new Phaser.Math.Vector2(width * .19, height * .43),
      new Phaser.Math.Vector2(width * .38, height * .52),
      new Phaser.Math.Vector2(width * .56, height * .4),
      new Phaser.Math.Vector2(width * .74, height * .51),
      new Phaser.Math.Vector2(width, height * .42),
      new Phaser.Math.Vector2(width, height),
      new Phaser.Math.Vector2(0, height)
    ], true);
    const foreground = this.add.graphics().setDepth(-9);
    foreground.fillStyle(0x4b211e, .22);
    foreground.fillPoints([
      new Phaser.Math.Vector2(0, height * .79),
      new Phaser.Math.Vector2(width * .2, height * .74),
      new Phaser.Math.Vector2(width * .4, height * .81),
      new Phaser.Math.Vector2(width * .63, height * .72),
      new Phaser.Math.Vector2(width * .83, height * .79),
      new Phaser.Math.Vector2(width, height * .74),
      new Phaser.Math.Vector2(width, height),
      new Phaser.Math.Vector2(0, height)
    ], true);
  }

  private drawTerrainDetails(width: number, height: number) {
    const terrain = this.add.graphics().setDepth(-7);
    const rocks = [
      [.04, .68, 19, 9], [.12, .85, 26, 13], [.29, .7, 17, 8],
      [.4, .89, 20, 10], [.62, .69, 21, 10], [.74, .87, 28, 13],
      [.91, .67, 23, 11], [.97, .86, 25, 12], [.52, .76, 13, 7]
    ];
    rocks.forEach(([x, y, rw, rh], index) => {
      const px = x * width, py = y * height;
      terrain.fillStyle(0x2e1715, .32);
      terrain.fillEllipse(px + 3, py + rh * .7, rw * 2.4, rh * 1.1);
      terrain.fillStyle(index % 2 ? 0x99604a : 0xb16d50, .62);
      terrain.fillEllipse(px, py, rw * 2, rh * 2);
      terrain.lineStyle(1, 0xe2a17a, .24);
      terrain.lineBetween(px - rw * .65, py, px + rw * .15, py - rh * .55);
    });
    terrain.lineStyle(1, 0xf3b38a, .17);
    for (let i = 0; i < 9; i++) {
      const x = width * (.1 + i * .1);
      terrain.lineBetween(x, height * (.7 + (i % 3) * .04), x + width * .065, height * (.72 + (i % 3) * .04));
    }
  }

  private drawReferencePanel(x: number, y: number, id: string, key: string, width: number) {
    const panelWidth = Math.min(width * .245, 226);
    const panelHeight = 99;
    const panel = this.add.graphics().setDepth(5);
    panel.fillStyle(0x1d1114, .78);
    panel.fillRoundedRect(x - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 11);
    panel.lineStyle(1, 0xf0bd9d, .45);
    panel.strokeRoundedRect(x - panelWidth / 2, y - panelHeight / 2, panelWidth, panelHeight, 11);
    panel.fillStyle(0x120c10, .88);
    panel.fillRoundedRect(x - panelWidth / 2 + 6, y - panelHeight / 2 + 6, panelWidth - 12, panelHeight - 23, 6);
    if (this.textures.exists(key)) {
      const image = this.add.image(x, y - 6, key).setDepth(6);
      const source = image.texture.getSourceImage() as { width: number; height: number };
      const scale = Math.min((panelWidth - 16) / source.width, (panelHeight - 30) / source.height);
      image.setScale(scale);
    }
    const record = EXHIBITS.find(exhibit => exhibit.id === id);
    this.add.text(x, y + panelHeight / 2 - 13, `${record?.referenceImageCredit ?? "NASA"} · HISTORICAL REFERENCE`, {
      fontFamily: "DM Mono", fontSize: width < 700 ? "6px" : "7px", color: "#f3c7ad", letterSpacing: .45
    }).setOrigin(.5).setDepth(7);
  }

  private createAstronaut(x: number, y: number, astronautId: string) {
    this.avatar = new AstronautActor(this, x, y, astronautId);
    this.player = this.avatar.container;
  }

  update(_time: number, delta: number) {
    if (!this.player || !this.movementEnabled) return;
    const speed = 195 * Math.min(delta / 1000, .04);
    let dx = this.joystick.x, dy = this.joystick.y;
    if (this.keys) {
      if (this.keys.A?.isDown || this.keys.LEFT?.isDown) dx -= 1;
      if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) dx += 1;
      if (this.keys.W?.isDown || this.keys.UP?.isDown) dy -= 1;
      if (this.keys.S?.isDown || this.keys.DOWN?.isDown) dy += 1;
    }
    const magnitude = Math.hypot(dx, dy);
    if (magnitude > 1) { dx /= magnitude; dy /= magnitude; }
    const nextX = Phaser.Math.Clamp(this.player.x + dx * speed, this.bounds.left + 24, this.bounds.right - 24);
    const nextY = Phaser.Math.Clamp(this.player.y + dy * speed, this.bounds.top + 32, this.bounds.bottom - 25);
    const blocked = this.exhibits.some(exhibit =>
      Math.abs(nextX - exhibit.x) < exhibit.width / 2 + 12
      && Math.abs(nextY - exhibit.y) < exhibit.height / 2 + 8
    );
    if (!blocked) this.player.setPosition(nextX, nextY).setDepth(nextY + 20);
    this.avatar.update(blocked ? 0 : dx, blocked ? 0 : dy);
    const nearby = this.exhibits.find(exhibit =>
      !this.opts.completed.includes(exhibit.id)
      && Phaser.Math.Distance.Between(this.player.x, this.player.y, exhibit.x, exhibit.y) < exhibit.radius
    )?.id ?? null;
    this.proximityId = nearby;
    if (nearby !== this.lastReported) {
      this.lastReported = nearby;
      this.onNearbyCallback(nearby);
    }
  }
}
