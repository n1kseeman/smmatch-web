# Landing page — SMMatch

## Scope

The public entry point is the static [`index.html`](../../../index.html). The marketing route in `src/app/(marketing)` must follow this visual direction when it replaces the static delivery path.

## Direction

- Positioning: a selective SMM marketplace, not a generic freelance board.
- Tone: editorial warm graphite and paper, precise product UI, restrained motion.
- Type: Calistoga for expressive display headings; Inter for reading and UI; JetBrains Mono only for metadata.
- Visual proof: use a product-native matching board, service categories, and safety mechanics instead of stock photography, fake counters, or fabricated testimonials.

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#F4F0E9` | `#171513` |
| Surface | `#FFFDF9` | `#211E1A` |
| Primary text | `#171513` | `#F6F0E6` |
| Accent | `#B36A21` | `#EDB36A` |

## Responsive and interaction rules

- Start at 320px: 16px gutters, a one-column hero, two-column category cards, and an explicit menu button.
- At 680px and below, hide secondary header actions; at 960px and below, collapse the desktop navigation.
- Keep every icon as a 1.8px stroke SVG and every icon-only control at least 36px desktop / 38px mobile; primary CTAs are at least 44px high.
- Hover states use only a 200–220ms transform or color transition. Respect `prefers-reduced-motion`.
- Offer a persisted light/dark theme without changing layout or the information hierarchy.
