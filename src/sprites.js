// ============================================================
// assets/ — sprites pixel art 2D gerados proceduralmente
// (silhuetas claras, cores fortes, formas cúbicas 2D).
// Sem assets externos: tudo desenhado em canvas.
// ============================================================

export function px(ctx,x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }

// Personagem sobrevivente (corpo completo, rosto pixelizado,
// cabelo/barba opcionais, roupas simples). Animações por pose:
// andar/correr (pernas), pular, nadar, escalar, coletar,
// atacar, construir, dormir, tratar, montar.
export function drawPlayer(ctx, o){
  // o: {x,y,dir,pose,walkPhase,skin,hair,hairStyle,beard,shirt,pants,tool,riding,sleeping,swim,climb}
  const x=o.x, y=o.y, d=o.dir||1;
  const S=2; // escala pixel
  const ph=o.walkPhase||0;
  const legSwing = (o.pose==='andar'||o.pose==='correr') ? Math.sin(ph)*6 : 0;
  const legSwing2 = (o.pose==='andar'||o.pose==='correr') ? Math.cos(ph)*6 : 0;
  const armSwing = (o.pose==='andar'||o.pose==='correr') ? Math.sin(ph)*4 : 0;
  const bob = (o.pose==='andar'||o.pose==='correr') ? Math.abs(Math.sin(ph))*2 : 0;
  const yy = y - bob;
  if(o.sleeping){
    // deitado
    px(ctx,x-16,yy-6,32,8,o.shirt); px(ctx,x+14,yy-8,10,10,o.skin);
    px(ctx,x+14,yy-10,10,4,o.hair); px(ctx,x-20,yy-4,8,4,o.pants);
    return;
  }
  const headY = yy-34, bodyY = yy-24;
  // pernas
  if(o.swim){ px(ctx,x-8,yy-6,7,6,o.pants); px(ctx,x+2,yy-6,7,6,o.pants); }
  else if(o.climb){ px(ctx,x-8,yy-14,7,14,o.pants); px(ctx,x+2,yy-16,7,16,o.pants); }
  else { px(ctx,x-8+legSwing,yy-14,7,14,o.pants); px(ctx,x+2+legSwing2,yy-14,7,14,o.pants);
         px(ctx,x-8+legSwing,yy-2,8,3,'#3a2a1a'); px(ctx,x+2+legSwing2,yy-2,8,3,'#3a2a1a'); }
  // tronco (roupa simples)
  px(ctx,x-9,bodyY,18,12,o.shirt);
  px(ctx,x-9,bodyY+10,18,2,'#00000033');
  // braços
  let armY = bodyY+2;
  if(o.pose==='atacar'){ px(ctx,x+8*d,armY-2,14*d,4,o.skin); if(o.tool) px(ctx,x+20*d,armY-4,10*d,3,'#8a6a3a'); }
  else if(o.pose==='coletar'||o.pose==='construir'||o.pose==='tratar'){ px(ctx,x+8*d,armY+Math.sin(ph*2)*3,12*d,4,o.skin); }
  else if(o.climb){ px(ctx,x-12,armY-8,4,12,o.skin); px(ctx,x+9,armY-10,4,12,o.skin); }
  else if(o.riding){ px(ctx,x-12,armY+2,4,10,o.skin); px(ctx,x+9,armY+2,4,10,o.skin); }
  else { px(ctx,x-12,armY+armSwing,4,10,o.skin); px(ctx,x+9,armY-armSwing,4,10,o.skin); }
  // cabeça + rosto pixelizado
  px(ctx,x-7,headY,14,12,o.skin);
  px(ctx,x-7,headY+5,14,2,o.skin); // sombra
  // olhos
  px(ctx,x-4+(d>0?2:-2),headY+5,2,2,'#1a1a1a'); px(ctx,x+2+(d>0?2:-2),headY+5,2,2,'#1a1a1a');
  // cabelo
  if(o.hairStyle==='curto'){ px(ctx,x-7,headY-2,14,4,o.hair); }
  else if(o.hairStyle==='longo'){ px(ctx,x-8,headY-2,16,5,o.hair); px(ctx,x-8,headY+2,3,10,o.hair); px(ctx,x+5,headY+2,3,10,o.hair); }
  else if(o.hairStyle==='moicano'){ px(ctx,x-2,headY-5,4,6,o.hair); }
  // barba opcional
  if(o.beard){ px(ctx,x-6,headY+8,12,4,o.hair); }
  // ferramenta na mão
  if(o.tool && o.pose!=='atacar'){ px(ctx,x+10*d,armY+6,3,10,'#8a6a3a'); }
}

// Animais / dinossauros / marinhos — silhueta por porte e cor,
// com pernas animadas, cauda, chifres, asas, nadadeiras.
export function drawCreature(ctx, c){
  const x=c.x, y=c.y, d=c.dir||1, ph=c.walkPhase||0;
  const tam = {P:0.6,M:1,G:1.5,GG:2.2,GGG:3}[c.tam]||1;
  const w = 26*tam, h = 14*tam;
  const legSwing = Math.sin(ph)*4*tam;
  const sleeping = c.estado==='dormir';
  const yy = y - (sleeping? h*0.3 : 0);
  const body = c.cor||'#888';
  const dark = shade(body,-30);
  if(c.aquatico){
    // corpo alongado + cauda + nadadeiras
    px(ctx,x-w/2,yy-h, w, h*0.7, body);
    px(ctx,x+w/2*d,yy-h*0.9, 10*tam*d, 4*tam, dark);
    px(ctx,x-w/2*d-4,yy-h*1.1, 8*tam, 5*tam, dark); // cauda
    px(ctx,x+w/2*d-6,yy-h-4, 8, 4, dark); // dorsal
    px(ctx,x+w/2*d-8,yy-h+2, 3, 3, '#fff'); // olho
    if(c.nome==='polvo'||c.nome==='lula'){ for(let i=0;i<4;i++) px(ctx,x-w/2+i*6,yy-h*0.3,4,8,dark); }
    if(c.nome==='tartaruga marinha'){ px(ctx,x-w/2,yy-h-4,w,5,'#3a7a4a'); }
    return;
  }
  if(c.voador){
    // asas batendo
    const flap = Math.sin(ph*2)*8;
    px(ctx,x-w/2,yy-h*1.2,w,h*0.6,body);
    px(ctx,x-w/2-10,yy-h*1.2-flap,12,4,dark); px(ctx,x+w/2-2,yy-h*1.2-flap,12,4,dark);
    px(ctx,x+w/2*d,yy-h*1.3,10,5,body); px(ctx,x+w/2*d+8,yy-h*1.2,8,3,'#e8a84a'); // bico
    return;
  }
  // corpo
  px(ctx,x-w/2,yy-h,w,h*0.75,body);
  px(ctx,x-w/2,yy-h+h*0.6,w,3,dark);
  // cabeça
  const hx = x + w/2*d - 6*tam;
  px(ctx,hx,yy-h-4*tam,12*tam,10*tam,body);
  px(ctx,hx+ (d>0?8*tam:-2),yy-h-2*tam,3,3,'#fff'); px(ctx,hx+(d>0?9*tam:-1),yy-h-1*tam,2,2,'#000');
  // chifres / cristas por espécie
  if(c.nome.includes('Triceratops')||c.nome==='rinoceronte'){ px(ctx,hx+4,yy-h-10*tam,3,7,'#e8e0c8'); }
  if(c.nome.includes('Estegossauro')){ for(let i=0;i<4;i++) px(ctx,x-w/2+i*8,yy-h-4,5,5,'#e8d8a8'); }
  if(c.nome.includes('Tiranossauro')||c.nome==='Carnotauro'){ px(ctx,hx+2,yy-h-8*tam,3,5,dark); }
  if(c.nome==='leão'){ px(ctx,hx-2,yy-h-8*tam,14*tam,8*tam,'#a87a2e'); }
  if(c.nome==='galinha'){ px(ctx,hx+2,yy-h-8*tam,5,4,'#e84a3a'); px(ctx,hx+8,yy-h-2*tam,6,3,'#e8a83a'); }
  if(c.nome==='elefante'){ px(ctx,hx+8*d,yy-h+2,4,12,'#c8c8d0'); }
  if(c.nome==='cavalo'||c.nome==='camelo'){ px(ctx,hx+2,yy-h-8*tam,8,5,dark); }
  // pernas
  if(!sleeping){
    const n = tam>=1.5?4:2;
    for(let i=0;i<n;i++){ const lx = x-w/2+6+i*(w-12)/(n-1||1); px(ctx,lx+ (i%2?legSwing:-legSwing), yy-6*tam, 4*tam, 6*tam, dark); }
  } else { px(ctx,x-w/2,yy-4, w, 4, dark); }
  // cauda
  px(ctx,x-w/2*d-8,yy-h+2,8,3,dark);
  // sela/arreio/armadura se domesticado e equipado
  if(c.equip){ px(ctx,x-8,yy-h-3,16,5,'#7a4a2e'); px(ctx,x-8,yy-h-3,16,2,'#c8a84a'); }
  if(c.sela){ px(ctx,x-6,yy-h-4,12,4,'#5a3a1e'); }
  if(c.tamed){ px(ctx,x-2,yy-h-12,4,4,'#e84a6a'); } // laço vermelho
  if(c.veneno){ px(ctx,x+w/2*d-4,yy-h+4,4,4,'#e8e84a'); }
}

export function drawTree(ctx,t,camX,camY){
  const x=t.x-camX, y=t.y-camY;
  if(t.tipo==='palmeira'){ px(ctx,x-3,y-70,6,70,'#8a6a3a'); px(ctx,x-22,y-84,44,8,'#2e8a3a'); px(ctx,x-16,y-92,32,8,'#3aa84a'); }
  else if(t.tipo==='pinheiro'){ px(ctx,x-3,y-30,6,30,'#6a4a2e'); px(ctx,x-16,y-80,32,30,'#2a6a3a'); px(ctx,x-12,y-100,24,24,'#3a8a4a'); }
  else { px(ctx,x-4,y-46,8,46,'#7a5a32'); px(ctx,x-20,y-84,40,42,'#2e7a3a'); px(ctx,x-14,y-96,28,16,'#3a9a4a'); }
}
export function drawRock(ctx,r,camX,camY){
  const x=r.x-camX, y=r.y-camY;
  px(ctx,x-16,y-16,32,16,'#8a8a92'); px(ctx,x-12,y-22,24,8,'#9a9aa2'); px(ctx,x-16,y-4,32,4,'#5a5a62');
  // veios do minério real
  const cor = r.cor||'#d8d8d8';
  px(ctx,x-8,y-14,5,5,cor); px(ctx,x+3,y-10,5,5,cor); px(ctx,x-2,y-18,4,4,cor);
}
export function drawPlant(ctx,p,camX,camY,t){
  const x=p.x-camX, y=p.y-camY;
  const sway = Math.sin(t*2+p.x*0.01)*2;
  if(p.tipo==='tronco caído'){ px(ctx,x-18,y-8,36,8,'#7a5a32'); px(ctx,x-18,y-8,36,2,'#9a7a4a'); }
  else if(p.tipo==='pedra do chão'){ px(ctx,x-7,y-7,14,7,'#9a9aa2'); }
  else if(p.tipo==='fruta'){ px(ctx,x-2,y-16,4,16,'#6a4a2e'); px(ctx,x-10,y-26,20,12,'#3a9a4a'); px(ctx,x-6,y-24,4,4,'#e84a3a'); px(ctx,x+3,y-22,4,4,'#e84a3a'); }
  else if(p.tipo==='mel'){ px(ctx,x-2,y-20,4,20,'#6a4a2e'); px(ctx,x-8,y-30,16,12,'#c8a83a'); px(ctx,x-5,y-26,4,4,'#e8d24a'); }
  else if(p.tipo==='planta medicinal'){ px(ctx,x-2,y-14,4,14,'#3a8a4a'); px(ctx,x-8,y-22,16,10,'#e88ab8'); px(ctx,x-3,y-18,6,6,'#fff'); }
  else if(p.tipo==='cogumelo'){ px(ctx,x-2,y-8,4,8,'#e8d8c8'); px(ctx,x-7,y-14,14,7,'#c84a3a'); }
  else { px(ctx,x-2+sway,y-14,4,14,'#3a8a4a'); px(ctx,x-8+sway,y-20,16,8,'#4aa85a'); }
}
export function drawBuilding(ctx,b,camX,camY,t){
  const x=b.x-camX, y=b.y-camY;
  switch(b.nome){
    case 'fogueira': px(ctx,x-12,y-8,24,8,'#5a5a5a'); px(ctx,x-8,y-16,16,8,'#e87a2e'); px(ctx,x-5,y-22,10,8,'#f2c14e'); px(ctx,x-3,y-28,6,8,'#f8e8a8'); break;
    case 'bancada': px(ctx,x-20,y-16,40,8,'#8a6a3a'); px(ctx,x-18,y-8,6,8,'#6a4a2e'); px(ctx,x+12,y-8,6,8,'#6a4a2e'); break;
    case 'fornalha': px(ctx,x-14,y-30,28,30,'#7a7a7a'); px(ctx,x-8,y-20,16,12,'#e87a2e'); px(ctx,x-14,y-34,28,5,'#5a5a5a'); break;
    case 'cama': px(ctx,x-24,y-10,48,10,'#8a6a3a'); px(ctx,x-24,y-16,48,6,'#c84a4a'); px(ctx,x-24,y-16,12,6,'#e8e8e8'); break;
    case 'abrigo': px(ctx,x-26,y-34,52,34,'#8a6a3a'); px(ctx,x-30,y-40,60,8,'#6a4a2e'); px(ctx,x-8,y-22,16,22,'#3a2a1a'); break;
    case 'casa': px(ctx,x-34,y-48,68,48,'#a87a4a'); px(ctx,x-40,y-56,80,10,'#7a3a2e'); px(ctx,x-10,y-30,20,30,'#5a3a1e'); px(ctx,x+14,y-36,12,12,'#f2d24a'); break;
    case 'torre': case 'posto de observação': px(ctx,x-10,y-90,20,90,'#8a6a3a'); px(ctx,x-18,y-100,36,12,'#6a4a2e'); px(ctx,x-14,y-96,8,8,'#f2d24a'); break;
    case 'ponte': px(ctx,x-40,y-6,80,6,'#8a6a3a'); px(ctx,x-36,y-12,6,6,'#6a4a2e'); px(ctx,x+30,y-12,6,6,'#6a4a2e'); break;
    case 'cerca': case 'baia': case 'estábulo': px(ctx,x-30,y-24,60,6,'#8a6a3a'); px(ctx,x-30,y-12,60,6,'#8a6a3a'); px(ctx,x-30,y-26,6,26,'#6a4a2e'); px(ctx,x+24,y-26,6,26,'#6a4a2e'); break;
    case 'portão': px(ctx,x-16,y-26,32,26,'#8a6a3a'); break;
    case 'doca': px(ctx,x-30,y-8,60,8,'#8a6a3a'); px(ctx,x-26,y,6,20,'#6a4a2e'); px(ctx,x+20,y,6,20,'#6a4a2e'); break;
    case 'barco': px(ctx,x-26,y-14,52,12,'#8a6a3a'); px(ctx,x-4,y-34,4,22,'#6a4a2e'); px(ctx,x-4,y-34,22,14,'#e8e8e8'); break;
    case 'armazém': px(ctx,x-26,y-30,52,30,'#9a7a4a'); px(ctx,x-26,y-30,52,6,'#7a5a32'); px(ctx,x-8,y-18,16,18,'#5a3a1e'); break;
    case 'horta (canteiro)': px(ctx,x-24,y-8,48,8,'#5a3a1e'); px(ctx,x-20,y-14,40,6,'#3a8a3a'); break;
    case 'armadilha': px(ctx,x-14,y-14,28,14,'#8a6a3a'); px(ctx,x-10,y-20,20,6,'#c8a83a'); break;
    case 'escada': px(ctx,x-8,y-60,16,60,'#8a6a3a'); for(let i=0;i<5;i++) px(ctx,x-8,y-56+i*12,16,3,'#6a4a2e'); break;
    case 'carroça': px(ctx,x-24,y-16,48,10,'#8a6a3a'); px(ctx,x-18,y-6,10,10,'#3a2a1a'); px(ctx,x+8,y-6,10,10,'#3a2a1a'); break;
    case 'guindaste simples': px(ctx,x-4,y-70,8,70,'#8a6a3a'); px(ctx,x-4,y-70,40,6,'#6a4a2e'); px(ctx,x+30,y-64,3,30,'#c8a83a'); break;
    default: px(ctx,x-14,y-20,28,20,'#8a6a3a');
  }
  if(b.crop){ const g=b.crop.progress; px(ctx,x-6,y-24-g*10,12,4,'#4aa85a'); }
}
export function drawPOI(ctx,p,camX,camY){
  const x=p.x-camX, y=p.y-camY;
  if(p.tipo==='cachoeiras'){ px(ctx,x-14,y-60,28,60,'#5ab0e8'); px(ctx,x-14,y-60,28,6,'#b8e8f8'); }
  else if(p.tipo==='ruínas'||p.tipo==='aldeias abandonadas'){ px(ctx,x-24,y-30,10,30,'#9a9a92'); px(ctx,x+10,y-22,12,22,'#8a8a82'); px(ctx,x-24,y-34,48,6,'#7a7a72'); }
  else if(p.tipo==='acampamentos'){ px(ctx,x-16,y-16,32,16,'#8a6a3a'); px(ctx,x-4,y-30,8,16,'#c84a3a'); }
  else if(p.tipo==='torres de observação'){ px(ctx,x-8,y-80,16,80,'#8a6a3a'); px(ctx,x-14,y-90,28,12,'#6a4a2e'); }
  else if(p.tipo==='naufrágios'){ px(ctx,x-30,y-16,60,14,'#6a4a2e'); px(ctx,x-6,y-40,6,26,'#5a3a1e'); }
  else if(p.tipo==='entradas de cavernas'){ px(ctx,x-20,y-34,40,34,'#3a3a3a'); px(ctx,x-14,y-28,28,28,'#0a0a0a'); }
  else if(p.tipo==='fósseis'){ px(ctx,x-14,y-8,28,8,'#e8e0c8'); px(ctx,x-8,y-14,16,6,'#d8d0b8'); }
  else { px(ctx,x-12,y-24,24,24,'#5a4a8a'); px(ctx,x-6,y-30,12,8,'#ffd97a'); }
}
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt; r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b)); return `rgb(${r},${g},${b})`; }
