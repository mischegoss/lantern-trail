/* ==========================================================
   words.js — the word banks, and how a word is picked.

   HOW TO EDIT
   - Each line is one word. The first word is the one she spells.
   - Words after it use the SAME letters in a different order
     (OWL LOW). They only appear as wrong choices in the
     "same letters" levels. Leave them off if there are none.
   - Words can be 3 to 6 letters. Use concrete, familiar words.
   - Add a new bank (for example family names or places) by
     adding a new list. Every bank is used.
   ========================================================== */

import { pickOne } from './utils.js';

export const WORD_BANKS = {
  animals: [
    'OWL LOW', 'CAT ACT', 'RAT ART TAR', 'BAT TAB', 'ANT TAN', 'APE PEA',
    'HEN', 'PIG', 'FOX', 'COW', 'DOG', 'BEE',
    'BEAR BARE', 'WOLF FLOW', 'LION LOIN', 'DEER REED', 'SEAL SALE',
    'GOAT TOGA', 'LAMB BALM', 'HARE HEAR',
    'DUCK', 'FISH', 'FROG', 'SWAN', 'CRAB',
    'BEARS SABER', 'HORSE SHORE',
    'ROBIN', 'TIGER', 'SHEEP', 'ZEBRA', 'CAMEL',
    'TURTLE', 'KITTEN', 'RABBIT', 'DONKEY', 'PARROT'
  ],

  food: [
    'TEA EAT ATE', 'YAM MAY',
    'JAM', 'PIE', 'EGG', 'NUT', 'HAM', 'BUN',
    'PEAR REAP PARE', 'LIME MILE', 'MEAT TEAM MATE', 'PLUM LUMP', 'SALT LAST',
    'SOUP', 'CAKE', 'RICE', 'CORN', 'MILK',
    'LEMON MELON', 'PEACH CHEAP', 'BREAD BEARD', 'GRAPE PAGER', 'DAIRY DIARY',
    'PEARS SPEAR SPARE',
    'APPLE', 'HONEY', 'BERRY', 'BACON',
    'RECIPE PIERCE',
    'BUTTER', 'COOKIE', 'ORANGE', 'CARROT'
  ],

  home: [
    'POT TOP', 'PAN NAP', 'TUB BUT',
    'CUP', 'MAP', 'BED', 'MOP', 'KEY', 'FAN', 'BOX',
    'LAMP PALM', 'STOP POTS SPOT TOPS', 'DOOR ODOR', 'ROPE PORE', 'VASE SAVE',
    'BOWL BLOW', 'COAT TACO',
    'BELL', 'SOAP', 'SOFA', 'DISH', 'FORK',
    'TABLE BLEAT', 'SPOON SNOOP', 'SHEET THESE', 'BRUSH SHRUB', 'PLATE PETAL',
    'CHAIR', 'CLOCK', 'QUILT', 'TOWEL',
    'DRAWER REWARD', 'STABLE TABLES', 'PASTEL STAPLE PLATES',
    'CANDLE', 'BASKET', 'PENCIL', 'WINDOW'
  ],

  nature: [
    'ARM RAM', 'TEN NET',
    'SUN', 'SKY', 'SEA', 'ICE', 'MUD',
    'STAR RATS ARTS', 'ROSE SORE', 'LEAF FLEA', 'SNOW OWNS', 'LAKE LEAK',
    'DAWN WAND', 'TIDE EDIT DIET',
    'MOON', 'RAIN', 'TREE', 'POND', 'HILL', 'WAVE',
    'HEART EARTH', 'STONE NOTES', 'OCEAN CANOE', 'NIGHT THING', 'TRAIL TRIAL', 'SHOUT SOUTH',
    'DAISY', 'RIVER', 'CLOUD', 'TULIP', 'SHELL', 'BEACH',
    'GARDEN DANGER', 'FOREST FOSTER SOFTER', 'OCEANS CANOES', 'STREAM MASTER',
    'FLOWER'
  ],

  everyday: [
    'NOW OWN WON', 'BUS SUB',
    'NOTE TONE', 'READ DEAR DARE', 'SHOE HOSE', 'RING GRIN',
    'BOAT', 'KITE', 'GIFT', 'BOOK', 'CARD', 'BIKE',
    'ANGEL ANGLE', 'PLANE PANEL', 'STEAL SLATE LEAST', 'SMILE SLIME', 'TEARS STARE',
    'CRATE TRACE REACT', 'SCARE RACES', 'DREAM ARMED', 'SWORD WORDS', 'SHARE HEARS',
    'ELBOW BELOW',
    'TRAIN', 'PIANO', 'MUSIC',
    'LISTEN SILENT TINSEL', 'CINEMA ICEMAN', 'NECTAR CANTER', 'SISTER RESIST',
    'DUSTER RUSTED', 'ARTIST STRAIT', 'RESCUE SECURE', 'STRIPE PRIEST SPRITE',
    'DIRECT CREDIT', 'SALTED LASTED',
    'PUZZLE'
  ]
};

/* ---------- Everything below is derived from the banks ---------- */

// One entry per line: { bank, words: ['OWL', 'LOW'] }
export const GROUPS = Object.entries(WORD_BANKS).flatMap(([bank, lines]) =>
  lines.map(line => ({ bank, words: line.trim().toUpperCase().split(/\s+/) }))
);

export const ALL_WORDS = [...new Set(GROUPS.flatMap(g => g.words))];

// The word plus any words that use the same letters
export function familyOf(word) {
  const group = GROUPS.find(g => g.words.includes(word));
  return group ? group.words : [word];
}

/**
 * Pick the next word to spell.
 * - Skips words she has already seen, so each playthrough feels new.
 *   When every word of that size has been seen, that size starts over.
 * - Tries not to use the same bank twice in a row.
 * - Saves words with same-letter partners for the levels that need them.
 * Returns the word and the updated "seen" list.
 */
export function pickTarget({ length, needsSameLetters, seen, avoidBank }) {
  const fits = g => g.words[0].length === length && (!needsSameLetters || g.words.length > 1);
  const bucket = GROUPS.filter(fits);

  let fresh = bucket.filter(g => !seen.includes(g.words[0]));
  let nextSeen = seen;
  if (!fresh.length) {
    const bucketWords = new Set(bucket.map(g => g.words[0]));
    nextSeen = seen.filter(w => !bucketWords.has(w));
    fresh = bucket;
  }

  if (!needsSameLetters && length >= 4) {
    const singles = fresh.filter(g => g.words.length === 1);
    if (singles.length) fresh = singles;
  }

  const varied = fresh.filter(g => g.bank !== avoidBank);
  const group = pickOne(varied.length ? varied : fresh);

  return { word: group.words[0], bank: group.bank, seen: [...nextSeen, group.words[0]] };
}
