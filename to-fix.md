## New Features
- Add Buttons: Undo, Redo -> Kids might not know Ctrl+Z, Ctrl+Y etc.
- Let users select "start with an example" or "start with an empty program" -> If Start with an empty program, insert a when green flag clicked block in the front and the next line indented
- When the code is running, and the green flag is clicked, prompt the user to stop the program before running the next time.
- If the user didn't have any event blocks in the code, raise a warning and tell them the code will not be executed. If better, provide a sample.

## Features to Modify
- Green flag needs to be run twice -> Occurs when deployed but not when test running
- Indentation rules: Indent is needed -> If no indent between C-shaped blocks with a top line and an end block, in the error message, tell them to push the tab button to indent (to let the program know that this part of the code is in this function or statement) -> Foster a good programming style practice for future programming

## Intelliscence Bug
- the repeat intelliscence would auto assume "repeat until" when I type repeat 10 -> add autocomplete only when I type "repeat u..."
- disable intelliscence for "when key space pressed" -> the standard is "when space key pressed"

## Toolbox Bug
- After inserting a number block, it contains a "$0" at the end

## Compiler Bug
- random not working
- myblock not working

## Future Stuff
- Add crm system (clicks, usage time etc.) -> Convex DB