# My Studio — Design Direction

## Reference Ground-Truth

The homepage will be an original, responsive fashion-rental experience informed by the browsing hierarchy of Rent the Runway: a utility-aware header, category-led discovery, an occasion selector, editorial value storytelling, and a simple rental journey. It will not copy Rent the Runway’s assets, brand identity, layouts, copy, or interface details. The user-supplied My Studio wardrobe image establishes the founding visual cue: a theatrical dark-brown velvet environment, gold clothing rail, and jewel-tone occasionwear.

## Chosen Approach: Velvet Wardrobe Editorial

### Design Movement

**Modern fashion editorial with a stage-set sensibility.** The site treats wardrobe rental as an invitation into a private dressing room instead of an ordinary catalogue.

### Core Principles

1. Use theatrical **dark-to-light transitions**: velvet-brown entry moments followed by gallery-like ivory shopping surfaces.
2. Pair **quiet luxury typography** with generous negative space, using a refined serif only for editorial statements and a crisp sans-serif for utility.
3. Make browsing feel **curated by occasion**, allowing each event to act as a doorway into the collection.
4. Use structured, rectangular frames, gilt hairlines, and cropped imagery rather than generic pill-heavy cards.

### Color Philosophy

The signature color is **Burgundy Velvet (#7B1633)**: warm, theatrical, and confident without feeling overly romantic. It is grounded by Cocoa Ink (#23150F), softened by Gallery Ivory (#F7F3EC), and lifted by brushed-gold accents (#B9954B). The dark palette makes the wardrobe feel private and premium; ivory space lets fashion imagery breathe.

### Layout Paradigm

The page follows an **editorial procession** rather than a centered SaaS landing-page grid: a framed hero entrance, a staggered occasion ribbon, a split manifesto, an offset collection rail, and a dark rental ritual section. Large type and thin rules guide the eye through intentional shifts in scale.

### Signature Elements

1. Fine **gilt border lines** and glass-like illuminated frames that echo the clothing rail in the supplied image.
2. A **stage curtain** texture and deep-brown panels for brand moments and footer space.
3. Offset, vertical **occasion tabs** and micro-labels in uppercase letterspacing for editorial pacing.

### Interaction Philosophy

Interactions should feel tactile and composed: image cards gently rise, framed buttons fill from left to right, and category selection changes the highlighted occasion without abrupt motion. Any placeholder shopping control clearly acknowledges that it is a frontend preview through a concise toast.

### Animation

Use a single 650ms editorial reveal for key hero elements on first visit, with subsequent UI transitions under 220ms using `cubic-bezier(0.23, 1, 0.32, 1)`. Product cards lift 4px on hover; image crops scale slightly inside their frame. Respect `prefers-reduced-motion`, avoiding scroll-bound animation and any automatic carousels.

### Typography System

**Cormorant Garamond** is reserved for the headline, manifesto, and key numbers—high contrast, measured, and elegant. **DM Sans** serves all utility navigation, metadata, form labels, and CTAs. Headline tracking remains tight; utility labels are uppercase with open letterspacing.

### Brand Essence

**My Studio is a curated wardrobe library for people who want the right piece for every invitation, without the permanence of ownership.**

Personality: **assured, cinematic, considered**.

### Brand Voice

The voice is intimate, poised, and specific. Headlines should suggest a scene or an invitation; calls to action should promise a next move instead of generic encouragement.

> “A better outfit changes the whole evening.”

> “Open your wardrobe to what’s next.”

### Wordmark & Logo

The My Studio mark is a fine-line, symmetrical **wardrobe portal**: a gold arched doorway with a central hanger form, suggesting both a dressing room and access to a shared closet. It is intentionally symbol-first, with the wordmark set separately in Cormorant Garamond italic.

### Signature Brand Color

**Burgundy Velvet — #7B1633**

## Homepage Revision — Collection Rail

The homepage will be reworked as an **original MK Studio collection rail** informed by the supplied Endless reference's ecommerce rhythm: a compact service strip, minimal editorial navigation, one decisive hero, image-led discovery doors, a shoppable mock product shelf, and a sequence of campaign-style feature panels. It will not reproduce Endless branding, copy, artwork, or page layouts.

The MK Studio interpretation keeps the existing warm-champagne, espresso, muted-coral, and gilt visual language. The hero will foreground the shared wardrobe as the collection's opening scene; the discovery doors will lead with **The Wedding Edit**, **After Dark**, and **Studio Days**; four local mock pieces will appear as the current edit; and two asymmetrical panels will connect the rental ritual to the studio's point of view. All controls will link to the existing catalogue or product-detail routes without changing any non-home page or adding live commerce.
