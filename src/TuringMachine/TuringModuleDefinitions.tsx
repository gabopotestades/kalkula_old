import { StatesDirection } from "../Interfaces/AcceptorStates";
import { TuringCharactersPerStates } from "../Interfaces/TuringCharactersPerState";
import { TuringStates } from "../Interfaces/TuringStates";
import { isNullOrUndefined } from "../Utilities/GeneralHelpers";
import { addCharacterToTheEnd, replaceAt, trimTrailingChars } from "../Utilities/StringHelpers";

/*
    * *These definitions are pre-defined Turing Machines that 
    * *are use to manipulate the input string and tape head index
*/

function turingMachineExecute(currentOmega: string, currentIndex: number, initialState: string, 
                              turingStates: TuringStates, turingStatesDirection: StatesDirection, currentModuleIndex: number ): [string, number, number] {

    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let acceptedOrRejected: number = 1;

    // Setup initial state per iteration based on parameter given
    let currentState: string = initialState;
    let characterToBeScanned: string = currentOmega[newOmegaIndex];
    let currentStateInstructions: (TuringCharactersPerStates | string) = turingStates[currentState];

    while (currentStateInstructions !== 'ACCEPT' &&
           currentStateInstructions !== 'REJECT') {

       if (turingStatesDirection[currentState] === 'right') {
           newOmegaIndex++;
       } else {
           newOmegaIndex--;
       }

       // If the index is at the edge of the string, add a sharp
       if (newOmegaIndex >= newOmegaString.length - 1) {
           newOmegaString = newOmegaString.concat("#").replace(/\r?\n|\r/g, '');
       }

       characterToBeScanned = newOmegaString[newOmegaIndex];

        // For Testing
        // if (currentModuleIndex === 0 ) {
        //     console.log(`Current state: ${currentState}`);
        //     console.log(`Current omega: ${newOmegaString}`);
        //     console.log(`Current index: ${newOmegaIndex}`);
        //     console.log(`Current direction: ${turingStatesDirection[currentState]}`);
        //     console.log(`Character to be scanned: ${characterToBeScanned}`);
        //     console.log(`Current State Instructions:`);
        //     console.log(currentStateInstructions);
        //     console.log('=======================================')
        // }

       currentState = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].stateTransition;
       let characterToReplace = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].characterReplacement;

       if (!isNullOrUndefined(characterToReplace)) {
           newOmegaString  = replaceAt(newOmegaString, newOmegaIndex, characterToReplace!.replace(/\r?\n|\r/g, ''));
       }

       currentStateInstructions = turingStates[currentState];

       if ( currentStateInstructions === 'REJECT') {
           acceptedOrRejected = 0;
       }

    }    
    
    newOmegaString = trimTrailingChars(newOmegaString, "#");
    newOmegaString = addCharacterToTheEnd(newOmegaString, "#");
    
    return [newOmegaString, newOmegaIndex, acceptedOrRejected]
}

export function shiftModule(currentOmega: string, currentIndex: number, command: string, shiftValue: number, currentStateIndex: number): [string, number] {

    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}
    let acceptOrReject: number = 1;

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
    
        [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);

     }

    return [newOmegaString, newOmegaIndex];

}

export function constantModule(currentOmega: string, currentIndex: number, constantNumber: number, currentStateIndex: number): [string, number] {
    
    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let acceptOrReject: number = 1;

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

    for (let i = constantNumber; i > 0; i--) {
    
        [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);

    }

    return [newOmegaString, newOmegaIndex];

}

export function copyModule(currentOmega: string, currentIndex: number, copyNumber: number, currentStateIndex: number): [string, number] {
    
    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let acceptOrReject: number = 1;

    // Perform a constant module using the copy number
    var result: [string, number] = constantModule(newOmegaString, newOmegaIndex, copyNumber, currentStateIndex);
    newOmegaString = result[0];
    newOmegaIndex = result[1];

    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}

    // ** States
    // 0] const- (the copy number)
    // 1] right (1 / x, 2) (x, 1) (#, 5)
    // 2] left  (1, 2) (x, 2) (a, 3)
    // 3] left  (1, 3) (# / a, 4)
    // 4] right (1, 4) (x, 1) (a, 4)
    // 5] left  (1, 5) (x / #) (a / #, 5) (#, 6)
    // 6] right (1 / x, 7) (#, 10)
    // 7] right (1, 7) (#, 8)
    // 8] right (1, 7) (a, 8) (# / a, 9)
    // 9] left (1, 9) (x / 1, 6) (a, 9) (#, 9) 
    // 10] right (1, 10) (a / 1, 11) (#, 10)
    // 11] right  (a / 1, 11) (#, 12)
    // 12] ACCEPT

    //#region States Direction

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
    turingStateTransitions['#'] = {
        stateTransition: '1',
         characterReplacement: 'a'
    }
    turingStates['2'] = turingStateTransitions;

    // For State: 3
    turingStateTransitions = {}
    turingStateTransitions['1'] = {
        stateTransition: '3'
    }
    turingStateTransitions['a'] = {
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
    turingStateTransitions['1'] = {
        stateTransition: '7'
    }
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
    turingStateTransitions['a'] = {
        stateTransition: '9'
    }
    turingStateTransitions['#'] = {
        stateTransition: '9'
    }
    turingStateTransitions['x'] = {
        stateTransition: '6',
        characterReplacement: '1'
    }
    turingStates['9'] = turingStateTransitions;

    // For State: 10
    turingStateTransitions = {}
    turingStateTransitions['a'] = {
        stateTransition: '10'
    }
    turingStateTransitions['#'] = {
        stateTransition: '10'
    }
    turingStateTransitions['1'] = {
        stateTransition: '10'
    }
    turingStateTransitions['a'] = {
        stateTransition: '11',
        characterReplacement: '1'
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

    // For State: 14
    turingStates['12'] = 'ACCEPT';
    //#endregion States Declaration

    [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);

    return [newOmegaString, newOmegaIndex]

}

export function moveModule(currentOmega: string, currentIndex: number, numbersToRemove: number, numbersToMoveLeft: number, currentStateIndex: number): [string, number] {
    
    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let acceptOrReject: number = 1;

    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}

    //#region Convert current head to an index 'x'
    statesDirection['1'] = 'right';
    statesDirection['2'] = 'left';

    // For State: 1
    turingStateTransitions['1'] = {
        stateTransition: '2'
    }
    turingStateTransitions['#'] = {
        stateTransition: '2'
    }
    turingStates['1'] = turingStateTransitions;

    //For State: 2
    turingStateTransitions = {};
    turingStateTransitions['#'] = {
        stateTransition: '3',
        characterReplacement: 'x'
    }
    turingStates['2'] = turingStateTransitions;

    //For State: 3
    turingStates['3'] = 'ACCEPT';

    [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);

    //#endregion
    
    // Perform a shift left to go to the # where the removal will take take place
    [newOmegaString, newOmegaIndex] = shiftModule(newOmegaString, newOmegaIndex, 'shl', numbersToRemove, currentStateIndex);

    //#region Convert the target # to a y and go to x
    turingStates = {};
    statesDirection = {};

    statesDirection['1'] = 'right';
    statesDirection['2'] = 'left';
    statesDirection['3'] = 'right';

    // For State: 1
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '2'
    }
    turingStateTransitions['#'] = {
        stateTransition: '2'
    }
    turingStates['1'] = turingStateTransitions;

    // For State: 2
    turingStateTransitions = {};
    turingStateTransitions['#'] = {
        stateTransition: '3',
        characterReplacement: 'y'
    }
    turingStates['2'] = turingStateTransitions;

    // For State: 3
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '3'
    }
    turingStateTransitions['#'] = {
        stateTransition: '3'
    }
    turingStateTransitions['x'] = {
        stateTransition: '4'
    }
    turingStates['3'] = turingStateTransitions;

    turingStates['4'] = 'ACCEPT';

    [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);

    //#endregion

    // Perform a shift right to go to the # where the last value that will be moved
    [newOmegaString, newOmegaIndex] = shiftModule(newOmegaString, newOmegaIndex, 'shr', numbersToMoveLeft, currentStateIndex);

    //#region Perform the actual move module
    turingStates = {};
    statesDirection = {};

    statesDirection['1'] = 'right';
    statesDirection['2'] = 'left';
    statesDirection['3'] = 'left';
    statesDirection['4'] = 'left';
    statesDirection['5'] = 'right';
    statesDirection['6'] = 'left';
    statesDirection['7'] = 'right';
    statesDirection['8'] = 'left';
    statesDirection['9'] = 'right';
    statesDirection['10'] = 'left';

    // For State: 1
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '2'
    }
    turingStateTransitions['#'] = {
        stateTransition: '2'
    }
    turingStates['1'] = turingStateTransitions;

    // For State: 2
    turingStateTransitions = {};
    turingStateTransitions['#'] = {
        stateTransition: '3',
        characterReplacement: 'z'
    }
    turingStateTransitions['x'] = {
        stateTransition: '4',
        characterReplacement: 'z'
    }
    turingStates['2'] = turingStateTransitions;

    // For State: 3
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '3'
    }
    turingStateTransitions['x'] = {
        stateTransition: '4',
        characterReplacement: '#'
    }
    turingStateTransitions['#'] = {
        stateTransition: '3',
        characterReplacement: 'b'
    }
    turingStates['3'] = turingStateTransitions;

    // For State: 4
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '4',
        characterReplacement: '#'
    }
    turingStateTransitions['y'] = {
        stateTransition: '5'
    }
    turingStateTransitions['#'] = {
        stateTransition: '4'
    }
    turingStates['4'] = turingStateTransitions;

    // For State: 5
    turingStateTransitions = {};
    turingStateTransitions['1'] = {
        stateTransition: '6',
        characterReplacement: '#'
    }
    turingStateTransitions['z'] = {
        stateTransition: '10',
        characterReplacement: '#'
    }
    turingStateTransitions['b'] = {
        stateTransition: '8',
        characterReplacement: '#'
    }
    turingStateTransitions['#'] = {
        stateTransition: '5'
    }
    turingStates['5'] = turingStateTransitions;

    // For State: 6
    turingStateTransitions = {};
    turingStateTransitions['y'] = {
        stateTransition: '7'
    }
    turingStateTransitions['a'] = {
        stateTransition: '7'
    }
    turingStateTransitions['b'] = {
        stateTransition: '7'
    }
    turingStateTransitions['#'] = {
        stateTransition: '6'
    }
    turingStates['6'] = turingStateTransitions;

    // For State: 7
    turingStateTransitions = {};
    turingStateTransitions['#'] = {
        stateTransition: '5',
        characterReplacement: 'a'
    }
    turingStates['7'] = turingStateTransitions;

    // For State: 8
    turingStateTransitions = {};
    turingStateTransitions['y'] = {
        stateTransition: '9'
    }
    turingStateTransitions['a'] = {
        stateTransition: '9'
    }
    turingStateTransitions['b'] = {
        stateTransition: '9'
    }
    turingStateTransitions['#'] = {
        stateTransition: '8'
    }
    turingStates['8'] = turingStateTransitions;

    // For State: 9
    turingStateTransitions = {};
    turingStateTransitions['#'] = {
        stateTransition: '5',
        characterReplacement: 'b'
    }
    turingStates['9'] = turingStateTransitions;

    // For State: 10
    turingStateTransitions = {};
    turingStateTransitions['a'] = {
        stateTransition: '10',
        characterReplacement: '1'
    }
    turingStateTransitions['b'] = {
        stateTransition: '10',
        characterReplacement: '#'
    }
    turingStateTransitions['y'] = {
        stateTransition: '11',
        characterReplacement: '#'
    }
    turingStateTransitions['#'] = {
        stateTransition: '10'
    }
    turingStates['10'] = turingStateTransitions;

    turingStates['11'] = 'ACCEPT';
    
    [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);

    //#endregion

    return [newOmegaString, newOmegaIndex]
}

export function comparisonModule(currentOmega: string, currentIndex: number, command: string, currentStateIndex: number): [string, number, number] {
    
    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let acceptOrReject: number = 1;

    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}
    
    if (command === 'ife' || command === 'ifne') {
       
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'left';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'right';
        statesDirection['6'] = 'left';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'right';
        statesDirection['9'] = 'right';
        statesDirection['10'] = 'left';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'left';
        statesDirection['13'] = 'left';
        statesDirection['14'] = 'right';
        statesDirection['15'] = 'right';
        statesDirection['16'] = 'left';
        statesDirection['17'] = 'left';
        statesDirection['18'] = 'left';
        statesDirection['19'] = 'right';
        statesDirection['20'] = 'right';
        statesDirection['21'] = 'right';
        statesDirection['22'] = 'left';
        statesDirection['23'] = 'left';
        statesDirection['24'] = 'left';
        statesDirection['25'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '8'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStateTransitions['1'] = {
            stateTransition: '11',
            characterReplacement: '#'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '14',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '16',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '15'
        }
        turingStateTransitions['#'] = {
            stateTransition: '17'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '16'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '17',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['x'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '21',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '20'
        }
        turingStateTransitions['#'] = {
            stateTransition: '24'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '21',
            characterReplacement: 'x'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['21'] = turingStateTransitions;

        // For State: 22
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '22',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['22'] = turingStateTransitions;

        // For State: 23
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '23',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['23'] = turingStateTransitions;

        // For State: 24
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '24',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '25'
        }
        turingStates['24'] = turingStateTransitions;

        // For State: 25
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '25',
            characterReplacement: '#'
        }
        turingStateTransitions['x'] = {
            stateTransition: '25',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['25'] = turingStateTransitions;


        // Switch accepting and rejecting state depending on the command
        if (command === 'ife') {
            turingStates['26'] = 'REJECT';
            turingStates['27'] = 'ACCEPT';
        } else {
            turingStates['26'] = 'ACCEPT';
            turingStates['27'] = 'REJECT';
        }

    } else if (command === 'ifg') {
        
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'left';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'right';
        statesDirection['6'] = 'left';
        statesDirection['7'] = 'right';
        statesDirection['8'] = 'right';
        statesDirection['9'] = 'left';
        statesDirection['10'] = 'left';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'left';
        statesDirection['13'] = 'right';
        statesDirection['14'] = 'right';
        statesDirection['15'] = 'left';
        statesDirection['16'] = 'right';
        statesDirection['17'] = 'right';
        statesDirection['18'] = 'left';
        statesDirection['19'] = 'left';
        statesDirection['20'] = 'left';
        statesDirection['21'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['#'] = {
            stateTransition: '8'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '12'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '13',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '16'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '14'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '15',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '15'
        }
        turingStateTransitions['#'] = {
            stateTransition: '12'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '16'
        }
        turingStateTransitions['#'] = {
            stateTransition: '17'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '17',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '17'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '20',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '21',
            characterReplacement: '#'
        }
        turingStateTransitions['x'] = {
            stateTransition: '21',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['21'] = turingStateTransitions;

        turingStates['22'] = 'ACCEPT';
        turingStates['23'] = 'REJECT';

    } else if (command === 'ifge') {
        
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'right';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'left';
        statesDirection['6'] = 'right';
        statesDirection['7'] = 'right';
        statesDirection['8'] = 'left';
        statesDirection['9'] = 'left';
        statesDirection['10'] = 'left';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'right';
        statesDirection['13'] = 'right';
        statesDirection['14'] = 'left';
        statesDirection['15'] = 'left';
        statesDirection['16'] = 'left';
        statesDirection['17'] = 'right';
        statesDirection['18'] = 'right';
        statesDirection['19'] = 'right';
        statesDirection['20'] = 'right';
        statesDirection['21'] = 'left';
        statesDirection['22'] = 'left';
        statesDirection['23'] = 'left';
        statesDirection['24'] = 'left';
        statesDirection['25'] = 'left';
        statesDirection['26'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '6'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '3'
        }
        turingStateTransitions['#'] = {
            stateTransition: '25'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '3'
        }
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '4',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '5'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '28'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10'
        }
        turingStateTransitions['#'] = {
            stateTransition: '8'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '9',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '11'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '11'
        }
        turingStateTransitions['#'] = {
            stateTransition: '17'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '14',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '11'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '15',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '16'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '16',
            characterReplacement: '#'
        }
        turingStateTransitions['x'] = {
            stateTransition: '16',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '17'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '20',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '19'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '20',
            characterReplacement: 'x'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '21',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['21'] = turingStateTransitions;

        // For State: 22
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '22',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['22'] = turingStateTransitions;

        // For State: 23
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '23',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '24'
        }
        turingStates['23'] = turingStateTransitions;

        // For State: 24
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '24',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '28'
        }
        turingStates['24'] = turingStateTransitions;

        // For State: 25
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['25'] = turingStateTransitions;

        // For State: 26
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['26'] = turingStateTransitions;

        turingStates['27'] = 'ACCEPT';
        turingStates['28'] = 'REJECT';

    } else if (command === 'ifl') {
       
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'right';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'left';
        statesDirection['6'] = 'left';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'right';
        statesDirection['9'] = 'right';
        statesDirection['10'] = 'left';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'left';
        statesDirection['13'] = 'left';
        statesDirection['14'] = 'right';
        statesDirection['15'] = 'right';
        statesDirection['16'] = 'left';
        statesDirection['17'] = 'left';
        statesDirection['18'] = 'left';
        statesDirection['19'] = 'right';
        statesDirection['20'] = 'right';
        statesDirection['21'] = 'left';
        statesDirection['22'] = 'left';
        statesDirection['23'] = 'right';
        statesDirection['24'] = 'left';
        statesDirection['25'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '8'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '3'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '3'
        }
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '4',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '5'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '11'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '14',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '16',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '15'
        }
        turingStateTransitions['#'] = {
            stateTransition: '17'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '16'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '17',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['x'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '23',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '20'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '21',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['21'] = turingStateTransitions;

        // For State: 22
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '22',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '27'
        }
        turingStates['22'] = turingStateTransitions;

        // For State: 23
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '23',
            characterReplacement: 'x'
        }
        turingStateTransitions['#'] = {
            stateTransition: '24'
        }
        turingStates['23'] = turingStateTransitions;

        // For State: 24
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '24',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '25'
        }
        turingStates['24'] = turingStateTransitions;

        // For State: 25
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '25',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['25'] = turingStateTransitions;


        turingStates['26'] = 'ACCEPT';
        turingStates['27'] = 'REJECT';

    } else if (command === 'ifle') {
         
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'left';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'right';
        statesDirection['6'] = 'left';
        statesDirection['7'] = 'right';
        statesDirection['8'] = 'right';
        statesDirection['9'] = 'left';
        statesDirection['10'] = 'left';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'left';
        statesDirection['13'] = 'right';
        statesDirection['14'] = 'right';
        statesDirection['15'] = 'left';
        statesDirection['16'] = 'right';
        statesDirection['17'] = 'right';
        statesDirection['18'] = 'left';
        statesDirection['19'] = 'left';
        statesDirection['20'] = 'left';
        statesDirection['21'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['#'] = {
            stateTransition: '8'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '12'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '13',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '16'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '14'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '15',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '15'
        }
        turingStateTransitions['#'] = {
            stateTransition: '12'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '16'
        }
        turingStateTransitions['#'] = {
            stateTransition: '17'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '17',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '17'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '20',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '21',
            characterReplacement: '#'
        }
        turingStateTransitions['x'] = {
            stateTransition: '21',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['21'] = turingStateTransitions;

        turingStates['22'] = 'ACCEPT';
        turingStates['23'] = 'REJECT';

    }
    
    [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);
 
    // Third item is a boolean variable
    // 0 = false, 1 = true
    return [newOmegaString, newOmegaIndex, acceptOrReject];
}

export function operationModule(currentOmega: string, currentIndex: number, command: string, currentStateIndex: number): [string, number] {
    
    let newOmegaIndex: number = currentIndex;
    let newOmegaString: string = currentOmega;
    let acceptOrReject: number = 1;

    let turingStateTransitions: TuringCharactersPerStates = {};
    let statesDirection: StatesDirection = {};
    let turingStates: TuringStates = {}

    if (command === 'swap') {

        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'right';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'left';
        statesDirection['6'] = 'left';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'left';
        statesDirection['9'] = 'right';
        statesDirection['10'] = 'right';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'right';
        statesDirection['13'] = 'left';
        statesDirection['14'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '2',
            characterReplacement: 'a'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
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

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '4',
            characterReplacement: 'a'
        }
        turingStateTransitions['a'] = {
            stateTransition: '3'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '4'
        }
        turingStateTransitions['a'] = {
            stateTransition: '4'
        }
        turingStateTransitions['#'] = {
            stateTransition: '5'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['a'] = {
            stateTransition: '1',
            characterReplacement: '1'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6'
        }
        turingStateTransitions['a'] = {
            stateTransition: '6',
            characterReplacement: '1'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7',
            characterReplacement: '1'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['a'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '9'
        }
        turingStateTransitions['a'] = {
            stateTransition: '10',
            characterReplacement: '1'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11'
        }
        turingStateTransitions['a'] = {
            stateTransition: '10',
            characterReplacement: '1'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11 
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11'
        }
        turingStateTransitions['#'] = {
            stateTransition: '12',
            characterReplacement: '1'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '14'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['14'] = turingStateTransitions;
        
        turingStates['15'] = 'ACCEPT';

    } else if (command === 'add') {
        
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'right';
        statesDirection['4'] = 'right';
        statesDirection['5'] = 'left';
        statesDirection['6'] = 'left';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'left';
        statesDirection['9'] = 'right';
        statesDirection['10'] = 'right';
        statesDirection['11'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '2'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
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

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '4'
        }
        turingStateTransitions['#'] = {
            stateTransition: '8'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '4'
        }
        turingStateTransitions['#'] = {
            stateTransition: '5'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6',
            characterReplacement: '#'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7',
            characterReplacement: '1'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '7'
        }
        turingStateTransitions['#'] = {
            stateTransition: '8'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10'
        }
        turingStateTransitions['#'] = {
            stateTransition: '11'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10'
        }
        turingStateTransitions['#'] = {
            stateTransition: '5'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['11'] = turingStateTransitions;

        turingStates['13'] = 'ACCEPT';

    } else if (command === 'monus') {
        
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'right';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'left';
        statesDirection['6'] = 'right';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'left';
        statesDirection['9'] = 'left';
        statesDirection['10'] = 'right';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'left';
        statesDirection['13'] = 'left';
        statesDirection['14'] = 'right';
        statesDirection['15'] = 'right';
        statesDirection['16'] = 'right';
        statesDirection['17'] = 'right';
        statesDirection['18'] = 'left';
        statesDirection['19'] = 'right';
        statesDirection['20'] = 'right';
        statesDirection['21'] = 'left';
        statesDirection['22'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '2'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
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

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10'
        }
        turingStateTransitions['#'] = {
            stateTransition: '4'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '5'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '6'
        }
        turingStateTransitions['#'] = {
            stateTransition: '8'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStateTransitions['x'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10'
        }
        turingStateTransitions['#'] = {
            stateTransition: '11'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12',
            characterReplacement: 'x'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '14',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '16'
        }
        turingStateTransitions['x'] = {
            stateTransition: '17',
            characterReplacement: '#'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '16'
        }
        turingStateTransitions['x'] = {
            stateTransition: '11'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '17',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '18'
        }
        turingStateTransitions['x'] = {
            stateTransition: '18',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '20',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '22',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21'
        }
        turingStates['21'] = turingStateTransitions;

        // For State: 22
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '22',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['22'] = turingStateTransitions;

        turingStates['23'] = 'ACCEPT';
    } else if (command === 'div') {
        
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'left';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'right';
        statesDirection['6'] = 'right';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'left';
        statesDirection['9'] = 'right';
        statesDirection['10'] = 'left';
        statesDirection['11'] = 'left';
        statesDirection['12'] = 'left';
        statesDirection['13'] = 'right';
        statesDirection['14'] = 'right';
        statesDirection['15'] = 'right';
        statesDirection['16'] = 'right';
        statesDirection['17'] = 'right';
        statesDirection['18'] = 'left';
        statesDirection['19'] = 'right';
        statesDirection['20'] = 'right';
        statesDirection['21'] = 'right';
        statesDirection['22'] = 'left';
        statesDirection['23'] = 'right';
        statesDirection['24'] = 'right';
        statesDirection['25'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2',
            characterReplacement: 'x'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '2',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '4',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '9'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '9'
        }
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11',
            characterReplacement: 'x'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '11'
        }
        turingStateTransitions['#'] = {
            stateTransition: '12'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '13',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '14'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '15'
        }
        turingStateTransitions['x'] = {
            stateTransition: '16',
            characterReplacement: '1'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '15'
        }
        turingStateTransitions['x'] = {
            stateTransition: '10'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '16',
            characterReplacement: '1'
        }
        turingStateTransitions['#'] = {
            stateTransition: '17'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '17'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18',
            characterReplacement: '1'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '18'
        }
        turingStateTransitions['#'] = {
            stateTransition: '10'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '19',
            characterReplacement: 'y'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20',
            characterReplacement: 'y'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '20',
            characterReplacement: 'y'
        }
        turingStateTransitions['x'] = {
            stateTransition: '20',
            characterReplacement: 'y'
        }
        turingStateTransitions['#'] = {
            stateTransition: '21',
            characterReplacement: 'y'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '22',
            characterReplacement: 'y'    
        }
        turingStateTransitions['#'] = {
            stateTransition: '25'
        }
        turingStates['21'] = turingStateTransitions;

        // For State: 22
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '23'
        }
        turingStateTransitions['y'] = {
            stateTransition: '22'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['22'] = turingStateTransitions;

        // For State: 23
        turingStateTransitions = {};
        turingStateTransitions['y'] = {
            stateTransition: '24',
            characterReplacement: '1'
        }
        turingStates['23'] = turingStateTransitions;

        // For State: 24
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '22',
            characterReplacement: 'y'
        }
        turingStateTransitions['y'] = {
            stateTransition: '24'
        }
        turingStateTransitions['#'] = {
            stateTransition: '25'
        }
        turingStates['24'] = turingStateTransitions;

        // For State: 25
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '25'
        }
        turingStateTransitions['y'] = {
            stateTransition: '25',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '26'
        }
        turingStates['25'] = turingStateTransitions;

        turingStates['26'] = 'ACCEPT';
    } else if (command === 'mult') {
        
        statesDirection['1'] = 'right';
        statesDirection['2'] = 'right';
        statesDirection['3'] = 'left';
        statesDirection['4'] = 'left';
        statesDirection['5'] = 'right';
        statesDirection['6'] = 'right';
        statesDirection['7'] = 'left';
        statesDirection['8'] = 'left';
        statesDirection['9'] = 'left';
        statesDirection['10'] = 'right';
        statesDirection['11'] = 'right';
        statesDirection['12'] = 'right';
        statesDirection['13'] = 'right';
        statesDirection['14'] = 'left';
        statesDirection['15'] = 'left';
        statesDirection['16'] = 'left';
        statesDirection['17'] = 'left';
        statesDirection['18'] = 'right';
        statesDirection['19'] = 'right';
        statesDirection['20'] = 'right';
        statesDirection['21'] = 'left';
        statesDirection['22'] = 'right';
        statesDirection['23'] = 'left';
    
        // For State: 1
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '2',
            characterReplacement: 'x'
        }
        turingStates['1'] = turingStateTransitions;

        // For State: 2
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '2',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['2'] = turingStateTransitions;

        // For State: 3
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '4',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '3'
        }
        turingStates['3'] = turingStateTransitions;

        // For State: 4
        turingStateTransitions = {};
        turingStateTransitions['#'] = {
            stateTransition: '24'
        }
        turingStates['4'] = turingStateTransitions;

        // For State: 5
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '5'
        }
        turingStateTransitions['#'] = {
            stateTransition: '6'
        }
        turingStates['5'] = turingStateTransitions;

        // For State: 6
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '9'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['6'] = turingStateTransitions;

        // For State: 7
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '7'
        }
        turingStates['7'] = turingStateTransitions;

        // For State: 8
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '8',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '24'
        }
        turingStates['8'] = turingStateTransitions;

        // For State: 9
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10',
            characterReplacement: 'x'
        }
        turingStateTransitions['#'] = {
            stateTransition: '9'
        }
        turingStates['9'] = turingStateTransitions;

        // For State: 10
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '10'
        }
        turingStateTransitions['#'] = {
            stateTransition: '11'
        }
        turingStates['10'] = turingStateTransitions;

        // For State: 11
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12',
            characterReplacement: 'x'
        }
        turingStateTransitions['#'] = {
            stateTransition: '16'
        }
        turingStates['11'] = turingStateTransitions;

        // For State: 12
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '12'
        }
        turingStateTransitions['#'] = {
            stateTransition: '13'
        }
        turingStates['12'] = turingStateTransitions;

        // For State: 13
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '13'
        }
        turingStateTransitions['#'] = {
            stateTransition: '14',
            characterReplacement: '1'
        }
        turingStates['13'] = turingStateTransitions;

        // For State: 14
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '14'
        }
        turingStateTransitions['#'] = {
            stateTransition: '15'
        }
        turingStates['14'] = turingStateTransitions;

        // For State: 15
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '15'
        }
        turingStateTransitions['x'] = {
            stateTransition: '11',
            characterReplacement: '1'
        }
        turingStates['15'] = turingStateTransitions;

        // For State: 16
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '16'
        }
        turingStateTransitions['x'] = {
            stateTransition: '17'
        }
        turingStateTransitions['#'] = {
            stateTransition: '16'
        }
        turingStates['16'] = turingStateTransitions;

        // For State: 17
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '10',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '17'
        }
        turingStateTransitions['#'] = {
            stateTransition: '18'
        }
        turingStates['17'] = turingStateTransitions;

        // For State: 18
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '18'
        }
        turingStateTransitions['#'] = {
            stateTransition: '19',
            characterReplacement: 'x'
        }
        turingStates['18'] = turingStateTransitions;

        // For State: 19
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '19',
            characterReplacement: 'x'
        }
        turingStateTransitions['#'] = {
            stateTransition: '20',
            characterReplacement: 'x'
        }
        turingStates['19'] = turingStateTransitions;

        // For State: 20
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '21',
            characterReplacement: 'x'
        }
        turingStateTransitions['x'] = {
            stateTransition: '20'
        }
        turingStateTransitions['#'] = {
            stateTransition: '23'
        }
        turingStates['20'] = turingStateTransitions;

        // For State: 21
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '22'
        }
        turingStateTransitions['x'] = {
            stateTransition: '21'
        }
        turingStateTransitions['#'] = {
            stateTransition: '22'
        }
        turingStates['21'] = turingStateTransitions;

        // For State: 22
        turingStateTransitions = {};
        turingStateTransitions['x'] = {
            stateTransition: '20',
            characterReplacement: '1'
        }
        turingStates['22'] = turingStateTransitions;

        // For State: 23
        turingStateTransitions = {};
        turingStateTransitions['1'] = {
            stateTransition: '23'
        }
        turingStateTransitions['x'] = {
            stateTransition: '23',
            characterReplacement: '#'
        }
        turingStateTransitions['#'] = {
            stateTransition: '24'
        }
        turingStates['23'] = turingStateTransitions;

        turingStates['24'] = 'ACCEPT';

    }
    
    [newOmegaString, newOmegaIndex, acceptOrReject] = turingMachineExecute(newOmegaString, newOmegaIndex, '1', turingStates, statesDirection, currentStateIndex);
 
    return [newOmegaString, newOmegaIndex];
}