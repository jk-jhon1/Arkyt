#!/usr/bin/env python3
"""Converte as artes aprovadas em sprites estáticos com fundo transparente.

Requer Pillow, NumPy e OpenCV (opencv-python-headless). As artes originais
ficam intactas em assets/revisao e assets/conceito-*.png.
"""
from pathlib import Path
import sys
import cv2
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MODELS = {
    'personagem': 'assets/revisao/personagem.png',
    'lobo': 'assets/conceito-lobo.png',
    'cavalo': 'assets/conceito-cavalo.png',
    'capivara': 'assets/conceito-capivara.png',
    'urso': 'assets/revisao/urso.png',
    'crocodilo': 'assets/revisao/crocodilo.png',
    'triceratops': 'assets/revisao/triceratops.png',
    'tubarao': 'assets/revisao/tubarao.png',
    'arvore': 'assets/revisao/arvore.png',
    'fornalha': 'assets/revisao/fornalha.png',
    'picareta': 'assets/revisao/picareta.png',
    'tiranossauro': 'assets/revisao/tiranossauro.png',
    'velociraptor': 'assets/revisao/velociraptor.png',
    'estegossauro': 'assets/revisao/estegossauro.png',
    'diplodoco': 'assets/revisao/diplodoco.png',
    'braquiossauro': 'assets/revisao/braquiossauro.png',
    'anquilossauro': 'assets/revisao/anquilossauro.png',
    'parasaurolophus': 'assets/revisao/parasaurolophus.png',
    'pteranodonte': 'assets/revisao/pteranodonte.png',
    'espinossauro': 'assets/revisao/espinossauro.png',
    'carnotauro': 'assets/revisao/carnotauro.png',
    'iguanodonte': 'assets/revisao/iguanodonte.png',
    'mosassauro': 'assets/revisao/mosassauro.png',
    'plesiossauro': 'assets/revisao/plesiossauro.png',
    'compsognato': 'assets/revisao/compsognato.png',
    'baleia': 'assets/revisao/baleia.png',
    'golfinho': 'assets/revisao/golfinho.png',
    'orca': 'assets/revisao/orca.png',
    'tartaruga-marinha': 'assets/revisao/tartaruga-marinha.png',
    'polvo': 'assets/revisao/polvo.png',
    'raia': 'assets/revisao/raia.png',
    'galinha': 'assets/revisao/galinha.png',
    'pato': 'assets/revisao/pato.png',
    'coelho': 'assets/revisao/coelho.png',
    'cabra': 'assets/revisao/cabra.png',
    'ovelha': 'assets/revisao/ovelha.png',
    'vaca': 'assets/revisao/vaca.png',
    'camelo': 'assets/revisao/camelo.png',
    'cervo': 'assets/revisao/cervo.png',
    'elefante': 'assets/revisao/elefante.png',
    'rinoceronte': 'assets/revisao/rinoceronte.png',
    'bufalo': 'assets/revisao/bufalo.png',
    'hipopotamo': 'assets/revisao/hipopotamo.png',
    'gorila': 'assets/revisao/gorila.png',
    'javali': 'assets/revisao/javali.png',
    'alce': 'assets/revisao/alce.png',
    'touro': 'assets/revisao/touro.png',
    'leao': 'assets/revisao/leao.png',
    'tigre': 'assets/revisao/tigre.png',
    'onca': 'assets/revisao/onca.png',
    'hiena': 'assets/revisao/hiena.png',
    'serpente': 'assets/revisao/serpente.png',
    'peixe': 'assets/revisao/peixe.png',
    'foca': 'assets/revisao/foca.png',
    'lula': 'assets/revisao/lula.png',
    'crustaceo': 'assets/revisao/crustaceo.png',
    'abrigo': 'assets/revisao/abrigo.png',
    'casa': 'assets/revisao/casa.png',
    'torre': 'assets/revisao/torre.png',
    'ponte': 'assets/revisao/ponte.png',
    'fogueira': 'assets/revisao/fogueira.png',
    'cerca': 'assets/revisao/cerca.png',
    'portao': 'assets/revisao/portao.png',
    'estabulo': 'assets/revisao/estabulo.png',
    'baia': 'assets/revisao/baia.png',
    'doca': 'assets/revisao/doca.png',
    'barco': 'assets/revisao/barco.png',
    'armazem': 'assets/revisao/armazem.png',
    'horta': 'assets/revisao/horta.png',
    'armadilha': 'assets/revisao/armadilha.png',
    'cama': 'assets/revisao/cama.png',
    'posto': 'assets/revisao/posto.png',
    'escada': 'assets/revisao/escada.png',
    'carroca': 'assets/revisao/carroca.png',
    'guindaste': 'assets/revisao/guindaste.png',
    'bancada': 'assets/revisao/bancada.png',
    'machado': 'assets/revisao/machado.png',
    'lanca': 'assets/revisao/lanca.png',
    'arco': 'assets/revisao/arco.png',
    'rocha': 'assets/revisao/rocha.png',
    'tronco': 'assets/revisao/tronco.png',
    'pinheiro': 'assets/revisao/pinheiro.png',
    'palmeira': 'assets/revisao/palmeira.png',
    'fibra': 'assets/revisao/fibra.png',
    'fruta': 'assets/revisao/fruta.png',
    'cogumelo': 'assets/revisao/cogumelo.png',
    'planta-medicinal': 'assets/revisao/planta-medicinal.png',
    'mel': 'assets/revisao/mel.png',
    'pedra-chao': 'assets/revisao/pedra-chao.png',
    'semente': 'assets/revisao/semente.png',
    'folha': 'assets/revisao/folha.png',
    'poi-caverna': 'assets/revisao/poi-caverna.png',
    'poi-cachoeira': 'assets/revisao/poi-cachoeira.png',
    'poi-ruinas': 'assets/revisao/poi-ruinas.png',
    'poi-acampamento': 'assets/revisao/poi-acampamento.png',
    'poi-aldeia': 'assets/revisao/poi-aldeia.png',
    'poi-naufragio': 'assets/revisao/poi-naufragio.png',
    'poi-fossil': 'assets/revisao/poi-fossil.png',
    'poi-segredo': 'assets/revisao/poi-segredo.png',
    'mochila': 'assets/revisao/mochila.png',
    'sela': 'assets/revisao/sela.png',
}
OUT = ROOT / 'assets/sprites-aprovados'
OUT.mkdir(parents=True, exist_ok=True)
selected = sys.argv[1:] or list(MODELS)
for name in selected:
    source = MODELS[name]
    src = Image.open(ROOT / source).convert('RGB')
    # Dimensões moderadas tornam a segmentação reproduzível e leve.
    src.thumbnail((640, 640), Image.Resampling.LANCZOS)
    rgb = np.array(src)
    h, w = rgb.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    bg = np.zeros((1, 65), np.float64)
    fg = np.zeros((1, 65), np.float64)
    margin_x, margin_y = max(1, w // 30), max(1, h // 30)
    cv2.grabCut(rgb, mask, (margin_x, margin_y, w-2*margin_x, h-2*margin_y), bg, fg, 5, cv2.GC_INIT_WITH_RECT)
    alpha = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype('uint8')
    count, labels, stats, _ = cv2.connectedComponentsWithStats(alpha, 8)
    if count < 2:
        raise RuntimeError(f'Não foi possível separar o modelo: {name}')
    largest = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    alpha = np.where(labels == largest, 255, 0).astype('uint8')
    rgba = Image.fromarray(np.dstack((rgb, alpha)), 'RGBA')
    bounds = rgba.getbbox()
    if not bounds:
        raise RuntimeError(f'Sprite vazio: {name}')
    rgba = rgba.crop(bounds)
    # Resolução consistente em pixels, sem desfoque no jogo.
    rgba = rgba.resize((max(1, round(rgba.width * 128 / rgba.height)), 128), Image.Resampling.NEAREST)
    rgba.save(OUT / f'{name}.png', optimize=True)
    print(name, rgba.size)
