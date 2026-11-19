# SSR Cards — Rewind 2026

Créditos finales del Rewind: una carta SSR por persona, con la animación de revelación de una Support Card recreada frame a frame a partir del video de referencia.

## Resultado

`output/SSR_<Nombre>.mp4` — 1080×1920, 60 fps, 6 s.

| Tramo | Original (30 fps) | Qué pasa |
|---|---|---|
| 0.00–0.13 s | frames 1–4 | Destello mágenta con rayos de luz |
| 0.17–0.80 s | frames 6–24 | Barrido diagonal blanco → primer plano 1 (inclinado) + estrellas pastel |
| 0.83–1.47 s | frames 26–44 | Barrido diagonal → primer plano 2 + estrellas |
| 1.50–2.33 s | frames 46–70 | Ventana horizontal que se abre sobre blanco → zoom a la cara, estallido de estrellas, cierre con zoom |
| 2.43–2.80 s | frames 74–84 | Revelación: fondo rosa difuminado, arcoíris pastel, destellos ✦ y anillo arcoíris expansivo |
| 2.83–3.17 s | frames 86–95 | Entra `SSR` + `[Tipo]` + nombre (de blanco a degradado) |
| 3.17–3.23 s | frames 95–97 | Etiqueta **NEW!** |
| 4.00–4.13 s | frames 121–124 | Brillo que recorre la imagen |
| 4.47–6.00 s | (extra) | La imagen se acomoda en la carta: borde holográfico, badge SSR e ícono del tipo |

## Estructura

- `assets/gfx/` — GFX finales (uno por persona)
- `assets/faces/` — recortes de cara (sirven para centrar los primeros planos)
- `assets/icons/` — íconos de tipo sin bordes negros + badge SSR
- `tools/card.html` — motor de animación (canvas, determinista por tiempo)
- `tools/render.js` — renderiza con Chromium (Playwright) y codifica con ffmpeg
- `tools/cards.json` — nombre y tipo de cada carta
- `tools/faces.json` — posición de la cara en cada GFX (calculada con `facefind.py`)

## Volver a renderizar

```bash
cd tools && npm install
node render.js                       # todas
node render.js --only Alex,Cami      # solo algunas
node render.js --only Alex --preview 90,133,179   # PNG de frames sueltos (frame = original a 30 fps)
```

Para cambiar un nombre o tipo, edita `tools/cards.json` (`label` permite mostrar un texto distinto al del archivo, p. ej. `Sánchez`).
