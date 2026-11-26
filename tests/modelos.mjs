import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
const loaded=[];
globalThis.Image=class { constructor(){this.complete=true;this.naturalWidth=100;this.naturalHeight=100;} set src(value){this.path=value;loaded.push(value);} };
const {drawPlayer,drawCreature,drawRock,drawBuilding,drawTree,drawPlant,drawPOI}=await import('../src/sprites.js');
const draws=[];
const ctx=new Proxy({}, {get(t,k){if(k==='drawImage')return (...args)=>draws.push(args);return ()=>{}},set(){return true}});
const player={x:0,y:0,dir:1,skin:'#e0b088',hair:'#2a1a0a',shirt:'#c84a3a',hairStyle:'curto',beard:true};
drawPlayer(ctx,player);
for(const nome of ['cavalo','lobo','capivara','urso','crocodilo','tubarão','Triceratops','Tiranossauro rex','Velociraptor','Estegossauro','Diplodoco','Braquiossauro','Anquilossauro','Parasaurolophus','Pteranodonte','Espinossauro','Carnotauro','Iguanodonte','Mosassauro','Plesiossauro','Compsognato','baleia','golfinho','orca','tartaruga marinha','polvo','raia','galinha','pato','coelho','cabra','ovelha','vaca','camelo','cervo','elefante','rinoceronte','búfalo','hipopótamo','gorila','javali','alce','touro','leão','tigre','onça','hiena','serpente venenosa','peixe','foca','lula','crustáceo']) drawCreature(ctx,{x:0,y:0,nome,dir:1});
drawRock(ctx,{x:0,y:0,ore:'ferro'});
drawBuilding(ctx,{x:0,y:0,nome:'fornalha'},0);
drawTree(ctx,{x:0,y:0,tipo:'árvore'});
assert.equal(draws.length,56);
assert.ok(draws[0][0].path.includes('/sprites-aprovados/personagem.png'));
assert.ok(draws[1][0].path.includes('/sprites-aprovados/cavalo.png'));
assert.ok(draws[53][0].path.includes('/sprites-aprovados/rocha.png'));
assert.ok(draws[54][0].path.includes('/sprites-aprovados/fornalha.png'));
assert.ok(draws[55][0].path.includes('/sprites-aprovados/arvore.png'));
for(const path of loaded) assert.ok(existsSync(path.split('?')[0]),`Modelo ausente: ${path}`);
console.log('Sprites aprovados e alternativas: arquivos disponíveis e usados no desenho OK');

for(const nome of ['abrigo','casa','torre','ponte','fogueira','cerca','portão','estábulo','baia','doca','barco','armazém','horta (canteiro)','armadilha','cama','posto de observação','escada','carroça','guindaste simples','bancada']) { const before=draws.length; drawBuilding(ctx,{x:0,y:0,nome},0); assert.equal(draws.length,before+1,`Modelo ausente: ${nome}`); assert.ok(draws.at(-1)[0].path.includes('/sprites-aprovados/')); }
const {ANIMALS,DINOSAURS,MARINE}=await import('../src/data.js');
for(const species of [...ANIMALS,...DINOSAURS,...MARINE]) {
  const before=draws.length;
  drawCreature(ctx,{...species,x:0,y:0,dir:1,walkPhase:0,estado:'parado'});
  assert.equal(draws.length,before+1,`Falta sprite para ${species.nome}`);
  assert.ok(draws.at(-1)[0].path.includes('/sprites-aprovados/'),`Falta modelo no estilo aprovado: ${species.nome}`);
}
console.log('Todas as espécies cadastradas usam os novos modelos.');

{ const before=draws.length; drawBuilding(ctx,{x:0,y:0,nome:"horta (canteiro)",crop:{progress:.7}},0); assert.equal(draws.length,before+1,"Horta cultivada deve manter o sprite"); }

for(const ferramenta of ["machado simples","picareta","lança","arco"]) { const before=draws.length; drawPlayer(ctx,{...player,tool:ferramenta}); assert.equal(draws.length,before+2,`Ferramenta não desenhada: ${ferramenta}`); }
const {BUILDINGS}=await import('../src/data.js');
for(const item of BUILDINGS) {
  const before=draws.length;
  drawBuilding(ctx,{nome:item.nome,x:0,y:0},0);
  assert.equal(draws.length,before+1,`Falta modelo para construção ${item.nome}`);
  assert.ok(draws.at(-1)[0].path.includes('/sprites-aprovados/'),`Construção fora do estilo aprovado: ${item.nome}`);
}
console.log('Todas as construções cadastradas usam os novos modelos.');

for(const tipo of ["pinheiro","palmeira","árvore"]) { const before=draws.length; drawTree(ctx,{tipo,x:0,y:0}); assert.equal(draws.length,before+1,`Árvore sem modelo: ${tipo}`); assert.ok(draws.at(-1)[0].path.includes("/sprites-aprovados/")); }
for(const tipo of ["fibra","capim","fruta","cogumelo","planta medicinal","mel","pedra do chão","semente","folha","tronco caído"]) { const before=draws.length; drawPlant(ctx,{tipo,x:0,y:0},0); assert.equal(draws.length,before+1,`Recurso sem modelo: ${tipo}`); assert.ok(draws.at(-1)[0].path.includes("/sprites-aprovados/")); }

const {POIS}=await import("../src/data.js");
for(const tipo of POIS){ const before=draws.length; drawPOI(ctx,{tipo,x:0,y:0}); assert.equal(draws.length,before+1,`POI sem modelo: ${tipo}`); assert.ok(draws.at(-1)[0].path.includes("/sprites-aprovados/")); }
console.log("Todos os pontos de interesse usam os novos modelos.");
