// Default code shown when creating a new project
export const initialCode = `// Welcome to Whiskers Playground! 🐱
// Click the green flag to see this code in action

when green flag clicked
    say "Hello! I'm going to dance!"
    wait 1 seconds
    
    // Do a fun dance pattern
    repeat 4
        move 50 steps
        turn right 90 degrees
        wait 0.3 seconds
    
    say "Now watch me spin!"
    wait 1 seconds
    
    // Spin around
    repeat 12
        turn right 30 degrees
        wait 0.1 seconds
    
    say "Try editing this code!"
    wait 2 seconds
    say ""

// You can also use keyboard controls!
when space key pressed
    say "You pressed space!" for 1 seconds

when up arrow key pressed
    move 20 steps

when down arrow key pressed
    move -20 steps

when left arrow key pressed
    turn left 15 degrees

when right arrow key pressed
    turn right 15 degrees
`;
