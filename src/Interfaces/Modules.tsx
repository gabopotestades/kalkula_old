export interface Modules {
    [key: string]: {
        command: string;
        type: string;
        firstParameter?: number;
        secondParameter?: number;
    }
}