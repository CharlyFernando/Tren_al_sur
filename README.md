# Tren al sur

Una carta frente al mar, al atardecer.

Una sola página: océano procedural en Three.js, sol cálido en el horizonte y un sobre
que se abre para dejar la carta en blanco, lista para escribir. Sin menús, sin paneles,
sin texto inventado.

## Stack

- [Vite](https://vite.dev/) 8
- [Three.js](https://threejs.org/) (vanilla, sin frameworks)
- HTML + CSS para el sobre y la carta

## Uso local

Requiere Node.js 20 o superior.

```bash
git clone https://github.com/CharlyFernando/Tren_al_sur.git
cd Tren_al_sur
npm install
npm run dev
```

Comandos disponibles:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |

## Cómo escribir la carta

El contenido vive en `index.html`, dentro de `.letter-content`:

```html
<div class="letter-content">
  <!-- Agrega aquí el contenido de tu carta -->
</div>
```

Reemplazá ese comentario por el HTML que quieras: párrafos, saltos de línea, una firma.
Los estilos de la hoja ya están preparados en `src/letter/letter.css` (`.letter-content`),
así que el texto hereda tipografía, tamaño y color sin configuración extra.

No hay contenido de ejemplo a propósito: la carta es tuya.

## Música ambiental

El audio está en `public/audio/ambient.mp3`. Se reproduce en loop, a volumen bajo, y
solo después de una interacción del usuario: al abrir la carta o al tocar el control de
sonido (abajo a la derecha).

- Para usar otra pista, reemplazá el archivo manteniendo el mismo nombre.
- El volumen inicial se ajusta en `src/audio/ambient.js` (`DEFAULT_VOLUME`).
- El navegador no descarga el audio hasta que el usuario interactúa.

### Licencia del audio incluido

`public/audio/ambient.mp3` fue generado para este proyecto con FFmpeg a partir de tonos
sinusoidales sintetizados (La menor, 72 segundos, loop). No contiene samples de terceros.
Se libera como **CC0 / dominio público**: podés reemplazarlo o reutilizarlo sin
atribución.

## Accesibilidad y movimiento

- La carta se abre con clic, `Enter` o `Space`, y se cierra con el botón, clic afuera o
  `Escape`. `aria-expanded`, `aria-hidden` y el foco se actualizan en cada transición.
- Con `prefers-reduced-motion: reduce` el océano, la cámara y el sol quedan quietos y las
  transiciones se acortan. La carta y el audio siguen funcionando.

## Estructura

```text
Tren_al_sur/
├── public/
│   └── audio/
│       └── ambient.mp3
├── src/
│   ├── main.js
│   ├── style.css
│   ├── scene/
│   │   ├── createScene.js
│   │   ├── ocean.js
│   │   ├── sun.js
│   │   └── camera.js
│   ├── letter/
│   │   ├── letter.js
│   │   └── letter.css
│   └── audio/
│       └── ambient.js
├── index.html
├── package.json
└── vercel.json
```

## Deploy en Vercel

### Desde GitHub (recomendado)

1. Entrar a [vercel.com](https://vercel.com) y elegir **Add New Project**.
2. Importar `CharlyFernando/Tren_al_sur`.
3. Vercel detecta Vite automáticamente. Verificar:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
4. **Deploy**.

Cada push a `main` despliega producción; las ramas y pull requests generan previews.

### Con la CLI

```bash
npm install -g vercel
vercel        # preview
vercel --prod # producción
```

## Alcance de esta versión

Incluye océano procedural con ondas suaves, sol con halo, sobre desplegable, música
ambiental opcional, diseño responsive y soporte de movimiento reducido.

Queda afuera, a propósito: FFT, reflejos físicos, espuma, cáusticas, nubes, partículas,
cámara libre y clima. La prioridad es que la escena se sienta tranquila y liviana.
