// ============================================================
// main.js — inicialização da aplicação JavaScript.
// Tela de título, personalização do sobrevivente (cabelo,
// barba, roupas), seed reproduzível e arranque do loop.
// ============================================================
import { Game } from './game.js';
import * as UI from './ui.js';
import * as D from './data.js';
import { drawPlayer } from './sprites.js';

const $ = id => document.getElementById(id);
const canvas = $('game');
const game = new Game(canvas);

const char = { skin: D.SKIN_TONES[1], hair: D.HAIR_COLORS[0], hairStyle: 'curto', beard: true, shirt: D.SHIRT_COLORS[0] };

function renderPreview(){
  const cv = $('char-preview'), ctx = cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.save(); ctx.scale(1.4,1.4);
  drawPlayer(ctx,{x:24,y:44,dir:1,pose:'parado',walkPhase:0,skin:char.skin,hair:char.hair,hairStyle:char.hairStyle,beard:char.beard,shirt:char.shirt,pants:'#4a3a2e',tool:'machado simples'});
  ctx.restore();
}
function buildOpts(){
  const box = $('char-opts'); box.innerHTML='';
  const groups = [
    { label:'Pele', key:'skin', vals:D.SKIN_TONES },
    { label:'Cabelo (cor)', key:'hair', vals:D.HAIR_COLORS },
    { label:'Cabelo (estilo)', key:'hairStyle', vals:D.HAIR_STYLES },
    { label:'Barba', key:'beard', vals:[true,false], fmt:v=>v?'sim':'não' },
    { label:'Roupa', key:'shirt', vals:D.SHIRT_COLORS },
  ];
  for(const gr of groups){
    const row=document.createElement('div'); row.className='opt-row';
    row.innerHTML=`<span>${gr.label}</span>`;
    const opts=document.createElement('span'); opts.className='opts';
    for(const v of gr.vals){
      const b=document.createElement('button');
      b.textContent = gr.fmt ? gr.fmt(v) : (gr.key==='skin'||gr.key==='hair'||gr.key==='shirt' ? '■' : v);
      if(gr.key==='skin'||gr.key==='hair'||gr.key==='shirt') b.style.color=v;
      if(char[gr.key]===v) b.className='sel';
      b.onclick=()=>{ char[gr.key]=v; buildOpts(); renderPreview(); };
      opts.appendChild(b);
    }
    row.appendChild(opts); box.appendChild(row);
  }
}
buildOpts(); renderPreview();
$('btn-continue').disabled = !game.hasSave();

function startGame(fresh){
  const seed = ($('seed-input').value||'ARKYT-2026').trim();
  game.audio.init();
  if(fresh) game.newGame(seed, {...char});
  else if(!game.load()){ game.newGame(seed, {...char}); }
  $('title-screen').classList.add('hidden');
  $('hud').classList.remove('hidden');
  UI.renderHotbar(game);
  if(!game.running) game.start();
}
$('btn-new').onclick = ()=>startGame(true);
$('btn-continue').onclick = ()=>startGame(false);
$('btn-help2').onclick = ()=>{ $('help-overlay').classList.remove('hidden'); };
$('btn-respawn').onclick = ()=>game.respawn();
$('btn-inv').onclick = ()=>{ UI.toggle('inv-overlay'); UI.renderInventory(game); };
$('btn-craft').onclick = ()=>UI.openCraft(game);
$('btn-build').onclick = ()=>UI.openBuild(game);
$('btn-map').onclick = ()=>UI.openMap(game);
$('btn-tamed').onclick = ()=>UI.openTamed(game);
$('btn-body').onclick = ()=>UI.openBody(game);
$('btn-help').onclick = ()=>UI.toggle('help-overlay');
$('btn-save').onclick = ()=>game.save();
$('btn-sound').onclick = ()=>{ game.audio.enabled=!game.audio.enabled; $('btn-sound').textContent = game.audio.enabled?'🔊 Som':'🔇 Mudo'; };
$('inv-close').onclick = ()=>UI.closeAll();
$('craft-close').onclick = ()=>UI.closeAll();
$('build-close').onclick = ()=>UI.closeAll();
$('map-close').onclick = ()=>UI.closeAll();
$('tamed-close').onclick = ()=>UI.closeAll();
$('body-close').onclick = ()=>UI.closeAll();
$('help-close').onclick = ()=>UI.closeAll();
