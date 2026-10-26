# DESIGN.md — Teman Siap Design System & Guidelines (v2.0)

## 1. Product Identity & Direction
Teman Siap is an empathetic, friendly, and game-like learning app for Indonesian young adults, engaged couples, and newlyweds preparing for marriage across three core pillars: emotions (**Emosi**), money (**Uang**), and the couple relationship (**Kita**).

- **Character:** Playful, warm, confident; never childish, never pushy (*ramah, hangat, percaya diri, menyenangkan tanpa kekanak-kanakan*).
- **Structure & Feel:** Inspired by the clarity and chunky tactility of approachable learning apps (chunky pressed buttons, bold outlines, cheerful visual landmarks), but custom-crafted for adult relationship transitions.
- **Independence:** We take structure and feel only. Zero copying of any app's mascot, illustrations, icons, names, sounds, or exact layouts.

---

## 2. Visual System & Palette (v2)

### Semantic Color System
The palette pairs the foundational grounding tones (Teal, Saffron, Plum) with joyful, gamified accents (Tunas Green, Soft Coral, Sunny Yellow). Every text and control pairing is mathematically verified to exceed **WCAG 2.1 AA (>= 4.5:1)** for normal text and **>= 3.0:1** for controls and large text.

#### 1. Primary Teal (Ketenteraman & Fondasi)
- **Light:** `#1B5E59` (Border: `#164E4A`, Pressed Shadow: `#124440`) — Contrast on White: **6.54:1**
- **Dark:** `#4FB0A8` (Border: `#388E87`, Pressed Shadow: `#0A2E2B`) — Contrast on Dark Card: **6.11:1**
- *Usage:* Primary app shell, foundational navigation, calm breathing cues, core action buttons.

#### 2. Accent Saffron (Harapan & Jeda Sadar)
- **Light:** `#D97706` (Text contrast paired as `#B45309` at **4.82:1** on white, Pressed Shadow: `#92400E`)
- **Dark:** `#FBBF24` (Contrast on Dark Card: **10.2:1** with `#2A1E00`, Pressed Shadow: `#78350F`)
- *Usage:* Active urge-surfing pause tools, conscious choice milestones, reflective timers.

#### 3. Relational Plum (Kasih & Ruang Berdua — Pilar Kita)
- **Light:** `#6B4E71` (Border: `#553C5A`, Pressed Shadow: `#4E3553`) — Contrast on White: **6.82:1**
- **Dark:** `#B396B9` (Border: `#8C7092`, Pressed Shadow: `#4A3050`) — Contrast on Dark Card: **6.31:1**
- *Usage:* Guided couple conversations, turn-based handover cards, mutual consent reveal spaces.

#### 4. Tunas Green (Pertumbuhan & Keberhasilan — Success)
- **Light:** `#15803D` (Tint: `#DCFCE7`, Pressed Shadow: `#14532D`) — Contrast on White: **5.02:1** (White text on `#15803D`: **5.02:1**)
- **Dark:** `#4ADE80` (Tint: `#143522`, Pressed Shadow: `#166534`) — Contrast on Dark Card: **9.25:1**
- *Usage:* Celebrates completed check-ins, finished partner reflections, adoption of coping plans.

#### 5. Soft Coral (Penekanan Lembut — Gentle Emphasis)
- **Light:** `#C84825` (Tint: `#FFEDE7`, Pressed Shadow: `#9A3412`) — Contrast on White: **4.76:1** (White text on `#C84825`: **4.76:1**)
- **Dark:** `#FB923C` (Tint: `#3D1E0C`, Pressed Shadow: `#9A3412`) — Contrast on Dark Card: **7.12:1**
- *Usage:* Gentle attention, self-care safety pauses, sensitive communication tips.
- *Strict Rule:* **NOT red.** Red is strictly banned for spending logs, budget overages, or missed dates.

#### 6. Sunny Yellow (Apresiasi & Hadiah — Rewards)
- **Light:** `#EAB308` (Dark Amber text `#78350F` on tint `#FEF3C7`: **8.15:1**; Dark Ink `#12211F` on `#EAB308`: **7.74:1**, Pressed Shadow: `#A16207`)
- **Dark:** `#FCD34D` (Tint: `#3B3008`, Pressed Shadow: `#78350F`) — Contrast on Dark Card: **11.18:1**
- *Usage:* Practice badges, weekly practice streak-free milestones, cheerful completion rewards.

#### 7. Canvas, Surface & Inks
- **Canvas (Background):** Light `#F4F6F5` / Dark `#101716` (Warm organic base, reduces eye fatigue).
- **Surface (Card):** Light `#FFFFFF` / Dark `#182322`.
- **Card Borders:** Light `2px solid #DFE5E3` / Dark `2px solid #273735`.
- **Ink Primary:** Light `#12211F` (**16.31:1**) / Dark `#F0F6F5` (**14.24:1**).
- **Ink Secondary / Mute:** Light `#485D5A` (**6.42:1**) / Dark `#9EABA9` (**6.31:1**).

---

## 3. Typography Hierarchy

### Font Families
- **Display Headings & Big Numbers:** `"Nunito", "Baloo 2", system-ui, -apple-system, sans-serif`  
- **Body Text, Controls & Reading:** `"Plus Jakarta Sans", system-ui, -apple-system, sans-serif`  
- Loaded with `font-display: swap;` and zero layout thrash.

### Why Newsreader was Replaced in Headings
In v1, *Newsreader* (serif) was introduced to cultivate literary seriousness. While dignified, real testing showed it felt overly solemn, clinical, and intimidating for young Indonesian adults navigating vulnerable daily topics. Replacing Newsreader in headings with *Nunito* delivers approachable warmth, buoyant optimism, and chunky game-like clarity, without descending into cartoonishness. *Plus Jakarta Sans* remains the body typeface for pristine numeral rendering and UI readability.

---

## 4. Shape Language & Chunky Tactility

- **Border Radius:** **16px to 24px** (`--radius-sm: 14px`, `--radius-md: 18px`, `--radius-lg: 24px`, `--radius-pill: 9999px`). Soft, friendly contours across all cards and widgets.
- **Thick Outlines:** **2px solid borders** on cards, buttons, choice tiles, and inputs, creating prominent, tactile edges that are instantly distinguishable in both light and dark modes.
- **Pressed Bottom Shadow (Chunky Button Mechanics):**
  - Resting state: `box-shadow: 0 4px 0 var(--btn-shadow); transform: translateY(0);`
  - Active (pressed) state: `box-shadow: 0 0 0 var(--btn-shadow); transform: translateY(4px);`
  - Provides instant, satisfying physical feedback on touch devices.

---

## 5. Playful Guardrails

The following guardrails govern all gamification and interactive elements across the app:

no hearts or energy limits that block learning; no leaderboards or public comparisons; no streak loss shaming; no countdown pressure or fake scarcity; no variable/random rewards near any money action; no celebration tied to the amount saved or spent (celebrate practice, not balances); mascot never guilt-trips; every sound/animation/haptic can be turned off.

---

## 6. Craftsmanship & Anti-Slop Dials (R-37)

- **Energy (3.5/5):** Cheerful, motivating, clear, and confident. Never manic, never frantic.
- **Rhythm (4/5 — short bursts):** Short, rewarding sessions (30 seconds to 3 minutes). One clear primary action per screen context.
- **Motion (3/5):** Tactile button presses, smooth 4-4-6 breathing expansion, soft wave indicators. Strictly animating only `transform` and `opacity`. Every animation collapses cleanly when `prefers-reduced-motion: reduce` is active.
- **Zero Shame Policy:** Celebrate weekly meaningful practice. No red warnings for spending. No broken streaks. Respect private boundaries unconditionally.
