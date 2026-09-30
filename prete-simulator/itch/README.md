# For the itch.io page

Everything here is generated out of the game itself, by
[`gifart.js`](gifart.js) and [`keyart.js`](keyart.js). Nothing was drawn by
hand, and no picture can go stale: change the game and re-run them.

**The cover and the banner are the village at sunrise on a merit day**, and
both of them move. Four monks are walking the lane barefoot, the village is
kneeling along it with rice, the sun is just coming up behind the spirit
house, the kitchens are going, and Boonmee the elephant is walking down the
road from the banana grove with Lung Kham on her neck. The ghost is standing
in the middle of all of it, and nobody can see him. They are rendered with
the light pass on — the lamps, the sun and its rays, the smoke — and blown up
by whole numbers so every pixel stays square. The last half second of each
loop dissolves into the first, so they go round without a jump.

| file | what it is | where it goes on itch |
|---|---|---|
| `prete-simulator-html5.zip` | the whole game, one `index.html` at the root of the zip | **Uploads** → tick *This file will be played in the browser* |
| `cover-630x500.gif` | 630×500 animated cover, 4 s loop | **Cover image** (itch shows it at 315×250; a GIF cover plays on hover) |
| `banner-1920x620.gif` | 1920×620 animated banner, 4 s loop | **Theme** → *Banner image* |
| `cover-630x500.png`, `banner-1920x620.png` | a still of each | anywhere that will not take a GIF |
| `title-1440x810.png` | the paddy, the buffalo and the som tam, at 3× | **Screenshots** |

More screenshots for the page are in [`../screenshots`](../screenshots).

## The upload settings that matter

- **Kind of project:** HTML
- **Embed:** manually set size, **960 × 540**. The canvas is 480×270 and
  scales by whole numbers, so 960×540 and 1440×810 are both exact; anything
  in between letterboxes. Tick *Fullscreen button* and *Mobile friendly*
  (it has a joystick and tap-to-walk, and it asks to be turned sideways).
- **Frame options:** leave *Automatically start on page load* off — the game
  wants a tap before it can make a sound anyway.

## Rebuilding it

```
node itch/gifart.js       # the cover and the banner, moving and still
node itch/keyart.js       # the page screenshot
cd prete-simulator && zip -9 itch/prete-simulator-html5.zip index.html
```

`gifart.js` needs `gifenc` as well as `playwright-core`, and a chromium that
can do WebGL in software; the flags it launches with are the ones that work
headless.

The game is one self-contained HTML file with no assets, no fonts and no
network calls, so the zip is the file.
