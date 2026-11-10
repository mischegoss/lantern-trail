/* ==========================================================
   config.js — the 10 levels and every timing in the game.
   Most tuning happens here.
   ========================================================== */

/*
  Each level sets three things:
  - len:     letters in the word (= number of lanterns)
  - order:   how the lights move (easiest to hardest; see js/pattern.js)
             'in'    = left to right, spelling the word
             'swap'  = nearly in order: one pair of neighbors swapped
             'swap2' = two pairs of neighbors swapped
             'mix'   = truly mixed
  - choices: how close the wrong words are
             'different' = clearly different words
             'lookalike' = same length, many shared letters
             'same'      = includes words with the same letters (BEARS / SABER)

  Nothing ever gets easier from one level to the next: the tapping
  stays as hard or gets harder, and so do the wrong choices.
  Patterns stay near the span typical of early memory loss (about
  3 to 4 items). Each lantern lights once. Truly mixed orders never
  go above 5 lanterns; longer words stay nearly in order.

  The first word of each level is a warm-up, one order-step easier.
*/
export const LEVELS = [
  { len: 3, order: 'in',    choices: 'different' }, // 1
  { len: 3, order: 'mix',   choices: 'different' }, // 2
  { len: 4, order: 'swap',  choices: 'different' }, // 3
  { len: 4, order: 'mix',   choices: 'different' }, // 4
  { len: 4, order: 'mix',   choices: 'lookalike' }, // 5
  { len: 5, order: 'swap',  choices: 'lookalike' }, // 6
  { len: 5, order: 'mix',   choices: 'lookalike' }, // 7
  { len: 5, order: 'mix',   choices: 'same' },      // 8
  { len: 6, order: 'swap',  choices: 'same' },      // 9
  { len: 6, order: 'swap2', choices: 'same' }       // 10
];

// Words per level, and how many must be finished with no hints to move up
export const ROUNDS_PER_LEVEL = 5;
export const CLEAN_ROUNDS_TO_PASS = 3;

// How many word buttons appear for each kind of choice
export const CHOICE_COUNT = { different: 3, lookalike: 4, same: 4 };

// Milliseconds
export const TIMING = {
  letterReveal: 320,        // between letters as the word appears
  readPause: 1300,          // time to read the word before the lights start
  readPauseFirstTime: 1800,
  lightOn: 1000,            // how long each lantern stays lit in the pattern
  lightGap: 450,            // dark pause between lights
  lightOnFirstTime: 1200,
  lightGapFirstTime: 600,
  repeatPause: 900,         // pause before a new pattern is shown a second time
  beforeReplay: 900,        // pause after the letters clear, before the pattern replays
  letterReturn: 480,        // between letters flying back after the right word (in pattern order)
  levelBarIntro: 1800,     // level bar shown alone before the first word of a visit
  afterRound: 2400,         // fireworks and level bar before the next word
  afterLevel: 2600          // celebration before the next level
};

// After the letters are cleared, the pattern plays once more over the
// empty lanterns and she taps it again before choosing the word.
// (Watching it again = a second look; tapping it again = practice
// recalling it, which builds memory more than watching alone.)
export const REPLAY_AFTER_CLEAR = true;

// Errorless tapping: if she pauses this long, the next lantern glows
export const TAP_CUE = {
  shortWait: 3500,          // levels 1 and 2
  longWait: 4500,           // levels 3 and up
  shortWaitThroughLevel: 2
};

// Hints while choosing the word (milliseconds of no tapping)
export const WORD_HINTS = {
  firstLetterAfter: 7000,   // first letter comes back faintly
  wholeWordAfter: 9000,     // then the whole word flickers back
  wholeWordShowFor: 1500
};

// The lanterns spell this after level 10
export const FINALE_WORD = 'HOORAY';

// Each "Play again" moves to the next sky (see css/base.css)
export const SKY_THEMES = ['night', 'dusk', 'aurora'];

// Small reset button in the corner, for testing. Set to false before giving it to her.
export const SHOW_RESET_BUTTON = true;

// Where progress is saved in the browser
export const STORAGE_KEY = 'lantern-trail:v1';
