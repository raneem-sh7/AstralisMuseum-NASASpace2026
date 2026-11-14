import Phaser from "phaser";
import { audioManager } from "../audio/AudioManager";
import { EXHIBITS } from "../data/exhibits";
import { MOON_CHARACTER_ART, MOON_EQUIPMENT_PHOTOS, MOON_SURFACE_PHOTO } from "../data/moonAssets";
import type { SceneOptions } from "./MuseumScene";

type MoonExhibit = {
  id: string;
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
  finished: boolean;
  character: Phaser.GameObjects.Container;
  indicator?: Phaser.GameObjects.Container;
  eyes: Phaser.GameObjects.Ellipse[];
  mouth: Phaser.GameObjects.Ellipse;
  baseY: number;
  blinkAt: number;
  talking: boolean;
};

export class MoonScene extends Phaser.Scene {
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private player!: Phaser.GameObjects.Container;
  private opts!: SceneOptions;
  private joystick = { x: 0, y: 0 };
  private movementEnabled = true;
  private proximityId: string | null = null;
  private lastReported: string | null = null;
  private exhibits: MoonExhibit[] = [];
  private bounds = { left: 28, right: 972, top: 35, bottom: 590 };
  private worldWidth = 1000;
  private worldHeight = 620;
  private compactWorld = false;
  private reducedMotion = false;
  private lastMovementSound = 0;
  private loadFailures: string[] = [];
  private statusText?: Phaser.GameObjects.Text;

  constructor() { super("moon"); }

  configure(opts: SceneOptions) { this.opts = opts; }
  setJoystick(x: number, y: number) { this.joystick = { x, y }; }
  setMovementEnabled(enabled: boolean) { this.movementEnabled = enabled; }

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
      item.talking = talking && id !== null && item.id === id;
      item.mouth.setVisible(true);
      item.mouth.setScale(item.talking ? 1 : 1, item.talking ? .75 : .5);
    });
  }

  preload() {
    this.load.image("moon-surface", MOON_SURFACE_PHOTO.localImage);
    for (const exhibit of EXHIBITS.filter(item => item.planet === "Moon")) {
      const art = MOON_CHARACTER_ART[exhibit.id];
      const photo = MOON_EQUIPMENT_PHOTOS[exhibit.id];
      if (art) this.load.image(`moon-character-${exhibit.id}`, art.image);
      if (photo) this.load.image(`moon-photo-${exhibit.id}`, photo.localImage);
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
    if (this.textures.exists("moon-surface")) {
      const surface = this.add.image(this.worldWidth / 2, this.worldHeight / 2, "moon-surface").setDepth(-20);
      const source = surface.texture.getSourceImage() as { width: number; height: number };
      const coverScale = Math.max(this.worldWidth / source.width, this.worldHeight / source.height);
      surface.setScale(coverScale * 1.025);
    } else {
      this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x161c1d).setDepth(-20);
      this.loadWarning("NASA lunar panorama could not be loaded.");
    }
    this.drawTerrainAtmosphere();
    this.createLocations();
    const startX = this.worldWidth * .5;
    const startY = this.worldHeight * (this.compactWorld ? .19 : .45);
    this.createAstronaut(startX, startY, this.opts.astronaut);
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E") as Record<string, Phaser.Input.Keyboard.Key>;
      this.input.keyboard.on("keydown-E", () => this.interact());
    }
    this.events.on("shutdown", () => {
      this.proximityId = null;
      this.lastReported = null;
      this.opts.onNearby(null);
    });
    if (this.loadFailures.length) this.loadWarning(`Some locally stored mission images could not be loaded: ${this.loadFailures.join(", ")}`);
    this.opts.onReady?.();
  }

  private drawTerrainAtmosphere() {
    const veil = this.add.graphics().setDepth(-10);
    veil.fillGradientStyle(0x111718, 0x111718, 0x111718, 0x111718, .13);
    veil.fillRect(0, 0, this.worldWidth, this.worldHeight);
    const vignette = this.add.graphics().setDepth(10);
    vignette.fillStyle(0x071011, .17);
    vignette.fillRect(0, 0, this.worldWidth, this.worldHeight);
    // Photo-ground shadows and subtle cyan telemetry marks, never artificial terrain.
    const markers = this.compactWorld
      ? [[.12, .22, 12], [.86, .28, 6], [.12, .47, 9], [.88, .62, 11], [.16, .82, 7], [.82, .87, 5]]
      : [[.075, .33, 12], [.405, .28, 6], [.9, .52, 13], [.37, .81, 8], [.86, .77, 6], [.12, .72, 5]];
    markers.forEach(([x, y, r], index) => {
      this.add.ellipse(x * this.worldWidth, y * this.worldHeight, r * 2, r * .7, 0x121717, .26).setDepth(-2);
      if (index % 2 === 0) {
        this.add.circle(x * this.worldWidth, y * this.worldHeight - 2, 2, 0xb7e8e1, .55).setDepth(-1);
      }
    });
    this.add.text(this.worldWidth / 2, this.worldHeight * .115, "EDUCATIONAL COMPOSITE · DISTINCT APOLLO SITES", {
      fontFamily: "DM Mono", fontSize: this.compactWorld ? "8px" : "9px", color: "#f0f4eb", letterSpacing: 1,
      backgroundColor: "rgba(7,15,16,.32)", padding: { x: 9, y: 5 },
    }).setOrigin(.5, 0).setDepth(12).setAlpha(.85);
  }

  private createLocations() {
    const locations = this.compactWorld
      ? [
          { id: "apollo-11-eagle", x: this.worldWidth * .29, y: this.worldHeight * .29 },
          { id: "apollo-rover", x: this.worldWidth * .71, y: this.worldHeight * .51 },
          { id: "alsep", x: this.worldWidth * .5, y: this.worldHeight * .73 },
        ]
      : [
          { id: "apollo-11-eagle", x: this.worldWidth * .22, y: this.worldHeight * .4 },
          { id: "apollo-rover", x: this.worldWidth * .75, y: this.worldHeight * .36 },
          { id: "alsep", x: this.worldWidth * .535, y: this.worldHeight * .68 },
        ];
    const characterSize = this.compactWorld ? 190 : 150;
    const photoWidth = this.compactWorld ? 112 : 95;
    const photoHeight = this.compactWorld ? 78 : 62;
    this.exhibits = EXHIBITS.filter(item => item.planet === "Moon").map((exhibit, index) => {
      const pos = locations.find(location => location.id === exhibit.id)
        ?? { id: exhibit.id, x: this.worldWidth * (.2 + index * .3), y: this.worldHeight * .5 };
      const finished = this.opts.completed.includes(exhibit.id);
      const accent = exhibit.color;
      const locationGroup = this.add.container(pos.x, pos.y).setDepth(pos.y - 2);
      const groundGlow = this.add.ellipse(0, characterSize * .45, characterSize * 1.08, characterSize * .25, accent, .13);
      const photoY = -characterSize * .5 - photoHeight * .5 - 15;
      const imageWell = this.add.rectangle(0, photoY, photoWidth + 10, photoHeight + 14, 0x0d1517, .72).setStrokeStyle(1, 0xd8e5df, .42);
      const photoFrame = this.add.rectangle(0, photoY, photoWidth, photoHeight, 0x253236, .9);
      locationGroup.add([groundGlow, imageWell, photoFrame]);
      const photoKey = `moon-photo-${exhibit.id}`;
      if (this.textures.exists(photoKey)) {
        const equipmentPhoto = this.add.image(0, photoY, photoKey);
        const source = equipmentPhoto.texture.getSourceImage() as { width: number; height: number };
        const cropScale = Math.max(photoWidth / source.width, photoHeight / source.height);
        equipmentPhoto.setScale(cropScale);
        equipmentPhoto.setCrop(
          Math.max(0, (source.width - photoWidth / cropScale) / 2),
          Math.max(0, (source.height - photoHeight / cropScale) / 2),
          Math.min(source.width, photoWidth / cropScale),
          Math.min(source.height, photoHeight / cropScale),
        );
        locationGroup.add(equipmentPhoto);
      } else {
        this.add.text(pos.x, pos.y + photoY, "PHOTO UNAVAILABLE", {
          fontFamily: "DM Mono", fontSize: "7px", color: "#ffd2c8", align: "center",
          backgroundColor: "rgba(24,14,13,.8)", padding: { x: 5, y: 5 },
        }).setOrigin(.5).setDepth(pos.y + 7);
      }
      const labelY = characterSize * .54 + 12;
      const name = this.add.text(0, labelY, exhibit.galleryName ?? exhibit.name, {
        fontFamily: "Manrope", fontSize: this.compactWorld ? "13px" : "11px", color: "#f0f3ea", fontStyle: "600",
        align: "center", wordWrap: { width: Math.min(this.worldWidth * .42, 210) }, stroke: "#101719", strokeThickness: 3,
      }).setOrigin(.5).setDepth(characterSize + 2);
      const state = this.add.text(0, labelY + (this.compactWorld ? 19 : 17), finished ? "MEMORY RESTORED" : "NASA FIELD RECORD", {
        fontFamily: "DM Mono", fontSize: this.compactWorld ? "8px" : "7px", color: finished ? "#d6e8cb" : "#c4e8e1",
        letterSpacing: 1, stroke: "#101719", strokeThickness: 3,
      }).setOrigin(.5).setDepth(characterSize + 2);
      locationGroup.add([name, state]);
      let indicator: Phaser.GameObjects.Container | undefined;
      if (finished) {
        this.add.circle(pos.x + characterSize * .42, pos.y - characterSize * .44, 13, 0x18221e, .82).setStrokeStyle(1, 0xd5e5b9, .78).setDepth(pos.y + 8);
        this.add.text(pos.x + characterSize * .42, pos.y - characterSize * .44, "✓", { fontFamily: "Manrope", fontSize: "12px", color: "#e6f0ce" }).setOrigin(.5).setDepth(pos.y + 9);
      } else {
        const marker = this.add.container(pos.x, pos.y + characterSize * .4).setDepth(pos.y + 12);
        const ring = this.add.circle(0, 0, this.compactWorld ? 25 : 22, 0x8ee5da, 0).setStrokeStyle(1.5, accent, .68);
        const dot = this.add.circle(0, 0, this.compactWorld ? 6 : 5, accent, .9);
        const aura = this.add.circle(0, 0, this.compactWorld ? 36 : 30, accent, .06);
        marker.add([aura, ring, dot]);
        if (!this.reducedMotion) {
          this.tweens.add({ targets: marker, scale: 1.15, alpha: .65, duration: 1500 + index * 160, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        }
        indicator = marker;
      }
      const char = this.createCharacter(exhibit.id, pos.x, pos.y, accent, characterSize, index);
      return {
        id: exhibit.id, x: pos.x, y: pos.y, radius: this.compactWorld ? 138 : 122,
        width: characterSize * .78, height: characterSize * .54,
        finished, character: char.container, indicator, eyes: char.eyes, mouth: char.mouth, baseY: pos.y,
        blinkAt: this.time.now + 1700 + index * 700, talking: false,
      };
    });
  }

  private createCharacter(id: string, x: number, y: number, accent: number, size: number, index: number) {
    const container = this.add.container(x, y).setDepth(y);
    const shadow = this.add.ellipse(0, size * .31, size * .72, size * .16, 0x111516, .35);
    const imageKey = `moon-character-${id}`;
    if (this.textures.exists(imageKey)) {
      const image = this.add.image(0, -size * .08, imageKey).setDisplaySize(size, size);
      container.add([shadow, image]);
    } else {
      const unavailable = this.add.text(0, -20, "CHARACTER ART\nUNAVAILABLE", {
        fontFamily: "DM Mono", fontSize: "9px", color: "#ffd3c7", align: "center",
        backgroundColor: "rgba(26,13,12,.82)", padding: { x: 8, y: 7 },
      }).setOrigin(.5);
      container.add([shadow, unavailable]);
    }
    const face = MOON_CHARACTER_ART[id]?.face;
    const eyes: Phaser.GameObjects.Ellipse[] = [];
    const mouth = this.add.ellipse(0, 0, 6, 3, 0xa5fff1, .92);
    if (face) {
      const faceCenterX = (face.x - .5) * size;
      const faceCenterY = (face.y - .5) * size - size * .08;
      const eyeY = faceCenterY;
      const eyeGap = face.width * size * .3;
      const eyeWidth = Math.max(3, face.width * size * .12);
      const eyeHeight = Math.max(4, face.height * size * .58);
      eyes.push(this.add.ellipse(faceCenterX - eyeGap, eyeY, eyeWidth, eyeHeight, 0xa8fff0, .98));
      eyes.push(this.add.ellipse(faceCenterX + eyeGap, eyeY, eyeWidth, eyeHeight, 0xa8fff0, .98));
      mouth.setPosition(faceCenterX, faceCenterY + face.height * size * .57)
        .setSize(Math.max(6, face.width * size * .34), Math.max(3, size * .02))
        .setScale(1, .55);
      container.add([...eyes, mouth]);
    }
    container.setScale(1);
    if (!this.reducedMotion) {
      this.tweens.add({ targets: container, y: y - 2, duration: 1850 + index * 340, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: container, angle: { from: -1.2, to: 1.2 }, duration: 3600 + index * 280, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    this.add.ellipse(x, y + size * .44, size * .68, size * .18, accent, .07).setDepth(y - 1);
    return { container, eyes, mouth };
  }

  private createAstronaut(x: number, y: number, astronautId: string) {
    const palette: Record<string, number> = { blue: 0x9ddce0, orange: 0xe5b98b, purple: 0xc1b4db };
    const color = palette[astronautId] ?? palette.blue;
    this.player = this.add.container(x, y).setDepth(y + 20);
    const shadow = this.add.ellipse(0, 25, 44, 13, 0x111516, .48);
    const suit = this.add.graphics();
    suit.fillStyle(0x263234, .5); suit.fillRoundedRect(-20, -24, 40, 58, 15);
    suit.fillStyle(color, 1); suit.fillRoundedRect(-16, -7, 32, 33, 11);
    suit.lineStyle(2, 0xf4f0e6, .95); suit.strokeRoundedRect(-16, -7, 32, 33, 11);
    suit.fillStyle(0xd8e3dc, 1); suit.fillCircle(0, -20, 22);
    suit.fillStyle(0x24383b, 1); suit.fillRoundedRect(-15, -30, 30, 20, 9);
    suit.lineStyle(2, 0xb1e7e3, .82); suit.strokeRoundedRect(-15, -30, 30, 20, 9);
    suit.fillStyle(0xf4f4eb, .9); suit.fillRoundedRect(-24, 2, 9, 19, 4); suit.fillRoundedRect(15, 2, 9, 19, 4);
    suit.fillStyle(0x1a2425, 1); suit.fillRoundedRect(-12, 25, 9, 10, 3); suit.fillRoundedRect(3, 25, 9, 10, 3);
    suit.fillStyle(0x9ee6df, .95); suit.fillRoundedRect(8, 0, 7, 12, 2);
    suit.lineStyle(1, 0x324446, .8); suit.lineBetween(9, 4, 14, 4); suit.lineBetween(9, 7, 14, 7);
    this.player.add([shadow, suit]);
    if (this.compactWorld) this.player.setScale(1.18);
    this.add.ellipse(x, y + 34, 47, 20, color, .08).setDepth(y - 1);
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
    this.exhibits.forEach(item => {
      if (!this.reducedMotion && !item.talking && time >= item.blinkAt) {
        item.eyes.forEach(eye => eye.setScale(1, .12));
        this.time.delayedCall(115, () => item.eyes.forEach(eye => eye.setScale(1, 1)));
        item.blinkAt = time + Phaser.Math.Between(2300, 4900);
      }
      if (item.talking && !this.reducedMotion) item.mouth.setScale(1, .55 + Math.abs(Math.sin(time / 100)) * 1.5);
    });
    if (!this.movementEnabled) return;
    let dx = this.joystick.x, dy = this.joystick.y;
    if (this.keys) {
      if (this.keys.A?.isDown || this.keys.LEFT?.isDown) dx -= 1;
      if (this.keys.D?.isDown || this.keys.RIGHT?.isDown) dx += 1;
      if (this.keys.W?.isDown || this.keys.UP?.isDown) dy -= 1;
      if (this.keys.S?.isDown || this.keys.DOWN?.isDown) dy += 1;
    }
    const magnitude = Math.hypot(dx, dy);
    if (magnitude > 1) { dx /= magnitude; dy /= magnitude; }
    if (Math.abs(dx) > .08 || Math.abs(dy) > .08) {
      const speed = 195 * Math.min(delta / 1000, .04);
      const nextX = Phaser.Math.Clamp(this.player.x + dx * speed, this.bounds.left + 20, this.bounds.right - 20);
      const nextY = Phaser.Math.Clamp(this.player.y + dy * speed, this.bounds.top + 24, this.bounds.bottom - 24);
      const blocked = this.exhibits.some(item => Math.abs(nextX - item.x) < item.width / 2 && Math.abs(nextY - item.y) < item.height / 2);
      if (!blocked) {
        this.player.setPosition(nextX, nextY).setDepth(nextY + 20);
        if (time - this.lastMovementSound > 520) {
          audioManager.play("movement");
          this.lastMovementSound = time;
        }
      }
    }
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
