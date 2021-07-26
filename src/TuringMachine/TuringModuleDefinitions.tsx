/*
    * *This definitions are pre-defined Turing Machines that 
    * *are use to manipulate the input string
*/
export function shiftModule(currentOmega: string, currentIndex: number, command: string, shiftValue: number): number {
    return 1;
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