// i18n Type Definitions

export type SupportedLocale = 'en' | 'zh-TW';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'zh-TW'];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
    'en': 'English',
    'zh-TW': '繁體中文',
};

// Translation structure types
export interface TranslationSchema {
    // Navigation & Common
    common: {
        appName: string;
        tagline: string;
        tryItNow: string;
        contribute: string;
        backToEditor: string;
        loading: string;
        cancel: string;
        save: string;
        discard: string;
        delete: string;
        confirm: string;
        close: string;
    };

    // Landing Page
    landing: {
        hero: {
            title: string;
            cta: string;
        };
        roleSelection: {
            title: string;
            student: string;
            studentDesc: string;
            parent: string;
            parentDesc: string;
            teacher: string;
            teacherDesc: string;
        };
        demo: {
            title: string;
            videoUrl: string;
            cta: string;
            ctaMobile: string;
            mobileNotice: string;
        };
        why: {
            title: string;
            challengeTitle: string;
            challengeText: string;
            solutionTitle: string;
            solutionText: string;
        };
        how: {
            title: string;
            familiarTitle: string;
            familiarText: string;
            smartEditorTitle: string;
            smartEditorText: string;
            liveFeedbackTitle: string;
            liveFeedbackText: string;
        };
        who: {
            title: string;
            learnersTitle: string;
            learnersText: string;
            classroomsTitle: string;
            classroomsText: string;
            homeLearningTitle: string;
            homeLearningText: string;
        };
        whatsNext: {
            title: string;
            parent: {
                title: string;
                step1Title: string;
                step1Text: string;
                step2Title: string;
                step2Text: string;
                step3Title: string;
                step3Text: string;
                footer: string;
            };
            teacher: {
                title: string;
                step1Title: string;
                step1Text: string;
                step2Title: string;
                step2Text: string;
                step3Title: string;
                step3Text: string;
                footer: string;
            };
        };
        footer: {
            developedBy: string;
            authorName: string;
            mission: string;
        };
        backToTop: string;
    };

    // Playground
    playground: {
        toolbar: {
            newProject: string;
            openProject: string;
            saveProject: string;
            downloadHtml: string;
            help: string;
            run: string;
            stop: string;
        };
        sidebar: {
            toolbox: string;
            costumes: string;
            sounds: string;
            showToolbox: string;
            hideToolbox: string;
        };
        tabs: {
            addSprite: string;
            stage: string;
            stageTooltip: string;
            deleteSprite: string;
            rename: string;
            duplicate: string;
            delete: string;
            cannotDeleteStage: string;
            cannotDeleteLastSprite: string;
            confirmDeleteSprite: string;
            stageCannotBeModified: string;
        };
        modals: {
            newProjectTitle: string;
            newProjectMessage: string;
            projectNameTitle: string;
            projectNamePlaceholder: string;
            unsavedChangesTitle: string;
            unsavedChangesMessage: string;
            howSavingWorks: string;
        };
        notifications: {
            projectLoaded: string;
            projectSaved: string;
            projectAutoSaved: string;
            welcomeProject: string;
            spriteAdded: string;
            spriteDeleted: string;
            costumeAdded: string;
            costumeDeleted: string;
            soundAdded: string;
            soundDeleted: string;
            invalidFile: string;
            downloadReady: string;
            runtimeError: string;
            noEventBlocks: string;
        };
        costumeSidebar: {
            uploadCostume: string;
            moveUp: string;
            moveDown: string;
            rename: string;
            delete: string;
            cannotDeleteLast: string;
            renameCostumeTitle: string;
            renameCostumeMessage: string;
            costumePlaceholder: string;
            renameButton: string;
            notAnImage: string;
        };
        soundSidebar: {
            uploadSound: string;
            play: string;
            stop: string;
            moveUp: string;
            moveDown: string;
            rename: string;
            delete: string;
            cannotDeleteLast: string;
            renameSoundTitle: string;
            renameSoundMessage: string;
            soundPlaceholder: string;
            renameButton: string;
            notAnAudio: string;
        };
        editor: {
            lineColumn: string;
        };
        errorPanel: {
            hideDetails: string;
            showDetails: string;
            errorsFound: string;
            errorFound: string;
            lineColumn: string;
            problemsFound: string;
            problemFound: string;
            unexpectedError: string;
        };
        preview: {
            title: string;
            clickToStart: string;
        };
    };

    // Toolbox - category names and descriptions
    toolbox: {
        categories: {
            motion: string;
            looks: string;
            sound: string;
            events: string;
            control: string;
            sensing: string;
            operators: string;
            variables: string;
            lists: string;
            pen: string;
            custom: string;
        };
        // Block display labels (shown in toolbox)
        blocks: {
            // Motion
            moveSteps: string;
            turnRight: string;
            turnLeft: string;
            goToXY: string;
            goToRandom: string;
            goToMouse: string;
            glideToXY: string;
            pointDirection: string;
            pointTowardsMouse: string;
            changeX: string;
            setX: string;
            changeY: string;
            setY: string;
            bounceOnEdge: string;
            setRotationStyle: string;
            xPosition: string;
            yPosition: string;
            direction: string;
            // Looks
            say: string;
            sayFor: string;
            think: string;
            thinkFor: string;
            switchCostume: string;
            nextCostume: string;
            switchBackdrop: string;
            nextBackdrop: string;
            changeSize: string;
            setSize: string;
            changeGhostEffect: string;
            setGhostEffect: string;
            clearEffects: string;
            show: string;
            hide: string;
            goToFront: string;
            goToBack: string;
            costumeNumber: string;
            costumeName: string;
            backdropNumber: string;
            backdropName: string;
            size: string;
            // Sound
            playSoundUntilDone: string;
            startSound: string;
            stopAllSounds: string;
            changeVolume: string;
            setVolume: string;
            volume: string;
            // Events
            whenFlagClicked: string;
            whenKeyPressed: string;
            whenSpriteClicked: string;
            whenReceive: string;
            whenCloneStart: string;
            broadcast: string;
            broadcastAndWait: string;
            keySpace: string;
            keyUpArrow: string;
            keyDownArrow: string;
            keyLeftArrow: string;
            keyRightArrow: string;
            // Control
            wait: string;
            repeat: string;
            forever: string;
            ifThen: string;
            ifThenElse: string;
            waitUntil: string;
            repeatUntil: string;
            stopAll: string;
            stopThisScript: string;
            createCloneOfMyself: string;
            createCloneOf: string;
            deleteThisClone: string;
            // Sensing
            touchingMouse: string;
            touching: string;
            touchingEdge: string;
            touchingColor: string;
            askAndWait: string;
            keyPressed: string;
            mouseDown: string;
            distanceTo: string;
            resetTimer: string;
            answer: string;
            mouseX: string;
            mouseY: string;
            loudness: string;
            timer: string;
            username: string;
            currentYear: string;
            currentMonth: string;
            currentDate: string;
            currentDayOfWeek: string;
            currentHour: string;
            currentMinute: string;
            currentSecond: string;
            daysSince2000: string;
            // Operators
            add: string;
            subtract: string;
            multiply: string;
            divide: string;
            pickRandom: string;
            greaterThan: string;
            lessThan: string;
            equals: string;
            and: string;
            or: string;
            not: string;
            join: string;
            letterOf: string;
            lengthOfString: string;
            mod: string;
            round: string;
            absOf: string;
            // Variables
            varCreate: string;
            setVar: string;
            changeVar: string;
            showVar: string;
            hideVar: string;
            listCreate: string;
            addToList: string;
            deleteFromList: string;
            deleteAllList: string;
            insertAtList: string;
            replaceInList: string;
            itemOfList: string;
            lengthOfList: string;
            listContains: string;
            // My Blocks
            define: string;
            defineWithArgs: string;
            call: string;
            // Pen
            eraseAll: string;
            stamp: string;
            penDown: string;
            penUp: string;
            setPenColor: string;
            changePenSize: string;
            setPenSize: string;
        };
        // Block descriptions (tooltips) - optional, can be empty
        descriptions: {
            // Motion
            moveSteps: string;
            turnRight: string;
            turnLeft: string;
            goToXY: string;
            goToRandom: string;
            goToMouse: string;
            glideToXY: string;
            pointDirection: string;
            pointTowardsMouse: string;
            changeX: string;
            setX: string;
            changeY: string;
            setY: string;
            bounceOnEdge: string;
            setRotationStyle: string;
            xPosition: string;
            yPosition: string;
            direction: string;
            // Looks
            say: string;
            sayFor: string;
            think: string;
            thinkFor: string;
            switchCostume: string;
            nextCostume: string;
            switchBackdrop: string;
            nextBackdrop: string;
            changeSize: string;
            setSize: string;
            changeGhostEffect: string;
            setGhostEffect: string;
            clearEffects: string;
            show: string;
            hide: string;
            goToFront: string;
            goToBack: string;
            costumeNumber: string;
            costumeName: string;
            backdropNumber: string;
            backdropName: string;
            size: string;
            // Sound
            playSoundUntilDone: string;
            startSound: string;
            stopAllSounds: string;
            changeVolume: string;
            setVolume: string;
            volume: string;
            // Events
            whenFlagClicked: string;
            whenKeyPressed: string;
            whenSpriteClicked: string;
            whenReceive: string;
            whenCloneStart: string;
            broadcast: string;
            broadcastAndWait: string;
            // Control
            wait: string;
            repeat: string;
            forever: string;
            ifThen: string;
            ifThenElse: string;
            waitUntil: string;
            repeatUntil: string;
            stopAll: string;
            stopThisScript: string;
            createCloneOfMyself: string;
            createCloneOf: string;
            deleteThisClone: string;
            // Sensing
            touchingMouse: string;
            touching: string;
            touchingEdge: string;
            touchingColor: string;
            askAndWait: string;
            keyPressed: string;
            mouseDown: string;
            distanceTo: string;
            answer: string;
            mouseX: string;
            mouseY: string;
            timer: string;
            resetTimer: string;
            // Operators
            add: string;
            subtract: string;
            multiply: string;
            divide: string;
            pickRandom: string;
            lessThan: string;
            equals: string;
            greaterThan: string;
            and: string;
            or: string;
            not: string;
            join: string;
            letterOf: string;
            lengthOf: string;
            contains: string;
            mod: string;
            round: string;
            mathFunction: string;
            // Variables
            setVariable: string;
            changeVariable: string;
            // Lists
            addToList: string;
            deleteFromList: string;
            deleteAllList: string;
            insertAtList: string;
            replaceInList: string;
            itemOfList: string;
            itemNumberInList: string;
            lengthOfList: string;
            listContains: string;
            // Pen
            penDown: string;
            penUp: string;
            setPenColor: string;
            changePenSize: string;
            setPenSize: string;
            clearPen: string;
            stamp: string;
            // Custom
            defineBlock: string;
        };
    };

    // Support Page
    support: {
        pageTitle: string;
        quickStart: {
            title: string;
            intro: string;
            step1Title: string;
            step1Text: string;
            step2Title: string;
            step2Text: string;
            step3Title: string;
            step3Text: string;
            step4Title: string;
            step4Text: string;
            reminder: string;
        };
        saving: {
            title: string;
            intro: string;
            bullet1: string;
            bullet2: string;
            bullet3: string;
            bullet4: string;
            warning: string;
        };
        download: {
            title: string;
            intro: string;
            step1: string;
            step2: string;
            step3: string;
            zipContents: string;
            zipItem1: string;
            zipItem2: string;
        };
        upload: {
            title: string;
            intro: string;
            step1: string;
            step2: string;
            step3: string;
            step4: string;
            dragDrop: string;
        };
        newProject: {
            title: string;
            intro: string;
            step1: string;
            step2: string;
            step3: string;
        };
        sprites: {
            title: string;
            intro: string;
            adding: {
                title: string;
                text: string;
            };
            switching: {
                title: string;
                text: string;
            };
            deleting: {
                title: string;
                text: string;
            };
            stage: {
                title: string;
                text: string;
            };
        };
        costumes: {
            title: string;
            intro: string;
            adding: string;
            preview: string;
            note: string;
        };
        sounds: {
            title: string;
            intro: string;
            adding: string;
            supported: string;
            note: string;
        };
        faq: {
            title: string;
            q1: string;
            a1: string;
            q2: string;
            a2: string;
            q3: string;
            a3: string;
            q4: string;
            a4: string;
        };
    };

    // Compiler Error Messages
    errors: {
        // Compiler pre-check errors
        emptyCircle: {
            message: string;
            suggestion: string;
        };
        emptyDiamond: {
            message: string;
            suggestion: string;
        };
        // Lexer errors
        invalidBracket: {
            message: string;
            suggestion: string;
        };
        invalidCurlyBracket: {
            message: string;
            suggestion: string;
        };
        emptyParentheses: {
            message: string;
            suggestion: string;
        };
        unterminatedString: {
            message: string;
            suggestion: string;
        };
        inconsistentIndent: {
            message: string;
            suggestion: string;
        };
        // Parser errors
        emptyBlock: {
            message: string;
            suggestion: string;
        };
        undeclaredVariable: {
            message: string;
            suggestion: string;
        };
        reservedKeyword: {
            message: string;
            suggestion: string;
        };
        missingValue: {
            message: string;
            suggestion: string;
        };
        unexpectedToken: {
            message: string;
            suggestion: string;
        };
        missingEnd: {
            message: string;
            suggestion: string;
        };
        invalidSyntax: {
            message: string;
            suggestion: string;
        };
        missingIndent: {
            message: string;
            suggestion: string;
        };
        unknownBlock: {
            message: string;
            suggestion: string;
        };
        procedureArgMismatch: {
            message: string;
            suggestion: string;
        };
        // Type errors
        typeMismatch: {
            message: string;
            suggestion: string;
        };
        numberRequired: {
            message: string;
            suggestion: string;
        };
        stringRequired: {
            message: string;
            suggestion: string;
        };
        booleanRequired: {
            message: string;
            suggestion: string;
        };
        invalidBooleanOperation: {
            message: string;
            suggestion: string;
        };
    };
}
