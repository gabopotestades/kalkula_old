import { TuringCharactersPerStates } from "./TuringCharactersPerState";

export interface TuringStates {
    [key: string]: (TuringCharactersPerStates | string)
}