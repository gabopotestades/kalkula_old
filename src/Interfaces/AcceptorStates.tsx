import { CharactersPerState } from "./CharactersPerState";

export interface TwoWayAcceptorStates {
    [key: string]: (CharactersPerState | string);
}

export interface StatesDirection {
    [key: string]: string;
}