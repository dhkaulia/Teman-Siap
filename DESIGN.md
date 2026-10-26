# DESIGN.md — Teman Siap Design System & Guidelines

## 1. Product Identity & Voice
Teman Siap is an empathetic, beginner-friendly companion for Indonesian young adults, engaged couples, and newlyweds navigating the emotional, financial, and relational transitions of marriage.

- **Character:** Calm, warm, grounded, non-judgmental, culturally authentic (*hangat, tenang, bersahabat, menghargai proses*).
- **Tone:** Speaks as a trusted, gentle mentor, never an authoritative judge, an aggressive drill sergeant, or an artificial corporate bot.
- **Audience:** Indonesian adults aged 19–34 facing real stressors (sandwich generation support, wedding costs, gajian/payday management, emotional suppression).

---

## 2. Visual System & Palette

### Semantic Palette
- **Primary Teal (Ketenteraman & Fondasi):** `#1B5E59` (Dark: `#58B5AE`)  
  *Purpose:* Used for primary navigation, grounding actions, and foundational headers. Evokes stillness, stability, and emotional safety.
- **Accent Saffron (Harapan & Sabar):** `#D97706` (Accent highlight: `#F59E0B`)  
  *Purpose:* Reserved strictly for active practice moments (Urge-surfing timer, breathing circle, progress milestones).
- **Relational Plum (Kasih & Hubungan):** `#6B4E71` (Accent: `#8B5CF6`)  
  *Purpose:* Reserved for the "Kita" (relationship) pillar, guided conversations, and shared partner activities.
- **Canvas / Background:** `#F6F8F7` (Dark: `#111817`)  
  *Purpose:* Soft organic warm tone that avoids harsh cold blue-white light, reducing cognitive strain during emotional moments.
- **Surface / Card:** `#FFFFFF` (Dark: `#1A2422`)  
  *Purpose:* High legibility content container with a subtle 1px border (`#E0E7E4`, Dark: `#273735`).
- **Typography Inks:**
  - Ink High Contrast: `#132220` (Dark: `#EEF5F3`) — Contrast ratio > 11:1 (Exceeds WCAG AAA).
  - Ink Secondary / Mute: `#4B615D` (Dark: `#A3B8B4`) — Contrast ratio > 5.5:1 (Exceeds WCAG AA).

---

## 3. Typography Hierarchy

- **Editorial Headings:** Serif font stack: `"Newsreader", "Lora", Georgia, serif`  
  *Why:* Conveys reflective pacing, dignity, and thoughtful human editorial warmth rather than cold fintech dashboards.
- **UI, Controls & Reading Text:** Humanist Sans stack: `"Plus Jakarta Sans", system-ui, -apple-system, sans-serif`  
  *Why:* Designed for high readability on Indonesian mobile screens, clear numeral rendering, and clean legibility.

---

## 4. Craftsmanship & Anti-Slop Dials (R-37)

- **Energy (2/5):** Calming, meditative, inviting. No loud promotional banners, flashing counters, or urgency guilt-trips.
- **Rhythm (3/5):** Clear progressive disclosure. One primary action per screen context.
- **Motion (2/5):** Subtle and purposeful.
  - Breathing guide: Smooth 4s-4s-6s expansion/contraction.
  - Urge surfing: Rhythmic wave curve indicator.
  - Tab transition: Clean fade, zero disorienting bounces.
- **Zero Shame Policy:**
  - No red warning icons for spending mistakes or budget overages.
  - No streaks that break and guilt-trip the user.
  - Celebrate weekly meaningful practice over daily performative usage.
