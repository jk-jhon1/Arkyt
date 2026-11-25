// ============================================================
// Sobrevivência Primitiva — Mundo Vivo (2D Pixel Art)
// Dados configuráveis: espécies, itens, receitas, minérios,
// biomas, construções, estações e plantações.
// Separação dados/comportamento/animação conforme o prompt.
// ============================================================

export const TILE = 32;          // 1 metro = 32 px (queda > 4 m = 128 px)
export const DAY_LENGTH = 360;   // 1 dia de jogo = 6 min reais (24 h de relógio)
export const WORLD_W = 16000;    // largura do mundo em px
export const SEA_Y = 560;        // nível do mar (px, Y cresce para baixo)
export const MAX_WEIGHT = 80;    // kg — limite básico do jogador

// ---------------- Biomas (15) ----------------
export const BIOMES = [
  { id:'praia',        nome:'Praia',             cor:'#e8d89a', ceu:['#8ec9e8','#d8f0f8'], temp:26, agua:true },
  { id:'costa',        nome:'Costa',             cor:'#d8c98a', ceu:['#7ec0e8','#c8e8f8'], temp:25, agua:true },
  { id:'pantano',      nome:'Pântano',           cor:'#6a7a4a', ceu:['#7a9a6a','#b8c8a0'], temp:24, agua:true },
  { id:'tropical',     nome:'Floresta Tropical', cor:'#2e7a3a', ceu:['#5ab0d8','#b8e8c8'], temp:27 },
  { id:'savana',       nome:'Savana',            cor:'#c8a84a', ceu:['#8ec8e8','#f0e0a8'], temp:29 },
  { id:'deserto',      nome:'Deserto',           cor:'#e0b85a', ceu:['#a8d8f0','#f8e8b8'], temp:38 },
  { id:'planicie',     nome:'Planície',          cor:'#8ab85a', ceu:['#7ec0e8','#d0ecf8'], temp:22 },
  { id:'temperada',    nome:'Floresta Temperada',cor:'#4a8a4a', ceu:['#7ab8e0','#c8e8d8'], temp:16 },
  { id:'gelada',       nome:'Região Gelada',     cor:'#d8ecf8', ceu:['#a8c8e8','#e8f4fc'], temp:-8 },
  { id:'montanha',     nome:'Montanha',          cor:'#8a8a92', ceu:['#8ab0d8','#d8e8f8'], temp:6 },
  { id:'rochosas',     nome:'Áreas Rochosas',    cor:'#7a6a5a', ceu:['#a8b8c8','#e0d0b8'], temp:18 },
  { id:'vulcao',       nome:'Vulcão',            cor:'#4a3a3a', ceu:['#c86a4a','#f0b88a'], temp:42, lava:true },
  { id:'rios',         nome:'Rios',              cor:'#5a9ac8', ceu:['#7ec0e8','#c8e8f8'], temp:23, agua:true },
  { id:'lagos',        nome:'Lagos',             cor:'#5a9ac8', ceu:['#7ec0e8','#c8e8f8'], temp:21, agua:true },
  { id:'ilhas',        nome:'Ilhas',             cor:'#e8d89a', ceu:['#8ec9e8','#d8f0f8'], temp:26, agua:true },
];
export function biomeAt(x){ const i=Math.min(BIOMES.length-1, Math.max(0, Math.floor(x/WORLD_W*BIOMES.length))); return BIOMES[i]; }

// ---------------- Minérios REAIS (sem material fictício) ----------------
export const ORES = ['ferro','cobre','ouro','prata','estanho','chumbo','zinco','níquel','cobalto','alumínio','titânio','carvão','quartzo','enxofre','diamante','esmeralda','rubi','safira','calcário','granito','basalto','mármore','obsidiana natural'];
export const ORE_COR = { ferro:'#b08a6a', cobre:'#d87a4a', ouro:'#f2d24a', prata:'#d8dde2', estanho:'#a8b0b8', chumbo:'#6a6a72', zinco:'#9ab0b8', 'níquel':'#c8c8a8', cobalto:'#4a6ad8', 'alumínio':'#c8ccd2', 'titânio':'#8a9ab0', 'carvão':'#2a2a2a', quartzo:'#e8f0f8', enxofre:'#e8d24a', diamante:'#a8ecf8', esmeralda:'#4ae88a', rubi:'#e84a6a', safira:'#4a7ae8', 'calcário':'#c8c0a8', granito:'#9a8a7a', basalto:'#4a4a52', 'mármore':'#e8e8e8', 'obsidiana natural':'#2a1a3a' };

// ---------------- Animais: pacíficos / neutros / agressivos ----------------
export const ANIMAL_CATS = {
  pacifico:{ nome:'Pacíficos', desc:'Fogem, pastam ou ignoram. Domesticáveis com alimentação e confiança.' },
  neutro:{ nome:'Neutros', desc:'Só atacam quando feridos, ameaçados ou ao invadir território / aproximar-se de filhotes.' },
  agressivo:{ nome:'Agressivos', desc:'Podem atacar espontaneamente, perseguir, caçar em grupo ou defender território.' },
};
// dieta: herbivoro/carnivoro/onivoro ; tam: porte ; favorite: alimento favorito p/ domesticação
export const ANIMALS = [
  // Pacíficos
  { nome:'galinha', cat:'pacifico', dieta:'onivoro', tam:'P', hp:20, vel:60, dano:2,  fav:'semente', cor:'#f2f2f2', biomas:['planicie','temperada','tropical','savana'] },
  { nome:'pato', cat:'pacifico', dieta:'onivoro', tam:'P', hp:20, vel:65, dano:2,  fav:'semente', cor:'#7ab8e8', biomas:['lagos','rios','pantano','costa'] },
  { nome:'capivara', cat:'pacifico', dieta:'herbivoro', tam:'M', hp:60, vel:70, dano:4, fav:'capim', cor:'#8a6a4a', biomas:['pantano','rios','lagos','tropical'] },
  { nome:'coelho', cat:'pacifico', dieta:'herbivoro', tam:'P', hp:15, vel:95, dano:1, fav:'cenoura', cor:'#c8c8c8', biomas:['planicie','temperada','savana'] },
  { nome:'cabra', cat:'pacifico', dieta:'herbivoro', tam:'M', hp:50, vel:70, dano:5, fav:'folha', cor:'#a89880', biomas:['montanha','rochosas','planicie','savana'] },
  { nome:'ovelha', cat:'pacifico', dieta:'herbivoro', tam:'M', hp:50, vel:65, dano:4, fav:'capim', cor:'#e8e8e8', biomas:['planicie','temperada','montanha'] },
  { nome:'vaca', cat:'pacifico', dieta:'herbivoro', tam:'G', hp:120, vel:55, dano:8, fav:'capim', cor:'#6a4a3a', biomas:['planicie','temperada','savana'] },
  { nome:'cavalo', cat:'pacifico', dieta:'herbivoro', tam:'G', hp:130, vel:110, dano:10, fav:'cenoura', cor:'#7a5a3a', biomas:['planicie','savana','temperada'], montaria:true },
  { nome:'camelo', cat:'pacifico', dieta:'herbivoro', tam:'G', hp:130, vel:80, dano:10, fav:'agave', cor:'#d8b87a', biomas:['deserto','savana'], montaria:true },
  { nome:'cervo', cat:'pacifico', dieta:'herbivoro', tam:'M', hp:60, vel:105, dano:6, fav:'folha', cor:'#a87a4a', biomas:['temperada','tropical','planicie'] },
  { nome:'elefante', cat:'pacifico', dieta:'herbivoro', tam:'GG', hp:400, vel:60, dano:25, fav:'fruta', cor:'#9a9aa8', biomas:['savana','tropical'], montaria:true },
  // Neutros
  { nome:'rinoceronte', cat:'neutro', dieta:'herbivoro', tam:'GG', hp:350, vel:70, dano:30, fav:'folha', cor:'#8a8a92', biomas:['savana','planicie'] },
  { nome:'búfalo', cat:'neutro', dieta:'herbivoro', tam:'GG', hp:300, vel:75, dano:28, fav:'capim', cor:'#5a4a3a', biomas:['planicie','pantano'] },
  { nome:'hipopótamo', cat:'neutro', dieta:'herbivoro', tam:'GG', hp:380, vel:65, dano:32, fav:'fruta', cor:'#7a7a8a', biomas:['rios','lagos','pantano'] },
  { nome:'gorila', cat:'neutro', dieta:'onivoro', tam:'G', hp:220, vel:80, dano:22, fav:'fruta', cor:'#3a3a3a', biomas:['tropical'] },
  { nome:'javali', cat:'neutro', dieta:'onivoro', tam:'M', hp:90, vel:95, dano:14, fav:'fruta', cor:'#6a5a4a', biomas:['temperada','tropical','pantano'] },
  { nome:'urso', cat:'neutro', dieta:'onivoro', tam:'G', hp:250, vel:80, dano:24, fav:'mel', cor:'#6a4a2e', biomas:['temperada','gelada','montanha'] },
  { nome:'alce', cat:'neutro', dieta:'herbivoro', tam:'G', hp:180, vel:85, dano:16, fav:'folha', cor:'#7a5a3a', biomas:['gelada','temperada'] },
  { nome:'crocodilo', cat:'neutro', dieta:'carnivoro', tam:'G', hp:220, vel:70, dano:26, fav:'carne crua', cor:'#4a6a3a', biomas:['pantano','rios','lagos'], aquatico:true },
  { nome:'touro', cat:'neutro', dieta:'herbivoro', tam:'G', hp:200, vel:85, dano:20, fav:'capim', cor:'#4a3a2e', biomas:['planicie','savana'] },
  // Agressivos
  { nome:'leão', cat:'agressivo', dieta:'carnivoro', tam:'G', hp:200, vel:115, dano:26, fav:'carne crua', cor:'#d8a84a', biomas:['savana'] },
  { nome:'tigre', cat:'agressivo', dieta:'carnivoro', tam:'G', hp:210, vel:120, dano:27, fav:'carne crua', cor:'#e87a2e', biomas:['tropical'] },
  { nome:'onça', cat:'agressivo', dieta:'carnivoro', tam:'G', hp:190, vel:125, dano:25, fav:'carne crua', cor:'#d8a84a', biomas:['tropical','pantano'] },
  { nome:'hiena', cat:'agressivo', dieta:'carnivoro', tam:'M', hp:110, vel:120, dano:16, fav:'carne crua', cor:'#a8986a', biomas:['savana','deserto'], grupo:true },
  { nome:'lobo', cat:'agressivo', dieta:'carnivoro', tam:'M', hp:110, vel:125, dano:16, fav:'carne crua', cor:'#8a8a92', biomas:['temperada','gelada','montanha'], grupo:true },
  { nome:'serpente venenosa', cat:'agressivo', dieta:'carnivoro', tam:'P', hp:40, vel:90, dano:12, veneno:true, fav:'carne crua', cor:'#4a8a3a', biomas:['tropical','deserto','pantano'] },
  { nome:'tubarão', cat:'agressivo', dieta:'carnivoro', tam:'G', hp:250, vel:130, dano:30, fav:'peixe cru', cor:'#6a8aa8', biomas:['praia','costa','ilhas'], aquatico:true },
  { nome:'orca', cat:'agressivo', dieta:'carnivoro', tam:'GG', hp:500, vel:120, dano:40, fav:'peixe cru', cor:'#2a2a3a', biomas:['praia','costa','ilhas','gelada'], aquatico:true },
];

// ---------------- Dinossauros reais (15) ----------------
export const DINOSAURS = [
  { nome:'Tiranossauro rex', dieta:'carnivoro', tam:'GG', hp:800, vel:95, dano:60, fav:'carne crua', cor:'#7a8a4a', cat:'agressivo', dificuldade:0.95, biomas:['tropical','savana','planicie'] },
  { nome:'Velociraptor', dieta:'carnivoro', tam:'M', hp:120, vel:150, dano:18, fav:'carne crua', cor:'#c87a3a', cat:'agressivo', dificuldade:0.7, biomas:['deserto','savana','planicie'], grupo:true },
  { nome:'Triceratops', dieta:'herbivoro', tam:'GG', hp:600, vel:70, dano:35, fav:'folha', cor:'#a87a5a', cat:'neutro', dificuldade:0.6, biomas:['planicie','savana'] },
  { nome:'Estegossauro', dieta:'herbivoro', tam:'GG', hp:550, vel:60, dano:30, fav:'folha', cor:'#8a9a5a', cat:'neutro', dificuldade:0.6, biomas:['tropical','planicie'] },
  { nome:'Diplodoco', dieta:'herbivoro', tam:'GGG', hp:900, vel:55, dano:25, fav:'folha', cor:'#7a9a7a', cat:'pacifico', dificuldade:0.5, biomas:['tropical','savana'], montaria:true },
  { nome:'Braquiossauro', dieta:'herbivoro', tam:'GGG', hp:1000, vel:50, dano:25, fav:'folha', cor:'#a8a87a', cat:'pacifico', dificuldade:0.5, biomas:['tropical','planicie'], montaria:true },
  { nome:'Anquilossauro', dieta:'herbivoro', tam:'G', hp:650, vel:60, dano:28, fav:'folha', cor:'#8a7a6a', cat:'neutro', dificuldade:0.65, biomas:['temperada','planicie'] },
  { nome:'Parasaurolophus', dieta:'herbivoro', tam:'G', hp:300, vel:90, dano:12, fav:'folha', cor:'#d8a86a', cat:'pacifico', dificuldade:0.45, biomas:['tropical','pantano','rios'] },
  { nome:'Pteranodonte', dieta:'carnivoro', tam:'G', hp:150, vel:160, dano:14, fav:'peixe cru', cor:'#d87a5a', cat:'neutro', dificuldade:0.75, biomas:['costa','praia','ilhas'], voador:true },
  { nome:'Espinossauro', dieta:'carnivoro', tam:'GG', hp:750, vel:85, dano:50, fav:'peixe cru', cor:'#5a8a6a', cat:'agressivo', dificuldade:0.9, biomas:['rios','lagos','pantano'], aquatico:true },
  { nome:'Carnotauro', dieta:'carnivoro', tam:'G', hp:450, vel:105, dano:35, fav:'carne crua', cor:'#b85a3a', cat:'agressivo', dificuldade:0.8, biomas:['savana','planicie'] },
  { nome:'Iguanodonte', dieta:'herbivoro', tam:'G', hp:350, vel:85, dano:14, fav:'folha', cor:'#8aa87a', cat:'pacifico', dificuldade:0.5, biomas:['temperada','planicie'] },
  { nome:'Mosassauro', dieta:'carnivoro', tam:'GGG', hp:900, vel:110, dano:55, fav:'peixe cru', cor:'#4a7a8a', cat:'agressivo', dificuldade:0.95, biomas:['praia','costa','ilhas'], aquatico:true },
  { nome:'Plesiossauro', dieta:'carnivoro', tam:'GG', hp:600, vel:90, dano:30, fav:'peixe cru', cor:'#6a9ab0', cat:'neutro', dificuldade:0.85, biomas:['praia','costa','ilhas'], aquatico:true },
  { nome:'Compsognato', dieta:'carnivoro', tam:'P', hp:60, vel:140, dano:8, fav:'carne crua', cor:'#d8c86a', cat:'pacifico', dificuldade:0.4, biomas:['tropical','savana','deserto'], grupo:true },
];

// ---------------- Animais marinhos ----------------
export const MARINE = [
  { nome:'peixe', dieta:'onivoro', tam:'P', hp:15, vel:90, dano:1, fav:'semente', cor:'#7ab8d8', cat:'pacifico', biomas:['praia','costa','rios','lagos','ilhas'] },
  { nome:'tubarão', dieta:'carnivoro', tam:'G', hp:250, vel:130, dano:30, fav:'peixe cru', cor:'#6a8aa8', cat:'agressivo', biomas:['praia','costa','ilhas'] },
  { nome:'baleia', dieta:'carnivoro', tam:'GGG', hp:800, vel:80, dano:20, fav:'peixe cru', cor:'#4a6a8a', cat:'pacifico', biomas:['praia','costa','ilhas'] },
  { nome:'golfinho', dieta:'carnivoro', tam:'M', hp:120, vel:140, dano:10, fav:'peixe cru', cor:'#8ab8d8', cat:'pacifico', biomas:['praia','costa','ilhas'] },
  { nome:'orca', dieta:'carnivoro', tam:'GG', hp:500, vel:120, dano:40, fav:'peixe cru', cor:'#2a2a3a', cat:'agressivo', biomas:['praia','costa','ilhas','gelada'] },
  { nome:'tartaruga marinha', dieta:'herbivoro', tam:'M', hp:80, vel:50, dano:3, fav:'folha', cor:'#4a8a5a', cat:'pacifico', biomas:['praia','costa','ilhas'] },
  { nome:'raia', dieta:'carnivoro', tam:'M', hp:60, vel:100, dano:8, fav:'peixe cru', cor:'#8a7a9a', cat:'neutro', biomas:['praia','costa'] },
  { nome:'foca', dieta:'carnivoro', tam:'M', hp:100, vel:90, dano:8, fav:'peixe cru', cor:'#a8a8b0', cat:'pacifico', biomas:['gelada','costa','praia'] },
  { nome:'crocodilo', dieta:'carnivoro', tam:'G', hp:220, vel:70, dano:26, fav:'carne crua', cor:'#4a6a3a', cat:'neutro', biomas:['pantano','rios','lagos'] },
  { nome:'polvo', dieta:'carnivoro', tam:'M', hp:60, vel:70, dano:6, fav:'peixe cru', cor:'#c86a7a', cat:'pacifico', biomas:['praia','costa','ilhas'] },
  { nome:'lula', dieta:'carnivoro', tam:'M', hp:50, vel:110, dano:5, fav:'peixe cru', cor:'#d88aa8', cat:'pacifico', biomas:['praia','costa','ilhas'] },
  { nome:'crustáceo', dieta:'onivoro', tam:'P', hp:30, vel:60, dano:3, fav:'semente', cor:'#d87a4a', cat:'pacifico', biomas:['praia','costa','ilhas'] },
];

// ---------------- Itens ----------------
// peso em kg. tipo: material, comida, ferramenta, tratamento, equipamento, estrutura, semente, bebida
export const ITEMS = {
  'pedra':{ peso:0.5, icone:'🪨', tipo:'material', desc:'Pedra coletada do chão ou de rochas.' },
  'madeira':{ peso:1.0, icone:'🪵', tipo:'material', desc:'Madeira de troncos caídos, galhos e árvores.' },
  'fibra':{ peso:0.1, icone:'🌾', tipo:'material', desc:'Fibra: cânhamo, juta, sisal, algodão, agave, capim, cipós, palmeiras.' },
  'corda':{ peso:0.2, icone:'🪢', tipo:'material', desc:'Corda de fibra.' },
  'couro':{ peso:0.8, icone:'🟫', tipo:'material', desc:'Couro de animais.' },
  'argila':{ peso:0.6, icone:'🟤', tipo:'material', desc:'Argila para fornalha e cerâmica.' },
  'carvão':{ peso:0.3, icone:'⬛', tipo:'material', desc:'Carvão para fornalha.' },
  'osso':{ peso:0.4, icone:'🦴', tipo:'material', desc:'Osso.' },
  'pena':{ peso:0.05, icone:'🪶', tipo:'material', desc:'Pena.' },
  'folha':{ peso:0.1, icone:'🍃', tipo:'material', desc:'Folha — alimento de herbívoros e remédio.' },
  'capim':{ peso:0.1, icone:'🌿', tipo:'material', desc:'Capim — alimento de herbívoros.' },
  'semente':{ peso:0.05, icone:'🌰', tipo:'material', desc:'Semente — alimento de aves e plantio.' },
  'fruta':{ peso:0.3, icone:'🍎', tipo:'comida', desc:'Fruta. Restaura fome.' },
  'cenoura':{ peso:0.2, icone:'🥕', tipo:'comida', desc:'Cenoura. Restaura fome.' },
  'cogumelo':{ peso:0.2, icone:'🍄', tipo:'comida', desc:'Cogumelo. Pode ser venenoso se cru.' },
  'mel':{ peso:0.5, icone:'🍯', tipo:'comida', desc:'Mel. Restaura fome e energia.' },
  'carne crua':{ peso:0.8, icone:'🥩', tipo:'comida', desc:'Carne crua. Cozinhe na fogueira!' },
  'carne cozida':{ peso:0.7, icone:'🍖', tipo:'comida', desc:'Carne cozida. Restaura muita fome.' },
  'peixe cru':{ peso:0.5, icone:'🐟', tipo:'comida', desc:'Peixe cru. Cozinhe na fogueira!' },
  'peixe cozido':{ peso:0.4, icone:'🐠', tipo:'comida', desc:'Peixe cozido.' },
  'água suja':{ peso:0.5, icone:'💧', tipo:'bebida', desc:'Água contaminada. Purifique na fogueira.' },
  'água limpa':{ peso:0.5, icone:'🚰', tipo:'bebida', desc:'Água potável. Restaura sede.' },
  'sal':{ peso:0.2, icone:'🧂', tipo:'material', desc:'Sal.' },
  'planta medicinal':{ peso:0.1, icone:'🌸', tipo:'material', desc:'Planta medicinal — base de remédios.' },
  'machado simples':{ peso:2.0, icone:'🪓', tipo:'ferramenta', desc:'Corta galhos e derruba árvores. [madeira+pedra+fibra]' },
  'picareta':{ peso:2.0, icone:'⛏️', tipo:'ferramenta', desc:'Quebra rochas e extrai minérios. [madeira+pedra+fibra]' },
  'lança':{ peso:1.5, icone:'🔱', tipo:'ferramenta', desc:'Arma corpo a corpo de longo alcance.' },
  'arco':{ peso:1.0, icone:'🏹', tipo:'ferramenta', desc:'Arma à distância (tecla F).' },
  'flecha':{ peso:0.05, icone:'➶', tipo:'material', desc:'Munição do arco.' },
  'bandagem':{ peso:0.1, icone:'🩹', tipo:'tratamento', desc:'Para sangramento. [fibra]' },
  'torniquete':{ peso:0.2, icone:'🧵', tipo:'tratamento', desc:'Para hemorragia grave. [corda]' },
  'tala':{ peso:0.5, icone:'🦴', tipo:'tratamento', desc:'Para fraturas. [madeira+fibra]' },
  'remédio':{ peso:0.2, icone:'💊', tipo:'tratamento', desc:'Contra infecção. [planta medicinal]' },
  'mochila':{ peso:1.0, icone:'🎒', tipo:'equipamento', desc:'Aumenta espaço e organiza carga. [couro+fibra+cordas]' },
  'sela':{ peso:3.0, icone:'🐎', tipo:'equipamento', desc:'Permite montar animal domesticado. [couro+fibra]' },
  'arreio':{ peso:2.0, icone:'🪖', tipo:'equipamento', desc:'Controle de montaria. [couro+corda]' },
  'armadura leve':{ peso:4.0, icone:'🦺', tipo:'equipamento', desc:'Proteção para você ou montaria. [couro+fibra]' },
  'equipamento de carga':{ peso:2.0, icone:'🧺', tipo:'equipamento', desc:'Montaria carrega mais peso. [fibra+corda]' },
  'fogueira':{ peso:5.0, icone:'🔥', tipo:'estrutura', desc:'Cozinhar, aquecer e purificar água. [madeira+pedra]' },
  'bancada':{ peso:8.0, icone:'🪑', tipo:'estrutura', desc:'Desbloqueia ferramentas e estruturas. [madeira+fibra+pedras]' },
  'fornalha':{ peso:15.0, icone:'🏺', tipo:'estrutura', desc:'Funde minérios reais. [pedra+argila+carvão]' },
  'cama':{ peso:6.0, icone:'🛏️', tipo:'estrutura', desc:'Dormir e recuperar sono. [madeira+fibra]' },
  'barco':{ peso:20.0, icone:'⛵', tipo:'estrutura', desc:'Navegar em oceanos, rios e lagos. [madeira+corda]' },
  'trono gigante':{ peso:90.0, icone:'🪵', tipo:'material', desc:'Tronco enorme: acima de 80 kg — só com montaria, carroça, barco ou guindaste!' },
};
export function oreItem(ore){ return { peso:0.4, icone:'💎', tipo:'material', desc:`Minério real: ${ore}. Fundir na fornalha.` }; }

// ---------------- Receitas (materiais mínimos do prompt) ----------------
export const RECIPES = [
  { out:'machado simples', qtd:1, custo:{ madeira:2, pedra:1, fibra:1 }, estacao:'mão', desc:'Cortar galhos e derrubar árvores.' },
  { out:'picareta', qtd:1, custo:{ madeira:2, pedra:1, fibra:1 }, estacao:'mão', desc:'Quebrar rochas e extrair minérios.' },
  { out:'lança', qtd:1, custo:{ madeira:2, pedra:1, fibra:1 }, estacao:'bancada', desc:'Arma corpo a corpo.' },
  { out:'arco', qtd:1, custo:{ madeira:2, fibra:2 }, estacao:'bancada', desc:'Arma à distância.' },
  { out:'flecha', qtd:5, custo:{ madeira:1, pedra:1 }, estacao:'mão', desc:'Munição do arco.' },
  { out:'fogueira', qtd:1, custo:{ madeira:3, pedra:2 }, estacao:'mão', desc:'Cozinhar, aquecer e purificar água.' },
  { out:'bancada', qtd:1, custo:{ madeira:4, fibra:2, pedra:2 }, estacao:'mão', desc:'Desbloqueia ferramentas e estruturas.' },
  { out:'fornalha', qtd:1, custo:{ pedra:6, argila:3, 'carvão':2 }, estacao:'bancada', desc:'Fundir minérios reais.' },
  { out:'mochila', qtd:1, custo:{ couro:2, fibra:2, corda:1 }, estacao:'bancada', desc:'Aumenta espaço e organiza carga.' },
  { out:'bandagem', qtd:2, custo:{ fibra:1 }, estacao:'mão', desc:'Tratar sangramento.' },
  { out:'torniquete', qtd:1, custo:{ corda:1 }, estacao:'mão', desc:'Tratar hemorragia grave.' },
  { out:'tala', qtd:1, custo:{ madeira:1, fibra:1 }, estacao:'mão', desc:'Tratar fratura.' },
  { out:'remédio', qtd:1, custo:{ 'planta medicinal':2 }, estacao:'bancada', desc:'Prevenir/tratar infecção.' },
  { out:'corda', qtd:2, custo:{ fibra:2 }, estacao:'mão', desc:'Material de amarração.' },
  { out:'sela', qtd:1, custo:{ couro:3, fibra:2 }, estacao:'bancada', desc:'Montar animal domesticado.' },
  { out:'arreio', qtd:1, custo:{ couro:2, corda:1 }, estacao:'bancada', desc:'Controle de montaria.' },
  { out:'armadura leve', qtd:1, custo:{ couro:4, fibra:2 }, estacao:'bancada', desc:'Proteção leve.' },
  { out:'equipamento de carga', qtd:1, custo:{ fibra:3, corda:2 }, estacao:'bancada', desc:'Montaria carrega mais.' },
  { out:'cama', qtd:1, custo:{ madeira:3, fibra:3 }, estacao:'bancada', desc:'Dormir.' },
  { out:'barco', qtd:1, custo:{ madeira:8, corda:2 }, estacao:'bancada', desc:'Navegar.' },
  { out:'carne cozida', qtd:1, custo:{ 'carne crua':1 }, estacao:'fogueira', desc:'Cozinhar carne.' },
  { out:'peixe cozido', qtd:1, custo:{ 'peixe cru':1 }, estacao:'fogueira', desc:'Cozinhar peixe.' },
  { out:'água limpa', qtd:1, custo:{ 'água suja':1 }, estacao:'fogueira', desc:'Purificar água contaminada.' },
  { out:'lingote de ferro', qtd:1, custo:{ 'minério de ferro':1, 'carvão':1 }, estacao:'fornalha', desc:'Fundir ferro (minério real).' },
  { out:'lingote de cobre', qtd:1, custo:{ 'minério de cobre':1, 'carvão':1 }, estacao:'fornalha', desc:'Fundir cobre (minério real).' },
  { out:'lingote de ouro', qtd:1, custo:{ 'minério de ouro':1, 'carvão':1 }, estacao:'fornalha', desc:'Fundir ouro (minério real).' },
];

// ---------------- Estações de trabalho (12) ----------------
export const STATIONS = ['fogueira','bancada simples','bancada avançada','fornalha','forja','mesa de costura','carpintaria','bancada de química','cozinha','oficina de equipamentos','estábulo','cercado','armazém'];

// ---------------- Construções ----------------
export const BUILDINGS = [
  { nome:'abrigo', custo:{ madeira:6, fibra:3 }, desc:'Abrigo básico para dormir.' },
  { nome:'casa', custo:{ madeira:12, pedra:6, fibra:4 }, desc:'Casa completa.' },
  { nome:'torre', custo:{ madeira:14, pedra:4 }, desc:'Torre alta (escalar com escada/cipó).' },
  { nome:'ponte', custo:{ madeira:8, corda:2 }, desc:'Atravessar rios e lagos.' },
  { nome:'cerca', custo:{ madeira:4 }, desc:'Cercar animais e base.' },
  { nome:'portão', custo:{ madeira:3, corda:1 }, desc:'Entrada controlada da cerca.' },
  { nome:'estábulo', custo:{ madeira:10, fibra:4 }, desc:'Abrigar montarias.' },
  { nome:'baia', custo:{ madeira:6, fibra:2 }, desc:'Baia para animais.' },
  { nome:'doca', custo:{ madeira:8 }, desc:'Embarcar barcos.' },
  { nome:'barco', custo:{ madeira:8, corda:2 }, desc:'Navegar.' },
  { nome:'armazém', custo:{ madeira:10, pedra:4 }, desc:'Guardar itens (baú).' },
  { nome:'horta (canteiro)', custo:{ madeira:3, pedra:2 }, desc:'Plantar sem cavar o mapa.' },
  { nome:'armadilha', custo:{ madeira:4, corda:2 }, desc:'Armadilha não letal de captura.' },
  { nome:'cama', custo:{ madeira:3, fibra:3 }, desc:'Dormir.' },
  { nome:'fogueira', custo:{ madeira:3, pedra:2 }, desc:'Cozinhar/aquecer/purificar.' },
  { nome:'posto de observação', custo:{ madeira:10 }, desc:'Ver o horizonte.' },
  { nome:'escada', custo:{ madeira:4 }, desc:'Escalar torres e montanhas.' },
  { nome:'carroça', custo:{ madeira:8, corda:2 }, desc:'Puxada por montaria — transporte pesado.' },
  { nome:'guindaste simples', custo:{ madeira:10, corda:3 }, desc:'Levantar itens > 80 kg.' },
];

// ---------------- Agricultura ----------------
export const CROPS = ['milho','trigo','arroz','batata','cenoura','feijão','abóbora','tomate','frutas','ervas medicinais','algodão','cana-de-açúcar','agave','plantas venenosas','espécies de fibra'];
export const CROP_DATA = {
  'milho':{ tempo:90, produto:'fruta', icone:'🌽' }, 'trigo':{ tempo:80, produto:'semente', icone:'🌾' },
  'arroz':{ tempo:100, produto:'semente', icone:'🍚' }, 'batata':{ tempo:85, produto:'cenoura', icone:'🥔' },
  'cenoura':{ tempo:70, produto:'cenoura', icone:'🥕' }, 'feijão':{ tempo:90, produto:'semente', icone:'🫘' },
  'abóbora':{ tempo:120, produto:'fruta', icone:'🎃' }, 'tomate':{ tempo:80, produto:'fruta', icone:'🍅' },
  'frutas':{ tempo:110, produto:'fruta', icone:'🍎' }, 'ervas medicinais':{ tempo:75, produto:'planta medicinal', icone:'🌸' },
  'algodão':{ tempo:95, produto:'fibra', icone:'☁️' }, 'cana-de-açúcar':{ tempo:100, produto:'mel', icone:'🎋' },
  'agave':{ tempo:130, produto:'fibra', icone:'🌵' }, 'plantas venenosas':{ tempo:60, produto:'planta medicinal', icone:'☠️' },
  'espécies de fibra':{ tempo:70, produto:'fibra', icone:'🌾' },
};

// ---------------- Pontos de interesse ----------------
export const POIS = ['cachoeiras','ruínas','acampamentos','aldeias abandonadas','torres de observação','naufrágios','entradas de cavernas','fósseis','locais secretos'];

// ---------------- Regiões corporais (11) ----------------
export const BODY_REGIONS = ['cabeça','pescoço','peito','abdômen','costas','braços','mãos','pernas','pés','cauda','asas'];
export const VITAL_REGIONS = ['cabeça','peito','abdômen','pescoço'];

// ---------------- Comandos de domesticação ----------------
export const TAMED_COMMANDS = ['seguir','ficar','proteger','atacar','carregar','retornar'];

// ---------------- Personalização ----------------
export const SKIN_TONES = ['#f2d0b0','#e0b088','#c88a5a','#8a5a3a','#5a3a24'];
export const HAIR_COLORS = ['#2a1a0a','#5a3a1a','#c8a84a','#e8e8e8','#c84a2a','#2a2a3a'];
export const HAIR_STYLES = ['curto','longo','moicano','careca'];
export const SHIRT_COLORS = ['#c84a3a','#3a7ac8','#3ac86a','#c8a83a','#8a4ac8','#e8e8e8'];
