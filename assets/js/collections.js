/* Maison Aurelle — this season's story collections and "Mix the stories" looks (hand-edited; not generated).
   OWNER:
   - MA.COLLECTIONS: one entry per story. `story` is the lookbook text (two paragraphs, verbatim). `line` is the one-line
     description shown under the name. `banner` is the id of the product whose photo is the collection banner
     (null = typographic banner: the collection name in script with a tile ornament, until the studio photos arrive).
     `legacy` is the old category slug; old links such as shop.html?category=<legacy> redirect to this collection.
     `title` is the search-result title for the collection page (keep it under 43 characters; " | Maison Aurelle" follows).
   - Products join a collection through their own `collection` field in products.js; lineup pieces carry
     `lineup: true` and `lineupOrder` (their position in the lookbook).
   - MA.LOOKS: the three "Mix the stories" looks. `pieces` are product ids, shown in this order. "Add the look to bag"
     adds each piece once and skips pieces marked priceOnRequest.
   The season name itself ("The Gilded Hour · Collection 2026") lives in config.js (MA.config.season). */
window.MA = window.MA || {};

MA.COLLECTIONS = [
  {
    slug: "molten-tide", title: "The Molten Tide: Sculptural Gold Cuffs", name: "The Molten Tide", line: "Sculptural cuffs",
    lineupTitle: "The Tide Lineup", legacy: "molten-cuffs", banner: "s16",
    story: [
      "In a fishing town on a far coast, a goldsmith's daughter walked the beach at low tide with the scraps from her father's bench. She poured the warm gold into the wet sand and let the sea shape it. By morning the tide had left behind cuffs no hand could have planned: rippled, bent and smooth as water.",
      "The Molten Tide is for the woman who wears one bold piece and lets it speak. No two curves are quite alike."
    ]
  },
  {
    slug: "midnight-at-the-grand", title: "Midnight at the Grand: Chunky Gold Bangles", name: "Midnight at the Grand", line: "Chunky gold bangles",
    lineupTitle: "The Ballroom Lineup", legacy: "dome-bangles", banner: "b1",
    story: [
      "The Grand Hotel's ballroom closed its doors in 1986, but the story says the last party never ended. Every midnight the chandeliers come back on, and the guests arrive wrists stacked to the elbow in thick, mirror-bright gold.",
      "Midnight at the Grand is '80s glamour made for now: polished domes, wide cuffs and bangles that clink when you lift a glass. Wear three. Wear six."
    ]
  },
  {
    slug: "hammered-moon", title: "The Hammered Moon: Statement Earrings", name: "The Hammered Moon", line: "Statement earrings and hoops",
    lineupTitle: "The Moonlight Lineup", legacy: "statement-earrings", banner: "m18",
    story: [
      "Old sailors said the moon was once smooth as a coin, until a lovesick smith climbed up and hammered it to catch more light for the girl he left on shore. Every dent made it shine brighter.",
      "The Hammered Moon gathers crinkled studs, molten shapes and chunky hoops that catch the light from every angle. They are the easiest way to wear the whole story: one pair, and the look is done."
    ]
  },
  {
    slug: "lost-treasury", title: "The Lost Treasury: Layered Coin Necklaces", name: "The Lost Treasury", line: "Layered coin necklaces",
    lineupTitle: "The Treasury Lineup", legacy: "coin-necklaces", banner: "m21",
    story: [
      "A queen's ship sank with her whole treasury, and for three hundred years the coins slept on the ocean floor. Divers who find one keep it, but the legend says a coin only brings luck when it is worn close to the heart and layered with another.",
      "The Lost Treasury layers medallions, portrait coins and toggle chains. Each necklace looks like it was handed down, not bought."
    ]
  },
  {
    slug: "frangipani-garden", title: "Frangipani Garden: Gold Flower Jewelry", name: "Letters from the Frangipani Garden", line: "Flower pendants and earrings",
    lineupTitle: "The Garden Lineup", legacy: "flower-sets", banner: null,
    story: [
      "On an island where the frangipani bloom all year, a grandmother pressed one flower into every letter she sent her granddaughter overseas. When the granddaughter finally came home, the garden was gone, so she had the flowers cast in gold to keep them forever.",
      "Letters from the Frangipani Garden is soft, sunlit and sentimental. A flower pendant and matching studs make a gift that feels personal."
    ]
  },
  {
    slug: "wanderers-cabinet", title: "The Wanderer's Cabinet: Gemstone Rings", name: "The Wanderer's Cabinet", line: "Gemstone and signet rings",
    lineupTitle: "The Cabinet Lineup", legacy: "rings", banner: null,
    story: [
      "A traveler who never stayed anywhere long kept one small wooden cabinet. In each drawer was a ring set with a stone from a place she had loved: tiger eye from the desert, malachite from the mountains, garnet from a market at dusk. She wore a different one each day, depending on where her mind wanted to go.",
      "The Wanderer's Cabinet mixes earthy stones with bold signets and sculpted gold bands. Rings stack across the hand — wear one, or three."
    ]
  }
];

MA.LOOKS = [
  { slug: "sunset-on-the-shore", name: "Sunset on the Shore", mood: "Beach dinner, bare shoulders, one bold wrist",
    recipe: "One Molten Tide cuff, Hammered Moon studs, a Lost Treasury coin necklace",
    pieces: ["s16", "m17", "m21"] },
  { slug: "the-last-dance", name: "The Last Dance", mood: "Night out, '80s glamour",
    recipe: "Three to five Midnight at the Grand bangles, chunky Hammered Moon hoops, two Wanderer's Cabinet rings",
    pieces: ["b1", "s21", "lb2", "m18", "s101", "s107"] },
  { slug: "sunday-letters", name: "Sunday Letters", mood: "Brunch, gifting, everyday soft gold",
    recipe: "A Frangipani pendant with matching studs, one stone ring",
    pieces: ["s81", "m61"] }
];

/* Styling FAQ (lookbook, verbatim) is static HTML in styling.html. Opening line used by the home hero: */
MA.SEASON_OPENING = "Golden light, bare shoulders and warm skin: this is the hour gold was made for.";

