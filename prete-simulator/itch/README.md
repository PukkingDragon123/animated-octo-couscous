# For the itch.io page

Everything here is generated out of the game itself by
[`keyart.js`](keyart.js). The cover and the banner are **the game running with
`GS.plate` set** — a flag that takes the purse, the clock, the prompts and the
thumb controls off and leaves the village standing there — photographed at
twenty past eight at night on the village road, with the lettering set over the
top at the size each picture wants. Nothing was drawn by hand, and neither
picture can go stale: change the game and re-run it.

| file | what it is | where it goes on itch |
|---|---|---|
| `prete-simulator-html5.zip` | the whole game, one `index.html` at the root of the zip | **Uploads** → tick *This file will be played in the browser* |
| `cover-630x500.png` | 630×500 cover | **Cover image** (itch shows it at 315×250) |
| `banner-1920x620.png` | 1920×620 page banner | **Theme** → *Banner image* |
| `title-1440x810.png` | the title screen at 3× | **Screenshots** |

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
node keyart.js            # cover, banner and the title shot
cd prete-simulator && zip -9 itch/prete-simulator-html5.zip index.html
```

The game is one self-contained HTML file with no assets, no fonts and no
network calls, so the zip is the file.
