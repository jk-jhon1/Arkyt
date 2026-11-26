// ============================================================
// world/ — biomas, geração procedural com seed, cavernas
// naturais, pontos de interesse, clima e temperatura.
// REGRA: a superfície nunca é escavada — cavernas são
// naturais e pré-existentes, com entradas visíveis.
// ============================================================
import { WORLD_W, SEA_Y, BIOMES, biomeAt, ORES, POIS } from './data.js?v=20261126l';

export function hashSeed(str){ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
export function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

export class World {
  constructor(seedStr){
    this.seedStr = seedStr;
    this.rng = mulberry32(hashSeed(seedStr));
    this.step = 16; // coluna de terreno a cada 16 px
    this.cols = Math.ceil(WORLD_W/this.step);
    this.surface = new Float32Array(this.cols);
    this.caves = [];   // {x,y,w,h} retângulos escavados naturalmente
    this.rocks = [];   // {x,y,ore,hp}
    this.trees = [];   // {x,y,tipo,hp}
    this.plants = [];  // {x,y,tipo}
    this.pois = [];    // {x,y,tipo,nome}
    this.water = [];   // {x0,x1,level} lagos/rios
    this.lava = [];    // {x0,x1}
    this.generate();
  }
  col(x){ return Math.max(0, Math.min(this.cols-1, Math.floor(x/this.step))); }
  groundY(x){ return this.surface[this.col(x)]; }
  biome(x){ return biomeAt(x); }

  generate(){
    const r = this.rng;
    // --- terreno: altura por bioma (montanha/vulcão altos, praia baixa) ---
    let base = 480;
    for(let i=0;i<this.cols;i++){
      const x = i*this.step;
      const b = this.biome(x);
      const n = Math.sin(i*0.013)*30 + Math.sin(i*0.041+2)*18 + Math.sin(i*0.11)*8;
      let h = base + n;
      if(b.id==='montanha') h -= 260 + Math.sin(i*0.02)*80;
      if(b.id==='vulcao') h -= 300 + Math.sin(i*0.03)*60;
      if(b.id==='gelada') h -= 60;
      if(b.id==='praia'||b.id==='costa'||b.id==='ilhas') h = Math.min(h, SEA_Y+40);
      if(b.id==='deserto') h += 20;
      if(b.id==='rochosas') h -= 120;
      // ilhas: sobe e desce até o mar
      if(b.id==='ilhas'){ const t=(x% (WORLD_W/15))/ (WORLD_W/15); h = SEA_Y+120 - Math.sin(t*Math.PI)*160; }
      // rios/lagos: depressões com água
      if(b.id==='rios'||b.id==='lagos'){ const t=(x%(WORLD_W/15))/(WORLD_W/15); h = SEA_Y+30 - Math.sin(t*Math.PI)*90; }
      if(b.id==='pantano') h = Math.min(h, SEA_Y+25);
      this.surface[i] = Math.max(120, Math.min(SEA_Y+220, h));
    }
    // suaviza
    for(let k=0;k<2;k++) for(let i=1;i<this.cols-1;i++) this.surface[i]=(this.surface[i-1]+this.surface[i]*2+this.surface[i+1])/4;
    // --- água: mar + lagos/rios ---
    this.water.push({x0:0, x1:WORLD_W, level:SEA_Y, mar:true});
    // --- lava no vulcão ---
    const vx0 = WORLD_W*11/15, vx1 = WORLD_W*12/15;
    this.lava.push({x0:vx0, x1:vx1, level:SEA_Y-140});
    // --- cavernas naturais (pré-existentes, entradas na superfície) ---
    const nCaves = 14;
    for(let i=0;i<nCaves;i++){
      const cx = 400 + r()*(WORLD_W-800);
      const cy = this.groundY(cx) + 120 + r()*260;
      const cw = 260 + r()*520, ch = 90 + r()*140;
      this.caves.push({x:cx, y:cy, w:cw, h:ch});
      // entrada natural: abre a superfície acima da caverna
      const ei = this.col(cx);
      for(let j=Math.max(0,ei-3); j<Math.min(this.cols,ei+4); j++) this.surface[j] = Math.max(this.surface[j], cy+ch/2);
      this.pois.push({x:cx, y:this.groundY(cx)-10, tipo:'entradas de cavernas', nome:'Entrada de caverna natural'});
    }
    // --- rochas com minérios REAIS (superfície + cavernas) ---
    const orePool = ORES;
    for(let i=0;i<260;i++){
      const x = 100 + r()*(WORLD_W-200);
      const inCave = r()<0.45;
      let y;
      if(inCave){ const c=this.caves[Math.floor(r()*this.caves.length)]; y = c.y + c.h - 14; }
      else y = this.groundY(x)-8;
      const ore = orePool[Math.floor(r()*orePool.length)];
      this.rocks.push({x, y, ore, hp:3, caverna:inCave});
    }
    // --- árvores / plantas por bioma ---
    for(let i=0;i<420;i++){
      const x = 80 + r()*(WORLD_W-160);
      const b = this.biome(x);
      const y = this.groundY(x);
      if(b.id==='tropical'||b.id==='temperada'||b.id==='pantano'||b.id==='planicie'||b.id==='savana'||b.id==='gelada')
        this.trees.push({x, y, tipo: b.id==='gelada'?'pinheiro':(r()<0.5?'palmeira':'árvore'), hp:3});
      if(r()<0.6) this.plants.push({x, y, tipo:['fibra','capim','fruta','cogumelo','planta medicinal','mel','semente','folha'][Math.floor(r()*8)]});
    }
    // troncos caídos e pedras do chão
    for(let i=0;i<120;i++){ const x=80+r()*(WORLD_W-160); this.plants.push({x, y:this.groundY(x), tipo: r()<0.5?'tronco caído':'pedra do chão'}); }
    // --- pontos de interesse fixos ---
    const poiDefs = [
      {tipo:'cachoeiras', n:3}, {tipo:'ruínas', n:4}, {tipo:'acampamentos', n:4},
      {tipo:'aldeias abandonadas', n:3}, {tipo:'torres de observação', n:3},
      {tipo:'naufrágios', n:3}, {tipo:'fósseis', n:4}, {tipo:'locais secretos', n:3},
    ];
    for(const d of poiDefs) for(let i=0;i<d.n;i++){
      const x = 300 + r()*(WORLD_W-600);
      this.pois.push({x, y:this.groundY(x), tipo:d.tipo, nome:d.tipo});
    }
    // acampamento inicial (respawn)
    this.spawn = { x: WORLD_W*0.45, y: 0 };
    this.spawn.y = this.groundY(this.spawn.x);
  }
  inCave(x,y){ for(const c of this.caves) if(x>c.x-c.w/2 && x<c.x+c.w/2 && y>c.y-c.h/2 && y<c.y+c.h/2) return true; return false; }
  isSolid(x,y){ // terra/rocha sólida (NUNCA escavável pelo jogador)
    if(y < this.groundY(x)) return false;
    if(this.inCave(x,y)) return false;
    return true;
  }
  waterAt(x,y){ for(const w of this.water){ if(x>=w.x0 && x<=w.x1 && y>=w.level && y<w.level+400) return w; } return null; }
  waterLevelAt(x){ for(const w of this.water){ if(x>=w.x0 && x<=w.x1) return w.level; } return null; }
  waterLevelAt(x){ for(const w of this.water){ if(x>=w.x0 && x<=w.x1) return w.level; } return null; }
  lavaAt(x,y){ for(const l of this.lava){ if(x>=l.x0 && x<=l.x1 && y>=l.level && y<l.level+60) return l; } return null; }
  tempAt(x, hour, weather){
    const b = this.biome(x);
    const dayCurve = Math.sin((hour-6)/12*Math.PI); // pico ao meio-dia
    let t = b.temp + dayCurve*6;
    if(weather==='chuva') t-=4; if(weather==='tempestade') t-=6; if(weather==='neblina') t-=2;
    for(const l of this.lava) if(x>=l.x0 && x<=l.x1) t+=15;
    return Math.round(t);
  }
}

// ---------------- Clima ----------------
export const WEATHERS = ['limpo','chuva','neblina','tempestade'];
export class Weather {
  constructor(rng){ this.rng=rng; this.tipo='limpo'; this.timer=120; this.intensidade=0; }
  update(dt){
    this.timer-=dt;
    if(this.timer<=0){ this.timer=90+this.rng()*120; const r=this.rng(); this.tipo = r<0.55?'limpo':(r<0.72?'chuva':(r<0.86?'neblina':'tempestade')); }
    const alvo = this.tipo==='limpo'?0:(this.tipo==='neblina'?0.5:(this.tipo==='chuva'?0.8:1));
    this.intensidade += (alvo-this.intensidade)*dt*0.5;
  }
}
