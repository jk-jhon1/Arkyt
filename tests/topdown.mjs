import assert from 'node:assert/strict';
import { World } from '../src/world.js';
import { TopdownMap, MAP_H, TILE } from '../src/topdown.js';
import { WORLD_W } from '../src/data.js';

const a = new World('teste'), b = new World('teste'), c = new World('outro');
const ma = new TopdownMap('teste',a), mb = new TopdownMap('teste',b), mc = new TopdownMap('outro',c);
assert.deepEqual(ma.lakes,mb.lakes);
assert.notDeepEqual(ma.lakes,mc.lakes);
assert.deepEqual(a.trees.map(t=>t.mapY),b.trees.map(t=>t.mapY));
assert.ok(a.trees.every(t=>t.mapY>=0 && t.mapY<=MAP_H));
let different=0, water=0, path=0;
for(let x=0;x<WORLD_W;x+=TILE*4) for(let y=0;y<MAP_H;y+=TILE*4){
  const t=ma.tile(x,y,a);
  assert.equal(t,mb.tile(x,y,b));
  if(t!==mc.tile(x,y,c)) different++;
  if(t==='agua') water++;
  if(t==='caminho') path++;
}
assert.ok(different>100 && water>0 && path>0);
// Blocos vizinhos do mesmo material têm a mesma cor, sem juntas aparentes.
const colorsByType = new Map();
for(let x=0;x<WORLD_W;x+=TILE*3) for(let y=0;y<MAP_H;y+=TILE*3){
  const type=ma.tile(x,y,a), color=ma.color(x,y,a);
  if(colorsByType.has(type)) assert.equal(color,colorsByType.get(type));
  else colorsByType.set(type,color);
}
assert.ok(colorsByType.size>3);
assert.notEqual(ma.tile(a.spawn.x,MAP_H/2,a),'agua');
console.log('Mapa procedural: determinismo, variedade, água, trilhas e clareira inicial OK');
