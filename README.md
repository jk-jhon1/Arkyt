# Sobrevivência Primitiva — Mundo Vivo (2.5D Voxel)

Jogo de sobrevivência **2.5D em pixel art voxelizada**, desenvolvido em **JavaScript** (Canvas 2D), com sprites redesenhados a partir das pranchas de modelo e renderização 2.5D de verdade (movimento em profundidade com W/S, escala por profundidade, cubos com topo/lateral 3D pronunciados, parallax em 4 camadas, sombras projetadas, névoa de profundidade e primeiro plano) (personagem de camisa vermelha xadrez e calça azul com mochila; cavalo marrom de patas brancas; capivara; lobo cinza; urso; crocodilo; tubarão; golfinho; elefante; rinoceronte; triceratops laranja; dinossauros de pescoço longo; blocos de minério salpicados; fornalha, baú e cama vermelha; terreno em blocos; sol e nuvens em cubos),
seguindo o documento de visão *“Sobrevivência Primitiva — Mundo Vivo”* **à risca e sem
remover nenhum elemento**. A única adaptação é a dimensão: o prompt original pedia 3D
voxelizado; aqui tudo foi convertido para **2D pixel art** (formas cúbicas 2D, cores
fortes, silhuetas claras), mantendo todos os sistemas, listas e regras.

## Como rodar

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

Ou qualquer servidor estático. Sem dependências externas — tudo é procedural.

## Controles

| Ação | Tecla |
|---|---|
| Mover (2.5D) | `A`/`D` lados · `W`/`S` profundidade (controle: analógico) |
| Pular | `Espaço` |
| Correr | segurar `Shift` |
| Nadar / escalar | `W`/`S` na água ou em árvores/escadas |
| Coletar / interagir / domesticar / dormir | `E` |
| Atacar | `F` ou clique |
| Usar item da hotbar (comer/beber/tratar/equipar) | `Q` |
| Hotbar | `1`–`6` |
| Inventário | `I` |
| Livro de receitas / bancadas | `R` |
| Construir | `B` (posicionar com movimento, confirmar `Enter`) |
| Mapa | `M` |
| Domados e comandos | `T` |
| Corpo / ferimentos | `C` |
| Câmera 1ª pessoa (2D: zoom próximo) / 3ª pessoa (2D: visão afastada) | `V` |
| Ajuda | `H` |
| Fechar painéis | `Esc` |

## O que foi implementado (checklist do prompt)

- **Mundo aberto 2D procedural com seed reproduzível** (mesma seed = mesmo mapa),
  16.000 px contínuos, streaming por regiões (criaturas distantes são removidas).
- **15 biomas**: floresta tropical, floresta temperada, planície, savana, deserto,
  montanha, costa, praia, rios, lagos, pântano, ilhas, região gelada, vulcão e áreas rochosas.
- **9 pontos de interesse**: cachoeiras, ruínas, acampamentos, aldeias abandonadas,
  torres de observação, naufrágios, entradas de cavernas, fósseis e locais secretos.
- **Cavernas naturais** com entradas visíveis, minérios em veios, água subterrânea,
  fósseis, criaturas e ruínas. **Regra final respeitada: o jogador NUNCA escava a terra**
  — mineração só em rochas expostas e cavernas; construção só na superfície, sem deformar o terreno.
- **Somente minérios reais** (23): ferro, cobre, ouro, prata, estanho, chumbo, zinco,
  níquel, cobalto, alumínio, titânio, carvão, quartzo, enxofre, diamante, esmeralda,
  rubi, safira, calcário, granito, basalto, mármore e obsidiana natural. Sem material fictício.
- **Personagem original** com personalização (pele, cabelo, barba, roupa) e animações:
  andar, correr, pular, nadar, escalar, coletar, atacar, construir, dormir, tratar e montar.
- **Animais pacíficos (11), neutros (9) e agressivos (8)** com IA por máquina de estados
  (fuga, caça em grupo, defesa de território, provocação).
- **15 dinossauros reais**: Tiranossauro rex, Velociraptor, Triceratops, Estegossauro,
  Diplodoco, Braquiossauro, Anquilossauro, Parasaurolophus, Pteranodonte, Espinossauro,
  Carnotauro, Iguanodonte, Mosassauro, Plesiossauro e Compsognato — com dieta, tamanho,
  temperamento e dificuldade de domesticação proporcionais ao risco.
- **12 animais marinhos**: peixes, tubarões, baleias, golfinhos, orcas, tartarugas marinhas,
  raias, focas, crocodilos, polvos, lulas e crustáceos — nado, pesca e barcos.
- **Domesticação completa**: alimento favorito, aproximação lenta, iscas, cercados,
  armadilhas não letais, alimentação progressiva, tratamento, vínculo, reprodução com
  filhotes, comandos (seguir, ficar, proteger, atacar, carregar, retornar), montaria,
  sela, arreio, armadura leve, equipamento de carga, transporte e busca de recursos.
- **Coleta**: fibra (cânhamo, juta, sisal, algodão, agave, capim, cipós, palmeiras),
  pedras do chão, madeira (troncos caídos, galhos, árvores com machado), frutas, sementes,
  folhas, cogumelos, couro, penas, ossos, carne, peixe, mel, água, sal, carvão e plantas medicinais.
- **13 estações**: fogueira, bancada simples, bancada avançada, fornalha, forja, mesa de
  costura, carpintaria, bancada de química, cozinha, oficina de equipamentos, estábulo,
  cercado e armazém. Receitas com materiais mínimos do prompt (machado, picareta,
  fogueira, bancada, fornalha, mochila…).
- **Peso**: limite base de **80 kg**; acima disso velocidade/resistência caem; item
  individual > 80 kg exige montaria, carroça, barco ou guindaste.
- **Construção**: abrigos, casas, torres, pontes, cercas, portões, estábulos, baias,
  docas, barcos, armazéns, hortas, armadilhas, camas, fogueiras, postos de observação,
  escadas, carroças e guindastes — sempre na superfície.
- **Agricultura em canteiros superficiais** (sem cavar): milho, trigo, arroz, batata,
  cenoura, feijão, abóbora, tomate, frutas, ervas medicinais, algodão, cana-de-açúcar,
  agave, plantas venenosas e espécies de fibra.
- **Ferimentos por região corporal (11)**: cabeça, pescoço, peito, abdômen, costas,
  braços, mãos, pernas, pés, cauda e asas — com impacto fatal, hemorragia, fratura,
  bandagem, torniquete, tala, remédio, repouso e infecção. Interface mostra sangramento,
  dor, fratura, infecção, temperatura, consciência, respiração e estado dos membros.
- **Quedas**: acima de 4 m podem matar; menores causam contusões, fraturas e sangramento;
  perna quebrada impede caminhar até tratar (e pode deixar mobilidade reduzida).
- **Sono (24 h), fome (5 dias) e sede (48 h)** com consequências progressivas
  (fraqueza, confusão, desmaio, inanição, desidratação). Dormir em camas/redes/abrigos,
  purificar água, cozinhar; alimentos estragados causam doença.
- **Interface pixelizada**: inventário, peso, estado físico, fome, sede, sono, temperatura,
  mapa, bússola, livro de receitas e lista de domados (comandos, saúde por regiões,
  carga, vínculo e equipamento).
- **Clima e direção de arte**: ciclo dia/noite, chuva, neblina, tempestades, sombras
  estilizadas, temperatura por bioma, sons ambientais por bioma e música dinâmica
  (exploração, perigo, domesticação, combate, descoberta).
- **Arquitetura modular em JavaScript** (`src/data.js`, `world.js`, `sprites.js`,
  `audio.js`, `game.js`, `ui.js`, `main.js`) com dados configuráveis, máquinas de estado,
  salvamento completo (inventário, base, criaturas, ferimentos, posição, clima, progresso)
  e seed reproduzível.

## Estrutura

```
index.html
src/
├── data.js     # espécies, itens, receitas, minérios, biomas, construções, plantações
├── world.js    # geração procedural, cavernas naturais, POIs, clima, temperatura
├── sprites.js  # pixel art 2D procedural (personagem, criaturas, cenário)
├── audio.js    # sons por bioma + música dinâmica (WebAudio)
├── game.js     # loop, física, IA, sobrevivência, inventário, crafting, construção, domesticação, combate, save
├── ui.js       # HUD, inventário, receitas, mapa, bússola, corpo, domados
└── main.js     # inicialização, título e personalização
```
