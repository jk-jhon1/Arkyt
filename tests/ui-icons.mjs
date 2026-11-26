import assert from 'node:assert/strict';
const nodes=new Map();
function node(){ let html=''; return {children:[],style:{},classList:{add(){},remove(){},contains(){return true}},appendChild(child){this.children.push(child)},set innerHTML(value){html=value;this.children=[]},get innerHTML(){return html}}; }
globalThis.document={getElementById(id){if(!nodes.has(id)) nodes.set(id,node());return nodes.get(id)},createElement(){return node()}};
const {renderInventory,renderHotbar}=await import('../src/ui.js');
const g={inventory:[{item:'madeira',qtd:2},{item:'machado simples',qtd:1},{item:'mochila',qtd:1},{item:'corda',qtd:1}],selectedSlot:0,player:{},totalWeight:()=>0,carryCapacity:()=>80,maxSlots:()=>4};
renderInventory(g);renderHotbar(g);
for(const id of ['hotbar','inv-grid']){
 const children=nodes.get(id).children;
 assert.match(children[0].innerHTML,/sprites-aprovados\/tronco\.png/);
 assert.match(children[1].innerHTML,/sprites-aprovados\/machado\.png/);
 assert.match(children[2].innerHTML,/sprites-aprovados\/mochila\.png/);
 assert.doesNotMatch(children[3].innerHTML,/sprites-aprovados/);
}
console.log('Ícones produzidos na hotbar e no inventário; fallback para os demais OK');
