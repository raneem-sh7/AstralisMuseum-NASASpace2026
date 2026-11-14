import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, unlinkSync } from "node:fs";

// Generated sheets have a painted pale checkerboard. Remove only near-white
// pixels connected to each cell's boundary; enclosed white suit panels survive.
const destination = "public/images/astronauts";
mkdirSync(destination, { recursive: true });
function prepare(source, target, rows, order) {
  const raw = execFileSync("convert", [source, "-depth", "8", "rgba:-"], { maxBuffer: 20e6 });
  const out = Buffer.alloc(1024 * 1024 * 4);
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const sourceRow = order[row], top = rows[sourceRow], bottom = rows[sourceRow + 1];
    const width = 256, height = bottom - top;
    const cell = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) raw.copy(cell, y * width * 4, ((top + y) * 1024 + col * 256) * 4, ((top + y) * 1024 + col * 256 + width) * 4);
    const seen = new Uint8Array(width * height), queue = [];
    const add = (x, y) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const index = y * width + x, p = index * 4;
      if (seen[index]) return;
      const min = Math.min(cell[p], cell[p + 1], cell[p + 2]);
      const max = Math.max(cell[p], cell[p + 1], cell[p + 2]);
      if (min < 218 || max - min > 23) return;
      seen[index] = 1; queue.push(index);
    };
    for (let x = 0; x < width; x++) { add(x, 0); add(x, height - 1); }
    for (let y = 0; y < height; y++) { add(0, y); add(width - 1, y); }
    for (let index = 0; index < queue.length; index++) {
      const pixel = queue[index], x = pixel % width, y = Math.floor(pixel / width);
      cell[pixel * 4 + 3] = 0;
      add(x - 1, y); add(x + 1, y); add(x, y - 1); add(x, y + 1);
    }
    const temporary = `/tmp/astralis-frame-${row}-${col}.png`;
    execFileSync("convert", ["-size", `${width}x${height}`, "-depth", "8", "rgba:-", "-trim", "+repage", "-resize", "224x224", "-gravity", "south", "-background", "none", "-extent", "256x248", "-gravity", "north", "-extent", "256x256", temporary], { input: cell });
    const frame = execFileSync("convert", [temporary, "-depth", "8", "rgba:-"]);
    for (let y = 0; y < 256; y++) frame.copy(out, ((row * 256 + y) * 1024 + col * 256) * 4, y * 256 * 4, (y + 1) * 256 * 4);
    unlinkSync(temporary);
  }
  execFileSync("convert", ["-size", "1024x1024", "-depth", "8", "rgba:-", "-strip", target], { input: out });
}
prepare("generated-artifacts/astronaut-previews/christina-koch-walk-sheet.png", `${destination}/christina-koch-walk.png`, [0,256,512,764,1024], [0,1,2,3]);
prepare("generated-artifacts/astronaut-previews/victor-glover-walk-sheet.png", `${destination}/victor-glover-walk.png`, [0,268,516,768,1024], [0,2,1,3]);
for (const id of ["christina-koch", "victor-glover"]) {
  execFileSync("convert", [`generated-artifacts/astronaut-previews/${id}-idle.png`, "-trim", "+repage", "-resize", "224x224", "-gravity", "south", "-background", "none", "-extent", "256x248", "-gravity", "north", "-extent", "256x256", "-strip", `${destination}/${id}-idle.png`]);
}
execFileSync("convert", ["attached_assets/image_1794672085098.png", "-strip", "-quality", "88", `${destination}/christina-koch-nasa.jpg`]);
execFileSync("convert", ["attached_assets/image_1794672103481.png", "-strip", "-quality", "88", `${destination}/victor-glover-nasa.jpg`]);
writeFileSync(`${destination}/README.txt`, "Profile portraits supplied by the project team. NASA photo credits corroborated by Canadian Space Agency portrait records:\nChristina Koch: https://www.asc-csa.gc.ca/eng/multimedia/search/image/18517\nVictor Glover: https://www.asc-csa.gc.ca/eng/multimedia/search/image/18519\nIdle and walk PNG files: AI-generated ASTRALIS character interpretations, not NASA photographs or official suit depictions.\n");
