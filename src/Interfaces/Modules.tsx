export interface Modules {
    [key: string]: {
        command: string;
        type: string;
        firstParameter?: string;
        secondParameter?: string;
    }
}