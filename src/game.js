// ============================================================
// core/ + entities/ + ai/ + survival/ + inventory/ + crafting/
// building/ + taming/ + combat/ — núcleo do jogo 2D.
// JavaScript, canvas 2D pixel art, arquitetura modular por
// eventos (UI atualizada via ui.js).
// ============================================================
import { World, Weather, mulberry32, hashSeed } from './world.js?v=20261126l';
import { AudioSys } from './audio.js?v=20261126l';
import { TopdownMap, MAP_H, TILE } from './topdown.js?v=20261126l';
import { drawPlayer, drawCreature, drawTree, drawRock, drawPlant, drawBuilding, drawPOI, drawCloud, drawShadow, cube, px } from './sprites.js?v=20261126l';
import * as D from './data.js?v=20261126l';
import * as UI from './ui.js?v=20261126l';

const SAVE_KEY = 'arkyt-save-v2';
let _id = 1;

export class Game {
  constructor(canvas){
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.audio = new AudioSys();
    this.keys = {}; this.mouse = {x:0,y:0,down:false};
    this.running = false; this.paused = false; this.dead = false;
    this.camMode = '3P'; // 2D: '3P' = visão afastada, '1P' = visão próxima (zoom)
    this.buildMode = null; this.buildSource = null; this.buildX = 0;
    this.selectedSlot = 0;
    this.time = 0; this.last = 0;
    this.resize();
    window.addEventListener('resize', ()=>this.resize());
    this.bindInput();
  }
  resize(){ this.cv.width = window.innerWidth; this.cv.height = window.innerHeight; }
  zoom(){ return this.camMode==='1P' ? 2.2 : 1; }

  // ---------------- Novo jogo / save ----------------
  newGame(seedStr, char){
    this.keys = {}; this.buildMode = null; this.buildSource = null; this.selectedSlot = 0;
    this.world = new World(seedStr);
    this.map = new TopdownMap(seedStr, this.world);
    this.weather = new Weather(mulberry32(hashSeed(seedStr+'-clima')));
    this.rng = mulberry32(hashSeed(seedStr+'-jogo'));
    this.char = char;
    this.player = {
      x: this.world.spawn.x, y: this.world.spawn.y, mapY: MAP_H/2, vx:0, vy:0, dir:1, z:0, // z = profundidade 2.5D (-1 fundo .. +1 frente)
      onGround:false, swimming:false, climbing:false, riding:null, sleeping:false,
      pose:'parado', walkPhase:0, fallStartY:0, tool:null,
      hunger:100, thirst:100, sleep:100, temp:36.5, pain:0, consciousness:100, breathing:100,
      awakeHours:0, daysWithoutFood:0, hoursWithoutWater:0,
      body:{}, backpack:false, armor:0,
    };
    for(const r of D.BODY_REGIONS) this.player.body[r] = { hp:100, bleeding:0, fracture:false, infection:0, treated:false };
    this.inventory = []; // {item,qtd}
    this.buildings = [];
    this.entities = [];
    this.particles = [];
    this.discovered = new Set();
    this.gameHour = 8; this.day = 1; this.elapsed = 0;
    this.stats = { coletados:0, craftados:0, construídos:0, domesticados:0, abates:0, dist:0 };
    this.addItem('pedra', 3); this.addItem('madeira', 2); this.addItem('fibra', 2);
    this.addItem('fruta', 2); this.addItem('água limpa', 1);
    this.spawnInitial();
    this.dead = false; this.paused = false;
    UI.log('🌅 Bem-vindo ao Mundo Vivo! Sobreviva: coma, beba, durma, trate ferimentos.');
    UI.log('⛏️ Regra de ouro: NUNCA escave a terra. Minere só rochas e cavernas naturais.');
    UI.toast('Use WASD para mover · E para coletar · F para atacar · H para ajuda');
  }
  spawnInitial(){
    for(let i=0;i<26;i++) this.spawnCreatureNear(this.world.spawn.x + (this.rng()-0.5)*3000);
  }
  save(silent){
    if(!this.player) return;
    const data = {
      seed: this.world.seedStr, char: this.char, player: {...this.player, riding:null, body:this.player.body}, ridingId: this.player.riding?.id ?? null,
      inventory: this.inventory, buildings: this.buildings, entities: this.entities.map(e=>({...e})),
      gameHour:this.gameHour, day:this.day, stats:this.stats, discovered:[...this.discovered],
      weather: this.weather.tipo,
      rocks: this.world.rocks, trees: this.world.trees, plants: this.world.plants,
    };
    try{ localStorage.setItem(SAVE_KEY, JSON.stringify(data)); if(!silent){ UI.log('💾 Jogo salvo.'); this.audio.sfx('salvar'); } }catch(e){ if(!silent) UI.log('⚠️ Falha ao salvar.'); }
  }
  load(){
    try{
      const raw = localStorage.getItem(SAVE_KEY); if(!raw) return false;
      const d = JSON.parse(raw);
      this.newGame(d.seed, d.char);
      Object.assign(this.player, d.player);
      this.inventory = d.inventory; this.buildings = d.buildings||[];
      this.entities = d.entities||[]; this.gameHour=d.gameHour; this.day=d.day;
      const ridingId = d.ridingId ?? d.player?.riding?.id;
      this.player.riding = this.entities.find(e=>e.id===ridingId && e.tamed && e.montaria) || null;
      _id = Math.max(_id, ...this.entities.map(e=>Number(e.id)||0), 0)+1;
      this.stats = d.stats||this.stats; this.discovered = new Set(d.discovered||[]);
      if(d.weather) this.weather.tipo = d.weather;
      for(const key of ['rocks','trees','plants']) if(d[key]){
        const generated=this.world[key];
        this.world[key]=d[key].map(o=>({...o,mapY:o.mapY ?? generated.find(g=>g.x===o.x)?.mapY ?? MAP_H/2}));
      }
      this.player.mapY ??= MAP_H/2;
      for(const o of [...this.entities,...this.buildings]) o.mapY ??= MAP_H/2;
      UI.log('↩ Save carregado.'); return true;
    }catch(e){ return false; }
  }
  hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }

  // ---------------- Inventário / peso ----------------
  maxSlots(){ return this.player.backpack ? 36 : 24; }
  addItem(item, qtd=1){
    const def = D.ITEMS[item] || (item.startsWith('minério')||item.startsWith('lingote') ? {peso:0.4,icone:'💎',tipo:'material',desc:item} : null);
    if(!def) return false;
    // item individual acima de 80 kg não pode ser levantado sozinho
    if(def.peso > D.MAX_WEIGHT && !this.canCarryHeavy()){ UI.log(`⚠️ "${item}" (${def.peso} kg) excede 80 kg — use montaria, carroça, barco ou guindaste.`); this.audio.sfx('erro'); return false; }
    const stack = this.inventory.find(s=>s.item===item);
    if(stack) stack.qtd += qtd;
    else { if(this.inventory.length >= this.maxSlots()){ UI.log('🎒 Inventário cheio!'); return false; } this.inventory.push({item, qtd}); }
    this.stats.coletados += qtd;
    return true;
  }
  removeItem(item, qtd=1){
    const s = this.inventory.find(s=>s.item===item); if(!s||s.qtd<qtd) return false;
    s.qtd -= qtd; if(s.qtd<=0) this.inventory = this.inventory.filter(x=>x!==s);
    return true;
  }
  countItem(item){ const s=this.inventory.find(s=>s.item===item); return s?s.qtd:0; }
  totalWeight(){ let w=0; for(const s of this.inventory){ const d=D.ITEMS[s.item]||{peso:0.4}; w += d.peso*s.qtd; } return w; }
  carryCapacity(){
    let cap = D.MAX_WEIGHT;
    if(this.player.riding) cap += this.player.riding.carry||200;
    for(const b of this.buildings) if(b.nome==='carroça' && Math.hypot(b.x-this.player.x,(b.mapY ?? MAP_H/2)-(this.player.mapY ?? MAP_H/2))<120) cap += 400;
    for(const b of this.buildings) if(b.nome==='barco' && Math.hypot(b.x-this.player.x,(b.mapY ?? MAP_H/2)-(this.player.mapY ?? MAP_H/2))<120) cap += 300;
    return cap;
  }
  canCarryHeavy(){
    if(this.player.riding) return true;
    for(const b of this.buildings) if((b.nome==='guindaste simples'||b.nome==='carroça'||b.nome==='barco') && Math.hypot(b.x-this.player.x,(b.mapY ?? MAP_H/2)-(this.player.mapY ?? MAP_H/2))<140) return true;
    return false;
  }
  weightPenalty(){
    const w = this.totalWeight(), cap = this.carryCapacity();
    if(w<=cap) return 1;
    if(w<=cap*1.3) return 0.7;
    return 0.4;
  }

  // ---------------- Input ----------------
  bindInput(){
    window.addEventListener('keydown', e=>{
      if(e.target.tagName==='INPUT') return;
      const k = e.key.toLowerCase();
      this.keys[k] = true;
      if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
      if(!this.running || this.dead) return;
      const anyOpen = UI.anyOpen();
      if(k==='i'){ UI.toggle('inv-overlay'); if(UI.isOpen('inv-overlay')) UI.renderInventory(this); return; }
      if(anyOpen && !['escape','r','b','m','t','c','h'].includes(k)) return; // painéis abertos: ignora ações do jogo
      else if(k==='r') UI.openCraft(this);
      else if(k==='b') UI.openBuild(this);
      else if(k==='m'){ if(UI.isOpen('map-overlay')) UI.closeAll(); else UI.openMap(this); }
      else if(k==='t') UI.openTamed(this);
      else if(k==='c') UI.openBody(this);
      else if(k==='h') UI.toggle('help-overlay');
      else if(k==='v'){ this.camMode = this.camMode==='3P'?'1P':'3P'; UI.log(this.camMode==='1P'?'🔎 Visão aproximada':'🔎 Visão afastada'); }
      else if(k==='escape'){ UI.closeAll(); this.buildMode=null; this.buildSource=null; }
      else if(k==='enter' && this.buildMode) this.confirmBuild();
      else if(k==='e') this.interact();
      else if(k==='f') this.attack();
      else if(k==='q') this.useSelected();
      else if(/^[1-6]$/.test(k)){ this.selectedSlot = parseInt(k)-1; UI.renderHotbar(this); }
    });
    window.addEventListener('keyup', e=>{ this.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', ()=>{ this.keys={}; });
    this.cv.addEventListener('mousedown', e=>{ this.mouse.down=true; if(this.running&&!this.dead&&!this.paused&&!UI.anyOpen()) this.attack(); });
    window.addEventListener('mouseup', ()=>{ this.mouse.down=false; });
    this.cv.addEventListener('mousemove', e=>{ this.mouse.x=e.clientX; this.mouse.y=e.clientY; });
  }

  // ---------------- Loop ----------------
  start(){ this.running=true; this.last=performance.now(); requestAnimationFrame(t=>this.loop(t)); }
  loop(t){
    if(!this.running) return;
    const dt = Math.min(0.05, (t-this.last)/1000); this.last=t;
    if(!this.paused && !this.dead && this.player) this.update(dt);
    this.render();
    UI.updateHUD(this);
    requestAnimationFrame(tt=>this.loop(tt));
  }

  // ---------------- Update ----------------
  update(dt){
    this.time += dt; this.elapsed += dt;
    // relógio: 24h por dia
    const hoursPerSec = 24 / D.DAY_LENGTH;
    this.gameHour += dt*hoursPerSec;
    if(this.gameHour>=24){ this.gameHour-=24; this.day++; UI.log(`🌅 Dia ${this.day} — novo dia no Mundo Vivo.`); }
    this.weather.update(dt);
    const p = this.player;
    if(UI.anyOpen()) this.keys={};
    const biome = this.world.biome(p.x);
    const inWater = this.map.tile(p.x, p.mapY, this.world)==='agua';
    const inCave = this.world.inCave(p.x, p.y);
    this.audio.inCave = inCave;
    // --- movimento ---
    const run = (this.keys['shift']) ? 1.6 : 1;
    const pen = this.weightPenalty();
    const legBroken = p.body['pernas'].fracture && !p.body['pernas'].treated;
    const speed = (p.sleeping?0: (legBroken?40:150) * run * pen * (p.hunger<10?0.6:1) * (p.sleep<15?0.7:1));
    let move = 0;
    if(!p.sleeping && !p.riding){
      if(this.keys['a']||this.keys['arrowleft']) move -= 1;
      if(this.keys['d']||this.keys['arrowright']) move += 1;
      // suporte a controle (gamepad)
      try{
        const gp = navigator.getGamepads && navigator.getGamepads()[0];
        if(gp){ const ax = gp.axes[0]||0; if(ax<-0.3) move=-1; if(ax>0.3) move=1;
          if(gp.buttons[0]&&gp.buttons[0].pressed) this.keys[' ']=true;
          if(gp.buttons[2]&&gp.buttons[2].pressed && !this._gpE){ this._gpE=true; this.interact(); }
          if(!gp.buttons[2]||!gp.buttons[2].pressed) this._gpE=false;
        }
      }catch(e){}
    }
    // Coordenadas reais do chão em duas dimensões; y continua reservado ao
    // terreno antigo para compatibilidade com dados e sistemas de sobrevivência.
    let vertical = 0;
    if(this.keys['w']||this.keys['arrowup']) vertical--;
    if(this.keys['s']||this.keys['arrowdown']) vertical++;
    try { const gp=navigator.getGamepads && navigator.getGamepads()[0]; if(gp && Math.abs(gp.axes[1]||0)>.3) vertical=gp.axes[1]; } catch(e) {}
    if(UI.anyOpen()){ move=0; vertical=0; }
    if(!p.sleeping){
      if(p.riding){
        if(this.keys['a']||this.keys['arrowleft']) move=-1;
        if(this.keys['d']||this.keys['arrowright']) move=1;
      }
      const length=Math.hypot(move,vertical) || 1;
      const walkingSpeed=(p.riding ? p.riding.vel*1.2 : speed) * (inWater && !p.onBoat ? .6 : 1);
      p.x=Math.max(20,Math.min(D.WORLD_W-20,p.x+move/length*walkingSpeed*dt));
      p.mapY=Math.max(20,Math.min(MAP_H-20,(p.mapY ?? MAP_H/2)+vertical/length*walkingSpeed*dt));
      if(move) p.dir=Math.sign(move);
      if(move||vertical){ p.pose=inWater?'nadar':(run>1?'correr':'andar'); p.walkPhase+=dt*9; this.stats.dist+=walkingSpeed*dt; }
      else p.pose='parado';
      if(p.riding){ p.riding.x=p.x; p.riding.mapY=p.mapY; }
    }
    p.swimming=inWater && !p.onBoat; p.climbing=false;
    p.y=this.world.groundY(p.x); p.onGround=true; p.vy=0;
    // ferramenta equipada = primeiro item ferramenta da hotbar selecionada
    p.tool = this.hotbarTool();
    // --- sobrevivência: sono/fome/sede (regras do prompt) ---
    const awake = !p.sleeping;
    if(awake){ p.awakeHours += dt*hoursPerSec; p.sleep = Math.max(0, 100 - p.awakeHours/24*100); }
    else { p.sleep = Math.min(100, p.sleep + dt*8); p.awakeHours=(100-p.sleep)*24/100; if(p.sleep>=100){ p.sleeping=false; p.awakeHours=0; UI.log('☀️ Você acordou revigorado.'); this.audio.sfx('dormir'); } }
    if(p.sleep<=0){ p.consciousness = Math.max(0, p.consciousness - dt*2); if(p.consciousness<=0 && !p.sleeping){ p.sleeping=true; UI.log('😴 Você desmaiou de exaustão!'); } }
    else p.consciousness = Math.min(100, p.consciousness + dt*5);
    // fome: após 5 dias sem comer, risco de morte
    p.hunger = Math.max(0, p.hunger - dt*(100/(5*D.DAY_LENGTH))* (run>1?1.5:1));
    p.daysWithoutFood += dt*hoursPerSec;
    if(p.hunger<=0) p.body['abdômen'].hp -= dt*0.5;
    if(p.daysWithoutFood>=120) this.die('inanição (mais de 5 dias sem comer)');
    // sede: após 48h sem beber, risco de morte
    p.thirst = Math.max(0, p.thirst - dt*(100/(2*D.DAY_LENGTH)) * (biome.temp>30?1.5:1));
    p.hoursWithoutWater += dt*hoursPerSec;
    if(p.thirst<=0) p.consciousness = Math.max(0,p.consciousness-dt*1.5);
    if(p.hoursWithoutWater>=48) this.die('desidratação (mais de 48h sem beber)');
    // temperatura corporal
    const amb = this.world.tempAt(p.x, this.gameHour, this.weather.tipo);
    p.temp += ((amb+11) - p.temp)*dt*0.05; // ambiente frio/esquentando
    if(p.temp<34||p.temp>40) p.body['peito'].hp -= dt*0.3;
    if(this.world.lavaAt(p.x,p.y)) this.damage('peito', 30*dt, 'lava do vulcão');
    // --- ferimentos: sangramento / infecção / dor / respiração ---
    let bleedingTotal = 0;
    for(const r of D.BODY_REGIONS){
      const b = p.body[r];
      if(b.bleeding>0){ bleedingTotal += b.bleeding; b.hp -= b.bleeding*dt*0.8; if(b.bleeding>2 && !b.treated) b.hp -= dt*1; }
      if(b.infection>0){ b.infection = Math.min(100, b.infection+dt*0.5); b.hp -= dt*0.4; }
      if(b.hp<=0 && D.VITAL_REGIONS.includes(r)) this.die(`ferimento fatal no ${r}`);
      if(b.hp<=0) b.hp=0;
    }
    p.pain = Math.min(100, bleedingTotal*10 + (p.body['pernas'].fracture?40:0));
    p.breathing = p.body['peito'].hp<30 ? 50 : 100;
    // recuperação com repouso
    if(p.sleeping) for(const r of D.BODY_REGIONS){ const b=p.body[r]; if(b.hp<100&&b.bleeding===0) b.hp=Math.min(100,b.hp+dt*1.5); }
    // --- entidades ---
    this.updateEntities(dt);
    // --- plantações ---
    for(const b of this.buildings) if(b.crop){ b.crop.progress += dt/b.crop.tempo; if(b.crop.progress>=1) b.crop.ready=true; }
    // --- partículas ---
    for(const pt of this.particles){ pt.x+=pt.vx*dt; pt.y+=pt.vy*dt; pt.life-=dt; }
    this.particles = this.particles.filter(pt=>pt.life>0);
    // --- música dinâmica ---
    const danger = this.entities.some(e=>!e.tamed && e.cat==='agressivo' && Math.hypot(e.x-p.x,(e.mapY ?? MAP_H/2)-(p.mapY ?? MAP_H/2))<300);
    const nearTame = this.entities.some(e=>!e.tamed && Math.hypot(e.x-p.x,(e.mapY ?? MAP_H/2)-(p.mapY ?? MAP_H/2))<120);
    this.audio.update(dt, danger?'combate':(nearTame?'domesticao':'exploracao'));
    if(Math.random()<dt*0.15) this.audio.ambiente(biome.id, this.weather.tipo);
    // autosave silencioso
    if(this.elapsed%30 < dt) this.save(true);
    // modo construção: fantasma segue o jogador
    if(this.buildMode) this.buildX = Math.max(20,Math.min(D.WORLD_W-20,p.x+p.dir*60));
  }
  groundAt(x,y,prevY){
    // chão: superfície, ou piso de caverna, ou ponte/escada/doca
    let g = this.world.groundY(x);
    for(const b of this.buildings){
      if(['ponte','doca','escada','casa','abrigo','torre','posto de observação'].includes(b.nome)){
        if(Math.abs(x-b.x)<50 && prevY <= b.y+10 && y >= b.y-40) g = Math.min(g, b.y-40);
      }
    }
    if(this.world.inCave(x,y)){
      // piso da caverna: base do retângulo
      for(const c of this.world.caves) if(x>c.x-c.w/2&&x<c.x+c.w/2&&y>c.y-c.h/2&&y<c.y+c.h/2) g = Math.max(g, c.y+c.h/2);
    }
    return g;
  }
  nearClimbable(){
    const p=this.player;
    for(const t of this.world.trees) if(Math.abs(t.x-p.x)<30 && Math.abs(t.y-p.y)<90) return true;
    for(const b of this.buildings) if(b.nome==='escada' && Math.abs(b.x-p.x)<40) return true;
    return false;
  }
  hotbarTool(){
    const s = this.inventory[this.selectedSlot];
    if(s && D.ITEMS[s.item] && D.ITEMS[s.item].tipo==='ferramenta') return s.item;
    return null;
  }
  landFall(distPx){
    const meters = distPx / D.TILE;
    if(meters > 4){ // quedas acima de 4 metros
      if(meters > 10){ this.die(`queda fatal de ${meters.toFixed(1)} m`); return; }
      const dmg = (meters-4)*12;
      this.damage(Math.random()<0.5?'pernas':'peito', dmg, `queda de ${meters.toFixed(1)} m`);
      if(Math.random()<0.4){ p_fracture(this.player,'pernas'); UI.log('🦴 Perna quebrada na queda! Use uma tala.'); }
      UI.log(`💥 Queda de ${meters.toFixed(1)} m — contusão grave!`);
      this.audio.sfx('ferimento');
    } else if(meters>1.5){ this.damage('pernas', 4, `queda de ${meters.toFixed(1)} m`); }
  }
  damage(region, amount, cause){
    const p=this.player; if(this.dead) return;
    const b = p.body[region] || p.body['peito'];
    const reduced = amount * (1 - (p.armor||0)/100);
    b.hp -= reduced;
    if(amount>25 && D.VITAL_REGIONS.includes(region) && Math.random()<0.3){ this.die(`golpe fatal no ${region} (${cause})`); return; }
    if(amount>8 && Math.random()<0.5){ b.bleeding = Math.min(5, b.bleeding+1.5); UI.log(`🩸 Sangramento no ${region}! Use bandagem.`); }
    if(amount>15 && Math.random()<0.25){ b.fracture=true; UI.log(`🦴 Fratura no ${region}! Use tala.`); }
    if(amount>5 && Math.random()<0.3){ b.infection = Math.min(100, b.infection+20); }
    this.audio.sfx('ferimento');
    this.burst(p.x, p.y-20, '#c84a3a', 8);
    if(b.hp<=0 && D.VITAL_REGIONS.includes(region)) this.die(`ferimento fatal no ${region} (${cause})`);
  }
  die(cause){
    if(this.dead) return;
    this.dead = true; this.audio.sfx('morte');
    UI.showDeath(this, cause);
  }
  respawn(){
    const p=this.player;
    p.x=this.world.spawn.x; p.y=this.world.spawn.y; p.mapY=MAP_H/2; p.vx=p.vy=0; p.sleeping=false; p.riding=null;
    p.hunger=80; p.thirst=80; p.sleep=80; p.awakeHours=0; p.daysWithoutFood=0; p.hoursWithoutWater=0;
    for(const r of D.BODY_REGIONS) p.body[r]={hp:100,bleeding:0,fracture:false,infection:0,treated:false};
    this.dead=false; UI.hideDeath();
    UI.log('🌅 Você renasceu no acampamento. A sobrevivência continua!');
  }

  // ---------------- Entidades / IA ----------------
  spawnCreatureNear(x){
    x=Math.max(20,Math.min(D.WORLD_W-20,x));
    const biome = this.world.biome(x);
    const pool = [];
    for(const s of [...D.ANIMALS, ...D.DINOSAURS, ...D.MARINE.map(animal=>({...animal,aquatico:true}))]) if(s.biomas.includes(biome.id)) pool.push(s);
    if(!pool.length) return;
    const sp = pool[Math.floor(this.rng()*pool.length)];
    // Cavernas subterrâneas ainda não são jogáveis nesta visão: não
    // teletransportar criaturas para uma caverna escolhida ao acaso.
    const inCave = false;
    let y = sp.aquatico ? D.SEA_Y+30 : this.world.groundY(x);
    const body={}; for(const r of D.BODY_REGIONS) body[r]=sp.hp;
    this.entities.push({
      id:_id++, nome:sp.nome, cat:sp.cat||'pacifico', dieta:sp.dieta, tam:sp.tam, hp:sp.hp, maxHp:sp.hp,
      vel:sp.vel, dano:sp.dano, fav:sp.fav, cor:sp.cor, biomas:sp.biomas,
      aquatico:!!sp.aquatico, voador:!!sp.voador, veneno:!!sp.veneno, grupo:!!sp.grupo,
      montaria:!!sp.montaria, dificuldade:sp.dificuldade||0.5,
      x, y, mapY: Math.max(30, Math.min(MAP_H-30, (this.player.mapY || MAP_H/2) + (this.rng()-.5)*1000)), vx:0, vy:0, dir:this.rng()<0.5?-1:1, walkPhase:this.rng()*6, z:(this.rng()*2-1),
      estado:'vagar', timer:this.rng()*4, tamed:false, bond:0, comando:'seguir',
      sela:false, arreio:false, equip:false, carry:200, filhote:false, alvo:null, body, caverna:inCave,
    });
  }
  updateEntities(dt){
    const p=this.player;
    // manter população
    if(this.entities.length<30 && Math.random()<dt*0.5) this.spawnCreatureNear(p.x+(this.rng()-0.5)*1600);
    const births = [];
    this.entities = this.entities.filter(e=>{
      const dist = Math.hypot(e.x-p.x, (e.mapY ?? MAP_H/2)-(p.mapY ?? MAP_H/2));
      if(dist>2600 && !e.tamed) return false; // streaming por regiões (domados nunca somem)
      e.timer -= dt; e.walkPhase += dt*6;
      const speed = e.vel * (e.filhote?0.5:1);
      const ground = e.aquatico ? D.SEA_Y+40 : this.world.groundY(e.x);
      // --- estados da máquina de estados (pacífico/neutro/agressivo/fuga/caça/domesticação/montaria) ---
      if(e.tamed){
        e.estado = this.tamedAI(e, dt, speed, births);
      } else if(e.cat==='pacifico'){
        if(dist<180 && !p.sleeping){ e.estado='fugir'; e.dir = e.x<p.x?-1:1; }
        else if(e.timer<=0){ e.estado = Math.random()<0.3?'dormir':'vagar'; e.timer=3+Math.random()*5; e.dir=Math.random()<0.5?-1:1; }
      } else if(e.cat==='neutro'){
        const provoked = e.hp<e.maxHp || dist<60;
        if(provoked){ e.estado='atacar'; }
        else if(e.timer<=0){ e.estado='vagar'; e.timer=3+Math.random()*5; e.dir=Math.random()<0.5?-1:1; }
      } else { // agressivo
        if(dist<420){ e.estado='caçar'; }
        else if(e.timer<=0){ e.estado='vagar'; e.timer=3+Math.random()*5; e.dir=Math.random()<0.5?-1:1; }
      }
      // Movimentação de animais selvagens em direção ao jogador ou para longe.
      // Animais domesticados já são movimentados por tamedAI.
      if(!e.tamed && (e.estado==='fugir'||e.estado==='caçar'||e.estado==='atacar')){
        const dx=p.x-e.x, dy=(p.mapY ?? MAP_H/2)-(e.mapY ?? MAP_H/2);
        const length=Math.hypot(dx,dy)||1, sign=e.estado==='fugir'?-1:1;
        e.dir=Math.sign(dx)*sign || e.dir;
        e.x += dx/length*speed*sign*dt;
        e.mapY=(e.mapY ?? MAP_H/2)+dy/length*speed*sign*dt;
        if(sign>0 && dist<50 && Math.random()<dt*1.2) this.creatureHitPlayer(e);
      } else if(!e.tamed && e.estado==='vagar'){
        e.x += e.dir*speed*0.4*dt;
        e.mapY=(e.mapY ?? MAP_H/2)+Math.sin(e.id+this.time*.4)*speed*.25*dt;
      }
      e.x=Math.max(20,Math.min(D.WORLD_W-20,e.x));
      if(e.voador) e.y = ground - 60 + Math.sin(this.time*2+e.id)*10;
      else if(e.aquatico) e.y = D.SEA_Y+30+Math.sin(this.time*1.5+e.id)*8;
      else if(e.caverna){ const c=this.world.caves.find(c=>e.x>c.x-c.w/2&&e.x<c.x+c.w/2); e.y = c ? c.y+c.h/2 : ground; }
      else e.y = ground;
      e.mapY=Math.max(20,Math.min(MAP_H-20,e.mapY ?? MAP_H/2));
      // grupo caça em bando
      if(e.grupo && e.estado==='caçar'){ for(const o of this.entities) if(o!==e&&o.nome===e.nome&&Math.abs(o.x-e.x)<200) o.x += (e.x-o.x)*dt*0.5; }
      // veneno de serpente
      if(!e.tamed && e.veneno && dist<50 && Math.random()<dt*0.5){ p.body['braços'].infection=Math.min(100,p.body['braços'].infection+30); UI.log('🐍 Picada venenosa! Use remédio.'); }
      // morte natural / abate
      if(e.hp<=0){ this.killCreature(e); return false; }
      return true;
    });
    this.entities.push(...births);
  }
  tamedAI(e, dt, speed, births){
    const p=this.player;
    // reprodução: dois domesticados da mesma espécie próximos geram filhote
    if(!e.filhote && Math.random()<dt*0.01){
      const mate = this.entities.find(o=>o!==e&&o.tamed&&o.nome===e.nome&&!o.filhote&&Math.hypot(o.x-e.x,(o.mapY ?? MAP_H/2)-(e.mapY ?? MAP_H/2))<120);
      if(mate){
        const body={}; for(const r of D.BODY_REGIONS) body[r]=Math.round(e.maxHp*0.4);
        births.push({...e, id:_id++, x:(e.x+mate.x)/2, mapY:((e.mapY ?? MAP_H/2)+(mate.mapY ?? MAP_H/2))/2, hp:Math.round(e.maxHp*0.4), maxHp:Math.round(e.maxHp*0.4), filhote:true, bond:80, body});
        UI.log(`🐣 ${e.nome} reproduziu! Um filhote nasceu e já segue você. Cuide dele!`);
        this.audio.sfx('descoberta');
      }
    }
    // encontrar recursos: domado "carregar" coleta plantas próximas para você
    if(e.comando==='carregar' && Math.random()<dt*0.2){
      const pl = this.world.plants.find(pl=>Math.hypot(pl.x-e.x,(pl.mapY ?? MAP_H/2)-(e.mapY ?? MAP_H/2))<200);
      if(pl){ const map={'fibra':'fibra','capim':'capim','fruta':'fruta','cogumelo':'cogumelo','planta medicinal':'planta medicinal','mel':'mel','semente':'semente','folha':'folha','tronco caído':'madeira','pedra do chão':'pedra'}; if(this.addItem(map[pl.tipo]||'fibra',1)){ this.world.plants=this.world.plants.filter(x=>x!==pl); UI.log(`🧺 ${e.nome} encontrou ${pl.tipo} para você.`); } }
    }
    if(e===p.riding) return 'montado';
    if(e.comando==='ficar') return 'dormir';
    let targetX=p.x, targetY=p.mapY ?? MAP_H/2;
    if(e.comando==='retornar'){targetX=this.world.spawn.x; targetY=MAP_H/2;}
    if(e.comando==='proteger'||e.comando==='atacar'){
      const threat=this.entities.find(o=>!o.tamed && o.cat==='agressivo' && Math.hypot(o.x-p.x,(o.mapY ?? MAP_H/2)-targetY)<400);
      if(threat){ targetX=threat.x; targetY=threat.mapY ?? MAP_H/2;
        if(Math.hypot(targetX-e.x,targetY-(e.mapY ?? MAP_H/2))<50) threat.hp-=e.dano*dt*2;
      }
    }
    const dx=targetX-e.x, dy=targetY-(e.mapY ?? MAP_H/2), distance=Math.hypot(dx,dy);
    if(distance>45){ const step=Math.min(distance-45,speed*.8*dt); e.x+=dx/distance*step; e.mapY=(e.mapY ?? MAP_H/2)+dy/distance*step; e.dir=Math.sign(dx)||e.dir; }
    return distance>45?'vagar':'parado';
  }

  creatureHitPlayer(e){
    const region = D.BODY_REGIONS[Math.floor(Math.random()*6)]; // cabeça..mãos
    this.damage(region, e.dano, `ataque de ${e.nome}`);
  }
  killCreature(e){
    this.stats.abates++;
    this.burst(e.x, e.y-10, e.cor, 14);
    // loot: couro, carne, ossos, penas
    if(e.dieta==='carnivoro'||e.dieta==='onivoro'){ this.addItem('carne crua', 2); }
    this.addItem('couro', 1); this.addItem('osso', 1);
    if(e.nome==='galinha'||e.nome==='pato') this.addItem('pena', 2);
    UI.log(`☠ ${e.nome} abatido. Couro, carne e ossos coletados.`);
    this.audio.sfx('golpe');
  }

  // ---------------- Interação (E) ----------------
  nearest(list, maxD=80){ let best=null,bd=maxD; for(const o of list){ const d=Math.hypot(o.x-this.player.x,(o.mapY ?? MAP_H/2)-(this.player.mapY ?? MAP_H/2)); if(d<bd){bd=d;best=o;} } return best; }
  interact(){
    const p=this.player;
    if(p.sleeping){ p.sleeping=false; UI.log('☀️ Você acordou.'); return; }
    if(p.onBoat){ p.onBoat=false; UI.log('⛵ Desembarcou.'); return; }
    if(p.riding){ const m=p.riding; p.riding=null; p.y=this.world.groundY(p.x); UI.log(`🐎 Você desmontou de ${m.nome}.`); return; }
    // 1) criatura: alimentar/domesticar/montar
    const cr = this.nearest(this.entities, 90);
    if(cr){
      if(cr.tamed){
        if(cr.montaria && cr.sela){ p.riding=cr; UI.log(`🐎 Montando ${cr.nome}! WASD para mover, E para desmontar.`); return; }
        if(cr.montaria && !cr.sela){ UI.log(`🐎 ${cr.nome} precisa de sela. Equipe pelo inventário.`); return; }
        UI.log(`🐾 ${cr.nome} (vínculo ${Math.round(cr.bond)}). Comandos no painel [T].`); return;
      }
      // alimentar com favorito
      const favItem = cr.fav;
      if(this.countItem(favItem)>0){
        this.removeItem(favItem,1);
        const gain = 25*(1-cr.dificuldade*0.5);
        cr.bond = Math.min(100, cr.bond+gain);
        cr.hp = Math.min(cr.maxHp, cr.hp+10);
        this.audio.sfx('domesticar');
        this.burst(cr.x, cr.y-20, '#e84a6a', 8);
        if(cr.bond>=100){
          cr.tamed=true; cr.comando='seguir'; this.stats.domesticados++;
          UI.log(`💖 ${cr.nome} DOMESTICADO! Comandos: seguir, ficar, proteger, atacar, carregar, retornar [T].`);
          this.audio.sfx('descoberta');
        } else UI.log(`🐾 ${cr.nome}: vínculo ${Math.round(cr.bond)}%. Continue alimentando com ${favItem} (aproxime-se devagar!).`);
        return;
      }
      UI.log(`🐾 ${cr.nome} (${cr.cat}) — alimento favorito: ${favItem}. Aproxime-se devagar, sem correr.`);
      return;
    }
    // 2) rocha: minerar (só com picareta) — nunca escavar terra
    const rock = this.nearest(this.world.rocks, 80);
    if(rock){
      if(p.tool!=='picareta'){ UI.log('⛏️ Use a picareta para quebrar rochas (craft: madeira+pedra+fibra).'); this.audio.sfx('erro'); return; }
      rock.hp--; this.audio.sfx('golpe'); this.burst(rock.x, rock.y-10, '#9a9aa2', 6);
      if(rock.hp<=0){
        const oreItem = 'minério de '+rock.ore;
        if(!D.ITEMS[oreItem]) D.ITEMS[oreItem]={peso:0.4,icone:'💎',tipo:'material',desc:`Minério real: ${rock.ore}. Fundir na fornalha.`};
        this.addItem(oreItem, 2); this.addItem('pedra', 2);
        UI.log(`⛏️ Rocha quebrada: 2× ${oreItem} + 2× pedra.`);
        this.world.rocks = this.world.rocks.filter(r=>r!==rock);
      } else UI.log(`⛏️ Rocha (${rock.ore}) — mais ${rock.hp} golpes.`);
      return;
    }
    // 3) árvore: derrubar (só com machado)
    const tree = this.nearest(this.world.trees, 80);
    if(tree){
      if(p.tool!=='machado simples'){ UI.log('🪓 Use o machado simples para derrubar árvores (madeira+pedra+fibra).'); this.audio.sfx('erro'); return; }
      tree.hp--; this.audio.sfx('golpe'); this.burst(tree.x, tree.y-40, '#3a9a4a', 6);
      if(tree.hp<=0){ this.addItem('madeira', 4); this.addItem('fibra', 2); UI.log('🪓 Árvore derrubada: 4× madeira, 2× fibra.'); this.world.trees=this.world.trees.filter(t=>t!==tree); }
      return;
    }
    // 4) planta / recurso do chão
    const plant = this.nearest(this.world.plants, 70);
    if(plant){
      const map = { 'fibra':'fibra','capim':'capim','fruta':'fruta','cogumelo':'cogumelo','planta medicinal':'planta medicinal','mel':'mel','semente':'semente','folha':'folha','tronco caído':'madeira','pedra do chão':'pedra' };
      const item = map[plant.tipo]||'fibra';
      if(this.addItem(item, plant.tipo==='tronco caído'?3:1)){ this.audio.sfx('coletar'); this.burst(plant.x, plant.y-10, '#4aa85a', 5); this.world.plants=this.world.plants.filter(x=>x!==plant); }
      return;
    }
    // 5) construções: dormir, cozinhar, horta, barco, baú
    const b = this.nearest(this.buildings, 90);
    if(b){
      if(b.nome==='cama'||b.nome==='abrigo'||b.nome==='casa'){ p.sleeping=true; p.y=b.y-6; UI.log('😴 Dormindo... (sono restaurando)'); this.audio.sfx('dormir'); return; }
      if(['fogueira','bancada','fornalha'].includes(b.nome)){ UI.openCraft(this); return; }
      if(b.nome==='horta (canteiro)'){
        if(b.crop && b.crop.ready){ const prod=D.CROP_DATA[b.crop.nome].produto; if(this.addItem(prod,3)){ UI.log(`🌱 Colheita: 3× ${prod} (${b.crop.nome}).`); b.crop=null; } }
        else if(!b.crop){ const nome='milho'; b.crop={nome, progress:0, tempo:D.CROP_DATA[nome].tempo, ready:false}; UI.log(`🌱 Plantado: ${nome}. Regue com tempo e colha com E.`); }
        else UI.log(`🌱 ${b.crop.nome} crescendo... ${Math.round(b.crop.progress*100)}%`);
        return;
      }
      if(b.nome==='barco'){ p.onBoat=true; p.y=D.SEA_Y; UI.log('⛵ Navegando! WASD para velejar, E para desembarcar.'); return; }
      if(b.nome==='armazém'){ UI.log('📦 Armazém: seus itens estão seguros aqui.'); return; }
      if(b.nome==='armadilha'){ UI.log('🪤 Armadilha não letal armada — animais pacíficos podem ser capturados.'); return; }
      UI.log(`🏠 ${b.nome} — ${D.BUILDINGS.find(x=>x.nome===b.nome)?.desc||''}`); return;
    }
    if(p.onBoat){ p.onBoat=false; p.y=this.world.groundY(p.x); UI.log('⛵ Desembarcou.'); return; }
    // 6) pescar / beber na água
    const w = this.map.tile(p.x, p.mapY, this.world)==='agua';
    if(w){
      if(Math.random()<0.5){ if(this.addItem('peixe cru',1)){ UI.log('🎣 Você pescou um peixe cru!'); this.audio.sfx('coletar'); } }
      else { if(this.addItem('água suja',1)){ UI.log('💧 Você encheu água suja — purifique na fogueira.'); this.audio.sfx('beber'); } }
      return;
    }
    // 7) ponto de interesse: descoberta
    const poi = this.nearest(this.world.pois, 90);
    if(poi && !this.discovered.has(poi.tipo+poi.x)){
      this.discovered.add(poi.tipo+poi.x);
      UI.log(`🗺️ Descoberta: ${poi.nome}!`); this.audio.sfx('descoberta');
      return;
    }
    // 8) usar item selecionado (comer/beber/tratar)
    this.useSelected();
  }
  useSelected(){
    const p=this.player;
    const s = this.inventory[this.selectedSlot];
    if(!s){ UI.log('🎒 Hotbar vazia — selecione um item (teclas 1-6).'); return; }
    const item=s.item, def=D.ITEMS[item]||{tipo:'material'};
    if(def.tipo==='comida'){
      if(item==='carne crua'||item==='peixe cru'){ UI.log('⚠️ Comer cru causa doença! Cozinhe na fogueira.'); this.audio.sfx('erro'); return; }
      p.daysWithoutFood=0;
      if(item==='cogumelo'&&Math.random()<0.4){ p.body['abdômen'].infection=60; UI.log('🤢 Cogumelo venenoso! Infecção. Use remédio.'); }
      p.hunger=Math.min(100,p.hunger+35); this.removeItem(item,1); this.audio.sfx('comer'); UI.log(`🍖 Você comeu ${item}. Fome restaurada.`);
    } else if(def.tipo==='bebida'){
      p.hoursWithoutWater=0;
      if(item==='água suja'){ p.body['abdômen'].infection=Math.min(100,p.body['abdômen'].infection+40); UI.log('🤢 Água contaminada! Infecção. Purifique na fogueira.'); }
      p.thirst=Math.min(100,p.thirst+50); this.removeItem(item,1); this.audio.sfx('beber'); UI.log(`💧 Você bebeu ${item}. Sede restaurada.`);
    } else if(def.tipo==='tratamento'){ this.treat(item); }
    else if(def.tipo==='estrutura' && ['fogueira','bancada','fornalha','cama','barco'].includes(item)){ this.startBuildFromItem(item); }
    else if(item==='mochila'){ p.backpack=true; this.removeItem(item,1); UI.log('🎒 Mochila equipada: +12 slots!'); }
    else if(item==='sela'||item==='arreio'||item==='armadura leve'||item==='equipamento de carga'){
      const cr = this.nearest(this.entities.filter(e=>e.tamed), 100);
      if(cr){ if(item==='sela') cr.sela=true; if(item==='arreio') cr.arreio=true; if(item==='armadura leve'){ cr.equip=true; cr.maxHp+=50; } if(item==='equipamento de carga') cr.carry=400;
        this.removeItem(item,1); UI.log(`🐎 ${item} equipado em ${cr.nome}.`); this.audio.sfx('craft'); }
      else UI.log('🐎 Aproxime-se de um animal domesticado para equipar.');
    }
    else UI.log(`ℹ️ ${item} — ${def.desc||''}`);
  }
  treat(item){
    const p=this.player;
    const target = D.BODY_REGIONS.find(r=>{ const b=p.body[r]; return (item==='bandagem'&&b.bleeding>0)||(item==='torniquete'&&b.bleeding>2)||(item==='tala'&&b.fracture)||(item==='remédio'&&b.infection>0); });
    if(!target){ UI.log(`🩹 ${item}: nenhum ferimento compatível agora.`); return; }
    const b=p.body[target];
    if(item==='bandagem'){ b.bleeding=0; b.treated=true; }
    if(item==='torniquete'){ b.bleeding=0; b.treated=true; b.hp=Math.min(100,b.hp+10); }
    if(item==='tala'){ b.fracture=false; b.treated=true; }
    if(item==='remédio'){ b.infection=0; b.treated=true; }
    this.removeItem(item,1); this.audio.sfx('tratar');
    UI.log(`🩹 ${item} aplicado no ${target}. Repouso acelera a recuperação.`);
  }

  // ---------------- Combate (F) ----------------
  attack(){
    const p=this.player; if(p.sleeping||p.riding) return;
    p.pose='atacar'; p.walkPhase+=4;
    this.audio.sfx('atacar');
    const tool = p.tool;
    const dmg = tool==='lança'?22:(tool==='arco'?18:(tool==='machado simples'?12:(tool==='picareta'?10:6)));
    const range = tool==='lança'?90:(tool==='arco'?400:60);
    // arco: projétil
    if(tool==='arco'){
      if(this.countItem('flecha')<=0){ UI.log('🏹 Sem flechas! Crafte flechas (madeira+pedra).'); return; }
      this.removeItem('flecha',1);
      const t = this.nearest(this.entities, range);
      if(t){ this.hitCreature(t, dmg, 'flecha'); }
      return;
    }
    const t = this.nearest(this.entities, range);
    if(t){ this.hitCreature(t, dmg, tool||'mão'); }
    else {
      // golpear rocha/árvore também funciona com F
      const rock=this.nearest(this.world.rocks,70); if(rock&&p.tool==='picareta'){ this.interact(); return; }
      const tree=this.nearest(this.world.trees,70); if(tree&&p.tool==='machado simples'){ this.interact(); return; }
    }
  }
  hitCreature(e, dmg, weapon){
    e.hp -= dmg;
    const region = D.BODY_REGIONS[Math.floor(Math.random()*6)];
    this.burst(e.x, e.y-14, '#c84a3a', 6);
    this.audio.sfx('golpe');
    if(e.cat==='neutro'&&!e.tamed) UI.log(`😤 ${e.nome} foi provocado!`);
    if(e.hp<=0){ this.killCreature(e); this.entities=this.entities.filter(x=>x!==e); }
    else UI.log(`⚔️ ${weapon} acertou ${e.nome} no ${region} (${dmg} dano).`);
  }

  // ---------------- Crafting ----------------
  nearestStation(){
    const p=this.player;
    for(const b of this.buildings) if(Math.hypot(b.x-p.x,(b.mapY ?? MAP_H/2)-(p.mapY ?? MAP_H/2))<110){
      if(b.nome==='fogueira') return 'fogueira';
      if(b.nome==='bancada') return 'bancada';
      if(b.nome==='fornalha') return 'fornalha';
    }
    return 'mão';
  }
  hasStation(station){
    if(station==='mão') return true;
    return this.buildings.some(b=>b.nome===station && Math.hypot(b.x-this.player.x,(b.mapY ?? MAP_H/2)-(this.player.mapY ?? MAP_H/2))<110);
  }
  canCraft(recipe){
    for(const [k,v] of Object.entries(recipe.custo)) if(this.countItem(k)<v) return false;
    return true;
  }
  craft(recipe){
    if(!this.canCraft(recipe)){ UI.log('❌ Materiais insuficientes.'); this.audio.sfx('erro'); return; }
    if(!this.hasStation(recipe.estacao)){ UI.log('❌ Aproxime-se da estação necessária.'); return; }
    const freed=Object.entries(recipe.custo).filter(([k,v])=>this.countItem(k)===v).length;
    const hasOutput=this.countItem(recipe.out)>0 && !(recipe.custo[recipe.out] && this.countItem(recipe.out)===recipe.custo[recipe.out]);
    if(!hasOutput && this.inventory.length-freed>=this.maxSlots()){ UI.log('🎒 Inventário cheio!'); return; }
    const outputDef=D.ITEMS[recipe.out];
    if(outputDef && outputDef.peso>D.MAX_WEIGHT && !this.canCarryHeavy()){ UI.log('⚠️ Item pesado demais para carregar.'); return; }
    for(const [k,v] of Object.entries(recipe.custo)) this.removeItem(k,v);
    if(!D.ITEMS[recipe.out] && (recipe.out.startsWith('lingote'))) D.ITEMS[recipe.out]={peso:0.5,icone:'🔩',tipo:'material',desc:recipe.out};
    this.addItem(recipe.out, recipe.qtd);
    this.stats.craftados++;
    this.audio.sfx('craft');
    UI.log(`🔨 Craftado: ${recipe.qtd}× ${recipe.out} (${recipe.desc})`);
  }

  // ---------------- Construção ----------------
  startBuild(nome){
    const def = D.BUILDINGS.find(b=>b.nome===nome);
    if(!def) return;
    for(const [k,v] of Object.entries(def.custo)) if(this.countItem(k)<v){ UI.log(`❌ ${nome}: faltam ${k} (${this.countItem(k)}/${v}).`); this.audio.sfx('erro'); return; }
    this.buildMode = nome; this.buildSource='materiais'; this.buildX=Math.max(20,Math.min(D.WORLD_W-20,this.player.x+this.player.dir*60)); UI.closeAll();
    UI.log(`🏠 Posicionando ${nome} — Enter para confirmar, Esc para cancelar.`);
  }
  startBuildFromItem(nome){
    if(!['fogueira','bancada','fornalha','cama','barco'].includes(nome) || this.countItem(nome)<1) return;
    this.buildMode=nome; this.buildSource='item';
    this.buildX=Math.max(20,Math.min(D.WORLD_W-20,this.player.x+this.player.dir*60));
    UI.closeAll();
    UI.log(`🏠 Posicionando ${nome} do inventário — Enter confirma, Esc cancela.`);
  }
  confirmBuild(){
    const nome=this.buildMode; const def=D.BUILDINGS.find(b=>b.nome===nome);
    if(this.buildSource==='item'){
      if(!this.removeItem(nome,1)){ UI.log('❌ O item não está mais no inventário.'); return; }
    } else {
      if(!def || Object.entries(def.custo).some(([k,v])=>this.countItem(k)<v)){ UI.log('❌ Materiais insuficientes para construir.'); return; }
      for(const [k,v] of Object.entries(def.custo)) this.removeItem(k,v);
    }
    const y = this.world.groundY(this.buildX);
    this.buildings.push({nome, x:this.buildX, y, mapY:this.player.mapY ?? MAP_H/2, crop:null});
    this.stats.construídos++;
    this.audio.sfx('construir');
    UI.log(`🏠 ${nome} construído na superfície (sem deformar o terreno).`);
    this.buildMode=null; this.buildSource=null;
  }

  burst(x,y,cor,n=8){ for(let i=0;i<n;i++) this.particles.push({x,y,vx:(Math.random()-0.5)*160,vy:-Math.random()*160,life:0.6,cor}); }

  // ---------------- Render ----------------
  render(){
    const ctx=this.ctx, cv=this.cv, p=this.player;
    ctx.fillStyle='#253b29'; ctx.fillRect(0,0,cv.width,cv.height);
    if(!p) return;
    const zoom=this.camMode==='1P'?1.8:1.25;
    const cy=p.mapY ?? MAP_H/2, left=p.x-cv.width/(2*zoom), top=cy-cv.height/(2*zoom);
    const right=left+cv.width/zoom, bottom=top+cv.height/zoom;
    ctx.save(); ctx.imageSmoothingEnabled=false; ctx.scale(zoom,zoom); ctx.translate(-left,-top);
    // A grama é uma superfície única, não uma grade de retângulos.
    ctx.fillStyle='#7bb959'; ctx.fillRect(left-2,top-2,right-left+4,bottom-top+4);
    for(let y=Math.floor(top/TILE)*TILE; y<bottom+TILE; y+=TILE){
      for(let x=Math.floor(left/TILE)*TILE; x<right+TILE; x+=TILE){
        // A pequena sobreposição impede linhas transparentes com zoom fracionário.
        if(x<0||x>=D.WORLD_W||y<0||y>=MAP_H){ctx.fillStyle='#304d33';ctx.fillRect(x,y,TILE+1,TILE+1);continue;}
        const type=this.map.tile(x,y,this.world);
        if(type!=='grama'){ ctx.fillStyle=this.map.color(x,y,this.world); ctx.fillRect(x,y,TILE+1,TILE+1); }
        const tx=Math.floor(x/TILE), ty=Math.floor(y/TILE);
        const n=this.map.noise(tx,ty), nx=3+Math.floor(this.map.noise(tx+31,ty+57)*23), ny=3+Math.floor(this.map.noise(tx+79,ty+19)*23);
        // Marcas pequenas e irregulares dão textura sem revelar a grade.
        if(type==='grama' && n>.55){ctx.fillStyle=n>.83?'#95c771':'#70ad51';ctx.fillRect(x+nx,y+ny,2,3);ctx.fillRect(x+nx+3,y+ny-1,2,2);}
        if(type==='agua' && n>.58){ctx.fillStyle='#8ed4dd';ctx.fillRect(x+nx,y+ny,6,2);}
        if(type==='caminho' && n>.6){ctx.fillStyle='#bf9a65';ctx.fillRect(x+nx,y+ny,3,2);}
      }
    }
    const objects=[];
    const add=(list,draw)=>{for(const o of list){const y=o.mapY ?? MAP_H/2; if(o.x<left-100||o.x>right+100||y<top-120||y>bottom+120) continue; objects.push({y,draw:()=>draw({...o,y})});}};
    add(this.world.plants,o=>drawPlant(ctx,o,this.time));
    add(this.world.trees,o=>drawTree(ctx,o));
    add(this.world.rocks,o=>{o.cor=D.ORE_COR[o.ore];drawRock(ctx,o);});
    add(this.world.pois,o=>drawPOI(ctx,o));
    add(this.buildings,o=>drawBuilding(ctx,o,this.time));
    add(this.entities,o=>{drawShadow(ctx,o.x,o.y,15);drawCreature(ctx,o);});
    objects.push({y:cy,draw:()=>{drawShadow(ctx,p.x,cy,14); drawPlayer(ctx,{...p,y:cy,skin:this.char.skin,hair:this.char.hair,hairStyle:this.char.hairStyle,beard:this.char.beard,shirt:this.char.shirt,pants:'#4a3a2e',swim:p.swimming});}});
    objects.sort((a,b)=>a.y-b.y); for(const item of objects) item.draw();
    if(this.buildMode){ctx.globalAlpha=.6;drawBuilding(ctx,{nome:this.buildMode,x:this.buildX,y:cy},this.time);ctx.globalAlpha=1;}
    ctx.restore();
    const night=Math.max(0,1-Math.max(0,Math.sin((this.gameHour-6)/12*Math.PI)));
    if(night){ctx.fillStyle=`rgba(16,25,60,${night*.35})`;ctx.fillRect(0,0,cv.width,cv.height);}
    if(this.weather.tipo==='chuva'||this.weather.tipo==='tempestade') {ctx.fillStyle='rgba(200,225,255,.5)';for(let i=0;i<75;i++){const x=(i*107+this.time*120)%cv.width,y=(i*71+this.time*260)%cv.height;ctx.fillRect(x,y,2,9);}}
    if(p.sleeping){ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,0,cv.width,cv.height);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='20px monospace';ctx.fillText('Dormindo...',cv.width/2,cv.height/2);}
  }

}
function p_fracture(p, region){ p.body[region].fracture = true; }
