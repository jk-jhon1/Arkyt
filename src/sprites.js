// ============================================================
// assets/ — sprites pixel art 2D em estilo VOXEL idêntico às
// pranchas de modelo: cubos com salpicos de textura, cores
// fortes, silhuetas claras. Personagem: cabelo castanho,
// camisa vermelha xadrez, calça azul, mochila. Animais:
// cavalo marrom de patas brancas, capivara, lobo cinza,
// urso, crocodilo, tubarão, golfinho, elefante, rinoceronte,
// triceratops laranja, dinossauros de pescoço longo etc.
// ============================================================

export function px(ctx,x,y,w,h,c){ ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function shade(hex,amt){ const n=parseInt(hex.slice(1),16); let r=(n>>16)+amt,g=((n>>8)&255)+amt,b=(n&255)+amt; r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b)); return `rgb(${r},${g},${b})`; }
// cubo voxel: face frontal com salpicos, topo claro, base escura
export function cube(ctx,x,y,w,h,base,seed=0){
  px(ctx,x,y,w,h,base);
  px(ctx,x,y,w,Math.max(2,h*0.18),shade(base,38)); // topo iluminado
  px(ctx,x,y+h-Math.max(2,h*0.16),w,Math.max(2,h*0.16),shade(base,-42)); // base sombreada
  // salpicos de textura (determinísticos por posição)
  let s = (Math.abs(Math.round(x*7+y*13+seed*31))%97)/97;
  const n = Math.max(2, Math.floor(w*h/220));
  for(let i=0;i<n;i++){ s=(s*16807)%2147483647; const rx=x+(s%Math.max(1,w-4)), ry=y+((s>>3)%Math.max(1,h-4)); px(ctx,rx,ry,3,3, (i%2? shade(base,-28):shade(base,26))); }
}
function eye(ctx,x,y){ px(ctx,x,y,3,3,'#141414'); px(ctx,x+1,y,1,1,'#fff'); }

// ---------------- Personagem (modelo: camisa vermelha xadrez, calça azul) ----------------
export function drawPlayer(ctx, o){
  const x=o.x, y=o.y, d=o.dir||1, ph=o.walkPhase||0;
  const legSwing = (o.pose==='andar'||o.pose==='correr') ? Math.sin(ph)*5 : 0;
  const legSwing2 = (o.pose==='andar'||o.pose==='correr') ? Math.cos(ph)*5 : 0;
  const bob = (o.pose==='andar'||o.pose==='correr') ? Math.abs(Math.sin(ph))*2 : 0;
  const yy = y - bob;
  if(o.sleeping){
    cube(ctx,x-18,yy-8,36,9,o.shirt,1); px(ctx,x+16,yy-10,11,11,o.skin); px(ctx,x+16,yy-12,11,4,o.hair);
    px(ctx,x-24,yy-6,8,5,'#3a4a6a'); return;
  }
  const headY=yy-36, bodyY=yy-25;
  // pernas (calça azul do modelo)
  if(o.swim){ cube(ctx,x-9,yy-7,8,7,'#3a5a9a',2); cube(ctx,x+2,yy-7,8,7,'#3a5a9a',3); }
  else if(o.climb){ cube(ctx,x-9,yy-15,8,15,'#3a5a9a',2); cube(ctx,x+2,yy-17,8,17,'#3a5a9a',3); }
  else { cube(ctx,x-9+legSwing,yy-15,8,15,'#3a5a9a',2); cube(ctx,x+2+legSwing2,yy-15,8,15,'#3a5a9a',3);
         px(ctx,x-9+legSwing,yy-3,9,3,'#4a3220'); px(ctx,x+2+legSwing2,yy-3,9,3,'#4a3220'); }
  // tronco: camisa vermelha xadrez (modelo) ou cor escolhida
  const shirt = o.shirt || '#c83a2e';
  cube(ctx,x-10,bodyY,20,13,shirt,4);
  px(ctx,x-10,bodyY+4,20,2,shade(shirt,-40)); px(ctx,x-3,bodyY,2,13,shade(shirt,-40)); px(ctx,x+5,bodyY,2,13,shade(shirt,-40)); // xadrez
  // mochila (modelo: verde/vermelha nas costas)
  if(!o.riding){ cube(ctx,x-14*d,bodyY+1,6,11,'#4a7a3a',5); px(ctx,x-14*d,bodyY+1,6,3,'#c83a2e'); }
  // braços
  let armY=bodyY+2;
  const armC = o.skin;
  if(o.pose==='atacar'){ cube(ctx,x+9*d,armY-2,13*d,5,armC,6); drawTool(ctx,x+20*d,armY-6,o.tool,d); }
  else if(o.pose==='coletar'||o.pose==='construir'||o.pose==='tratar'){ cube(ctx,x+9*d,armY+Math.sin(ph*2)*3,11*d,5,armC,6); }
  else if(o.climb){ cube(ctx,x-13,armY-9,5,12,armC,6); cube(ctx,x+9,armY-11,5,12,armC,6); }
  else if(o.riding){ cube(ctx,x-13,armY+2,5,10,armC,6); cube(ctx,x+9,armY+2,5,10,armC,6); }
  else { cube(ctx,x-13,armY+Math.sin(ph)*3,5,10,armC,6); cube(ctx,x+9,armY-Math.sin(ph)*3,5,10,armC,6); }
  if(o.tool && o.pose!=='atacar') drawTool(ctx,x+11*d,armY+7,o.tool,d);
  // cabeça: bloco quadrado, cabelo castanho (modelo)
  cube(ctx,x-8,headY,16,13,o.skin,7);
  if(o.hairStyle==='curto'){ cube(ctx,x-8,headY-2,16,5,o.hair,8); }
  else if(o.hairStyle==='longo'){ cube(ctx,x-9,headY-2,18,5,o.hair,8); px(ctx,x-9,headY+2,3,11,o.hair); px(ctx,x+6,headY+2,3,11,o.hair); }
  else if(o.hairStyle==='moicano'){ cube(ctx,x-2,headY-5,5,7,o.hair,8); }
  eye(ctx,x-4+(d>0?2:-2),headY+6); eye(ctx,x+2+(d>0?2:-2),headY+6);
  if(o.beard) px(ctx,x-6,headY+9,12,4,o.hair);
}
function drawTool(ctx,x,y,tool,d){
  if(tool==='machado simples'){ px(ctx,x,y,3,12,'#8a5a2e'); px(ctx,x-4,y-3,9,5,'#c83a2e'); px(ctx,x+2,y-3,4,5,'#d8dce2'); }
  else if(tool==='picareta'){ px(ctx,x,y,3,12,'#8a5a2e'); px(ctx,x-6,y-4,13,4,'#9aa2ac'); }
  else if(tool==='lança'){ px(ctx,x,y-6,3,18,'#8a5a2e'); px(ctx,x-1,y-10,5,6,'#d8dce2'); }
  else if(tool==='arco'){ px(ctx,x,y-8,3,16,'#8a5a2e'); px(ctx,x+3,y-8,1,16,'#e8e8e8'); }
}

// ---------------- Criaturas voxel (fiéis às pranchas) ----------------
export function drawCreature(ctx, c){
  const x=c.x, y=c.y, d=c.dir||1, ph=c.walkPhase||0;
  const tam = {P:0.55,M:0.95,G:1.45,GG:2.1,GGG:2.9}[c.tam]||1;
  const w=30*tam, h=16*tam;
  const legSwing=Math.sin(ph)*4*tam;
  const sleeping=c.estado==='dormir';
  const attacking=c.estado==='atacar'||c.estado==='caçar';
  const yy=y-(sleeping?h*0.35:0);
  const body=c.cor||'#888', dark=shade(body,-34), light=shade(body,30);
  const seed=c.id||1;
  const legs=(n,lh)=>{ if(sleeping){ cube(ctx,x-w/2,yy-5,n? w:0,5,dark,seed); return; } for(let i=0;i<n;i++){ const lx=x-w/2+5+i*(w-10)/Math.max(1,n-1); cube(ctx,lx+(i%2?legSwing:-legSwing),yy-lh,5*tam,lh,dark,seed+i); } };
  const head=(hx,hy,hw,hh)=>{ cube(ctx,hx,hy,hw,hh,body,seed+9); eye(ctx,hx+(d>0?hw-6:3),hy+3); };
  const n=c.nome;

  if(c.aquatico){
    if(n==='tubarão'||n==='orca'){
      cube(ctx,x-w/2,yy-h,w,h*0.8,body,seed); cube(ctx,x-w/2,yy-h*0.45,w,h*0.35,'#eef2f4',seed); // barriga branca
      px(ctx,x-2,yy-h-9,7,9,body); // dorsal
      px(ctx,x-w/2*d-12,yy-h*0.8,12,5,dark); // cauda
      if(attacking){ px(ctx,x+w/2*d-4,yy-h*0.5,10,6,'#7a1a1a'); for(let i=0;i<3;i++) px(ctx,x+w/2*d-2+i*3,yy-h*0.5,2,3,'#fff'); }
      eye(ctx,x+w/2*d-8,yy-h*0.7);
    } else if(n==='golfinho'){
      cube(ctx,x-w/2,yy-h,w,h*0.75,'#5a9ad8',seed); cube(ctx,x-w/2,yy-h*0.45,w,h*0.3,'#eef2f4',seed);
      px(ctx,x+w/2*d,yy-h*0.6,9,4,'#5a9ad8'); px(ctx,x-2,yy-h-7,6,7,'#5a9ad8'); px(ctx,x-w/2*d-10,yy-h*0.7,10,4,dark);
      eye(ctx,x+w/2*d-6,yy-h*0.6);
    } else if(n==='baleia'){
      cube(ctx,x-w/2,yy-h,w*1.2,h*0.9,'#4a7ab8',seed); cube(ctx,x-w/2,yy-h*0.4,w*1.2,h*0.4,'#d8e8f4',seed);
      px(ctx,x-w/2*d-14,yy-h*0.9,14,5,'#3a6aa8'); eye(ctx,x+w/2*d-8,yy-h*0.6);
    } else if(n==='tartaruga marinha'){
      cube(ctx,x-w/2,yy-h*0.7,w,h*0.5,'#3a8a4a',seed); px(ctx,x-w/2,yy-h*0.7,w,4,'#2a6a3a');
      cube(ctx,x+w/2*d-2,yy-h*0.6,10,8,'#7ab86a',seed); px(ctx,x-w/2*d-8,yy-h*0.3,8,4,'#3a8a4a'); eye(ctx,x+w/2*d+4,yy-h*0.5);
    } else if(n==='raia'){
      px(ctx,x-w/2,yy-h*0.6,w,h*0.4,body); px(ctx,x-w/2*d-16,yy-h*0.5,16,2,dark); eye(ctx,x+w/2*d-6,yy-h*0.5);
    } else if(n==='polvo'||n==='lula'){
      cube(ctx,x-w/2,yy-h,w*0.6,h*0.7,body,seed); for(let i=0;i<4;i++) px(ctx,x-w/2+i*7,yy-h*0.3,5,9,dark);
      eye(ctx,x-4,yy-h*0.7); eye(ctx,x+3,yy-h*0.7);
    } else if(n==='crustáceo'){
      cube(ctx,x-w/2,yy-h*0.6,w,h*0.4,'#d86a3a',seed); px(ctx,x+w/2*d,yy-h*0.8,8,5,'#d86a3a'); px(ctx,x-w/2*d-6,yy-h*0.8,8,5,'#d86a3a'); eye(ctx,x-2,yy-h*0.9);
    } else { // peixe
      cube(ctx,x-w/2,yy-h,w,h*0.6,'#5ab0e8',seed); px(ctx,x-w/2*d-8,yy-h*0.8,8,5,'#3a8ad8'); px(ctx,x-2,yy-h-5,5,5,'#e88a3a'); eye(ctx,x+w/2*d-5,yy-h*0.6);
    }
    return;
  }
  if(c.voador){ // Pteranodonte
    const flap=Math.sin(ph*2)*8;
    cube(ctx,x-w/2,yy-h*1.2,w,h*0.6,'#d87a4a',seed);
    px(ctx,x-w/2-14,yy-h*1.2-flap,14,5,'#b85a2e'); px(ctx,x+w/2,yy-h*1.2-flap,14,5,'#b85a2e');
    px(ctx,x+w/2*d,yy-h*1.3,11,6,'#d87a4a'); px(ctx,x+w/2*d+9,yy-h*1.2,10,3,'#e8a83a'); eye(ctx,x+w/2*d+3,yy-h*1.2);
    return;
  }
  // ---- dinossauros ----
  if(n==='Tiranossauro rex'||n==='Carnotauro'||n==='Espinossauro'){
    cube(ctx,x-w/2,yy-h,w,h*0.8,'#7a8a6a',seed); // corpo cinza-esverdeado (modelo)
    px(ctx,x-w/2*d-16,yy-h*0.7,16,5,'#5a6a4a'); // cauda longa
    cube(ctx,x+w/2*d-8,yy-h-12*tam,20*tam,14*tam,'#7a8a6a',seed+2); // cabeça enorme
    if(attacking){ px(ctx,x+w/2*d+6,yy-h-4,10,6,'#7a1a1a'); for(let i=0;i<4;i++) px(ctx,x+w/2*d+7+i*3,yy-h-4,2,4,'#fff'); }
    eye(ctx,x+w/2*d+2,yy-h-8*tam);
    px(ctx,x+w/2*d-4,yy-h*0.4,4,6,'#5a6a4a'); // bracinho
    legs(2,7*tam);
    if(n==='Espinossauro') for(let i=0;i<4;i++) px(ctx,x-w/2+i*9,yy-h-6,6,7,'#c84a3a');
    return;
  }
  if(n==='Diplodoco'||n==='Braquiossauro'){
    cube(ctx,x-w/2,yy-h,w,h*0.7,body,seed);
    px(ctx,x-w/2*d-20,yy-h*0.6,20,4,body); // cauda longa
    px(ctx,x+w/2*d-6,yy-h-30*tam,7,30*tam,body); // pescoço longo
    cube(ctx,x+w/2*d-10,yy-h-38*tam,16,10,body,seed+2); eye(ctx,x+w/2*d-4,yy-h-34*tam);
    legs(4,8*tam); return;
  }
  if(n==='Triceratops'){
    cube(ctx,x-w/2,yy-h,w,h*0.8,'#c87a3a',seed); // laranja (modelo)
    cube(ctx,x+w/2*d-6,yy-h-14*tam,18*tam,16*tam,'#c87a3a',seed+2); // frill
    px(ctx,x+w/2*d+8,yy-h-16*tam,4,10,'#e8dcc0'); px(ctx,x+w/2*d+12,yy-h-10*tam,4,8,'#e8dcc0'); px(ctx,x+w/2*d+10,yy-h-2*tam,4,7,'#e8dcc0'); // 3 chifres
    eye(ctx,x+w/2*d+2,yy-h-8*tam); legs(4,8*tam); return;
  }
  if(n==='Estegossauro'){
    cube(ctx,x-w/2,yy-h,w,h*0.75,'#6a9a4a',seed);
    for(let i=0;i<5;i++) px(ctx,x-w/2+i*8,yy-h-7,7,8,'#c83a2e'); // placas vermelhas (modelo)
    cube(ctx,x+w/2*d-6,yy-h-4,13,10,'#6a9a4a',seed+2); eye(ctx,x+w/2*d,yy-h-2);
    px(ctx,x-w/2*d-12,yy-h*0.5,12,4,'#5a8a3a'); legs(4,8*tam); return;
  }
  if(n==='Velociraptor'||n==='Compsognato'){
    cube(ctx,x-w/2,yy-h,w,h*0.6,'#c87a3a',seed); px(ctx,x-w/2*d-12,yy-h*0.5,12,4,'#a85a2e');
    cube(ctx,x+w/2*d-6,yy-h-8,13,9,'#c87a3a',seed+2); eye(ctx,x+w/2*d,yy-h-5);
    px(ctx,x-2,yy-4,5,4,'#e8dcc0'); legs(2,6*tam); return;
  }
  if(n==='Anquilossauro'){ cube(ctx,x-w/2,yy-h,w,h*0.8,'#8a7a5a',seed); px(ctx,x-w/2*d-10,yy-h*0.6,10,8,'#6a5a3a'); cube(ctx,x+w/2*d-6,yy-h-4,13,10,'#8a7a5a',seed+2); eye(ctx,x+w/2*d,yy-h-2); legs(4,7*tam); return; }
  if(n==='Parasaurolophus'){ cube(ctx,x-w/2,yy-h,w,h*0.7,'#d8a86a',seed); px(ctx,x+w/2*d-4,yy-h-16,5,14,'#d8a86a'); cube(ctx,x+w/2*d-7,yy-h-4,13,10,'#d8a86a',seed+2); eye(ctx,x+w/2*d,yy-h-2); legs(2,8*tam); return; }
  if(n==='Iguanodonte'){ cube(ctx,x-w/2,yy-h,w,h*0.7,'#8aa87a',seed); cube(ctx,x+w/2*d-6,yy-h-6,13,10,'#8aa87a',seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(2,8*tam); return; }
  if(n==='Mosassauro'||n==='Plesiossauro'){ cube(ctx,x-w/2,yy-h,w*1.3,h*0.7,'#4a7a8a',seed); px(ctx,x-w/2*d-14,yy-h*0.7,14,5,'#3a6a7a'); px(ctx,x-2,yy-h-8,6,8,'#3a6a7a'); eye(ctx,x+w/2*d+4,yy-h*0.6); return; }
  // ---- mamíferos / aves / répteis (pranchas) ----
  if(n==='cavalo'){
    cube(ctx,x-w/2,yy-h,w,h*0.75,'#a86a2e',seed); // marrom (modelo)
    px(ctx,x-3,yy-h-8,7,9,'#3a2410'); // crina escura
    cube(ctx,x+w/2*d-6,yy-h-6,14,11,'#a86a2e',seed+2); cube(ctx,x+w/2*d+4,yy-h-3,9,6,'#e8e8e8',seed+3); // focinho branco
    eye(ctx,x+w/2*d,yy-h-3); px(ctx,x-w/2*d-8,yy-h*0.8,8,4,'#3a2410');
    legs(4,8*tam); for(let i=0;i<4;i++){ const lx=x-w/2+5+i*(w-10)/3; px(ctx,lx,yy-3,6,3,'#e8e8e8'); } // patas brancas
  } else if(n==='capivara'){
    cube(ctx,x-w/2,yy-h,w,h*0.8,'#c89a5a',seed); cube(ctx,x+w/2*d-6,yy-h-4,14,11,'#c89a5a',seed+2);
    px(ctx,x+w/2*d+4,yy-h-1,7,5,'#a87a3a'); eye(ctx,x+w/2*d,yy-h-1); legs(4,7*tam);
  } else if(n==='lobo'){
    cube(ctx,x-w/2,yy-h,w,h*0.7,'#8a929c',seed); px(ctx,x-w/2*d-10,yy-h*0.6,10,4,'#6a727c');
    cube(ctx,x+w/2*d-6,yy-h-8,13,10,'#8a929c',seed+2); px(ctx,x+w/2*d-4,yy-h-13,4,6,'#6a727c'); px(ctx,x+w/2*d+3,yy-h-13,4,6,'#6a727c');
    eye(ctx,x+w/2*d,yy-h-4); legs(4,7*tam); for(let i=0;i<4;i++){ const lx=x-w/2+5+i*(w-10)/3; px(ctx,lx,yy-3,6,3,'#e8e8e8'); }
  } else if(n==='urso'){
    cube(ctx,x-w/2,yy-h,w,h*0.9,'#7a4a26',seed); cube(ctx,x+w/2*d-6,yy-h-6,14,12,'#7a4a26',seed+2);
    px(ctx,x+w/2*d+4,yy-h-2,8,6,'#d8b88a'); // focinho claro
    if(attacking){ px(ctx,x+w/2*d+5,yy-h-1,7,5,'#7a1a1a'); }
    eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='crocodilo'){
    cube(ctx,x-w/2,yy-h,w,h*0.6,'#4a8a3a',seed); px(ctx,x-w/2*d-14,yy-h*0.5,14,4,'#3a7a2e');
    cube(ctx,x+w/2*d-8,yy-h-4,18,8,'#4a8a3a',seed+2);
    if(attacking){ px(ctx,x+w/2*d+6,yy-h-2,12,5,'#7a1a1a'); for(let i=0;i<4;i++) px(ctx,x+w/2*d+7+i*3,yy-h-2,2,3,'#fff'); }
    eye(ctx,x+w/2*d+2,yy-h-3); legs(4,6*tam);
  } else if(n==='elefante'){
    cube(ctx,x-w/2,yy-h,w,h*0.95,'#9aa2ac',seed); cube(ctx,x+w/2*d-8,yy-h-8,18,16,'#9aa2ac',seed+2); // orelha grande
    px(ctx,x+w/2*d+6,yy-h+2,5,12,'#9aa2ac'); px(ctx,x+w/2*d+2,yy-h+6,4,8,'#e8e8e8'); px(ctx,x+w/2*d-2,yy-h+6,4,8,'#e8e8e8'); // tromba + presas
    eye(ctx,x+w/2*d+2,yy-h-4); legs(4,9*tam);
  } else if(n==='rinoceronte'){
    cube(ctx,x-w/2,yy-h,w,h*0.85,'#9aa2ac',seed); cube(ctx,x+w/2*d-6,yy-h-6,15,13,'#9aa2ac',seed+2);
    px(ctx,x+w/2*d+6,yy-h-12,5,14,'#e8e8e8'); // chifre grande (modelo)
    eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='leão'){
    cube(ctx,x-w/2,yy-h,w,h*0.75,'#d8a84a',seed); cube(ctx,x+w/2*d-8,yy-h-10,18,18,'#a86a1e',seed+2); // juba
    cube(ctx,x+w/2*d-4,yy-h-6,11,10,'#d8a84a',seed+3); eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='tigre'){
    cube(ctx,x-w/2,yy-h,w,h*0.75,'#e87a2e',seed); for(let i=0;i<4;i++) px(ctx,x-w/2+i*8,yy-h,3,h*0.75,'#3a2410');
    cube(ctx,x+w/2*d-6,yy-h-6,13,11,'#e87a2e',seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='onça'){
    cube(ctx,x-w/2,yy-h,w,h*0.75,'#d8a84a',seed); for(let i=0;i<5;i++) px(ctx,x-w/2+i*7,yy-h+3,3,3,'#3a2410');
    cube(ctx,x+w/2*d-6,yy-h-6,13,11,'#d8a84a',seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='hiena'){
    cube(ctx,x-w/2,yy-h,w,h*0.75,'#a8986a',seed); px(ctx,x-2,yy-h-7,8,8,'#6a5a3a');
    cube(ctx,x+w/2*d-6,yy-h-6,13,11,'#a8986a',seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='serpente venenosa'){
    for(let i=0;i<5;i++) cube(ctx,x-w/2+i*7,yy-h*0.5,8,5,'#4a8a3a',seed+i);
    cube(ctx,x+w/2*d-4,yy-h*0.7,10,7,'#4a8a3a',seed+5); px(ctx,x+w/2*d+4,yy-h*0.6,6,2,'#c83a2e'); eye(ctx,x+w/2*d,yy-h*0.6);
  } else if(n==='galinha'){
    cube(ctx,x-w/2,yy-h,w*0.7,h*0.7,'#f2f2f2',seed); cube(ctx,x+w/2*d-4,yy-h-8,9,8,'#f2f2f2',seed+2);
    px(ctx,x+w/2*d+3,yy-h-11,5,4,'#e84a3a'); px(ctx,x+w/2*d+5,yy-h-5,6,3,'#e8a83a'); eye(ctx,x+w/2*d+1,yy-h-6); legs(2,5*tam);
  } else if(n==='pato'){
    cube(ctx,x-w/2,yy-h,w*0.7,h*0.7,'#7ab8e8',seed); cube(ctx,x+w/2*d-4,yy-h-8,9,8,'#5a9ad8',seed+2);
    px(ctx,x+w/2*d+5,yy-h-5,6,3,'#e8a83a'); eye(ctx,x+w/2*d+1,yy-h-6); legs(2,5*tam);
  } else if(n==='coelho'){
    cube(ctx,x-w/2,yy-h,w*0.7,h*0.6,'#c8c8c8',seed); cube(ctx,x+w/2*d-4,yy-h-6,9,8,'#c8c8c8',seed+2);
    px(ctx,x+w/2*d-2,yy-h-14,3,9,'#c8c8c8'); px(ctx,x+w/2*d+2,yy-h-14,3,9,'#c8c8c8'); eye(ctx,x+w/2*d+1,yy-h-4); legs(2,5*tam);
  } else if(n==='ovelha'){
    cube(ctx,x-w/2,yy-h,w,h*0.8,'#e8e8e8',seed); cube(ctx,x+w/2*d-6,yy-h-6,12,10,'#d8d8d8',seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(4,7*tam);
  } else if(n==='vaca'){
    cube(ctx,x-w/2,yy-h,w,h*0.8,'#8a5a3a',seed); px(ctx,x-w/2+4,yy-h+3,8,6,'#e8e8e8'); px(ctx,x+w/2-12,yy-h+5,8,6,'#e8e8e8');
    cube(ctx,x+w/2*d-6,yy-h-6,13,11,'#8a5a3a',seed+2); px(ctx,x+w/2*d-4,yy-h-11,3,6,'#e8dcc0'); px(ctx,x+w/2*d+3,yy-h-11,3,6,'#e8dcc0'); eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='camelo'){
    cube(ctx,x-w/2,yy-h,w,h*0.8,'#d8b87a',seed); px(ctx,x-4,yy-h-8,10,8,'#c8a86a'); // corcova
    cube(ctx,x+w/2*d-6,yy-h-10,12,14,'#d8b87a',seed+2); eye(ctx,x+w/2*d,yy-h-6); legs(4,9*tam);
  } else if(n==='cervo'){
    cube(ctx,x-w/2,yy-h,w,h*0.7,'#a87a4a',seed); cube(ctx,x+w/2*d-6,yy-h-8,12,10,'#a87a4a',seed+2);
    px(ctx,x+w/2*d-3,yy-h-16,2,9,'#e8dcc0'); px(ctx,x+w/2*d+3,yy-h-16,2,9,'#e8dcc0'); eye(ctx,x+w/2*d,yy-h-5); legs(4,8*tam);
  } else if(n==='cabra'){
    cube(ctx,x-w/2,yy-h,w,h*0.7,'#a89880',seed); cube(ctx,x+w/2*d-6,yy-h-8,12,10,'#a89880',seed+2);
    px(ctx,x+w/2*d-3,yy-h-13,2,6,'#e8dcc0'); px(ctx,x+w/2*d+3,yy-h-13,2,6,'#e8dcc0'); eye(ctx,x+w/2*d,yy-h-5); legs(4,7*tam);
  } else if(n==='gorila'||n==='búfalo'||n==='hipopótamo'||n==='javali'||n==='alce'||n==='touro'){
    cube(ctx,x-w/2,yy-h,w,h*0.9,body,seed); cube(ctx,x+w/2*d-6,yy-h-6,14,12,body,seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(4,8*tam);
  } else if(n==='foca'){
    cube(ctx,x-w/2,yy-h,w,h*0.6,'#a8a8b0',seed); cube(ctx,x+w/2*d-4,yy-h-6,10,8,'#a8a8b0',seed+2); eye(ctx,x+w/2*d,yy-h-4);
  } else { // genérico quadrúpede
    cube(ctx,x-w/2,yy-h,w,h*0.75,body,seed); cube(ctx,x+w/2*d-6,yy-h-6,13,11,body,seed+2); eye(ctx,x+w/2*d,yy-h-3); legs(4,7*tam);
  }
  // sela / arreio / armadura / laço de domado
  if(c.equip){ cube(ctx,x-9,yy-h-4,18,6,'#7a4a2e',seed+20); px(ctx,x-9,yy-h-4,18,2,'#c8a84a'); }
  if(c.sela){ cube(ctx,x-7,yy-h-5,14,5,'#5a3a1e',seed+21); }
  if(c.tamed){ px(ctx,x-2,yy-h-13,5,5,'#e84a6a'); }
  if(c.veneno){ px(ctx,x+w/2*d-4,yy-h+4,4,4,'#e8e84a'); }
}

// ---------------- Cenário voxel ----------------
export function drawTree(ctx,t){
  const x=t.x, y=t.y;
  if(t.tipo==='palmeira'){ cube(ctx,x-4,y-64,8,64,'#8a5a2e',1); cube(ctx,x-24,y-84,48,14,'#2e9a3a',2); cube(ctx,x-16,y-94,32,12,'#3ab84a',3); }
  else if(t.tipo==='pinheiro'){ cube(ctx,x-4,y-30,8,30,'#6a4a2e',1); cube(ctx,x-18,y-78,36,30,'#2a7a3a',2); cube(ctx,x-13,y-98,26,24,'#3a9a4a',3); }
  else { cube(ctx,x-5,y-44,10,44,'#7a5a32',1); cube(ctx,x-22,y-82,44,40,'#2e9a3a',2); cube(ctx,x-15,y-94,30,14,'#3ab84a',3); }
}
export function drawRock(ctx,r){
  const x=r.x, y=r.y;
  cube(ctx,x-17,y-17,34,17,'#8a929c',5);
  const cor=r.cor||'#d8d8d8';
  px(ctx,x-10,y-13,6,6,cor); px(ctx,x+3,y-9,6,6,cor); px(ctx,x-2,y-16,5,5,cor); px(ctx,x+8,y-14,4,4,cor); // veios salpicados
}
export function drawPlant(ctx,p,t){
  const x=p.x, y=p.y, sway=Math.sin(t*2+p.x*0.01)*2;
  if(p.tipo==='tronco caído'){ cube(ctx,x-19,y-9,38,9,'#8a5a2e',1); px(ctx,x-19,y-9,38,3,'#c8a86a'); }
  else if(p.tipo==='pedra do chão'){ cube(ctx,x-8,y-8,16,8,'#9aa2ac',2); }
  else if(p.tipo==='fruta'){ cube(ctx,x-3,y-16,6,16,'#6a4a2e',1); cube(ctx,x-11,y-27,22,13,'#2e9a3a',2); px(ctx,x-7,y-24,5,5,'#e84a3a'); px(ctx,x+3,y-22,5,5,'#e84a3a'); }
  else if(p.tipo==='mel'){ cube(ctx,x-3,y-20,6,20,'#6a4a2e',1); cube(ctx,x-9,y-31,18,13,'#c8a83a',2); px(ctx,x-5,y-26,5,5,'#e8d24a'); }
  else if(p.tipo==='planta medicinal'){ cube(ctx,x-3,y-14,6,14,'#3a9a4a',1); cube(ctx,x-9,y-23,18,11,'#e88ab8',2); px(ctx,x-3,y-18,6,6,'#fff'); }
  else if(p.tipo==='cogumelo'){ cube(ctx,x-3,y-8,6,8,'#e8d8c8',1); cube(ctx,x-8,y-15,16,8,'#c84a3a',2); }
  else { cube(ctx,x-3+sway,y-14,6,14,'#3a9a4a',1); cube(ctx,x-9+sway,y-21,18,9,'#4ab85a',2); }
}
export function drawBuilding(ctx,b,t){
  const x=b.x, y=b.y;
  switch(b.nome){
    case 'fogueira': cube(ctx,x-13,y-9,26,9,'#8a929c',1); px(ctx,x-8,y-17,16,9,'#e87a2e'); px(ctx,x-5,y-24,10,9,'#f2c14e'); px(ctx,x-3,y-31,6,9,'#f8e8a8'); break;
    case 'bancada': cube(ctx,x-21,y-17,42,9,'#c8a86a',1); cube(ctx,x-19,y-8,7,8,'#8a5a2e',2); cube(ctx,x+12,y-8,7,8,'#8a5a2e',2); px(ctx,x-8,y-22,10,5,'#9aa2ac'); break;
    case 'fornalha': cube(ctx,x-15,y-32,30,32,'#9aa2ac',1); cube(ctx,x-8,y-20,16,13,'#3a3a3a',2); px(ctx,x-6,y-17,12,8,'#e87a2e'); px(ctx,x-3,y-15,6,5,'#f2c14e'); break;
    case 'cama': cube(ctx,x-25,y-11,50,11,'#8a5a2e',1); cube(ctx,x-25,y-17,50,7,'#c83a2e',2); px(ctx,x-25,y-17,13,7,'#e8e8e8'); break;
    case 'abrigo': cube(ctx,x-27,y-36,54,36,'#c8a86a',1); cube(ctx,x-31,y-43,62,9,'#8a5a2e',2); px(ctx,x-9,y-24,18,24,'#3a2a1a'); break;
    case 'casa': cube(ctx,x-35,y-50,70,50,'#c8a86a',1); cube(ctx,x-41,y-59,82,11,'#a84a2e',2); px(ctx,x-11,y-32,22,32,'#5a3a1e'); px(ctx,x+15,y-38,13,13,'#f2d24a'); break;
    case 'torre': case 'posto de observação': cube(ctx,x-11,y-92,22,92,'#c8a86a',1); cube(ctx,x-19,y-103,38,13,'#8a5a2e',2); px(ctx,x-15,y-99,9,9,'#f2d24a'); break;
    case 'ponte': cube(ctx,x-41,y-7,82,7,'#c8a86a',1); px(ctx,x-37,y-13,7,7,'#8a5a2e'); px(ctx,x+30,y-13,7,7,'#8a5a2e'); break;
    case 'cerca': case 'baia': case 'estábulo': cube(ctx,x-31,y-26,62,7,'#c8a86a',1); cube(ctx,x-31,y-13,62,7,'#c8a86a',1); cube(ctx,x-31,y-28,7,28,'#8a5a2e',2); cube(ctx,x+24,y-28,7,28,'#8a5a2e',2); break;
    case 'portão': cube(ctx,x-17,y-28,34,28,'#c8a86a',1); break;
    case 'doca': cube(ctx,x-31,y-9,62,9,'#c8a86a',1); cube(ctx,x-27,y,7,22,'#8a5a2e',2); cube(ctx,x+20,y,7,22,'#8a5a2e',2); break;
    case 'barco': cube(ctx,x-27,y-15,54,13,'#c8a86a',1); cube(ctx,x-4,y-36,5,24,'#8a5a2e',2); px(ctx,x-4,y-36,24,16,'#e8e8e8'); px(ctx,x-4,y-36,24,4,'#c83a2e'); break;
    case 'armazém': cube(ctx,x-27,y-32,54,32,'#c8a86a',1); cube(ctx,x-27,y-32,54,7,'#8a5a2e',2); px(ctx,x-9,y-20,18,20,'#5a3a1e'); break;
    case 'horta (canteiro)': cube(ctx,x-25,y-9,50,9,'#5a3a1e',1); cube(ctx,x-21,y-15,42,7,'#3a9a4a',2); break;
    case 'armadilha': cube(ctx,x-15,y-15,30,15,'#c8a86a',1); px(ctx,x-11,y-21,22,7,'#c8a83a'); break;
    case 'escada': cube(ctx,x-9,y-62,18,62,'#c8a86a',1); for(let i=0;i<5;i++) px(ctx,x-9,y-58+i*13,18,4,'#8a5a2e'); break;
    case 'carroça': cube(ctx,x-25,y-17,50,11,'#c8a86a',1); cube(ctx,x-19,y-6,11,11,'#3a2a1a',2); cube(ctx,x+8,y-6,11,11,'#3a2a1a',2); break;
    case 'guindaste simples': cube(ctx,x-5,y-72,10,72,'#c8a86a',1); cube(ctx,x-5,y-72,42,7,'#8a5a2e',2); px(ctx,x+32,y-66,4,32,'#c8a83a'); break;
    default: cube(ctx,x-15,y-22,30,22,'#c8a86a',1);
  }
  if(b.crop){ const g=b.crop.progress; cube(ctx,x-7,y-26-g*12,14,5,'#4ab85a',9); }
}
export function drawPOI(ctx,p){
  const x=p.x, y=p.y;
  if(p.tipo==='cachoeiras'){ px(ctx,x-15,y-62,30,62,'#5ab0e8'); px(ctx,x-15,y-62,30,7,'#b8e8f8'); px(ctx,x-9,y-40,4,22,'#fff'); px(ctx,x+3,y-30,4,32,'#fff'); }
  else if(p.tipo==='ruínas'||p.tipo==='aldeias abandonadas'){ cube(ctx,x-25,y-32,11,32,'#9aa2ac',1); cube(ctx,x+10,y-24,13,24,'#8a929c',2); cube(ctx,x-25,y-37,50,7,'#7a828c',3); }
  else if(p.tipo==='acampamentos'){ cube(ctx,x-17,y-17,34,17,'#c8a86a',1); px(ctx,x-5,y-32,10,17,'#c83a2e'); }
  else if(p.tipo==='torres de observação'){ cube(ctx,x-9,y-82,18,82,'#c8a86a',1); cube(ctx,x-15,y-93,30,13,'#8a5a2e',2); }
  else if(p.tipo==='naufrágios'){ cube(ctx,x-31,y-17,62,15,'#8a5a2e',1); cube(ctx,x-7,y-42,7,28,'#6a4a2e',2); }
  else if(p.tipo==='entradas de cavernas'){ cube(ctx,x-21,y-36,42,36,'#6a727c',1); px(ctx,x-15,y-30,30,30,'#0a0a0a'); px(ctx,x-15,y-30,30,4,'#3a3a3a'); }
  else if(p.tipo==='fósseis'){ cube(ctx,x-15,y-9,30,9,'#e8e0c8',1); px(ctx,x-9,y-15,18,7,'#d8d0b8'); }
  else { cube(ctx,x-13,y-26,26,26,'#6a5a9a',1); px(ctx,x-7,y-33,14,9,'#ffd97a'); }
}
export function drawCloud(ctx,x,y,w){
  px(ctx,x,y,w,10,'#ffffff'); px(ctx,x+8,y-8,w*0.6,8,'#ffffff'); px(ctx,x+4,y+8,w*0.8,6,'#eef4f8');
}
