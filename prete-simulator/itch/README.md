# For the itch.io page

Everything here is generated out of the game itself by
[`keyart.js`](keyart.js). Nothing was drawn by hand, and neither picture can go
stale: change the game and re-run it.

**The cover is quiet.** No tagline, no English, no arrow, no reaction face, no
caption bar — just the village road at twenty to seven in the evening with the
lanterns lit and one thin ghost standing in it, and the game's name in Thai
across the empty half of the sky. It is drawn at one to one rather than blown
up: enlarged, the ground line ends up so near the bottom of the frame that the
only person in the picture is standing in the title.

**The banner is the temple at first light**, gold bell and chedi against the
hills, with the same name on the left over a gradient that gets out of the way
of everything you would want to look at.

| file | what it is | where it goes on itch |
|---|---|---|
| `prete-simulator-html5.zip` | the whole game, one `index.html` at the root of the zip | **Uploads** → tick *This file will be played in the browser* |
| `cover-630x500.png` | 630×500 cover | **Cover image** (itch shows it at 315×250) |
| `banner-1920x620.png` | 1920×620 page banner | **Theme** → *Banner image* |
| `title-1440x810.png` | the village road at dusk, at 3× | **Screenshots** |

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
