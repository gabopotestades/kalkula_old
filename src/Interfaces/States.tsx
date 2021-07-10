import { CharactersPerState } from "./CharactersPerState";

export interface States {
    [key: string]: (CharactersPerState | string);
}