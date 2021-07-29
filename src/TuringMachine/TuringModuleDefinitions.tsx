import { StatesDirection } from "../Interfaces/AcceptorStates";
import { TuringCharactersPerStates } from "../Interfaces/TuringCharactersPerState";
import { TuringStates } from "../Interfaces/TuringStates";
import { isNullOrUndefined } from "../Utilities/GeneralHelpers";
import { replaceAt } from "../Utilities/StringHelpers";

/*
    * *This definitions are pre-defined Turing Machines that 
    * *are use to manipulate the input string and tape head index
*/
export function shiftModule(currentOmega: string, currentIndex: number, command: string, shiftValue: number): [string, number] {

    let newOmegaIndex: number = currentIndex;
    let currentOmegaString: string = currentOmega;
    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}

     // ** States for Shift Right
     // 1] right (1, 1) (#, 2)
     // 2] ACCEPT

     // ** States for Shift Left
     // 1] left (1, 1) (#, 2)
     // 2] ACCEPT

     if (command === 'shl') {
        statesDirection['1'] = 'left';
     } else {
        statesDirection['1'] = 'right';
     }

     // For State: 1
     turingStateTransitions['1'] = {
         stateTransition: '1'
     }
     turingStateTransitions['#'] = {
         stateTransition: '2'
     };
     turingStates['1'] = turingStateTransitions;
     // State: 2 is the accepting state
     turingStates['2'] = 'ACCEPT';

     for (let i = shiftValue; i > 0; i--) {

        // Setup initial state per iteration based on parameter given
        let currentState: string = '1';
        let characterToBeScanned: string = currentOmega[newOmegaIndex];
        let currentStateInstructions: (TuringCharactersPerStates | string) = turingStates[currentState];

        while (currentStateInstructions !== 'ACCEPT') {

            if (statesDirection[currentState] === 'right') {
                newOmegaIndex++;
            } else {
                newOmegaIndex--;
            }

            // If the index is at the edge of the string, add a sharp
            if (newOmegaIndex >= currentOmegaString.length - 1) {
                currentOmegaString = currentOmegaString.concat("#").replace(/\r?\n|\r/g, '');
            }

            characterToBeScanned = currentOmegaString[newOmegaIndex];

            currentState = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].stateTransition;
            currentStateInstructions = turingStates[currentState];

        }

     }

    return [currentOmegaString, newOmegaIndex];

}

export function constantModule(currentOmega: string, currentIndex: number, constantNumber: number): [string, number] {
    
    let newOmegaIndex: number = currentIndex;
    let currentOmegaString: string = currentOmega;
    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}

    // ** States
    // 1] right (#/1, 2)
    // 2] left (1, 2) (#, 3)
    // 3] ACCEPT

    statesDirection['1'] = 'right';
    statesDirection['2'] = 'left';

    // For State: 1
    turingStateTransitions['1'] = {
        stateTransition: '1'
    }
    turingStateTransitions['#'] = {
        stateTransition: '2',
        characterReplacement: '1'
    }
    turingStates['1'] = turingStateTransitions;

     // For State: 2
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '2'
    }
    turingStateTransitions['#'] = {
        stateTransition: '3'
    }
    turingStates['2'] = turingStateTransitions;

     // State: 3 is the accepting state
    turingStates['3'] = 'ACCEPT';

    // console.log(turingStates);
    // return [currentOmegaString, newOmegaIndex];

    for (let i = constantNumber; i > 0; i--) {

        // Setup initial state per iteration based on parameter given
        let currentState: string = '1';
        let characterToBeScanned: string = currentOmega[newOmegaIndex];
        let currentStateInstructions: (TuringCharactersPerStates | string) = turingStates[currentState];

        while (currentStateInstructions !== 'ACCEPT') {

            if (statesDirection[currentState] === 'right') {
                newOmegaIndex++;
            } else {
                newOmegaIndex--;
            }

            // If the index is at the edge of the string, add a sharp
            if (newOmegaIndex >= currentOmegaString.length - 1) {
                currentOmegaString = currentOmegaString.concat("#").replace(/\r?\n|\r/g, '');
            }

            characterToBeScanned = currentOmegaString[newOmegaIndex];

            // console.log(`Current state: ${currentState}`);
            // console.log(`Character to be scanned: ${characterToBeScanned}`);
            // console.log(`Current State Instructions:`);
            // console.log(currentStateInstructions);

            currentState = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].stateTransition;
            let characterToReplace = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].characterReplacement;

            if (!isNullOrUndefined(characterToReplace)) {
                currentOmegaString  = replaceAt(currentOmegaString, newOmegaIndex, characterToReplace!.replace(/\r?\n|\r/g, ''));
            }

            currentStateInstructions = turingStates[currentState];

        }

    }

    // Add sharp to the edge of the string if not a sharp
    if (currentOmegaString[currentOmegaString.length - 1] !== "#") {
        currentOmegaString = currentOmegaString.concat("#").replace(/\r?\n|\r/g, '');
    }

    return [currentOmegaString, newOmegaIndex];

}

export function copyModule(currentOmega: string, currentIndex: number, copyNumber: number): [string, number] {
    
    let newOmegaIndex: number = currentIndex;
    let currentOmegaString: string = currentOmega;

    // Perform a constant module using the copy number
    var result: [string, number] = constantModule(currentOmegaString, newOmegaIndex, copyNumber);
    currentOmegaString = result[0];
    newOmegaIndex = result[1];
    
    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}

    // ** States
    // 1] right (1 / x, 2) (x, 1) (#, 5)
    // 2] left  (1, 2) (x, 2) (a, 3)
    // 3] left  (1, 3) (# / a, 4)
    // 4] right (1, 4) (x, 1) (a, 4)
    // 5] left  (1, 5) (x / #) (a / #, 5) (#, 6)
    // 6] right (1 / x) (#, 10)
    // 7] right (1, 7) (#, 8)
    // 8] right (a, 8) (# / a, 9)
    // 9] left  (1, 9) (x / 1, 6) (#, 9)
    // 10] right (1, 10) (a / 1, 11) (#, 10)
    // 11] right (a / 1, 11) (#, 12)
    // 12] ACCEPT

    //#region  States Direction

    statesDirection[1] = 'right';
    statesDirection[2] = 'left';
    statesDirection[3] = 'left';
    statesDirection[4] = 'right';
    statesDirection[5] = 'left';
    statesDirection[6] = 'right';
    statesDirection[7] = 'right';
    statesDirection[8] = 'right';
    statesDirection[9] = 'left';
    statesDirection[10] = 'right';
    statesDirection[11] = 'right';

    //#endregion States Direction

    //#region States Declaration 

    // For State: 1
    turingStateTransitions['1'] = {
        stateTransition: '2',
        characterReplacement: 'x'
    }
    turingStateTransitions['x'] = {
        stateTransition: '1'
    }
    turingStateTransitions['#'] = {
        stateTransition: '5'
    }
    turingStates['1'] = turingStateTransitions;

    // For State: 2
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '2'
    }
    turingStateTransitions['x'] = {
        stateTransition: '2'
    }
    turingStateTransitions['a'] = {
        stateTransition: '3'
    }
    turingStates['2'] = turingStateTransitions;

    // For State: 3
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '3'
    }
    turingStateTransitions['#'] = {
        stateTransition: '4',
        characterReplacement: 'a'
    }
    turingStates['3'] = turingStateTransitions;

    // For State: 4
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '4'
    }
    turingStateTransitions['x'] = {
        stateTransition: '1'
    }
    turingStateTransitions['a'] = {
        stateTransition: '4'
    }
    turingStates['4'] = turingStateTransitions;

    // For State: 5
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '5'
    }
    turingStateTransitions['x'] = {
        stateTransition: '5',
        characterReplacement: '#'
    }
    turingStateTransitions['a'] = {
        stateTransition: '5',
        characterReplacement: '#'
    }
    turingStateTransitions['#'] = {
        stateTransition: '6'
    }
    turingStates['5'] = turingStateTransitions;

    // For State: 6
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '7',
        characterReplacement: 'x'
    }
    turingStateTransitions['#'] = {
        stateTransition: '10'
    }
    turingStates['6'] = turingStateTransitions;

    // For State: 7
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '7'
    }
    turingStateTransitions['#'] = {
        stateTransition: '8'
    }
    turingStates['7'] = turingStateTransitions;

    // For State: 8
    turingStateTransitions = {}
    turingStateTransitions['a'] = {
        stateTransition: '8'
    }
    turingStateTransitions['#'] = {
        stateTransition: '9',
        characterReplacement: 'a'
    }
    turingStates['8'] = turingStateTransitions;

    // For State: 9
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '9'
    }
    turingStateTransitions['x'] = {
        stateTransition: '6',
        characterReplacement: '1'
    }
    turingStateTransitions['#'] = {
        stateTransition: '9'
    }
    turingStates['9'] = turingStateTransitions;

    // For State: 10
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '10'
    }
    turingStateTransitions['a'] = {
        stateTransition: '11',
        characterReplacement: '1'
    }
    turingStateTransitions['#'] = {
        stateTransition: '10'
    }
    turingStates['10'] = turingStateTransitions;

    // For State: 11
    turingStateTransitions = {}
    turingStateTransitions['a'] = {
        stateTransition: '11',
        characterReplacement: '1'
    }
    turingStateTransitions['#'] = {
        stateTransition: '12'
    }
    turingStates['11'] = turingStateTransitions;

    // For State: 12
    turingStates['12'] = 'ACCEPT';
    //#endregion States Declaration

    // Setup initial state per iteration based on parameter given
    let currentState: string = '1';
    let characterToBeScanned: string = currentOmega[newOmegaIndex];
    let currentStateInstructions: (TuringCharactersPerStates | string) = turingStates[currentState];

    while (currentStateInstructions !== 'ACCEPT') {

        if (statesDirection[currentState] === 'right') {
            newOmegaIndex++;
        } else {
            newOmegaIndex--;
        }

        // If the index is at the edge of the string, add a sharp
        if (newOmegaIndex >= currentOmegaString.length - 1) {
            currentOmegaString = currentOmegaString.concat("#").replace(/\r?\n|\r/g, '');
        }

        characterToBeScanned = currentOmegaString[newOmegaIndex];

        console.log(`Current state: ${currentState}`);
        console.log(`Character to be scanned: ${characterToBeScanned}`);
        console.log(`Current State Instructions:`);
        console.log(currentStateInstructions);

        currentState = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].stateTransition;
        let characterToReplace = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].characterReplacement;

        if (!isNullOrUndefined(characterToReplace)) {
            currentOmegaString  = replaceAt(currentOmegaString, newOmegaIndex, characterToReplace!.replace(/\r?\n|\r/g, ''));
        }

        currentStateInstructions = turingStates[currentState];

    }

    return [currentOmegaString, newOmegaIndex]

}

export function moveModule(currentOmega: string, currentIndex: number, numbersToRemove: number, numbersToMoveLeft: number,): [string, number] {
    return ['1', 2];
}

export function comparisonModule(currentOmega: string, currentIndex: number, command: string): [string, number] {
    return ['1', 1];
}

export function operationModule(currentOmega: string, currentIndex: number, command: string): string {
    return '';
}