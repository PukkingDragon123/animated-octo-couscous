# The Thai face that did not ship

`glyphs.py` is a hand-drawn Thai bitmap font: all 56 glyphs Prete Simulator
actually uses, as ASCII art, on a 6x8 base cell with upper vowels, tone marks
and lower vowels as separate 4x2 and 3x2 tables so they can be stacked the way
Thai stacks them.

It is here because it does not work, and the reason is worth keeping.

Thai consonants are told apart almost entirely by where a small loop — the
หัว — sits on the stem, and how many humps follow it. At six pixels wide that
loop is two pixels across, which is a blob rather than a loop, and about half
the consonants collapse into the same shape: ก ข ค ฆ became one glyph, and so
did จ ช ซ. The stacking engine was fine. The letterforms were not.

The game rasterises the reader's own Thai face instead and downsamples it to
one bit by coverage, which is crisp and correct at the size the layouts allow.

If you want to finish this: go to an 8x11 base cell, draw the loop as a real
3x3 circle, and give the game's panels the extra four pixels of line height.
