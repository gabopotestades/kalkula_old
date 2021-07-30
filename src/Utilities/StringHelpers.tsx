export function removeSpacesAndConcat (firstString: string, secondString: string): string {
    return firstString.trim().replace(/\s/g, "") + secondString.trim().replace(/\s/g, "")
}

export function replaceAt (stringToManipulate: string, index: number, charToBeReplaced: string): string {

    var a: string[] = stringToManipulate.split("");
    a[index] = charToBeReplaced;
    return a.join("")

}

export function trimTrailingChars(stringToEdit: string, charToTrim: string): string {
    var regExp = new RegExp(charToTrim + "+$");
    var result = stringToEdit.replace(regExp, "");
  
    return result;
}

export function addCharacterToTheEnd(stringToEdit:string, charToAdd: string): string {

    var stringToReturn: string = stringToEdit;

    // Add character to the edge of the string if not the character
    if (stringToReturn[stringToReturn.length - 1] !== charToAdd) {
        stringToReturn = stringToEdit.concat(charToAdd).replace(/\r?\n|\r/g, '');
    }

    return stringToReturn;

}
