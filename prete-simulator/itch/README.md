# For the itch.io page

Everything here is generated out of the game itself by
[`keyart.js`](keyart.js). Nothing was drawn by hand, and neither picture can go
stale: change the game and re-run it.

**The cover is the game's best afternoon.** He is standing in his own paddy
in a งอบ with a จอบ at his side, there is a plate of som tam on the dike at
his feet, and the buffalo is out in the rice with an egret on its back. No
tagline, no English, no arrow — just the name in Thai across the top of the
sky. Every single thing in that picture is something you actually do.

**The banner is the temple at first light**, gold bell and chedi against the
hills, with the same name on the left over a gradient that gets out of the way
of everything you would want to look at.

| file | what it is | where it goes on itch |
|---|---|---|
| `prete-simulator-html5.zip` | the whole game, one `index.html` at the root of the zip | **Uploads** → tick *This file will be played in the browser* |
| `cover-630x500.png` | 630×500 cover | **Cover image** (itch shows it at 315×250) |
| `banner-1920x620.png` | 1920×620 page banner | **Theme** → *Banner image* |
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
node keyart.js            # cover, banner and the page screenshot
cd prete-simulator && zip -9 itch/prete-simulator-html5.zip index.html
```

The game is one self-contained HTML file with no assets, no fonts and no
network calls, so the zip is the file.
