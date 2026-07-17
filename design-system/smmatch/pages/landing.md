# Landing page — SMMatch

## Scope

The public entry point is the static [`index.html`](../../../index.html). The marketing route in `src/app/(marketing)` must follow this visual direction when it replaces the static delivery path.

## Direction

- Positioning: a selective SMM marketplace, not a generic freelance board.
- Tone: dark creator SaaS with a precise marketplace UI, restrained motion and low-noise violet/cyan light.
- Type: Sora for all headings; Manrope for reading and controls.
- Visual proof: use a product-native matching board, service categories, and safety mechanics instead of stock photography, fake counters, or fabricated testimonials.

## Tokens

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#F5F7FF` | `#060816` |
| Surface | `#FFFFFF` | `#10142A` |
| Primary text | `#11142A` | `#F4F7FF` |
| Accent | `#7B6CFF` | `#7B6CFF` |

## Responsive and interaction rules

- Start at 320px: 16px gutters, a one-column hero, two-column category cards, and an explicit menu button.
- At 680px and below, hide secondary header actions; at 960px and below, collapse the desktop navigation.
- Keep every icon as a 1.8px stroke SVG and every icon-only control at least 37px desktop / 40px mobile; primary CTAs are at least 44px high.
- Hover states use only a 200–220ms transform or color transition. Respect `prefers-reduced-motion`.
- Offer a persisted light/dark theme without changing layout or the information hierarchy.
