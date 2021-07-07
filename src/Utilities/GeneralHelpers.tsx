export function isNullOrUndefined(value: any): boolean {
    return (value === null || value === undefined || value === "");
}

export function isEmptyObject(obj: any): boolean {
    return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
}