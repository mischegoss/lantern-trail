# Lantern Trail

A gentle memory game for an older adult in the early stages of memory loss.
Lanterns spell a word. The lanterns light up in a pattern, and she taps the
pattern back. Each letter disappears when its lantern is tapped. Once the
letters are gone, the pattern plays again over the empty lanterns and she taps
it once more. Then she picks the word they spelled.

Lanterns are small and still while she watches, and swing forward with a
two-note chime when it's her turn to tap.

The game has no instructions and no way to fail:

- **Errorless tapping.** If she pauses, the next lantern glows. If she taps the
  wrong one, it sways gently and the right one glows. There's no restart and no
  timer.
- **Hints while choosing.** After a pause, the first letter comes back faintly.
  After a longer pause, the whole word flickers back for a moment.
- **Short patterns.** Each lantern lights once. Truly mixed orders never go above
  5 lanterns, which keeps them close to the 3–4 item span typical of early memory
  loss. Longer words light nearly in order (one or two neighbor swaps).
- **10 visible levels that only get harder.** Each level is 5 words. Tapping and
  the wrong word choices stay the same or get harder from level to level, never
  easier. The first word of each level is a warm-up. She moves up when 3 of the
  5 words needed no hints. Otherwise she replays the level with new words.
- **One sound per moment.** A soft whoosh when the word arrives, each lantern's
  own note for the pattern, a two-note chime for "your turn," and a soft puff
  when the blanks appear. Only the pattern uses lantern notes.
- **Play again.** After level 10 the lanterns spell HOORAY and a Play again
  button appears. The next playthrough uses new words and a new sky color.

Progress is saved in the browser on her device. It is not shared between devices.

## Files

```
index.html          page shell: links the CSS, loads js/main.js
favicon.svg
css/
  base.css          colors, font, sky themes, layout, level bar
  lanterns.css      lanterns and letters
  choices.css       word buttons and Play again
  effects.css       animations, flying letters, reduced motion
js/
  main.js           starts the game
  config.js         the 10 levels and all timings  ← tune here
  words.js          word banks                     ← add words here
  state.js          progress and saving
  game.js           the flow of a round, levels, finale
  pattern.js        light patterns
  choices.js        wrong-word options and word buttons
  hints.js          glow cues and word hints
  lanterns.js       creating and updating lanterns
  levelbar.js       the 10 level lanterns and the 5 round dots
  audio.js          chimes (no sound files)
  sky.js            stars and fireworks
  utils.js          small helpers
```

## Common changes

| To change | Edit |
|---|---|
| Add or remove words, or add a bank (family names, places) | `js/words.js` |
| Level settings, words per level, the bar for moving up | `js/config.js` → `LEVELS`, `ROUNDS_PER_LEVEL`, `CLEAN_ROUNDS_TO_PASS` |
| Speed of the lights, pauses | `js/config.js` → `TIMING` |
| How soon the hint glow appears | `js/config.js` → `TAP_CUE`, `WORD_HINTS` |
| Turn off the second pattern after the letters clear | `js/config.js` → `REPLAY_AFTER_CLEAR = false` |
| Hide the reset button before giving it to her | `js/config.js` → `SHOW_RESET_BUTTON = false` |
| Colors and sky themes | `css/base.css` |

In `words.js`, each line is one word. Words that use the same letters go on the
same line (`'BEARS SABER'`). The first word is the one she spells, and the others
only appear as wrong choices in the "same letters" levels.

## Run it on your computer

The game uses JavaScript modules, so opening `index.html` by double-clicking
won't work. Start a small local server in this folder instead:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

Add `?debug` to the address (http://localhost:8000/?debug) to inspect the game
state in the browser console as `lanternTrail.state`.

## Publish on GitHub Pages

1. Push this folder to a GitHub repository, with `index.html` at the top level.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, then pick
   `main` and `/ (root)`.
4. After a minute, the game is live at `https://<your-username>.github.io/<repo-name>/`.

On her phone or tablet, open that address and use **Add to Home Screen** so the
game opens like an app.

## Notes

- Sound starts after the first tap. Browsers block sound until then.
- The game follows common dementia-care practices: errorless learning, cues that
  arrive on their own, a slow pace, and difficulty that rises slowly and eases
  quickly. It is a game, not a clinical tool, and it hasn't been clinically tested.
