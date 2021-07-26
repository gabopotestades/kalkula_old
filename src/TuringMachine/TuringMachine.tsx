import './TuringMachine.scss'
import { useEffect, useState } from 'react';
import FileUploader from '../Utilities/FileUploader';
import { isNullOrUndefined } from "../Utilities/GeneralHelpers";
import { Modules } from '../Interfaces/Modules';

const TuringMachine = () => {

    //Values for upload
    const [hasUploaded, setHasUploaded] = useState<boolean>(false);
    const [textFile, setUploadedTextFile] = useState<string>("");

    // Value for result
    const [executeResult, setExecuteResult] = useState<string>("");    
    
    // Values for the left table
    const [moduleToDisplayValues, setModuleToDisplayValues] = useState<string>("");

    // Values for the right table
    const [tapeIndexValue, setTapeIndexValue] = useState<string>("");
    const [outputValue, setOutputValue] = useState<string>("");

    // Values for the Turing Modules
    const [moduleValues, setModuleValues] = useState<Modules>({});

    useEffect(() => {

        // Skip on mount or invalid file entry
        if (isNullOrUndefined(textFile)){
            setHasUploaded(false);
            return;
        }

        const parseTextFile = (textFileToParse: string) => {

            var linesInText: string[] = textFileToParse.split("\n");
            
            if (linesInText.length === 0) {
                alert("Text file has no modules.");
                return;
            }
        
            // Display text to left table
            setModuleToDisplayValues(linesInText.join("\n"));

            // Patterns for syntax checking per line
            const oneParameterPattern: RegExp = /^\s*(const|shl|shr|copy)\s*-\s*(\d+)\s*$/;
            const twoParameterPattern: RegExp = /^\s*(move)\s*-\s*(d+)\s*-\s*(d+)\s*$/;
            const parenParameterPattern: RegExp = /^\s*(ife|ifne|ifg|ifge|ifl|ifle|goto)\s*\(\s*(d+)\s*\)\s*$/;
            const operationPattern: RegExp= /^\s*(add|mult|monus|div|halt)\s*$/;

            // Parse each line 
            var modulesToBeCreated: Modules= {};
            var tempModulesValues: string[] = linesInText;
            tempModulesValues.every(module => {

            });
            

        }

        setHasUploaded(true);
        setExecuteResult("");
        parseTextFile(textFile);

    }, [textFile])

    const textFileCallback = (textFileUploaded: string) => {
        setUploadedTextFile(textFileUploaded);
    }

    const executeProgram = (event: any) => {
        event.preventDefault();

    }

    return ( 
        <div className="TuringMachine">

            <div className="tm-modules">

                <table className="tm-modules-table">
                    <thead>
                        <tr className="title">Modules Definition</tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td id="modules-description">
                                <div className="modules-description-cell">
                                    {moduleToDisplayValues}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="tm-modules-buttons">
                    <FileUploader parentCallback = { textFileCallback } />
                    <button id="executeButton" onClick={executeProgram} className="default-btn">Execute</button>
                </div>

            </div>

            <div className="tm-logs">

                <table className="tm-logs-table">
                    <thead>
                        <tr>
                            <th className="title" colSpan={2}>Execution Log</th>
                        </tr>
                    </thead>
                    <tbody className="tm-logs-tbody">
                    </tbody>
                </table>

                <div className="tm-logs-output">

                    <div className="tm-logs-output-tapehead">
                        <label id="tapeLabel"> Tape Head </label>
                        <label>:</label>
                        <input readOnly id="tapeInput" type="text" value = { tapeIndexValue } onChange={(e) => setTapeIndexValue(e.target.value)}/>
                    </div>
                    <div className="tm-logs-output-result">
                        <label id="outputLabel"> Output String </label>
                        <label> :</label>
                        <input readOnly  id="outputInput" type="text" value = { outputValue } onChange={(e) => setOutputValue(e.target.value)}/>
                    </div>

                </div>

            </div>

        </div>
     );
}
 
export default TuringMachine;