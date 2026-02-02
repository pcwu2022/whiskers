// Toolbox translations hook
// Provides translated category names, block labels, and descriptions for the toolbox

import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import { toolboxCategories, ToolboxCategory } from '@/lib/editor/toolboxConfig';

// Map category names to translation keys
const categoryKeyMap: Record<string, keyof ReturnType<typeof useTranslation>['t']['toolbox']['categories']> = {
    'Motion': 'motion',
    'Looks': 'looks',
    'Sound': 'sound',
    'Events': 'events',
    'Control': 'control',
    'Sensing': 'sensing',
    'Operators': 'operators',
    'Variables': 'variables',
    'Lists': 'lists',
    'Pen': 'pen',
    'My Blocks': 'custom',
};

// Map block labels to translation keys
const blockLabelKeyMap: Record<string, keyof ReturnType<typeof useTranslation>['t']['toolbox']['blocks']> = {
    // Motion
    'move _ steps': 'moveSteps',
    'turn right _ degrees': 'turnRight',
    'turn left _ degrees': 'turnLeft',
    'go to x: _ y: _': 'goToXY',
    'go to random position': 'goToRandom',
    'go to mouse-pointer': 'goToMouse',
    'glide _ secs to x: _ y: _': 'glideToXY',
    'point in direction _': 'pointDirection',
    'point towards mouse-pointer': 'pointTowardsMouse',
    'change x by _': 'changeX',
    'set x to _': 'setX',
    'change y by _': 'changeY',
    'set y to _': 'setY',
    'if on edge, bounce': 'bounceOnEdge',
    'set rotation style _': 'setRotationStyle',
    'x position': 'xPosition',
    'y position': 'yPosition',
    'direction': 'direction',
    // Looks
    'say _': 'say',
    'say _ for _ seconds': 'sayFor',
    'think _': 'think',
    'think _ for _ seconds': 'thinkFor',
    'switch costume to _': 'switchCostume',
    'next costume': 'nextCostume',
    'switch backdrop to _': 'switchBackdrop',
    'next backdrop': 'nextBackdrop',
    'change size by _': 'changeSize',
    'set size to _': 'setSize',
    'change ghost effect by _': 'changeGhostEffect',
    'set ghost effect to _': 'setGhostEffect',
    'clear graphic effects': 'clearEffects',
    'show': 'show',
    'hide': 'hide',
    'go to front layer': 'goToFront',
    'go to back layer': 'goToBack',
    'costume number': 'costumeNumber',
    'costume name': 'costumeName',
    'backdrop number': 'backdropNumber',
    'backdrop name': 'backdropName',
    'size': 'size',
    // Sound
    'play sound _ until done': 'playSoundUntilDone',
    'start sound _': 'startSound',
    'stop all sounds': 'stopAllSounds',
    'change volume by _': 'changeVolume',
    'set volume to _': 'setVolume',
    'volume': 'volume',
    // Events
    'when green flag clicked': 'whenFlagClicked',
    'when ⬤ key pressed': 'whenKeyPressed',
    'when this sprite clicked': 'whenSpriteClicked',
    'when I receive _': 'whenReceive',
    'when I start as a clone': 'whenCloneStart',
    'broadcast _': 'broadcast',
    'broadcast _ and wait': 'broadcastAndWait',
    'space': 'keySpace',
    'up arrow': 'keyUpArrow',
    'down arrow': 'keyDownArrow',
    'left arrow': 'keyLeftArrow',
    'right arrow': 'keyRightArrow',
    // Control
    'wait _ seconds': 'wait',
    'repeat _': 'repeat',
    'forever': 'forever',
    'if _ then': 'ifThen',
    'if _ then / else': 'ifThenElse',
    'wait until _': 'waitUntil',
    'repeat until _': 'repeatUntil',
    'stop all': 'stopAll',
    'stop this script': 'stopThisScript',
    'create clone of myself': 'createCloneOfMyself',
    'create clone of _': 'createCloneOf',
    'delete this clone': 'deleteThisClone',
    // Sensing
    'touching mouse-pointer': 'touchingMouse',
    'touching _': 'touching',
    'touching edge': 'touchingEdge',
    'touching color _': 'touchingColor',
    'ask _ and wait': 'askAndWait',
    'key _ pressed': 'keyPressed',
    'mouse down': 'mouseDown',
    'distance to _': 'distanceTo',
    'reset timer': 'resetTimer',
    'answer': 'answer',
    'mouse x': 'mouseX',
    'mouse y': 'mouseY',
    'loudness': 'loudness',
    'timer': 'timer',
    'username': 'username',
    'current year': 'currentYear',
    'current month': 'currentMonth',
    'current date': 'currentDate',
    'current day of week': 'currentDayOfWeek',
    'current hour': 'currentHour',
    'current minute': 'currentMinute',
    'current second': 'currentSecond',
    'days since 2000': 'daysSince2000',
    // Operators
    '_ + _': 'add',
    '_ - _': 'subtract',
    '_ * _': 'multiply',
    '_ / _': 'divide',
    'pick random _ to _': 'pickRandom',
    '_ > _': 'greaterThan',
    '_ < _': 'lessThan',
    '_ = _': 'equals',
    '_ and _': 'and',
    '_ or _': 'or',
    'not _': 'not',
    'join _ _': 'join',
    'letter _ of _': 'letterOf',
    'length of _': 'lengthOfString',
    '_ mod _': 'mod',
    'round _': 'round',
    'abs of _': 'absOf',
    // Variables
    'var _ = _': 'varCreate',
    'set _ to _': 'setVar',
    'change _ by _': 'changeVar',
    'show variable _': 'showVar',
    'hide variable _': 'hideVar',
    'list _ = []': 'listCreate',
    'add _ to _': 'addToList',
    'delete _ of _': 'deleteFromList',
    'delete all of _': 'deleteAllList',
    'insert _ at _ of _': 'insertAtList',
    'replace item _ of _ with _': 'replaceInList',
    'item _ of _': 'itemOfList',
    '_ contains _': 'listContains',
    // My Blocks
    'define _': 'define',
    'define _ _': 'defineWithArgs',
    'call _': 'call',
    // Pen
    'erase all': 'eraseAll',
    'stamp': 'stamp',
    'pen down': 'penDown',
    'pen up': 'penUp',
    'set pen color to _': 'setPenColor',
    'change pen size by _': 'changePenSize',
    'set pen size to _': 'setPenSize',
};

// Map block descriptions to translation keys
const descriptionKeyMap: Record<string, keyof ReturnType<typeof useTranslation>['t']['toolbox']['descriptions']> = {
    // Motion
    'Move forward': 'moveSteps',
    'Turn clockwise': 'turnRight',
    'Turn counter-clockwise': 'turnLeft',
    'Go to position': 'goToXY',
    'Go to random position': 'goToRandom',
    'Go to mouse': 'goToMouse',
    'Glide to position': 'glideToXY',
    'Point in direction': 'pointDirection',
    'Point towards mouse': 'pointTowardsMouse',
    'Change x position': 'changeX',
    'Set x position': 'setX',
    'Change y position': 'changeY',
    'Set y position': 'setY',
    'Bounce off edge': 'bounceOnEdge',
    'Set rotation style': 'setRotationStyle',
    "Sprite's x position": 'xPosition',
    "Sprite's y position": 'yPosition',
    "Sprite's direction": 'direction',
    // Looks
    'Show speech bubble': 'say',
    'Say for duration': 'sayFor',
    'Show thought bubble': 'think',
    'Think for duration': 'thinkFor',
    'Change costume': 'switchCostume',
    'Next costume': 'nextCostume',
    'Change backdrop': 'switchBackdrop',
    'Next backdrop': 'nextBackdrop',
    'Change size': 'changeSize',
    'Set size percentage': 'setSize',
    'Change ghost effect': 'changeGhostEffect',
    'Set ghost effect': 'setGhostEffect',
    'Clear all effects': 'clearEffects',
    'Show sprite': 'show',
    'Hide sprite': 'hide',
    'Go to front': 'goToFront',
    'Go to back': 'goToBack',
    'Current costume number': 'costumeNumber',
    'Current costume name': 'costumeName',
    'Current backdrop number': 'backdropNumber',
    'Current backdrop name': 'backdropName',
    "Sprite's size percentage": 'size',
    // Sound
    'Play sound and wait': 'playSoundUntilDone',
    'Start playing sound': 'startSound',
    'Stop all sounds': 'stopAllSounds',
    'Change volume': 'changeVolume',
    'Set volume': 'setVolume',
    'Current volume': 'volume',
    // Events
    'Run when flag is clicked': 'whenFlagClicked',
    'Run when a key is pressed': 'whenKeyPressed',
    'Run when sprite is clicked': 'whenSpriteClicked',
    'Run when message received': 'whenReceive',
    'Run when clone starts': 'whenCloneStart',
    'Send a message': 'broadcast',
    'Send and wait for handlers': 'broadcastAndWait',
    // Control
    'Pause for seconds': 'wait',
    'Repeat code N times': 'repeat',
    'Repeat forever': 'forever',
    'Run if condition is true': 'ifThen',
    'If-else statement': 'ifThenElse',
    'Wait until condition is true': 'waitUntil',
    'Repeat until condition': 'repeatUntil',
    'Stop all scripts': 'stopAll',
    'Stop this script': 'stopThisScript',
    'Create a clone of this sprite': 'createCloneOfMyself',
    'Create a clone of sprite': 'createCloneOf',
    'Delete this clone': 'deleteThisClone',
    // Sensing
    'Check touching mouse': 'touchingMouse',
    'Check touching sprite': 'touching',
    'Check touching edge': 'touchingEdge',
    'Check touching color': 'touchingColor',
    'Ask user for input': 'askAndWait',
    'Check key pressed': 'keyPressed',
    'Check mouse button': 'mouseDown',
    'Get distance to sprite': 'distanceTo',
    'User answer': 'answer',
    'Mouse x position': 'mouseX',
    'Mouse y position': 'mouseY',
    'Timer value': 'timer',
    'Reset timer': 'resetTimer',
    // Operators
    'Addition': 'add',
    'Subtraction': 'subtract',
    'Multiplication': 'multiply',
    'Division': 'divide',
    'Pick random number': 'pickRandom',
    'Less than comparison': 'lessThan',
    'Equals comparison': 'equals',
    'Greater than comparison': 'greaterThan',
    'Both conditions true': 'and',
    'Either condition true': 'or',
    'Opposite of condition': 'not',
    'Join text together': 'join',
    'Letter at position': 'letterOf',
    'Length of text': 'lengthOf',
    'Text contains': 'contains',
    'Remainder (modulo)': 'mod',
    'Round number': 'round',
    'Math function': 'mathFunction',
    // Variables
    'Set variable value': 'setVariable',
    'Change variable by amount': 'changeVariable',
    // Lists
    'Add item to list': 'addToList',
    'Delete item from list': 'deleteFromList',
    'Delete all items from list': 'deleteAllList',
    'Insert item at position': 'insertAtList',
    'Replace item in list': 'replaceInList',
    'Get item from list': 'itemOfList',
    'Find item position in list': 'itemNumberInList',
    'Length of list': 'lengthOfList',
    'List contains item': 'listContains',
    // Pen
    'Start drawing': 'penDown',
    'Stop drawing': 'penUp',
    'Set pen color': 'setPenColor',
    'Change pen thickness': 'changePenSize',
    'Set pen thickness': 'setPenSize',
    'Clear all drawings': 'clearPen',
    'Stamp sprite image': 'stamp',
    // Custom
    'Define custom block': 'defineBlock',
};

export function useTranslatedToolbox() {
    const { t } = useTranslation();
    
    const translatedCategories = useMemo((): ToolboxCategory[] => {
        return toolboxCategories.map(category => {
            // Get translated category name
            const categoryKey = categoryKeyMap[category.name];
            const translatedCategoryValue = categoryKey ? t.toolbox.categories[categoryKey] : undefined;
            const translatedName = (typeof translatedCategoryValue === 'string' && translatedCategoryValue)
                ? translatedCategoryValue
                : category.name;
            
            // Translate command labels and descriptions
            const translatedCommands = category.commands.map(command => {
                // Translate label - ensure we get a string
                const labelKey = blockLabelKeyMap[command.label];
                const translatedLabelValue = labelKey ? t.toolbox.blocks[labelKey] : undefined;
                const translatedLabel = (typeof translatedLabelValue === 'string' && translatedLabelValue)
                    ? translatedLabelValue
                    : command.label;
                
                // Translate description - ensure we get a string
                let translatedDesc = command.description;
                if (command.description) {
                    const descKey = descriptionKeyMap[command.description];
                    const translatedDescValue = descKey ? t.toolbox.descriptions[descKey] : undefined;
                    translatedDesc = (typeof translatedDescValue === 'string' && translatedDescValue)
                        ? translatedDescValue
                        : command.description;
                }
                
                return {
                    ...command,
                    label: translatedLabel,
                    description: translatedDesc,
                };
            });
            
            return {
                ...category,
                name: translatedName,
                commands: translatedCommands,
            };
        });
    }, [t]);
    
    return translatedCategories;
}
