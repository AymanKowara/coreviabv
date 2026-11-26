---
name: Corevia B.V.
description: Corporate site of a Dutch holding company, set like a register entry made legible.
colors:
  navy: "#14213d"
  navy-deep: "#0e1830"
  navy-line: "#2b3a5c"
  navy-text: "#c9cfdc"
  brass: "#b08d57"
  brass-light: "#c9a877"
  brass-ink: "#82632f"
  ink: "#17203a"
  ink-soft: "#4a5368"
  rule: "#dfe2e9"
  band: "#f3f4f7"
  white: "#ffffff"
  danger: "#a3281f"
typography:
  display:
    fontFamily: "Spectral, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(3.25rem, 8.2vw, 5.75rem)"
    fontWeight: 300
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Spectral, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(2.2rem, 4.6vw, 3.4rem)"
    fontWeight: 300
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Spectral, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 400
    lineHeight: 1.12
  descriptor:
    fontFamily: "Spectral, Iowan Old Style, Palatino Linotype, Georgia, serif"
    fontSize: "clamp(1.35rem, 2.4vw, 1.75rem)"
    fontWeight: 300
  body:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Public Sans, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    letterSpacing: "0.1em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
  section: "clamp(4.5rem, 9vw, 7.5rem)"
  wrap: "75rem"
components:
  button-brass:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.navy-deep}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.4rem"
    height: "3rem"
  button-brass-hover:
    backgroundColor: "{colors.brass-light}"
  button-navy:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.4rem"
    height: "3rem"
  button-navy-hover:
    backgroundColor: "{colors.navy-deep}"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.none}"
    padding: "0.8rem 1.4rem"
    height: "3rem"
  button-line-hover:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.7rem 0.9rem"
    height: "3rem"
---

# Design System: Corevia B.V.

## Overview

**Creative North Star: "The Register Entry"**

Corevia's site reads like a company's entry in the trade register, made legible and dignified: the facts first, set in ruled lines, framed by deep navy and a single brass hairline. It is the classic corporate holding look played straight, with no stock photography, no icons standing in for content and no decorative device that the facts do not need.

Density is calm. Large light serif headings sit over short sans paragraphs; information that has structure (particulars, roles, contact details) is set as ruled definition lists, never as cards. Colour commits at section scale: navy owns the hero and footer, a cool grey band carries the audience paths, and white carries reading.

The developer's standing constraint holds across the system: clean, typography-driven design with no AI-generated or illustrative imagery.

**Key Characteristics:**
- Navy fields and white reading surfaces, brass only as hairlines and small marks
- Light serif display (Spectral 300) over a neutral sans (Public Sans)
- Ruled lists and tables instead of cards
- Square corners everywhere
- Every value that is not yet known shows as a marked placeholder, never invented

## Colors

A restrained palette: one deep navy, one brass accent, cool neutrals.

### Primary
- **Register Navy** (navy): the hero and footer fields, primary buttons on light grounds, headings on white.
- **Night Navy** (navy-deep): footer ground, button hover on navy, text on brass buttons.

### Secondary
- **Brass Hairline** (brass): rules above headings, the hero rule, the particulars top border, focus rings, the wordmark square, and the primary button on navy.
- **Pale Brass** (brass-light): the italic descriptor and panel titles on navy; brass button hover.
- **Brass Ink** (brass-ink): brass when it must be read on white (active language code, caret).

### Neutral
- **Ink** (ink): body text on white.
- **Slate Ink** (ink-soft): supporting paragraphs, labels on white.
- **Navy Mist** (navy-text): secondary text and labels on navy.
- **Navy Line** (navy-line): dividers on navy, scrollbar thumb.
- **Cool Rule** (rule): dividers and borders on white.
- **Cool Band** (band): the alternate section ground and hover tint.
- **White** (white): the reading ground.
- **Signal Red** (danger): form errors only.

### Named Rules
**The Hairline Rule.** Brass appears as lines and small marks, never as a large fill on white; its rarity is what makes it read as a seal.

**The Two Grounds Rule.** Text sits on navy or on white/cool band. Brass text on white uses Brass Ink, never Brass.

## Typography

**Display Font:** Spectral (with Iowan Old Style, Palatino, Georgia)
**Body Font:** Public Sans (with Segoe UI, system-ui)

**Character:** A light, literate serif for names and headings against a plain civic sans for everything a visitor reads or operates.

### Hierarchy
- **Display** (300, clamp 3.25–5.75rem, 0.98): the company name in the hero only.
- **Headline** (300, clamp 2.2–3.4rem, 1.12): section headings.
- **Title** (400, 1.75rem): path headings, document subheadings; 1.375rem for role terms.
- **Descriptor** (300 italic, clamp 1.35–1.75rem): the "Holding company" line, in Pale Brass.
- **Body** (400, 1.0625rem, 1.65): paragraphs, capped at roughly 34–38rem.
- **Label** (500, 0.8125rem, 0.1em, uppercase): panel titles such as "Company particulars" only.

### Named Rules
**The No Kicker Rule.** Headings stand alone; a brass rule may sit above them, a text label never does.

**The Tabular Facts Rule.** Registration numbers and legal values use tabular numerals.

## Layout

A centred wrap of 75rem with fluid gutters (1.25–2.5rem) and section padding of 4.5–7.5rem. The hero uses a 12-column grid: copy across seven columns, the particulars panel across the last four. Content sections split 5:6 (heading and lead on the left, ruled list or form on the right). The audience paths sit in three equal columns divided by hairlines, buttons aligned to a common baseline.

Below 68rem the navigation collapses into a menu panel, the hero panel stacks under the actions, two-column sections stack, and paths stack with top rules. Below 36rem hero and form buttons go full width and two-column rows inside lists collapse to one.

## Elevation & Depth

Flat by default. Depth comes from tonal fields (navy, band, white) and hairlines. Two soft shadows exist, both functional: the sticky header gains a faint drop once the page scrolls, and the language list floats on a soft shadow.

### Shadow Vocabulary
- **Header lift** (`box-shadow: 0 6px 18px -14px rgba(20, 33, 61, 0.35)`): sticky header after scroll.
- **Menu float** (`box-shadow: 0 18px 36px -18px rgba(20, 33, 61, 0.35)`): language list and mobile menu panel.

## Shapes

Square corners throughout (0px): buttons, inputs, menus, panels. Form comes from rules: 1px lines in Cool Rule on white and Navy Line on navy, a 1px navy top rule to open lists, and 2px brass bars (2.5–3rem wide) to open headings.

## Components

### Buttons
- **Shape:** square (0px), at least 3rem tall.
- **Brass:** the primary action on navy; Night Navy text.
- **Navy:** the primary action on light grounds; white text.
- **Line:** secondary actions; navy outline that fills navy on hover.
- **Hover / Focus:** colour shifts over 0.25s; the trailing arrow moves 3px; focus shows a 2px brass outline offset 3px.

### Inputs / Fields
- **Style:** 1px cool grey border, white ground, square, 3rem tall.
- **Focus:** navy border plus a soft brass halo (3px).
- **Error:** Signal Red border and a short message under the field.

### Navigation
- **Desktop:** Public Sans 0.9375rem in Slate Ink; hover darkens to navy and draws a brass underline from the left.
- **Mobile:** a full-width panel revealed by a clip from the top, links in navy separated by hairlines.
- **Language selector:** a square outlined button with globe icon and language code; opens a list of endonyms with codes, the active one in navy with a Brass Ink code.

### Company Particulars (signature)
A ruled definition list on navy under a brass top border: label in Navy Mist, value in white with tabular numerals. Unknown values show the translated "To be added" in italic with a dashed underline. On load the rows settle upward in sequence while the hero rule draws in.

## Do's and Don'ts

### Do:
- **Do** set structured facts as ruled definition lists.
- **Do** keep brass to rules, small marks and the one primary button on navy.
- **Do** show missing company data as the marked placeholder until real values exist.
- **Do** keep every string in all seven languages; switching language crossfades the copy in place.

### Don't:
- **Don't** use AI-generated or illustrative imagery (developer's standing constraint).
- **Don't** round corners.
- **Don't** put a text label above a heading.
- **Don't** wrap content in cards or icon tiles.
