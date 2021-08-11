export interface TuringCharactersPerStates {
    [key: string]: { stateTransition: string,
                    characterReplacement?: string
                };
}