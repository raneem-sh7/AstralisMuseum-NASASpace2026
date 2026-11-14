import Phaser from "phaser";
import { EXHIBITS } from "./_exhibits";

export type SceneOptions = {
  planet: "Moon" | "Mars";
  astronaut: string;
  completed: string[];
  onNearby: (id: string | null) => void;
  onInteract: (id: string) => void;
};

export class MuseumScene extends Phaser.Scene {
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private player!: Phaser.GameObjects.Container;
  private proximityId: string | null = null;
  private lastReported: string | null = null;
  private joystick = { x: 0, y: 0 };
  private movementEnabled = true;
  private opts!: SceneOptions;
  private exhibits: { id: string; x: number; y: number; radius: number; width: number; height: number }[] = [];
  private bounds = { left: 42, right: 958, top: 54, bottom: 576 };
  private onNearbyCallback: SceneOptions["onNearby"] = () => {};
  private onInteractCallback: SceneOptions["onInteract"] = () => {};

  constructor() { super("museum"); }

  configure(opts: SceneOptions) {
    this.opts = opts;
    this.onNearbyCallback = opts.onNearby;
    this.onInteractCallback = opts.onInteract;
  }

  setJoystick(x: number, y: number) { this.joystick = { x, y }; }
  setMovementEnabled(enabled: boolean) { this.movementEnabled = enabled; }
  interact() {
    if (!this.movementEnabled || !this.proximityId) return;
    this.onInteractCallback(this.proximityId);
  }

  preload() {
    for (const exhibit of EXHIBITS.filter(item => item.planet === this.opts.planet && item.characterImage)) {
      this.load.image(`exhibit-${exhibit.id}`, exhibit.characterImage!);
    }
  }

  create() {
    const mars = this.opts.planet === "Mars";
    const bg = this.add.graphics();
    bg.fillGradientStyle(mars ? 0x221e35 : 0x112344, mars ? 0x2e263b : 0x152b50, mars ? 0x101d35 : 0x0d1d38, mars ? 0x17263d : 0x101f3c, 1);
    bg.fillRect(0, 0, 1000, 620);
    // Gallery floor, softly lit central walkway and framed exhibits.
    bg.fillStyle(mars ? 0x704b44 : 0x425a7c, 0.12);
    bg.fillEllipse(500, 338, 830, 360);
    bg.lineStyle(2, mars ? 0xf0a67d : 0x80d9e8, 0.28);
    bg.strokeRoundedRect(28, 32, 944, 556, 28);
    bg.lineStyle(1, 0xa9c3e7, 0.13);
    bg.strokeRoundedRect(49, 54, 902, 512, 21);
    for (let i = 0; i < 27; i++) {
      const x = (i * 127 + 43) % 960 + 20;
      const y = (i * 79 + 62) % 520 + 45;
      bg.fillStyle(i % 4 === 0 ? (mars ? 0xffc29b : 0xb6a6ff) : 0xd7efff, i % 4 === 0 ? 0.62 : 0.25);
      bg.fillCircle(x, y, i % 5 === 0 ? 2 : 1);
    }
    this.add.text(500, 60, mars ? "MARS GALLERY  /  FIELD NOTES" : "LUNAR GALLERY  /  FIELD NOTES", {
      fontFamily: "DM Mono", fontSize: "13px", color: mars ? "#ffc19f" : "#9ceaf2", letterSpacing: 3
    }).setOrigin(.5).setAlpha(.82);
    this.add.text(500, 91, mars ? "The red planet, one quiet voice at a time." : "A small hall beneath a very large sky.", {
      fontFamily: "Manrope", fontSize: "12px", color: "#a9bad2"
    }).setOrigin(.5);

    const planetExhibits = EXHIBITS.filter(e => e.planet === this.opts.planet);
    const positions = [{ x: 215, y: 208 }, { x: 500, y: 208 }, { x: 785, y: 208 }];
    this.exhibits = planetExhibits.map((exhibit, i) => {
      const pos = positions[i];
      const finished = this.opts.completed.includes(exhibit.id);
      this.drawExhibit(pos.x, pos.y, exhibit.galleryName ?? exhibit.name, exhibit.color, exhibit.symbol, finished, mars, Boolean(exhibit.characterImage), Boolean(exhibit.imageWarning));
      if (exhibit.characterImage) {
        const image = this.add.image(pos.x, pos.y - 5, `exhibit-${exhibit.id}`).setDepth(1);
        const source = image.texture.getSourceImage() as { width: number; height: number };
        image.setScale(Math.min(112 / source.width, 74 / source.height));
      }
      return { id: exhibit.id, x: pos.x, y: pos.y + 74, radius: 94, width: 128, height: 84 };
    });

    // Display cases create walk-around routes and solid collision geometry.
    const architecture = this.add.graphics();
    architecture.fillStyle(0x051126, .56);
    architecture.fillRoundedRect(145, 319, 710, 16, 8);
    architecture.fillStyle(0x8fb9da, .11);
    architecture.fillRoundedRect(145, 318, 710, 3, 1);
    architecture.fillStyle(0x0b1c34, .55);
    architecture.fillRoundedRect(82, 463, 190, 38, 12);
    architecture.fillRoundedRect(728, 463, 190, 38, 12);
    architecture.lineStyle(1, mars ? 0xffbc93 : 0x8be2ef, .22);
    architecture.strokeRoundedRect(82, 463, 190, 38, 12);
    architecture.strokeRoundedRect(728, 463, 190, 38, 12);
    this.add.text(177, 482, "FIELD ARCHIVE", { fontFamily: "DM Mono", fontSize: "10px", color: "#a2b7d2", letterSpacing: 1 }).setOrigin(.5);
    this.add.text(823, 482, "OBSERVATION DECK", { fontFamily: "DM Mono", fontSize: "9px", color: "#a2b7d2", letterSpacing: 1 }).setOrigin(.5);

    this.createAstronaut(500, 405, this.opts.astronaut);
    if (this.input.keyboard) {
      this.keys = this.input.keyboard.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E") as Record<string, Phaser.Input.Keyboard.Key>;
      this.input.keyboard.on("keydown-E", () => this.interact());
    }
    this.events.on("shutdown", () => { this.onNearbyCallback(null); });
  }

  private drawExhibit(x: number, y: number, name: string, tint: number, symbol: string, finished: boolean, mars: boolean, hasCharacterImage: boolean, temporaryArt: boolean) {
    const g = this.add.graphics();
    g.fillStyle(0x071329, .68); g.fillRoundedRect(x - 100, y - 55, 200, 138, 17);
    g.lineStyle(1, tint, .28); g.strokeRoundedRect(x - 100, y - 55, 200, 138, 17);
    g.fillStyle(tint, .12); g.fillRoundedRect(x - 88, y - 43, 176, 76, 12);
    g.fillStyle(0x91e6f0, .22); g.fillRoundedRect(x - 56, y + 27, 112, 15, 7);
    g.fillStyle(0x5c7290, .38); g.fillRoundedRect(x - 70, y + 40, 140, 10, 5);
    g.fillStyle(tint, finished ? .95 : .72);
    if (hasCharacterImage) {
      // Moon exhibit artwork is loaded from the supplied illustrations below.
    } else if (symbol === "R" || symbol === "O") {
      g.fillRoundedRect(x - 26, y - 23, 52, 23, 8);
      g.fillStyle(0x14243b, .95); g.fillCircle(x - 19, y + 2, 7); g.fillCircle(x + 19, y + 2, 7);
      g.fillStyle(tint, .8); g.fillCircle(x - 19, y + 2, 3); g.fillCircle(x + 19, y + 2, 3);
      g.fillStyle(0xd9f7ff, .85); g.fillCircle(x + 16, y - 16, 7);
    } else if (symbol === "A") {
      g.fillTriangle(x - 31, y + 15, x, y - 31, x + 31, y + 15);
      g.fillStyle(0x13243c, .9); g.fillCircle(x, y - 3, 11);
      g.fillStyle(tint, .85); g.fillCircle(x - 29, y + 15, 5); g.fillCircle(x + 29, y + 15, 5);
      g.lineStyle(2, tint, .8); g.lineBetween(x, y - 5, x - 32, y - 30); g.lineBetween(x, y - 5, x + 32, y - 30);
    } else {
      g.fillRoundedRect(x - 23, y - 25, 46, 43, 10);
      g.fillStyle(0xdffbff, .78); g.fillRoundedRect(x - 16, y - 17, 32, 19, 6);
      g.fillStyle(tint, .9); g.fillCircle(x - 26, y + 20, 5); g.fillCircle(x + 26, y + 20, 5);
      g.lineStyle(2, tint, .9); g.lineBetween(x - 19, y + 9, x - 29, y + 19); g.lineBetween(x + 19, y + 9, x + 29, y + 19);
      g.fillStyle(0xfff0bd, .9); g.fillCircle(x - 8, y - 8, 2); g.fillCircle(x + 8, y - 8, 2);
    }
    if (finished) { g.lineStyle(2, tint, .75); g.strokeCircle(x + 75, y - 38, 11); g.lineStyle(2, 0xffffff, .9); g.lineBetween(x + 70, y - 38, x + 74, y - 34); g.lineBetween(x + 74, y - 34, x + 81, y - 43); }
    this.add.text(x, y + 57, name, { fontFamily: "Manrope", fontSize: "11px", color: "#e4edf9", align: "center", wordWrap: { width: 180 } }).setOrigin(.5);
    this.add.text(x, y + 73, hasCharacterImage ? "AI ART · NOT A NASA PHOTO" : finished ? "MEMORY RESTORED" : "DEMO EXHIBIT", { fontFamily: "DM Mono", fontSize: hasCharacterImage ? "7px" : "8px", color: finished ? "#b5f5dc" : mars ? "#e5a587" : "#91dae7", letterSpacing: 1 }).setOrigin(.5);
    if (temporaryArt) this.add.text(x, y + 82, "TEMP ART · REPLACE BEFORE RELEASE", { fontFamily: "DM Mono", fontSize: "6px", color: "#ffb4bc", letterSpacing: .5 }).setOrigin(.5);
  }

  private createAstronaut(x: number, y: number, astronautId: string) {
    const palette: Record<string, number> = { blue: 0x78dce9, orange: 0xffb477, purple: 0xb8a3ff };
    const color = palette[astronautId] ?? palette.blue;
    this.player = this.add.container(x, y);
    const shadow = this.add.ellipse(0, 22, 45, 13, 0x000000, .28);
    const body = this.add.graphics();
    body.fillStyle(color, 1); body.fillRoundedRect(-14, -4, 28, 29, 10);
    body.fillStyle(0xe8f5ff, 1); body.fillCircle(0, -15, 19);
    body.fillStyle(0x385479, 1); body.fillRoundedRect(-12, -24, 24, 17, 8);
    body.fillStyle(0xbceef2, .8); body.fillCircle(-5, -20, 2);
    body.fillStyle(0xe9f4ff, 1); body.fillRoundedRect(-21, 1, 9, 15, 4); body.fillRoundedRect(12, 1, 9, 15, 4);
    body.fillStyle(0x18304d, 1); body.fillRoundedRect(-10, 21, 8, 10, 3); body.fillRoundedRect(2, 21, 8, 10, 3);
    this.player.add([shadow, body]);
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
    const blocked = this.exhibits.some(e => Math.abs(nextX - e.x) < e.width / 2 + 14 && Math.abs(nextY - e.y) < e.height / 2 + 10);
    if (!blocked) { this.player.setPosition(nextX, nextY); }
    const near = this.exhibits.find(e => Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) < e.radius)?.id ?? null;
    this.proximityId = near;
    if (near !== this.lastReported) { this.lastReported = near; this.onNearbyCallback(near); }
  }
}
