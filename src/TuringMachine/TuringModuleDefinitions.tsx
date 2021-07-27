import { StatesDirection } from "../Interfaces/AcceptorStates";
import { TuringCharactersPerStates } from "../Interfaces/TuringCharactersPerState";
import { TuringStates } from "../Interfaces/TuringStates";

/*
    * *This definitions are pre-defined Turing Machines that 
    * *are use to manipulate the input string and tape head index
*/
export function shiftModule(currentOmega: string, currentIndex: number, command: string, shiftValue: number): number {

    let newOmegaIndex: number = currentIndex;
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
        let characterToBeScanned: string = currentOmega[currentIndex];
        let currentStateInstructions: (TuringCharactersPerStates | string) = turingStates[currentState];

        while (currentStateInstructions !== 'ACCEPT') {

            if (statesDirection[currentState] === 'right') {
                newOmegaIndex++;
            } else {
                newOmegaIndex--;
            }

            characterToBeScanned = currentOmega[newOmegaIndex];
            currentState = (currentStateInstructions as TuringCharactersPerStates)[characterToBeScanned].stateTransition;
            currentStateInstructions = turingStates[currentState];

        }

    
     }

    return newOmegaIndex;
}

export function constantModule(currentOmega: string, currentIndex: number, constantNumber: number): [string, number] {
    return ['#1#1#', 3];
}

export function copyModule(currentOmega: string, currentIndex: number, copyNumber: number): [string, number] {
    return ['1', 2];
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