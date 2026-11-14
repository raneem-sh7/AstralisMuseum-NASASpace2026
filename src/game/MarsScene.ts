import Phaser from "phaser";
import { audioManager } from "../audio/AudioManager";
import { EXHIBITS } from "../data/exhibits";
import { MARS_ENVIRONMENT } from "../data/marsExhibits";
import type { SceneOptions } from "./MuseumScene";
import { AstronautActor, preloadAstronaut } from "./AstronautActor";

type MarsExhibitActor = {
  id: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  finished: boolean;
  character: Phaser.GameObjects.Container;
  indicator?: Phaser.GameObjects.Container;
  idle?: Phaser.GameObjects.Image;
  talking?: Phaser.GameObjects.Image;
  blinkAt: number;
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
  private bounds = { left: 28, right: 972, top: 35, bottom: 590 };
  private worldWidth = 1000;
  private worldHeight = 620;
  private compactWorld = false;
  private reducedMotion = false;
  private lastMovementSound = 0;
  private loadFailures: string[] = [];
  private statusText?: Phaser.GameObjects.Text;

  constructor() { super("mars"); }

  configure(opts: SceneOptions) { this.opts = opts; }
  setJoystick(x: number, y: number) { this.joystick = { x, y }; }
  setMovementEnabled(enabled: boolean) { this.movementEnabled = enabled; if (!enabled) this.avatar?.update(0, 0); }

  interact() {
    if (!this.movementEnabled || !this.proximityId) return;
    const target = this.exhibits.find(item => item.id === this.proximityId);
    if (!target || target.finished) return;
    target.character.setScale(this.player.x < target.x ? -1 : 1, 1);
    if (!this.reducedMotion) {
      this.tweens.add({ targets: target.character, scaleY: 1.08, duration: 150, yoyo: true, ease: "Sine.easeOut" });
    }
    this.opts.onInteract(target.id);
  }

  setTalking(id: string | null, talking: boolean) {
    this.exhibits.forEach(item => {
      const active = talking && id !== null && item.id === id;
      item.idle?.setVisible(!active);
      item.talking?.setVisible(active);
    });
  }

  preload() {
    preloadAstronaut(this, this.opts.astronaut);
    this.load.image("mars-surface", MARS_ENVIRONMENT.localImage);
    for (const exhibit of EXHIBITS.filter(item => item.planet === "Mars")) {
      if (exhibit.characterImage) this.load.image(`mars-character-${exhibit.id}`, exhibit.characterImage);
      if (exhibit.referenceImage) this.load.image(`mars-reference-${exhibit.id}`, exhibit.referenceImage);
      if (exhibit.characterTalkImage) this.load.image(`mars-character-${exhibit.id}-talking`, exhibit.characterTalkImage);
    }
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file: Phaser.Loader.File) => {
      this.loadFailures.push(file.key);
    });
  }

  create() {
    this.worldWidth = this.scale.width || 1000;
    this.worldHeight = this.scale.height || 620;
    this.compactWorld = this.worldWidth < 768;
    this.bounds = {
      left: this.worldWidth * .035,
      right: this.worldWidth * .965,
      top: this.worldHeight * .035,
      bottom: this.worldHeight * .965,
    };
    this.reducedMotion = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    this.physics?.world?.setBounds(0, 0, this.worldWidth, this.worldHeight);

    if (this.textures.exists("mars-surface")) {
      const surface = this.add.image(this.worldWidth / 2, this.worldHeight / 2, "mars-surface").setDepth(-20);
      const source = surface.texture.getSourceImage() as { width: number; height: number };
      const coverScale = Math.max(this.worldWidth / source.width, this.worldHeight / source.height);
      surface.setScale(coverScale * 1.025);
    } else {
      this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x772e23).setDepth(-20);
      this.loadWarning("NASA Mars panorama could not be loaded.");
    }
    this.drawTerrainAtmosphere();
    this.createLocations();
    this.createAstronaut(this.worldWidth * .5, this.worldHeight * (this.compactWorld ? .19 : .88), this.opts.astronaut);
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E") as Record<string, Phaser.Input.Keyboard.Key>;
      this.input.keyboard.on("keydown-E", () => this.interact());
    }
    this.events.on("shutdown", () => {
      this.proximityId = null;
      this.lastReported = null;
      this.opts.onNearby(null);
    });
    if (this.loadFailures.length) this.loadWarning(`Some mission images could not be loaded: ${this.loadFailures.join(", ")}`);
    this.opts.onReady?.();
  }

  private drawTerrainAtmosphere() {
    const veil = this.add.graphics().setDepth(-10);
    veil.fillStyle(0x231410, .16);
    veil.fillRect(0, 0, this.worldWidth, this.worldHeight);
    const vignette = this.add.graphics().setDepth(10);
    vignette.fillStyle(0x1a0d0a, .18);
    vignette.fillRect(0, 0, this.worldWidth, this.worldHeight);

    const markers = this.compactWorld
      ? [[.12, .22, 12], [.86, .28, 6], [.12, .47, 9], [.88, .62, 11], [.16, .82, 7], [.82, .87, 5]]
      : [[.075, .33, 12], [.405, .28, 6], [.9, .52, 13], [.37, .81, 8], [.86, .77, 6], [.12, .72, 5]];
    markers.forEach(([x, y, r], index) => {
      this.add.ellipse(x * this.worldWidth, y * this.worldHeight, r * 2, r * .7, 0x1b1110, .24).setDepth(-2);
      if (index % 2 === 0) this.add.circle(x * this.worldWidth, y * this.worldHeight - 2, 2, 0xf1c09d, .5).setDepth(-1);
    });
    this.add.text(this.worldWidth / 2, this.worldHeight * .115, "EDUCATIONAL COMPOSITE · JEZERO CRATER", {
      fontFamily: "DM Mono", fontSize: this.compactWorld ? "8px" : "9px", color: "#f5e8df", letterSpacing: 1,
      backgroundColor: "rgba(22,12,10,.32)", padding: { x: 9, y: 5 },
    }).setOrigin(.5, 0).setDepth(12).setAlpha(.85);
  }

  private createLocations() {
    const marsExhibits = EXHIBITS.filter(item => item.planet === "Mars");
    const columns = this.compactWorld ? 2 : 3;
    const rowCount = Math.ceil(marsExhibits.length / columns);
    const locations = marsExhibits.map((_exhibit, index) => {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const x = columns === 2 ? (column === 0 ? .29 : .71) : [.22, .5, .78][column];
      const y = rowCount === 1 ? .52 : this.compactWorld
        ? .35 + row * .19
        : .36 + row * .34;
      return { x: this.worldWidth * x, y: this.worldHeight * y };
    });
    const characterSize = this.compactWorld ? 190 : 150;
    const photoWidth = this.compactWorld ? 112 : 95;
    const photoHeight = this.compactWorld ? 78 : 62;

    this.exhibits = marsExhibits.map((exhibit, index) => {
      const pos = locations[index] ?? { x: this.worldWidth / 2, y: this.worldHeight / 2 };
      const finished = this.opts.completed.includes(exhibit.id);
      const locationGroup = this.add.container(pos.x, pos.y).setDepth(pos.y - 2);
      const groundGlow = this.add.ellipse(0, characterSize * .45, characterSize * 1.08, characterSize * .25, exhibit.color, .13);
      const photoY = -characterSize * .5 - photoHeight * .5 - 15;
      const imageWell = this.add.rectangle(0, photoY, photoWidth + 10, photoHeight + 14, 0x17100f, .72).setStrokeStyle(1, 0xf1e4db, .42);
      const photoFrame = this.add.rectangle(0, photoY, photoWidth, photoHeight, 0x33231f, .9);
      locationGroup.add([groundGlow, imageWell, photoFrame]);
      const photoKey = `mars-reference-${exhibit.id}`;
      if (this.textures.exists(photoKey)) {
        const photo = this.add.image(0, photoY, photoKey);
        const source = photo.texture.getSourceImage() as { width: number; height: number };
        const cropScale = Math.max(photoWidth / source.width, photoHeight / source.height);
        photo.setScale(cropScale);
        photo.setCrop(
          Math.max(0, (source.width - photoWidth / cropScale) / 2),
          Math.max(0, (source.height - photoHeight / cropScale) / 2),
          Math.min(source.width, photoWidth / cropScale),
          Math.min(source.height, photoHeight / cropScale),
        );
        locationGroup.add(photo);
      }
      const labelY = characterSize * .54 + 12;
      const name = this.add.text(0, labelY, exhibit.galleryName ?? exhibit.name, {
        fontFamily: "Manrope", fontSize: this.compactWorld ? "13px" : "11px", color: "#f5eee8", fontStyle: "600",
        align: "center", wordWrap: { width: Math.min(this.worldWidth * .42, 210) }, stroke: "#211411", strokeThickness: 3,
      }).setOrigin(.5).setDepth(characterSize + 2);
      const state = this.add.text(0, labelY + (this.compactWorld ? 19 : 17), finished ? "MEMORY RESTORED" : "NASA FIELD RECORD", {
        fontFamily: "DM Mono", fontSize: this.compactWorld ? "8px" : "7px", color: finished ? "#d6e8cb" : "#f0c4aa",
        letterSpacing: 1, stroke: "#211411", strokeThickness: 3,
      }).setOrigin(.5).setDepth(characterSize + 2);
      locationGroup.add([name, state]);

      let indicator: Phaser.GameObjects.Container | undefined;
      if (finished) {
        this.add.circle(pos.x + characterSize * .42, pos.y - characterSize * .44, 13, 0x271a16, .82).setStrokeStyle(1, 0xe5dfca, .78).setDepth(pos.y + 8);
        this.add.text(pos.x + characterSize * .42, pos.y - characterSize * .44, "✓", { fontFamily: "Manrope", fontSize: "12px", color: "#f3ead7" }).setOrigin(.5).setDepth(pos.y + 9);
      } else {
        const marker = this.add.container(pos.x, pos.y + characterSize * .4).setDepth(pos.y + 12);
        const ring = this.add.circle(0, 0, this.compactWorld ? 25 : 22, 0xf0c3a3, 0).setStrokeStyle(1.5, exhibit.color, .68);
        const dot = this.add.circle(0, 0, this.compactWorld ? 6 : 5, exhibit.color, .9);
        const aura = this.add.circle(0, 0, this.compactWorld ? 36 : 30, exhibit.color, .06);
        marker.add([aura, ring, dot]);
        if (!this.reducedMotion) {
          this.tweens.add({ targets: marker, scale: 1.15, alpha: .65, duration: 1500 + index * 160, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        }
        indicator = marker;
      }
      const character = this.add.container(pos.x, pos.y).setDepth(pos.y);
      const shadow = this.add.ellipse(0, characterSize * .31, characterSize * .72, characterSize * .16, 0x211513, .35);
      const imageKey = `mars-character-${exhibit.id}`;
      const availableCharacterKey = this.textures.exists(imageKey) ? imageKey
        : this.textures.exists(photoKey) ? photoKey : null;
      let idle: Phaser.GameObjects.Image | undefined;
      let talking: Phaser.GameObjects.Image | undefined;
      const characterParts: Phaser.GameObjects.GameObject[] = [shadow];
      const fitPortrait = (image: Phaser.GameObjects.Image) => {
        const source = image.texture.getSourceImage() as { width: number; height: number };
        image.setScale(characterSize / Math.max(1, source.width, source.height));
      };
      if (availableCharacterKey) {
        idle = this.add.image(0, -characterSize * .08, availableCharacterKey);
        fitPortrait(idle);
        characterParts.push(idle);
      }
      const talkingKey = `mars-character-${exhibit.id}-talking`;
      if (availableCharacterKey) {
        talking = this.add.image(0, -characterSize * .08, this.textures.exists(talkingKey) ? talkingKey : availableCharacterKey)
          .setVisible(false);
        fitPortrait(talking);
        characterParts.push(talking);
      }
      character.add(characterParts);
      if (!this.reducedMotion) {
        this.tweens.add({ targets: character, y: pos.y - 2, duration: 1850 + index * 340, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        this.tweens.add({ targets: character, angle: { from: -1.2, to: 1.2 }, duration: 3600 + index * 280, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      }
      this.add.ellipse(pos.x, pos.y + characterSize * .44, characterSize * .68, characterSize * .18, exhibit.color, .07).setDepth(pos.y - 1);
      return {
        id: exhibit.id, x: pos.x, y: pos.y, radius: this.compactWorld ? 138 : 122,
        width: characterSize * .78, height: characterSize * .54,
        finished, character, idle, talking, indicator, blinkAt: this.time.now + 1700 + index * 700,
      };
    });
  }

  private createAstronaut(x: number, y: number, astronautId: string) {
    this.avatar = new AstronautActor(this, x, y, astronautId, this.compactWorld ? 108 : 90);
    this.player = this.avatar.container;
  }

  private loadWarning(message: string) {
    this.statusText?.destroy();
    this.statusText = this.add.text(this.worldWidth / 2, this.worldHeight / 2, message, {
      fontFamily: "DM Mono", fontSize: "13px", color: "#ffe0d5", align: "center",
      backgroundColor: "rgba(29,15,14,.88)", padding: { x: 18, y: 13 },
      wordWrap: { width: this.worldWidth * .82 },
    }).setOrigin(.5).setDepth(30);
  }

  update(time: number, delta: number) {
    if (!this.player) return;
    if (!this.movementEnabled) return;
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
    let moved = false;
    if (Math.abs(dx) > .08 || Math.abs(dy) > .08) {
      const nextX = Phaser.Math.Clamp(this.player.x + dx * speed, this.bounds.left + 20, this.bounds.right - 20);
      const nextY = Phaser.Math.Clamp(this.player.y + dy * speed, this.bounds.top + 24, this.bounds.bottom - 24);
      const blocked = this.exhibits.some(item => Math.abs(nextX - item.x) < item.width / 2 && Math.abs(nextY - item.y) < item.height / 2);
      if (!blocked) {
        moved = true;
        this.player.setPosition(nextX, nextY).setDepth(nextY + 20);
        if (time - this.lastMovementSound > 520) {
          audioManager.play("movement");
          this.lastMovementSound = time;
        }
      }
    }
    this.avatar.update(moved ? dx : 0, moved ? dy : 0);
    const near = this.exhibits.find(item =>
      !item.finished && Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y) < item.radius
    )?.id ?? null;
    this.exhibits.forEach(item => item.indicator?.setAlpha(item.id === near ? 1 : .48));
    this.proximityId = near;
    if (near !== this.lastReported) {
      this.lastReported = near;
      this.opts.onNearby(near);
    }
  }
}
