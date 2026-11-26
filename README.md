# Sobrevivência Primitiva — Mundo Vivo

Jogo de sobrevivência em JavaScript e Canvas, agora com mundo jogável **visto de cima** e terreno em pixel art inspirado em jogos de fazenda. O mundo é original e procedural: não reproduz o mapa nem os gráficos de Stardew Valley.

## Jogar

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Abra `http://localhost:8000`. Na tela inicial, deixe a seed vazia para gerar um mundo diferente a cada novo jogo, ou informe uma seed para repetir o mesmo terreno. Continuar carrega a seed e o progresso salvos no navegador.

O mapa tem 16.000 × 2.048 unidades. Trilhas, lagos, texturas e posições dos recursos e locais de interesse dependem da seed; os biomas continuam distribuídos por regiões. A tecla **M** mostra o mesmo terreno, com jogador, locais, construções e animais domados. A visualização comprime a largura do mundo para caber na tela.

## Controles

- **WASD ou setas:** movimentação em quatro direções; **Shift:** correr.
- **E:** interagir/coletar; **F** ou clique: atacar; **Q:** usar item selecionado; **1–6:** selecionar item.
- **I:** inventário; **R:** receitas; **B:** construção (Enter confirma); **M:** mapa; **T:** animais domados; **C:** corpo; **H:** ajuda; **V:** zoom; **Esc:** fechar/cancelar.
- Água pode ser atravessada nadando; construções são posicionadas na superfície. Não há escavação de terra.

A conversão para vista de cima mantém inventário, coleta, criação, construção, animais e indicadores de sobrevivência existentes. A exploração subterrânea, pulo, quedas e escalada da visão lateral **ainda não foram adaptados** à nova visão; entradas de cavernas permanecem como pontos de interesse na superfície. A câmera V é apenas zoom, não uma câmera de primeira pessoa.

## Testes

```bash
node tests/topdown.mjs
node tests/game-topdown.mjs
node tests/modelos.mjs
node tests/species.mjs
node tests/ui-icons.mjs
```

O primeiro verifica determinismo e variedade da geração. O segundo verifica movimento, proximidade em duas dimensões, salvamento e renderização com um Canvas simulado.

## Modelos visuais do PDF

Os PNGs em `assets/modelos/` são recortes das pranchas enviadas no PDF: personagem padrão, alguns animais, minérios, recursos e construções. O desenho usa essas imagens quando estão disponíveis e conserva sprites procedurais para as espécies, aparências personalizadas e objetos que não têm modelo isolado na prancha. As imagens originais são em perspectiva voxel; seu uso em um mapa visto de cima é uma adaptação, não uma reprodução 3D idêntica das cenas do PDF.

Para conferir o carregamento dos recortes: `node tests/modelos.mjs`.

## Sprites no estilo aprovado

Os recortes transparentes em `assets/sprites-aprovados/` são usados no jogo para o sobrevivente padrão, lobo, cavalo, capivara, urso, crocodilo, tubarão, árvore comum, fornalha, picareta galinha, pato, coelho, cabra, ovelha, vaca, camelo, cervo, elefante, rinoceronte, búfalo, hipopótamo, gorila, javali, alce, touro, leão, tigre, onça, hiena, serpente, peixe, foca, lula, crustáceo, abrigo, casa, torre, ponte, fogueira, cerca, portão, estábulo, baia, doca, barco, armazém, horta, armadilha, cama, posto de observação, escada, carroça, guindaste, bancada, machado, lança, arco, rocha, tronco, pinheiro, palmeira, fibras, frutas, cogumelos, planta medicinal, colmeia, pedra do chão, sementes e folhas, criaturas marinhas (baleia, golfinho, orca, tartaruga, polvo e raia) e quinze dinossauros: triceratops, tiranossauro, velociraptor, estegossauro, diplodoco, braquiossauro, anquilossauro, parasaurolophus, pteranodonte, espinossauro, carnotauro, iguanodonte, mosassauro, plesiossauro e compsognato. A [galeria dos sprites](assets/sprites-aprovados/index.html) permite conferir os recortes. São imagens de pose única, com movimento simples por deslocamento e espelhamento; não há animação quadro a quadro. As demais espécies e elementos mantêm os modelos anteriores. Personalizações do personagem continuam usando o desenhador procedural.

Para recriar os recortes a partir das imagens aprovadas: instale Pillow, NumPy e `opencv-python-headless` e rode `python3 scripts/build_approved_sprites.py`.

Os pontos de interesse contam com modelos voxel; mochila e sela usam os novos ícones na hotbar, no inventário e nas receitas. Os demais itens ainda usam os ícones existentes.

As estruturas fabricadas (fogueira, bancada, fornalha, cama e barco) podem ser selecionadas no inventário ou hotbar e posicionadas com Q, seguidas de Enter. As artes produzidas são usadas no mundo e, quando correspondem a itens existentes, nos ícones do inventário e da hotbar.
