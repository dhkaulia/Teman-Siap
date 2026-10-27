# Asset Documentation & Licenses

This document records the provenance, license terms, vector specifications, and art direction adherence for all visual and typographic assets used in **Teman Siap**.

---

## 1. Taman Kita Botanical Plant System (Path B Vector Implementation)

* **Component:** [`public/js/ui/plant.js`](file:///d:/DEV%20FR/Date!/public/js/ui/plant.js) & CSS styling in [`public/css/tokens.css`](file:///d:/DEV%20FR/Date!/public/css/tokens.css), [`public/css/screens.css`](file:///d:/DEV%20FR/Date!/public/css/screens.css)
* **Source:** Custom procedural SVG geometry authored specifically for Teman Siap.
* **Art Direction Reference:** User-provided botanical reference image (`media_1793067965180_2ef0a7a2.jpg`) representing 4 life stages of a potted plant in a cream stoneware pot.
* **License:** MIT License (Project Original, zero third-party copyright claims).

### Specifications & Conformance
| Attribute | Specification Requirement | Implemented Solution | Status |
| :--- | :--- | :--- | :--- |
| **Path Selection** | Path B: Pure inline SVG | Written as inline SVG templates inside `plant.js` | PASS |
| **File Budget** | Under 4KB (4,096 bytes) per stage | Stage 1: 2,007 B<br>Stage 2: 2,288 B<br>Stage 3: 3,140 B<br>Stage 4: 4,068 B | PASS (< 4KB each) |
| **Filters Constraint** | No `<filter>` primitives | Zero `feGaussianBlur`, `feDropShadow`, or `filter` tags | PASS |
| **CSS Variables** | `--leaf-1..3`, `--petal-1..2`, `--pot-1..2`, `--soil` | Full CSS variable color bindings with light/dark theme overrides | PASS |
| **Pot Architecture** | Cream stoneware pot, speckled surface, visible base ring, dark soil top | Identical pot geometry across all 4 stages with base ring, stipple glaze, rim, and loam soil | PASS |
| **Seed Stage (Biji)** | One almond-brown seed resting on soil | Oval seed with center crease, upper-left highlight, contact shadow | PASS |
| **Sprout (Tunas)** | One stem, two leaves, 3 tones + center vein | Central stem, 2 arching leaves with highlight/base/shade planes & vein | PASS |
| **Leafy (Berdaun)** | 5 to 6 distinct leaves with varied size & curl | 6 distinct leaves curling left/right with 3 tones + center vein | PASS |
| **Flowering (Berbunga)**| 7+ leaves, 1 plum flower (light inner tone, orange stamens), 2 buds | 7 leaves, 2 buds (green sepals + plum tips), 1 plum flower with lighter radiant core & 8 stamens | PASS |
| **Light Direction** | Upper-left key light | Upper-left gradients and highlight facets across pot, leaves, flower | PASS |
| **Soft Shadow** | NOT baked into SVG (CSS rendered) | `.plant-pot-shadow` with CSS radial gradient ellipse | PASS |
| **Animation** | Sway only when effects are on & reduced motion off | Keyframe sway with partner phase offset; disabled under `.effects-disabled` & `@media (prefers-reduced-motion)` | PASS |
| **API** | `renderPlant(stage, size, name)`, `stageForPractices` | Identical API maintained; names rendered as clean HTML outside SVG | PASS |

### Disclosure: Parts That Could Not Be Matched
While Path B matches all structural, tonal, and botanical specifications of the art direction, the following characteristics of the raster reference could not be replicated in pure inline SVG under the 4KB constraint:
1. **Paper Pulp Fiber & Deckle Texture:**
   The reference image features rough handmade watercolor paper with coarse deckle fiber textures. In Path B, embedding fractal noise displacement maps or raster bitmaps was omitted to preserve mobile performance and strict < 4KB weight.
2. **Diffuse Raster Gaussian Blur Shadows Under Leaves:**
   The reference artwork has multi-pass diffuse blurred drop shadows beneath individual foliage planes. In Path B, SVG `<filter>` tags are strictly prohibited (to guarantee 60fps scrolling on low-end Android hardware); depth is created through crisp faceted 3-tone vector planes and a CSS-only contact shadow beneath the pot base.
3. **Random Glaze Micro-Speckling:**
   The ceramic pot in the reference has thousands of tiny, organic glaze irregularities. Path B uses a calibrated 6-point vector stipple pattern with `--pot-speckle` instead of heavy noise textures.

---

## 2. Typography

* **Display Font:** Fraunces Variable (`wght 600-700`, `opsz 9-144`, `SOFT 100`)
  * **Source:** Google Fonts / Undercase Type (Phaedra Charles, Flavia Zimbardi)
  * **License:** [SIL Open Font License, Version 1.1](https://openfontlibrary.org/en/license/ofl)
  * **Delivery:** Self-hosted Latin woff2 subset in `/public/fonts/fraunces-soft-latin.woff2` (zero 3rd-party network requests).
* **Body Font:** Figtree (`400`, `500`, `600`, `700`)
  * **Source:** Google Fonts / Erik Kennedy
  * **License:** [SIL Open Font License, Version 1.1](https://openfontlibrary.org/en/license/ofl)
  * **Delivery:** Self-hosted Latin woff2 subset in `/public/fonts/figtree-latin.woff2` (zero 3rd-party network requests).

---

## 3. Character & Mascot Artwork (Tunas)

* **Component:** [`public/js/mascot.js`](file:///d:/DEV%20FR/Date!/public/js/mascot.js)
* **Description:** Friendly sprout mascot expressing 4 emotional states (`cheer`, `hug`, `sleepy`, `calm`).
* **Source:** Handcrafted SVG vector art created specifically for Teman Siap.
* **License:** MIT License (Project Original).

---

## 4. UI Icons

* **Description:** Consistent 24px outline SVG icon set (`currentColor`, stroke width 2, stroke-linecap round).
* **Source:** Custom vector icons inspired by Lucide / Feather icon conventions.
* **License:** MIT License / ISC License equivalent.
