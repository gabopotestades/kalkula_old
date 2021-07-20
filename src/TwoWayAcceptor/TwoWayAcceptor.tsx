import './TwoWayAcceptor.scss'
import FileUploader from "../Utilities/FileUploader";
import { useState, useEffect } from "react";
import { States, StatesDirection } from '../Interfaces/States';
import { removeSpacesAndConcat } from '../Utilities/StringHelpers';
import { CharactersPerState } from '../Interfaces/CharactersPerState';
import { isNullOrUndefined, isEmptyObject } from "../Utilities/GeneralHelpers";

const TwoWayAcceptor = () => {

    //Values for upload
    const [hasUploaded, setHasUploaded] = useState<boolean>(false);
    const [textFile, setUploadedTextFile] = useState<string>("");

    // Values for center table
    const [xValues, setxValues] = useState<string>("");
    const [qValues, setqValues] = useState<string>("");
    const [sValues, setsValues] = useState<string>("");
    const [pValues, setpValues] = useState<string>("");
    const [iValues, setiValues] = useState<string>("");
    const [fValues, setfValues] = useState<string>("");
    
    // Values for creating the acceptor
    const rejectionKeywords:string[] = ["HELL", "REJECT"]
    const [xScannedString, setXScannedString] = useState<string>("");
    const [initialStatesList, setInitialStatesList] = useState<string[]>([]);
    const [parsedStates, setParsedStates] = useState<States>({});
    const [parsedStatesDirection, setParsedStatesDirection] = useState<StatesDirection>({});

    // Value for result
    const [executeResult, setExecuteResult] = useState<string>("");

    // On text file change
    useEffect(() => {

        // Skip on mount or invalid file entry
        if (isNullOrUndefined(textFile)){
            setHasUploaded(false);
            return;
        }
     
        const parseTextFile = (textFileToParse: string) => {

            var linesInText: string[] = textFileToParse.split("\n");
    
            // Check if number of lines follow syntax
            if (linesInText.length < 7) {
                setUploadedTextFile("");
                alert("Incorrect number of lines in text file.");
                return;
            } 
            
            // Check if each line matches the syntax
            const inputStringPattern: RegExp = /^\s*[Xx]\s*=(.*)\s*$/;
            const allStatesPattern: RegExp = /^\s*[Qq]\s*=\s*\{\s*([a-zA-Z0-9_]+)((\s*,\s*[a-zA-Z0-9_]+)*\s*)\s*\}\s*$/;
            const inputAlphabetPattern: RegExp = /^\s*[sS]\s*=\s*\{\s*([a-zA-Z0-9_]+)((\s*,\s*[a-zA-Z0-9_]+)*\s*)\s*\}\s*$/;
            const initialStatesPattern: RegExp = /^\s*[iI]\s*=\s*\{\s*([a-zA-Z0-9_]+)((\s*,\s*[a-zA-Z0-9_]+)*\s*)\s*\}\s*$/;
            const finalStatesPattern: RegExp = /^\s*[Ff]\s*=\s*\{\s*([a-zA-Z0-9_]+)((\s*,\s*[a-zA-Z0-9_]+)*\s*)\s*\}\s*$/;
            const programPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\]\s*((right|left)((\s*\([#a-zA-Z0-9_]+,\s*[#a-zA-Z0-9_]+\)\s*)+)|REJECT|HELL|ACCEPT)\s*$/;
    
            var xValueInText: string = linesInText[0].trim();
            var qValueInText: string = linesInText[1].trim();
            var sValueInText: string = linesInText[2].trim();
            var iValueInText: string = linesInText[3].trim();
            var fValueInText: string = linesInText[4].trim();
            var pValueInText: string = linesInText[5].trim();
            var pStates: string[] = linesInText.slice(6);
    
            if (!inputStringPattern.test(xValueInText)) {
                alert("Incorrect syntax for input string X (line 1).");
                return;
            } else if (!allStatesPattern.test(qValueInText)) {
                alert("Incorrect syntax for all states Q (line 2).");
                return;
            } else if (!inputAlphabetPattern.test(sValueInText)) {
                alert("Incorrect syntax for input alphabet S (line 3).");
                return;
            } else if (!initialStatesPattern.test(iValueInText)) {
                alert("Incorrect syntax for initial states I (line 4).");
                return;
            } else if (!finalStatesPattern.test(fValueInText)) {
                alert("Incorrect syntax for final states F (line 5).");
                return;
            } else if (pValueInText.toLowerCase() !== "p") {
                alert("No symbol 'P' (line 6).");
                return;
            }
    
            var line: number = 7;
            var passed: boolean = true;
            var statesToBeCreated: States = {};
            var statesDirectionToBeCreated: StatesDirection = {};
            pStates.every(state => {
    
                if (!programPattern.test(state.trim())) {
                    alert(`Incorrect syntax for line ${line}.`);
                    setParsedStates({});
                    passed = false;
                    return false;
                }
    
                let programMatchedPattern: RegExpMatchArray = state.match(programPattern)!;
                let stateName =  programMatchedPattern[1].trim();
                let statesInput = programMatchedPattern[2].trim();
    
                if (statesInput === 'REJECT' || statesInput === 'HELL' || statesInput === 'ACCEPT') {
                    statesToBeCreated[stateName] = statesInput;
                } else {
                    let stateDirection: string = programMatchedPattern[3];
                    let stateTransitions: string[] = programMatchedPattern[4].split(/[()]+/)
                                            .filter(e => e.trim() !== "" && e !== " " && e !== "\r");
                    let charState: CharactersPerState = {};

                    stateTransitions.forEach(characterPerState => {
                        let splittedCharacters: string[] = characterPerState.split(',');
                        charState[splittedCharacters[0].trim()] = splittedCharacters[1].trim();
                    });

                    statesDirectionToBeCreated[stateName] = stateDirection!;
                    statesToBeCreated[stateName] = charState!; 
                    
                }
                
                line++;
                return true;
            });
    
            if (!passed) { 
                return; 
            }
    
            // Set values to be displayed in the UI
            let qValuesForUI = qValueInText.match(allStatesPattern);
            let sValuesForUI = sValueInText.match(inputAlphabetPattern);
            let iValuesForUI = iValueInText.match(initialStatesPattern);
            let fValuesForUI = fValueInText.match(finalStatesPattern);
            
            setxValues(xValueInText.match(inputStringPattern)![1]);
            setqValues(removeSpacesAndConcat(qValuesForUI![1], qValuesForUI![2]));
            setsValues(removeSpacesAndConcat(sValuesForUI![1], sValuesForUI![2]));
            setiValues(removeSpacesAndConcat(iValuesForUI![1], iValuesForUI![2]));
            setfValues(removeSpacesAndConcat(fValuesForUI![1], fValuesForUI![2]));
            setpValues(pStates.join("\n"));
    
            // Set values to be used for execution
            let tempInitialStatesList: string[] = removeSpacesAndConcat(iValuesForUI![1], iValuesForUI![2]).split(",");
            tempInitialStatesList.forEach(item => {
                item = item.trim();
            });
    
            let tempFinalStatesList: string[] = removeSpacesAndConcat(fValuesForUI![1], fValuesForUI![2]).split(",");
            tempFinalStatesList.forEach(item => {
                item = item.trim();
            });
    
            setInitialStatesList(tempInitialStatesList);
            setParsedStates(statesToBeCreated);
            setParsedStatesDirection(statesDirectionToBeCreated);
    
        }
   
        setHasUploaded(true);
        setExecuteResult("");
        parseTextFile(textFile);

    }, [textFile])

    useEffect(() => {
   
        setXScannedString(`#${xValues}#`)

    }, [xValues])

    const textFileCallback = (textFileUploaded: string) => {
        setUploadedTextFile(textFileUploaded);
    }

    const executeProgram = (event: any) => {
        event.preventDefault();

        if (!hasUploaded) {
            alert('No file uploaded.');
            return;
        } else if (isEmptyObject(parsedStates)) {
            alert('The uploaded text file was not successfully parsed.')
            return;
        }

        //Set initial configurations
        let stringIndex: number = 1; 
        let programResult: string = "REJECTED"; 
        let currentState: string = initialStatesList[0];
        let characterToBeScanned: string = xScannedString[stringIndex];
        let currentStateInstructions: CharactersPerState | string = parsedStates[currentState];

        while (!rejectionKeywords.includes(currentStateInstructions as string)) {

            // End if accepting state
            if (currentStateInstructions === "ACCEPT") {
                programResult = "ACCEPTED";
                break;
            }

            // Check the next character to be scanned based on the index counter
            characterToBeScanned = xScannedString[stringIndex];
            
            // Assign the current state using the transition of the current character
            currentState = (currentStateInstructions as CharactersPerState)[characterToBeScanned];

            // console.log(characterToBeScanned);
            // console.log(currentStateInstructions);
            // console.log("===========================");

            // Increment / decrement based on the direction of the state
            if (parsedStatesDirection[currentState] === 'right') {
                stringIndex++;
            } else  {
                stringIndex--;
            }

            // Set the current instructions based on the transitioned state
            currentStateInstructions = parsedStates[currentState];

        } 

        setExecuteResult(programResult);

    }

    return ( 
        <div className="TwoWayAcceptor">

            <div className="twa-legend">

                <table className="twa-legend-table">         
                    <thead>
                        <tr>
                            <th className="title"colSpan={2}>Formal Definition</th>
                        </tr>
                    </thead>
                    <thead>
                        <tr>
                            <td>Symbol</td>
                            <td className="description">Description</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="symbol">M</td>
                            <td className="description">(Q, S, P, I, F)</td>
                        </tr>
                        <tr>
                            <td className="symbol">X</td>
                            <td className="description">input string</td>
                        </tr>
                        <tr>
                            <td className="symbol">Q</td>
                            <td className="description">set of internal states</td>
                        </tr>
                        <tr>
                            <td className="symbol">S</td>
                            <td className="description">input alphabet</td>
                        </tr>
                        <tr>
                            <td className="symbol">P</td>
                            <td className="description">the program</td>
                        </tr>
                        <tr>
                            <td className="symbol">I</td>
                            <td className="description">initial states</td>
                        </tr>
                        <tr>
                            <td className="symbol">F</td>
                            <td className="description">final states</td>
                        </tr>
                    </tbody>
                </table>

                <FileUploader parentCallback = { textFileCallback } />

            </div>

            <div className="twa-tuple">

                <table className="twa-tuple-table">
                    <thead>
                        <tr>
                            <th className="title" colSpan={2}>Parsed Values</th>
                        </tr>
                    </thead>
                    <thead>
                        <tr>
                            <td className="symbol">Symbol</td>
                            <td className="description">Values</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="symbol">X</td>
                            <td className="description">
                                <input id="xInput" type="text" value = { xValues } onChange={(e) => setxValues(e.target.value)}/>
                            </td>
                        </tr>
                        <tr>
                            <td className="symbol">Q</td>
                            <td className="description">{ qValues }</td>
                        </tr>
                        <tr>
                            <td className="symbol">S</td>
                            <td className="description">{ sValues }</td>
                        </tr>
                        <tr>
                            <td className="symbol">I</td>
                            <td className="description">{ iValues }</td>
                        </tr>
                        <tr>
                            <td className="symbol">F</td>
                            <td className="description">{ fValues }</td>
                        </tr>
                    </tbody>
                </table>

                <button onClick={executeProgram} className="default-btn">Execute</button>

            </div>

            <div className="twa-program">
                
                <table className="twa-program-table">
                    <thead>
                        <tr>
                            <td className="title">P</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td id="p-description">{ pValues }</td>
                        </tr>
                    </tbody>
                </table>


                <div className="result-panel">
                    <label className="result-label">Result: </label>
                    <label className="result-value">{ executeResult }</label>
                </div>

            </div>
        
        </div>
     );
}
 
export default TwoWayAcceptor;