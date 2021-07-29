export function removeSpacesAndConcat (firstString: string, secondString: string): string {
    return firstString.trim().replace(/\s/g, "") + secondString.trim().replace(/\s/g, "")
}

export function replaceAt (stringToManipulate: string, index: number, charToBeReplaced: string): string {

    var a: string[] = stringToManipulate.split("");
    a[index] = charToBeReplaced;
    return a.join("")

}