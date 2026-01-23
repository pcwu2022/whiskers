Below is a **comprehensive list of Scratch 3.0 blocks**, **categorized exactly like the Scratch editor**.
I’ll use **canonical English block names** (the ones used internally / in the UI), with example syntax so it’s compiler-friendly.
> Scope note
>
> * This is **Scratch 3.0 (current standard)**
> * Includes **Stage + Sprite blocks**
> * Excludes **extensions** (Pen, Music, Video Sensing, etc.) unless you want them later
> * Covers **nearly all core blocks** used in projects

---

# 🟦 Event Blocks

Trigger execution.

* `when green flag clicked`

* `when [key] key pressed`

* `when this sprite clicked`

* `when backdrop switches to [backdrop]`

* `when [loudness/timer/video motion] > [value]`

* `when I receive [message]`

* `broadcast [message]`

* `broadcast [message] and wait`

---

# 🟧 Control Blocks

Flow control, loops, concurrency.

* `wait [seconds] seconds`

* `repeat [n]`

* `forever`

* `if <condition> then`

* `if <condition> then else`

* `wait until <condition>`

* `repeat until <condition>`

* `stop [all / this script / other scripts in sprite]`

* `when I start as a clone`

* `create clone of [myself / sprite]`

* `delete this clone`

---

# 🟦 Motion Blocks (Sprites only)

Position, movement, direction.

* `move [n] steps`

* `turn right [n] degrees`

* `turn left [n] degrees`

* `go to [mouse-pointer / random position / sprite]`

* `go to x: [x] y: [y]`

* `glide [seconds] secs to [mouse-pointer / sprite]`

* `glide [seconds] secs to x: [x] y: [y]`

* `point in direction [degrees]`

* `point towards [mouse-pointer / sprite]`

* `change x by [n]`

* `set x to [n]`

* `change y by [n]`

* `set y to [n]`

* `if on edge, bounce`

* `set rotation style [all around / left-right / don’t rotate]`

### Motion Reporters

* `x position`
* `y position`
* `direction`

---

# 🟪 Looks Blocks

Speech bubbles, costumes, visual effects.

* `say [text] for [seconds] seconds`

* `say [text]`

* `think [text] for [seconds] seconds`

* `think [text]`

* `switch costume to [costume]`

* `next costume`

* `switch backdrop to [backdrop]`

* `next backdrop`

* `change [effect] by [n]`

* `set [effect] to [n]`

* `clear graphic effects`

* `change size by [n]`

* `set size to [n]`

* `show`

* `hide`

* `go to [front/back] layer`

* `go [forward/backward] [n] layers`

### Looks Reporters

* `costume [number/name]`
* `backdrop [number/name]`
* `size`

---

# 🟩 Sound Blocks

Audio playback.

* `play sound [sound] until done`

* `start sound [sound]`

* `stop all sounds`

* `change volume by [n]`

* `set volume to [n]`

### Sound Reporters

* `volume`

---

# 🟦 Sensing Blocks

Input, collisions, environment state.

* `touching [sprite / edge / mouse-pointer]?`

* `touching color [color]?`

* `color [color] is touching [color]?`

* `distance to [sprite / mouse-pointer]`

* `ask [question] and wait`

* `answer`

* `key [key] pressed?`

* `mouse down?`

* `mouse x`

* `mouse y`

* `set drag mode [draggable / not draggable]`

* `loudness`

* `timer`

* `reset timer`

* `video [motion/direction] on [sprite]`

* `turn video [on/off/on-flipped]`

* `set video transparency to [n]`

* `username`

---

# 🟧 Operators Blocks

Math, logic, strings.

### Arithmetic

* `[a] + [b]`

* `[a] - [b]`

* `[a] * [b]`

* `[a] / [b]`

* `pick random [a] to [b]`

### Comparisons

* `[a] < [b]`
* `[a] = [b]`
* `[a] > [b]`

### Boolean Logic

* `<condition> and <condition>`
* `<condition> or <condition>`
* `not <condition>`

### String Operations

* `join [a] [b]`
* `letter [n] of [text]`
* `length of [text]`
* `[text] contains [text]?`

### Math Functions

* `[abs / floor / ceiling / sqrt / sin / cos / tan / asin / acos / atan / ln / log / e^ / 10^] of [n]`

* `round [n]`

* `[mod]`

---

# 🟨 Variables Blocks

State storage.

* `set [variable] to [value]`

* `change [variable] by [value]`

* `show variable [variable]`

* `hide variable [variable]`

### Variable Reporters

* `[variable]`

---

# 🟨 Lists Blocks

Array-like structures.

* `add [item] to [list]`

* `delete [index] of [list]`

* `delete all of [list]`

* `insert [item] at [index] of [list]`

* `replace item [index] of [list] with [item]`

* `item [index] of [list]`

* `item # of [item] in [list]`

* `length of [list]`

* `[list] contains [item]?`

* `show list [list]`

* `hide list [list]`

---

# 🟥 My Blocks (Custom Procedures)

User-defined functions.

* `define [block name (args…)]`
* `[custom block]`

With options:

* Arguments: number / text / boolean
* `run without screen refresh`

---

# 🟪 Stage-Only Blocks

Only available on the Stage.

* `when backdrop switches to [backdrop]`
* `switch backdrop to [backdrop]`
* `next backdrop`
* `backdrop [number/name]`