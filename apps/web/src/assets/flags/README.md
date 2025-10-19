# Flag Assets

This directory contains flag SVG files used in the Ankilang application.

## Sources & Licenses

### Twemoji Flags (37 flags)

Most flags are sourced from [Twemoji](https://github.com/twitter/twemoji) - Twitter's emoji library.

**Files:** All country flags (ar→sa.svg, bg.svg, br.svg, cn.svg, cz.svg, de.svg, dk.svg, ee.svg, es.svg, fi.svg, fr.svg, gb.svg, gr.svg, hu.svg, id.svg, il.svg, it.svg, jp.svg, kr.svg, lt.svg, lv.svg, mx.svg, nl.svg, no.svg, pl.svg, pt.svg, ro.svg, ru.svg, sa.svg, se.svg, si.svg, sk.svg, th.svg, tr.svg, tw.svg, ua.svg, us.svg, vn.svg, world.svg)

**License:** CC-BY 4.0 + MIT (code)
- Attribution: Copyright 2020 Twitter, Inc and other contributors
- Graphics License: CC-BY 4.0 https://creativecommons.org/licenses/by/4.0/
- Code License: MIT https://github.com/twitter/twemoji/blob/master/LICENSE-CODE

### Occitan Flag (oc.svg)

**File:** `oc.svg`

**Description:** Traditional Occitan flag (croix occitane / Occitan cross) adapted to Twemoji style

**Design:**
- Yellow background (#FCDD09)
- Red cross (#C8102E) with 12 circles (croix occitane pattern)
- Adapted to match Twemoji visual style (36×36 viewBox, rounded corners)

**Inspiration:** Based on traditional Occitan cross flag design (public domain)

**Created:** 2025-10-19

**License:** Public Domain / CC0
- This specific SVG file was created for the Ankilang project
- The croix occitane design is a traditional historical symbol (public domain)
- No copyright restrictions apply to this file

**Usage in App:**
- `oc` (Occitan - Languedocien): Displays `oc.svg`
- `oc-gascon` (Occitan - Gascon): Displays `oc.svg` with orange "G" badge overlay

## Format

All flags follow the Twemoji format:
- **Format:** SVG (Scalable Vector Graphics)
- **ViewBox:** `0 0 36 36` (36×36 square)
- **Corners:** Rounded (`rx="4"`)
- **Size:** ~1-5 KB per file

## Usage in Code

Flags are loaded via `import.meta.glob()` in `src/components/ui/FlagIcon.tsx`:

```typescript
const flagModules = import.meta.glob('../../assets/flags/*.svg', {
  eager: true,
  import: 'default'
}) as Record<string, string>
```

## Attribution Requirements

### For Twemoji Flags

When distributing this application, the following attribution must be maintained:

```
Graphics License: CC-BY 4.0
Copyright 2020 Twitter, Inc and other contributors
Graphics licensed under CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
```

### For Occitan Flag

No attribution required (Public Domain), but acknowledgment appreciated:

```
Occitan flag (oc.svg) created for Ankilang project
Based on traditional croix occitane design
```

## Modifications

All Twemoji flags are used **as-is** without modifications.

The Occitan flag (`oc.svg`) was **custom-created** to match the Twemoji visual style while representing the traditional croix occitane symbol.

## Adding New Flags

To add a new flag:

1. **From Twemoji:** Download from https://github.com/twitter/twemoji/tree/master/assets/svg
2. **Custom flag:** Create SVG with:
   - `viewBox="0 0 36 36"`
   - Rounded corners `rx="4"` on background
   - Optimized with SVGO
   - File size target: 1-5 KB
3. Place in this directory with appropriate name (e.g., `xx.svg` for language code `xx`)
4. Update `COUNTRY_MAP` in `FlagIcon.tsx` if needed
5. Document source and license in this README

## References

- **Twemoji Repository:** https://github.com/twitter/twemoji
- **CC-BY 4.0 License:** https://creativecommons.org/licenses/by/4.0/
- **Occitan Cross (Wikipedia):** https://en.wikipedia.org/wiki/Cross_of_Toulouse
- **DeepL Language Codes:** https://developers.deepl.com/docs/resources/supported-languages

---

**Last Updated:** 2025-10-19
