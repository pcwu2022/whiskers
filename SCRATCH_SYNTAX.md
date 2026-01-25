# Scratch Text Syntax Reference

A text-based syntax for Scratch 3.0, designed to be **easy to type** and **easy to read**.

---

## Quick Start

```scratch
// Declare variables and lists at the top
var score = 0
var playerName = "Hero"
list inventory = []

// Main game logic
when green flag clicked
    set score to 0
    say "Welcome to the game!" for 2 seconds
    forever
        if key space pressed then
            change score by 1
        end
        if score > 10 then
            say "You win!"
            stop all
        end
    end
end
```

---

## Syntax Rules

### 1. Variables

Declare variables with `var`:
```scratch
var score = 0
var message = "Hello"
```

Use variables by name (no brackets):
```scratch
set score to 10
change score by 1
say message
```

### 2. Lists

Declare lists with `list`:
```scratch
list highScores = []
```

Manipulate lists:
```scratch
add 100 to highScores
add score to highScores
delete 1 of highScores
delete all of highScores
insert 50 at 1 of highScores
replace item 1 of highScores with 999
```

Access list data:
```scratch
item 1 of highScores
length of highScores
highScores contains 100
```

### 3. Strings

Use double quotes for string literals:
```scratch
say "Hello, world!"
switch costume to "costume1"
broadcast "gameStart"
```

### 4. Numbers

Write numbers directly (no quotes, no brackets):
```scratch
wait 2 seconds
move 10 steps
set x to 100
```

### 5. Parentheses (Math Only)

Parentheses are **only** for grouping in math expressions:
```scratch
set score to (a + b) * 2
set result to (x + y) / (a - b)
```

**⚠️ Empty parentheses `()` will cause a syntax error.**

### 6. Comments

Use `//` for comments:
```scratch
// This is a comment
move 10 steps  // Move forward
```

---

## Reserved Keywords

The following words are **reserved** and cannot be used as variable names:

### Effect Names
`color`, `fisheye`, `whirl`, `pixelate`, `mosaic`, `brightness`, `ghost`

### Special Targets
`mouse-pointer`, `random position`, `edge`, `myself`

### Control Keywords
`if`, `then`, `else`, `end`, `repeat`, `forever`, `until`, `wait`, `stop`, `all`, `this`, `script`, `other`, `scripts`, `clone`, `when`, `and`, `or`, `not`

### Block Keywords
`var`, `list`, `set`, `change`, `to`, `by`, `of`, `at`, `with`, `for`, `seconds`, `steps`, `degrees`

---

## Block Reference

### 🟡 Events

| Block | Syntax |
|-------|--------|
| Green flag | `when green flag clicked` |
| Key press | `when "space" key pressed` |
| Sprite click | `when this sprite clicked` |
| Backdrop switch | `when backdrop switches to "backdrop1"` |
| Threshold | `when timer > 10` |
| Receive message | `when I receive "message"` |
| Broadcast | `broadcast "message"` |
| Broadcast and wait | `broadcast "message" and wait` |

**Example:**
```scratch
when green flag clicked
    broadcast "startGame"
end

when I receive "startGame"
    say "Game started!"
end
```

---

### 🟠 Control

| Block | Syntax |
|-------|--------|
| Wait | `wait 1 seconds` |
| Repeat | `repeat 10 ... end` |
| Forever | `forever ... end` |
| If-then | `if condition then ... end` |
| If-else | `if condition then ... else ... end` |
| Wait until | `wait until condition` |
| Repeat until | `repeat until condition ... end` |
| Stop | `stop all` / `stop this script` / `stop other scripts in sprite` |
| Clone start | `when I start as a clone` |
| Create clone | `create clone of myself` / `create clone of "Sprite1"` |
| Delete clone | `delete this clone` |

**Example:**
```scratch
when green flag clicked
    repeat 5
        say "Hello!"
        wait 1 seconds
    end
    
    if score > 10 then
        say "Great job!"
    else
        say "Keep trying!"
    end
end
```

---

### 🔵 Motion (Sprites Only)

| Block | Syntax |
|-------|--------|
| Move | `move 10 steps` |
| Turn right | `turn right 15 degrees` |
| Turn left | `turn left 15 degrees` |
| Go to position | `go to x: 0 y: 0` |
| Go to target | `go to mouse-pointer` / `go to random position` / `go to "Sprite1"` |
| Glide to position | `glide 1 secs to x: 0 y: 0` |
| Glide to target | `glide 1 secs to mouse-pointer` |
| Point direction | `point in direction 90` |
| Point towards | `point towards mouse-pointer` / `point towards "Sprite1"` |
| Change X | `change x by 10` |
| Set X | `set x to 0` |
| Change Y | `change y by 10` |
| Set Y | `set y to 0` |
| Bounce | `if on edge, bounce` |
| Rotation style | `set rotation style left-right` |

**Reporters:** `x position`, `y position`, `direction`

**Example:**
```scratch
when green flag clicked
    go to x: 0 y: 0
    point in direction 90
    forever
        move 5 steps
        if on edge, bounce
    end
end
```

---

### 🟣 Looks

| Block | Syntax |
|-------|--------|
| Say timed | `say "Hello!" for 2 seconds` |
| Say | `say "Hello!"` |
| Think timed | `think "Hmm..." for 2 seconds` |
| Think | `think "Hmm..."` |
| Switch costume | `switch costume to "costume1"` |
| Next costume | `next costume` |
| Switch backdrop | `switch backdrop to "backdrop1"` |
| Next backdrop | `next backdrop` |
| Change effect | `change color effect by 25` |
| Set effect | `set ghost effect to 50` |
| Clear effects | `clear graphic effects` |
| Change size | `change size by 10` |
| Set size | `set size to 100` |
| Show | `show` |
| Hide | `hide` |
| Go to layer | `go to front layer` / `go to back layer` |
| Change layer | `go forward 1 layers` / `go backward 1 layers` |

**Reporters:** `costume number`, `costume name`, `backdrop number`, `backdrop name`, `size`

**Example:**
```scratch
when green flag clicked
    show
    set size to 100
    set ghost effect to 0
    say "I'm visible!" for 2 seconds
    repeat 10
        change ghost effect by 10
    end
    hide
end
```

---

### 🟢 Sound

| Block | Syntax |
|-------|--------|
| Play until done | `play sound "meow" until done` |
| Start sound | `start sound "meow"` |
| Stop sounds | `stop all sounds` |
| Change volume | `change volume by -10` |
| Set volume | `set volume to 100` |

**Reporter:** `volume`

---

### 🔵 Sensing

| Block | Syntax |
|-------|--------|
| Touching | `touching mouse-pointer` / `touching edge` / `touching "Sprite1"` |
| Touching color | `touching color "#FF0000"` |
| Key pressed | `key space pressed` / `key "a" pressed` |
| Mouse down | `mouse down` |
| Mouse position | `mouse x` / `mouse y` |
| Ask | `ask "What's your name?" and wait` |
| Answer | `answer` |
| Distance | `distance to mouse-pointer` / `distance to "Sprite1"` |
| Timer | `timer` |
| Reset timer | `reset timer` |
| Drag mode | `set drag mode draggable` / `set drag mode not draggable` |

**Common key names:** `space`, `up arrow`, `down arrow`, `left arrow`, `right arrow`, `enter`, `any`

**Example:**
```scratch
when green flag clicked
    ask "What's your name?" and wait
    say join "Hello, " answer for 2 seconds
    
    forever
        if key up arrow pressed then
            change y by 10
        end
        if touching edge then
            say "Ouch!"
        end
    end
end
```

---

### 🟠 Operators

#### Arithmetic
```scratch
a + b
a - b
a * b
a / b
a mod b
pick random 1 to 10
```

#### Comparisons (return Boolean)
```scratch
a > b
a < b
a = b
```

#### Boolean Logic
```scratch
condition1 and condition2
condition1 or condition2
not condition
```

#### String Operations
```scratch
join "Hello" "World"
letter 1 of "Hello"
length of "Hello"
"Hello" contains "ell"
```

#### Math Functions
```scratch
abs of -5
floor of 3.7
ceiling of 3.2
sqrt of 16
round 3.5
sin of 90
cos of 0
```

**Example:**
```scratch
var health = 100
var damage = pick random 5 to 20
set health to health - damage

if health < 0 then
    set health to 0
end

if health = 0 and not invincible then
    say "Game Over!"
end
```

---

### 🟡 Variables

| Block | Syntax |
|-------|--------|
| Declare | `var myVar = 0` |
| Set | `set myVar to 10` |
| Change | `change myVar by 5` |
| Show | `show variable myVar` |
| Hide | `hide variable myVar` |

---

### 🟡 Lists

| Block | Syntax |
|-------|--------|
| Declare | `list myList = []` |
| Add | `add "item" to myList` |
| Delete | `delete 1 of myList` |
| Delete all | `delete all of myList` |
| Insert | `insert "item" at 1 of myList` |
| Replace | `replace item 1 of myList with "new"` |
| Item | `item 1 of myList` |
| Item index | `item # of "item" in myList` |
| Length | `length of myList` |
| Contains | `myList contains "item"` |
| Show | `show list myList` |
| Hide | `hide list myList` |

---

### 🔴 My Blocks (Custom Procedures)

Define custom blocks:
```scratch
define jump height
    repeat height
        change y by 10
        wait 0.1 seconds
    end
    repeat height
        change y by -10
        wait 0.1 seconds
    end
end

when green flag clicked
    call jump 5
end
```

---

## Complete Example

```scratch
// === VARIABLE DECLARATIONS ===
var score = 0
var lives = 3
var gameOver = 0
list highScores = []

// === MAIN GAME ===
when green flag clicked
    set score to 0
    set lives to 3
    set gameOver to 0
    broadcast "startGame"
end

when I receive "startGame"
    go to x: 0 y: -150
    show
    forever
        if gameOver = 1 then
            stop this script
        end
        
        if key left arrow pressed then
            change x by -10
        end
        if key right arrow pressed then
            change x by 10
        end
        
        if touching "Enemy" then
            change lives by -1
            if lives = 0 then
                set gameOver to 1
                broadcast "gameOver"
            end
        end
    end
end

when I receive "gameOver"
    add score to highScores
    say "Game Over!" for 2 seconds
    hide
end
```

---

## Error Messages

The compiler will show helpful error messages:

| Error | Example | Message |
|-------|---------|---------|
| Undeclared variable | `set foo to 5` | "Variable 'foo' is not declared. Add `var foo = 0` at the top." |
| Reserved keyword | `var ghost = 5` | "'ghost' is a reserved keyword (effect name) and cannot be used as a variable name." |
| Empty parentheses | `set x to ()` | "Empty parentheses are not allowed." |
| Missing value | `go to x: y: 0` | "Missing value after 'x:'." |
| Type error | `wait "hello" seconds` | "'wait' requires a number, but got a string." |
| Type mismatch | `50 and score > 10` | "Cannot use 'and' with a number. Expected a boolean condition." |
| Invalid brackets | `set [score] to 5` | "Square brackets are not allowed except for list initialization. Use: `set score to 5`" |

---

## Tips for Scratch Users

1. **No brackets around variable names** - Just write the name directly
2. **Quotes for text** - Use `"double quotes"` for strings
3. **Indentation matters for readability** - Indent code inside blocks
4. **End your blocks** - Every `if`, `repeat`, `forever`, `when`, and `define` needs an `end`
5. **Declare first** - Variables and lists must be declared before use
