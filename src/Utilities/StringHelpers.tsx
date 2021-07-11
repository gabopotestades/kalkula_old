export function removeSpacesAndConcat (firstString: string, secondString: string): string {
    return firstString.trim().replace(/\s/g, "") + secondString.trim().replace(/\s/g, "")
}