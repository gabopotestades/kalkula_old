export interface Modules {
    [key: string]: {
        command: string;
        firstParameter?: number;
        secondParameter?: number;
    }
}