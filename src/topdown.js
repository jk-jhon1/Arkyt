// Terreno visto de cima. Mesma seed gera os mesmos lagos, trilhas e texturas.
import { WORLD_W } from './data.js?v=20261126l';
import { hashSeed, mulberry32 } from './world.js?v=20261126l';
export const MAP_H = 2048;
export const TILE = 32;
export class TopdownMap {
  constructor(seed, world) {
    this.seed = hashSeed(seed + '-mapa');
    const random = mulberry32(this.seed);
    this.pathPhase = random() * 20;
    this.lakes = Array.from({length: 35}, () => ({
      x: 180 + random() * (WORLD_W - 360), y: 130 + random() * (MAP_H - 260),
      rx: 70 + random() * 140, ry: 60 + random() * 125
    }));
    // Uma clareira inicial garante espaço para se movimentar e construir.
    this.lakes = this.lakes.filter(l => Math.hypot((l.x-world.spawn.x)/l.rx, (l.y-MAP_H/2)/l.ry) > 2.4);
    for (const list of [world.trees, world.rocks, world.plants, world.pois]) {
      for (const o of list) o.mapY = 48 + random() * (MAP_H - 96);
    }
  }
  noise(x,y) {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + this.seed;
    n = Math.imul(n ^ n >>> 13, 1274126177);
    return ((n ^ n >>> 16) >>> 0) / 4294967296;
  }
  tile(x,y,world) {
    const tx = Math.floor(x/TILE), ty = Math.floor(y/TILE);
    const cx = tx*TILE+TILE/2, cy = ty*TILE+TILE/2;
    for (const l of this.lakes) {
      const d = ((cx-l.x)/l.rx)**2 + ((cy-l.y)/l.ry)**2;
      if (d < 1 + (this.noise(tx,ty)-.5)*.18) return 'agua';
      if (d < 1.3) return 'areia';
    }
    const pathY = MAP_H/2 + Math.sin(cx/650+this.pathPhase)*130 + Math.sin(cx/1700)*100;
    if (Math.abs(cy-pathY) < 35 + this.noise(tx,ty)*9) return 'caminho';
    const biome = world.biome(cx).id;
    if (biome==='deserto'||biome==='praia'||biome==='costa') return 'areia';
    if (biome==='gelada') return 'neve';
    if (biome==='vulcao'||biome==='rochosas'||biome==='montanha') return 'pedra';
    return 'grama';
  }
  color(x,y,world) {
    // Uma cor contínua por material evita que cada bloco pareça uma placa.
    const colors={grama:'#7bb959',agua:'#4ca8cb',areia:'#dfc586',caminho:'#cba66e',neve:'#dcece8',pedra:'#a5a397'};
    return colors[this.tile(x,y,world)];
  }
}
