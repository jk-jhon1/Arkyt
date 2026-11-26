import assert from 'node:assert/strict';
import { ANIMALS, DINOSAURS, MARINE } from '../src/data.js';
import { drawCreature } from '../src/sprites.js';
let calls=0;
const methods=['fillRect','moveTo','lineTo','ellipse','translate','scale'];
const ctx=new Proxy({}, {get(t,k){if(methods.includes(k)) return (...args)=>{for(const n of args) assert.ok(Number.isFinite(n),`${String(k)} recebeu ${n}`);calls++;};return ()=>{};},set(){return true}});
for(const s of [...ANIMALS,...DINOSAURS,...MARINE]) for(const dir of [-1,1]){
 assert.ok(Number.isFinite(s.vel)&&Number.isFinite(s.hp)&&Number.isFinite(s.dano),s.nome);
 drawCreature(ctx,{...s,x:400,y:400,dir,walkPhase:1,id:1,estado:'vagar',aquatico:!!s.aquatico||MARINE.includes(s)});
}
assert.ok(calls>500);
console.log(`Renderização alternativa: ${ANIMALS.length+DINOSAURS.length+MARINE.length} espécies, duas direções, valores finitos OK`);
