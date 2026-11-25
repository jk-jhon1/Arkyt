// ============================================================
// ui/ — HUD pixelizado, inventário, peso, estado físico,
// fome/sede/sono/temperatura, mapa, bússola, livro de receitas,
// lista de domados. Sem lógica de jogo acoplada (eventos).
// ============================================================
import * as D from './data.js';
import { WORLD_W, SEA_Y } from './data.js';

const $ = id => document.getElementById(id);
const OVERLAYS = ['inv-overlay','craft-overlay','build-overlay','map-overlay','tamed-overlay','body-overlay','help-overlay'];
let craftTab = 'todas';

export function log(msg){
  const el = $('msg-log'); if(!el) return;
  const d = document.createElement('div'); d.textContent = msg;
  el.prepend(d);
  while(el.children.length>6) el.lastChild.remove();
  setTimeout(()=>{ if(d.parentNode) d.remove(); }, 9000);
}
export function toast(msg){ const t=$('toast'); t.textContent=msg; t.classList.remove('hidden'); setTimeout(()=>t.classList.add('hidden'),3500); }
export function closeAll(){ for(const id of OVERLAYS) $(id).classList.add('hidden'); }
export function toggle(id){ const el=$(id); const was=el.classList.contains('hidden'); closeAll(); if(was) el.classList.remove('hidden'); }

export function updateHUD(g){
  if(!g.player) return;
  const p=g.player;
  const hpAvg = D.BODY_REGIONS.reduce((s,r)=>s+p.body[r].hp,0)/D.BODY_REGIONS.length;
  $('hp-fill').style.width = hpAvg+'%'; $('hp-txt').textContent = Math.round(hpAvg)+'%';
  $('hunger-fill').style.width = p.hunger+'%'; $('hunger-txt').textContent = Math.round(p.hunger)+'%';
  $('thirst-fill').style.width = p.thirst+'%'; $('thirst-txt').textContent = Math.round(p.thirst)+'%';
  $('sleep-fill').style.width = p.sleep+'%'; $('sleep-txt').textContent = Math.round(p.sleep)+'%';
  const tempPct = Math.max(0,Math.min(100,(p.temp+10)/60*100));
  $('temp-fill').style.width = tempPct+'%'; $('temp-txt').textContent = p.temp.toFixed(1)+'°C';
  const w=g.totalWeight(), cap=g.carryCapacity();
  $('weight-fill').style.width = Math.min(100,w/cap*100)+'%';
  $('weight-txt').textContent = w.toFixed(1)+' / '+cap+' kg';
  const hh=Math.floor(g.gameHour), mm=Math.floor((g.gameHour-hh)*60);
  $('clock').textContent = `☀️ Dia ${g.day} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · ${g.weather.tipo}`;
  $('clock2').innerHTML = `Seed: <b>${g.world.seedStr}</b><br>Pos: ${Math.round(p.x)} m<br>Entidades: ${g.entities.length} · Domados: ${g.entities.filter(e=>e.tamed).length}`;
  $('seed-label').textContent = `Bioma: ${g.world.biome(p.x).nome}`;
  $('biome-label').textContent = `📍 ${g.world.biome(p.x).nome} · ${g.world.tempAt(p.x,g.gameHour,g.weather.tipo)}°C`;
  $('cam-label').textContent = g.camMode==='1P' ? '🎥 1ª pessoa (2D zoom próximo) [V]' : '🎥 3ª pessoa (2D visão afastada) [V]';
  // bússola
  const strip=$('compass-strip');
  const pts=['N','NE','L','SE','S','SO','O','NO'];
  let s=''; for(let i=0;i<16;i++){ const wx=p.x+i*100-800; const b=g.world.biome(wx); s+=` ${pts[Math.floor(i/2)%8]} ${b.nome.slice(0,4)} ·`; }
  strip.textContent=s; strip.style.left = (-((p.x%800)))+'px';
  // ícones de status
  const st=[];
  for(const r of D.BODY_REGIONS){ const b=p.body[r]; if(b.bleeding>0) st.push(`🩸${r}`); if(b.fracture) st.push(`🦴${r}`); if(b.infection>20) st.push(`🤢${r}`); }
  if(p.hunger<20) st.push('🍖FOME!'); if(p.thirst<20) st.push('💧SEDE!'); if(p.sleep<20) st.push('😴SONO!');
  if(p.temp<35) st.push('🥶Frio'); if(p.temp>38.5) st.push('🥵Calor');
  if(p.riding) st.push(`🐎Montado: ${p.riding.nome}`); if(p.onBoat) st.push('⛵Barco');
  if(p.swimming) st.push('🏊Nadando'); if(p.climbing) st.push('🧗Escalando');
  $('status-icons').textContent = st.join(' ');
  renderHotbar(g);
}

export function renderHotbar(g){
  const hb=$('hotbar'); if(!hb||!g.player) return;
  hb.classList.remove('hidden');
  hb.innerHTML='';
  for(let i=0;i<6;i++){
    const s=g.inventory[i];
    const d=document.createElement('div'); d.className='slot'+(g.selectedSlot===i?' sel':'');
    d.innerHTML = s ? `<span class="n">${i+1}</span><span>${(D.ITEMS[s.item]||{}).icone||'📦'}</span><span class="q">${s.qtd}</span><span class="nm">${s.item.split(' ')[0]}</span>` : `<span class="n">${i+1}</span>`;
    d.onclick=()=>{ g.selectedSlot=i; renderHotbar(g); };
    hb.appendChild(d);
  }
}

export function renderInventory(g){
  const grid=$('inv-grid'); grid.innerHTML='';
  const w=g.totalWeight(), cap=g.carryCapacity();
  $('inv-weight').textContent = `⚖ Peso total: ${w.toFixed(1)} kg / ${cap} kg (base 80 kg${g.player.riding?' + montaria':''}) · Slots: ${g.inventory.length}/${g.maxSlots()}${g.player.backpack?' (mochila)':''}`;
  g.inventory.forEach((s,i)=>{
    const def=D.ITEMS[s.item]||{icone:'📦',peso:0.4,desc:''};
    const d=document.createElement('div'); d.className='slot'+(g.selectedSlot===i?' sel':'');
    d.innerHTML=`<span>${def.icone}</span><span class="q">${s.qtd}</span><span class="nm">${s.item}</span>`;
    d.title=`${s.item} — ${def.peso} kg cada — ${def.desc}`;
    d.onclick=()=>{ g.selectedSlot=i; g.useSelected(); renderInventory(g); };
    grid.appendChild(d);
  });
  for(let i=g.inventory.length;i<g.maxSlots();i++){ const d=document.createElement('div'); d.className='slot'; d.innerHTML='<span style="opacity:.3">·</span>'; grid.appendChild(d); }
  const sel=g.inventory[g.selectedSlot];
  $('inv-detail').textContent = sel ? `${(D.ITEMS[sel.item]||{}).icone||''} ${sel.item} ×${sel.qtd} — ${(D.ITEMS[sel.item]||{}).desc||''} (Q ou clique para usar/comer/tratar/equipar)` : 'Selecione um item.';
}

export function openCraft(g){
  closeAll(); $('craft-overlay').classList.remove('hidden');
  const station = g.nearestStation();
  $('craft-station').textContent = `Estação próxima: ${station} (fogueira/bancada/fornalha desbloqueiam mais receitas). Estações: ${D.STATIONS.join(', ')}.`;
  const tabs=$('craft-tabs'); tabs.innerHTML='';
  for(const t of ['todas','mão','bancada','fogueira','fornalha']){
    const b=document.createElement('button'); b.textContent=t; b.className=craftTab===t?'sel':'';
    b.onclick=()=>{ craftTab=t; openCraft(g); }; tabs.appendChild(b);
  }
  const list=$('craft-list'); list.innerHTML='';
  const recs = D.RECIPES.filter(r=> craftTab==='todas' ? (r.estacao===station||r.estacao==='mão') : r.estacao===craftTab);
  if(!recs.length) list.innerHTML='<p class="small">Nenhuma receita aqui. Aproxime-se de uma estação ou troque a aba.</p>';
  for(const r of recs){
    const ok=g.canCraft(r);
    const d=document.createElement('div'); d.className='recipe';
    d.innerHTML=`<span>${(D.ITEMS[r.out]||{}).icone||'🔨'} <b>${r.out}</b> <span class="small">${r.desc}</span><br><span class="cost">${Object.entries(r.custo).map(([k,v])=>`${k} ${g.countItem(k)}/${v}`).join(' · ')}</span></span>`;
    const b=document.createElement('button'); b.textContent='Craft'; b.disabled=!ok;
    b.onclick=()=>{ g.craft(r); openCraft(g); renderInventory(g); };
    d.appendChild(b); list.appendChild(d);
  }
}

export function openBuild(g){
  closeAll(); $('build-overlay').classList.remove('hidden');
  const list=$('build-list'); list.innerHTML='';
  for(const b of D.BUILDINGS){
    const ok=Object.entries(b.custo).every(([k,v])=>g.countItem(k)>=v);
    const d=document.createElement('div'); d.className='recipe';
    d.innerHTML=`<span>🏠 <b>${b.nome}</b> <span class="small">${b.desc}</span><br><span class="cost">${Object.entries(b.custo).map(([k,v])=>`${k} ${g.countItem(k)}/${v}`).join(' · ')}</span></span>`;
    const btn=document.createElement('button'); btn.textContent='Posicionar'; btn.disabled=!ok;
    btn.onclick=()=>g.startBuild(b.nome);
    d.appendChild(btn); list.appendChild(d);
  }
}

export function openMap(g){
  closeAll(); $('map-overlay').classList.remove('hidden');
  const cv=$('map-canvas'), ctx=cv.getContext('2d');
  ctx.fillStyle='#0e1622'; ctx.fillRect(0,0,cv.width,cv.height);
  const sx = cv.width/WORLD_W;
  // biomas
  for(let x=0;x<WORLD_W;x+=40){ const b=g.world.biome(x); ctx.fillStyle=b.cor; ctx.fillRect(x*sx, 20, 40*sx+1, cv.height-60); }
  // mar
  ctx.fillStyle='rgba(60,140,220,0.5)'; ctx.fillRect(0,20,cv.width,cv.height-60);
  // cavernas
  ctx.fillStyle='#14141c'; for(const c of g.world.caves) ctx.fillRect((c.x-c.w/2)*sx, 30, c.w*sx, 8);
  // POIs
  ctx.font='10px monospace';
  for(const poi of g.world.pois){ ctx.fillStyle='#ffd97a'; ctx.fillRect(poi.x*sx-2, 24, 4, 4); }
  // jogador
  ctx.fillStyle='#fff'; ctx.fillRect(g.player.x*sx-3, 18, 6, 6);
  ctx.fillStyle='#ffd97a'; ctx.fillText('▲ você', g.player.x*sx-12, 14);
  // construções
  ctx.fillStyle='#e84a6a'; for(const b of g.buildings) ctx.fillRect(b.x*sx-2, cv.height-46, 4, 4);
  // domados
  ctx.fillStyle='#4ae88a'; for(const e of g.entities) if(e.tamed) ctx.fillRect(e.x*sx-2, cv.height-46, 4, 4);
  $('map-legend').textContent = `Legenda: ▲ jogador · pontos dourados = pontos de interesse (${D.POIS.join(', ')}) · faixas escuras = cavernas naturais · rosa = construções · verde = domados. Seed: ${g.world.seedStr}`;
}

export function openTamed(g){
  closeAll(); $('tamed-overlay').classList.remove('hidden');
  const list=$('tamed-list');
  const tamed=g.entities.filter(e=>e.tamed);
  if(!tamed.length){ list.innerHTML='<p>Nenhuma criatura domesticada ainda. Aproxime-se devagar e ofereça o alimento favorito com <b>E</b>.</p>'; return; }
  list.innerHTML='';
  for(const e of tamed){
    const d=document.createElement('div'); d.className='recipe';
    const weak = e.body ? Object.entries(e.body).sort((a,b)=>a[1]-b[1])[0] : null;
    d.innerHTML=`<span>🐾 <b>${e.nome}</b>${e.filhote?' (filhote)':''} — vínculo ${Math.round(e.bond)}% · HP ${Math.round(e.hp)}/${e.maxHp}${weak?` · região mais ferida: <b>${weak[0]} (${Math.round(weak[1])})</b>`:''} · carga ${e.carry}kg · ${e.sela?'sela ':''}${e.arreio?'arreio ':''}${e.equip?'armadura ':''}<br><span class="cost">Comando atual: <b>${e.comando}</b></span></span>`;
    const cmds=document.createElement('span');
    for(const c of D.TAMED_COMMANDS){
      const b=document.createElement('button'); b.textContent=c; b.style.margin='2px';
      b.onclick=()=>{ e.comando=c; openTamed(g); log(`🐾 ${e.nome}: comando "${c}".`); };
      cmds.appendChild(b);
    }
    d.appendChild(cmds); list.appendChild(d);
  }
}

export function openBody(g){
  closeAll(); $('body-overlay').classList.remove('hidden');
  const cv=$('body-canvas'), ctx=cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  const p=g.player;
  const col=r=>{ const b=p.body[r]; if(b.hp<=0) return '#e84a3a'; if(b.bleeding>0) return '#c84a3a'; if(b.fracture) return '#e8a83a'; if(b.infection>20) return '#8ae84a'; return '#8ab8d8'; };
  // desenho esquemático do corpo
  ctx.fillStyle=col('cabeça'); ctx.fillRect(50,10,20,20);
  ctx.fillStyle=col('pescoço'); ctx.fillRect(56,30,8,6);
  ctx.fillStyle=col('peito'); ctx.fillRect(45,36,30,26);
  ctx.fillStyle=col('abdômen'); ctx.fillRect(47,62,26,18);
  ctx.fillStyle=col('costas'); ctx.fillRect(45,36,30,4);
  ctx.fillStyle=col('braços'); ctx.fillRect(35,38,8,26); ctx.fillRect(77,38,8,26);
  ctx.fillStyle=col('mãos'); ctx.fillRect(35,64,8,8); ctx.fillRect(77,64,8,8);
  ctx.fillStyle=col('pernas'); ctx.fillRect(48,80,10,40); ctx.fillRect(62,80,10,40);
  ctx.fillStyle=col('pés'); ctx.fillRect(46,120,12,6); ctx.fillRect(62,120,12,6);
  ctx.fillStyle=col('cauda'); ctx.fillRect(20,90,10,4);
  ctx.fillStyle=col('asas'); ctx.fillRect(8,40,14,20); ctx.fillRect(98,40,14,20);
  const list=$('body-list'); list.innerHTML='';
  for(const r of D.BODY_REGIONS){
    const b=p.body[r];
    const st=[]; if(b.bleeding>0) st.push(`🩸 sangrando (${b.bleeding.toFixed(1)})`); if(b.fracture) st.push('🦴 fraturado'); if(b.infection>0) st.push(`🤢 infecção ${Math.round(b.infection)}%`); if(b.treated) st.push('✅ tratado');
    list.innerHTML += `<div><b>${r}:</b> HP ${Math.round(b.hp)}% ${st.join(' · ')||'— ok'}</div>`;
  }
  list.innerHTML += `<div style="margin-top:6px">😖 Dor: ${Math.round(p.pain)}% · 🧠 Consciência: ${Math.round(p.consciousness)}% · 🫁 Respiração: ${Math.round(p.breathing)}% · 🌡 ${p.temp.toFixed(1)}°C</div>`;
}

export function showDeath(g, cause){
  $('death-cause').textContent = `Causa: ${cause}`;
  $('death-stats').textContent = `Sobreviveu ${g.day} dia(s) · ${g.stats.coletados} coletas · ${g.stats.craftados} crafts · ${g.stats.construídos} construções · ${g.stats.domesticados} domesticados · ${g.stats.abates} abates · ${Math.round(g.stats.dist)} m percorridos.`;
  $('death-screen').classList.remove('hidden');
}
export function hideDeath(){ $('death-screen').classList.add('hidden'); }
