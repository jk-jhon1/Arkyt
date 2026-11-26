import assert from 'node:assert/strict';
const ctx = new Proxy({}, {get(target,key){ if(!(key in target)) target[key]=()=>{}; return target[key]; },set(t,k,v){t[k]=v;return true;}});
const nodes=new Map();
function element(id='') { return { id, style:{}, children:[], classList:{add(){},remove(){},contains(){return true;}}, prepend(){}, appendChild(child){this.children.push(child)}, addEventListener(){}, getContext(){return ctx;}, width:720,height:340, set innerHTML(v){this.children=[]}, get innerHTML(){return ''} }; }
globalThis.document={getElementById(id){if(!nodes.has(id)) nodes.set(id,element(id)); return nodes.get(id)}, createElement(){return element()}};
globalThis.window={innerWidth:800,innerHeight:600,addEventListener(){}};
Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[]},configurable:true});
const store={};globalThis.localStorage={setItem(k,v){store[k]=v},getItem(k){return store[k]??null}};
globalThis.setTimeout=()=>0;
const { Game } = await import('../src/game.js');
const { openMap } = await import('../src/ui.js');
const game=new Game(element('game'));
game.newGame('teste', {skin:'#e4b394',hair:'#35251c',hairStyle:'curto',shirt:'#c54a40'});
game.audio.update=()=>{};game.audio.ambiente=()=>{};game.audio.sfx=()=>{};
const x=game.player.x,y=game.player.mapY;
game.keys.w=true; game.update(.1); game.keys.w=false;
assert.ok(game.player.mapY<y); assert.equal(game.player.x,x);
const y2=game.player.mapY;game.keys.d=true;game.update(.1);game.keys.d=false;
assert.ok(game.player.x>x); assert.equal(game.player.mapY,y2);
const o={x:game.player.x,mapY:game.player.mapY+200};assert.equal(game.nearest([o],80),null);
const saveY=game.player.mapY;game.save(true);assert.ok(game.load());assert.equal(game.player.mapY,saveY);
game.render();openMap(game);
console.log('Jogo: movimento em duas direções, proximidade, save/load e renderização OK');
// Animais perseguem ou fogem na direção correta em ambas as dimensões.
const random=Math.random; Math.random=()=>.9;
game.entities=[];
const template={id:777,nome:'lobo',x:game.player.x-100,mapY:game.player.mapY-100,y:0,vel:100,dano:10,hp:100,maxHp:100,timer:10,walkPhase:0,dir:1,estado:'vagar',cat:'agressivo',cor:'#777777',tamed:false};
const predator={...template}; game.entities.push(predator);
const oldDist=Math.hypot(predator.x-game.player.x,predator.mapY-game.player.mapY);
game.updateEntities(.1);
assert.ok(Math.hypot(predator.x-game.player.x,predator.mapY-game.player.mapY)<oldDist,'predador deve perseguir');
const prey={...template,id:778,cat:'pacifico',x:game.player.x-50,mapY:game.player.mapY-50};
game.entities=[prey]; const oldPrey=Math.hypot(prey.x-game.player.x,prey.mapY-game.player.mapY);
game.updateEntities(.1);assert.ok(Math.hypot(prey.x-game.player.x,prey.mapY-game.player.mapY)>oldPrey,'presa deve fugir');
// Os filhotes criados durante o update não podem ser perdidos pelo filter.
const parent={...template,id:779,nome:'cavalo',cat:'pacifico',tamed:true,montaria:true,sela:true,comando:'ficar'};
const mate={...parent,id:780,x:parent.x+10};game.entities=[parent,mate];game.spawnCreatureNear=()=>{};Math.random=()=>0;
game.updateEntities(.1);assert.ok(game.entities.some(e=>e.filhote),'filhote deve permanecer na lista');
// A montaria carregada deve ser o mesmo objeto da lista de animais.
game.player.riding=parent;game.save(true);assert.ok(game.load());
assert.equal(game.player.riding,game.entities.find(e=>e.id===779));
const prevX=game.player.x;game.keys.d=true;Math.random=()=>.9;game.update(.1);game.keys.d=false;
assert.ok(game.player.x>prevX);assert.equal(game.player.riding.x,game.player.x);
// Criação sem estação não consome itens; confirmBuild inválido não falha.
const {RECIPES}=await import('../src/data.js');
game.player.riding=null;game.buildings=[];game.inventory=[{item:'madeira',qtd:2},{item:'pedra',qtd:1},{item:'fibra',qtd:1}];
const before=JSON.stringify(game.inventory);game.craft(RECIPES.find(r=>r.out==='lança'));assert.equal(JSON.stringify(game.inventory),before);
game.confirmBuild();
Math.random=random;
console.log('Animais: fuga, perseguição, reprodução, montaria e crafting OK');
// Estruturas fabricadas podem ser posicionadas sem cobrar materiais duas vezes.
game.inventory=[{item:'bancada',qtd:1},{item:'madeira',qtd:3},{item:'pedra',qtd:1},{item:'fibra',qtd:1}];game.selectedSlot=0;
const xstation=game.player.x+game.player.dir*60;game.useSelected();
assert.equal(game.buildMode,'bancada');assert.equal(game.buildSource,'item');
assert.equal(game.countItem('bancada'),1);game.confirmBuild();
assert.equal(game.countItem('bancada'),0);assert.equal(game.countItem('madeira'),3);
assert.ok(game.buildings.some(b=>b.nome==='bancada'&&b.x===xstation));
assert.equal(game.nearestStation(),'bancada');
const spear=RECIPES.find(r=>r.out==='lança');game.craft(spear);assert.equal(game.countItem('lança'),1);
// Uma estrutura removida antes da confirmação não deve ser instalada grátis.
game.inventory=[{item:'fornalha',qtd:1}];game.selectedSlot=0;game.useSelected();game.removeItem('fornalha',1);
const oldBuildings=game.buildings.length;game.confirmBuild();assert.equal(game.buildings.length,oldBuildings);
console.log('Posicionamento e utilização de estações fabricadas OK');
// Estaçōes próximas continuam acessíveis mesmo que outra venha antes na lista.
game.buildings.push({nome:'fornalha',x:game.player.x,mapY:game.player.mapY});
assert.ok(game.hasStation('bancada') && game.hasStation('fornalha'));
game.inventory=[{item:'minério de ferro',qtd:1},{item:'carvão',qtd:1}];
game.craft(RECIPES.find(r=>r.out==='lingote de ferro'));assert.equal(game.countItem('lingote de ferro'),1);
