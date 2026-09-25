# -*- coding: utf-8 -*-
"""
A hand-drawn Thai face for Prete Simulator.

Base cell 6 wide x 8 tall, advance 7, baseline under the last row.
Upper vowels sit two rows above the base; a tone mark sits two rows above
THOSE when there is already an upper vowel, which is what Thai does.
Lower vowels hang two rows under the baseline.

Rows are written top to bottom, '#' is ink.
"""

# ---------- consonants and on-the-line vowels: 6x8 ----------
BASE = {
# ก ko kai — hook down at the left, over the top, right leg
'ก': """
......
.#####
##...#
#....#
.....#
.....#
.....#
.....#
""",
# ข kho khai — a loop at the top left, then over and down
'ข': """
.#....
##.###
#.#..#
.##..#
.....#
.....#
.....#
.....#
""",
# ค kho khwai — loop low on the left, notch in the top, right leg
'ค': """
......
.#.###
##...#
#.#..#
.##..#
.....#
.....#
.....#
""",
# ฆ kho ra-khang — ค with a second hump
'ฆ': """
......
.#.###
##..##
#.#.#.
.##.##
.....#
.....#
.....#
""",
# ง ngo ngu — loop at the top left, leg curling in at the foot
'ง': """
......
.#####
##...#
#....#
.....#
.....#
#....#
.####.
""",
# จ cho chan — over the top, down the right, hook back left at the foot
'จ': """
......
######
#....#
.....#
.....#
.....#
#....#
.####.
""",
# ช cho chang — จ with a flag on the shoulder
'ช': """
....#.
#####.
#....#
.....#
.....#
.....#
#....#
.####.
""",
# ซ so so — ช with the flag the other way
'ซ': """
.#....
.#####
#....#
.....#
.....#
.....#
#....#
.####.
""",
# ญ yo ying — two bowls and a tail below the line
'ญ': """
......
#.##.#
#.#..#
###..#
#.#..#
#.#..#
#.##.#
#..#..
""",
# ณ no nen — a bowl, a stem, and two feet
'ณ': """
......
##..##
#.#.#.
#.#.##
#.#..#
#.#..#
##...#
..#.#.
""",
# ด do dek — loop low left, right leg with a straight top
'ด': """
......
.#####
##...#
#....#
.#...#
.....#
.....#
.....#
""",
# ต to tao — ด with a notch cut in the top bar
'ต': """
......
.###.#
##..##
#....#
.#...#
.....#
.....#
.....#
""",
# ถ tho thung — loop low left, top hooking back to the left
'ถ': """
......
.####.
##...#
#....#
.#...#
.....#
.....#
.....#
""",
# ท tho thahan — two humps, right leg
'ท': """
......
##.###
#.#..#
#.#..#
#.#..#
#.#..#
##...#
.....#
""",
# ธ tho thong — ท with a bar across the middle
'ธ': """
......
######
#....#
#....#
#####.
#....#
#....#
.#####
""",
# น no nu — loop low left, hump, right leg
'น': """
......
.#.###
##...#
#....#
.#...#
.....#
.....#
.....#
""",
# บ bo baimai — loop low left, closed at the foot
'บ': """
......
.#...#
##...#
#....#
#....#
#....#
#....#
.#####
""",
# ป po pla — บ with a tall stroke on the right
'ป': """
.....#
.#...#
##...#
#....#
#....#
#....#
#....#
.#####
""",
# ผ pho phueng — two stems and a bowl between them
'ผ': """
......
#....#
#.##.#
#.##.#
#.##.#
#.##.#
#....#
.#####
""",
# ฝ fo fa — ผ with the tall stroke
'ฝ': """
.....#
#....#
#.##.#
#.##.#
#.##.#
#.##.#
#....#
.#####
""",
# พ pho phan — three stems
'พ': """
......
#.#..#
#.#..#
#.#..#
#.#..#
#.#..#
#.#..#
.#.###
""",
# ฟ fo fan — พ with the tall stroke
'ฟ': """
.....#
#.#..#
#.#..#
#.#..#
#.#..#
#.#..#
#.#..#
.#.###
""",
# ภ pho samphao — closed on the left, one hump
'ภ': """
......
#....#
#....#
####.#
#..#.#
#..#.#
#..#.#
.##..#
""",
# ม mo ma — loop low left, hump, right leg to the foot
'ม': """
......
.#...#
##...#
#....#
#.##.#
#.##.#
#....#
.#####
""",
# ย yo yak — loop low left, tall right, foot to the right
'ย': """
......
.#...#
##...#
#....#
#....#
#....#
#....#
.####.
""",
# ร ro ruea — one stem with a loop at the top
'ร': """
......
.####.
##...#
#....#
.....#
....#.
...#..
..#...
""",
# ล lo ling — loop low left, hook over the top
'ล': """
......
.####.
##...#
#....#
.....#
.....#
#....#
.####.
""",
# ว wo waen — open bowl, no loop
'ว': """
......
#####.
....##
.....#
.....#
.....#
#....#
.####.
""",
# ศ so sala — ส with the tall stroke
'ศ': """
.....#
.####.
##...#
#....#
.#...#
.....#
.....#
.....#
""",
# ษ so rue-si — tall stroke, bowl and a hump
'ษ': """
.....#
##.#.#
#.##.#
#....#
.##..#
...#.#
.....#
.....#
""",
# ส so suea — loop low left, hook up at the right
'ส': """
......
.####.
##...#
#....#
.#...#
.....#
.....#
.....#
""",
# ห ho hip — two stems, loop at the left
'ห': """
......
.#...#
##...#
#....#
#....#
#....#
#....#
#....#
""",
# อ o ang — one closed bowl
'อ': """
......
.####.
##...#
#....#
.....#
.....#
#....#
.####.
""",
# ---------- vowels that sit on the line ----------
# ะ sara a — two dots on the right of the line
'ะ': """
......
......
......
.##...
.##...
......
.##...
.##...
""",
# า sara aa — a single stem with a small head
'า': """
......
.####.
....##
.....#
.....#
.....#
.....#
.....#
""",
# ำ sara am — า with the nikhahit circle over it
'ำ': """
......
.####.
....##
.....#
.....#
.....#
.....#
.....#
""",
# เ sara e — a leading stem with the head at the top
'เ': """
......
.####.
##...#
#....#
#.....
#.....
#....#
.####.
""",
# แ sara ae — two of them
'แ': """
......
##.##.
#.##.#
....#.
....#.
....#.
#...#.
.##.##
""",
# โ sara o — เ with a tall flag
'โ': """
...#..
.###..
##.#..
#..#..
#..#..
#..#..
#..#..
.###..
""",
# ใ sara ai maimuan — เ with a curl on top
'ใ': """
..##..
.#..#.
.####.
##...#
#....#
#.....
#....#
.####.
""",
# ไ sara ai maimalai — เ with a straight flag
'ไ': """
...#..
.####.
##...#
#....#
#....#
#.....
#....#
.####.
""",
# ๆ maiyamok — the repeat mark
'ๆ': """
......
......
.####.
....##
.....#
....#.
...#..
..#...
""",
}

# ---------- upper vowels: 4 wide x 2 tall, over the base ----------
ABOVE = {
'ั': """
.##.
.##.
""",
'ิ': """
.##.
.#..
""",
'ี': """
.##.
##..
""",
'ึ': """
###.
#.#.
""",
'ื': """
####
#..#
""",
}
# ---------- tone marks and the like: 3 wide x 2 tall ----------
TONE = {
'่': """
.#.
##.
""",
'้': """
##.
#.#
""",
'๊': """
#.#
###
""",
'๋': """
###
#.#
""",
'็': """
###
#.#
""",
'์': """
.#.
#.#
""",
}
# ---------- lower vowels: 4 wide x 2 tall, under the baseline ----------
BELOW = {
'ุ': """
.##.
.#..
""",
'ู': """
.##.
##..
""",
}
