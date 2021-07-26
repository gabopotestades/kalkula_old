import './TuringMachine.scss'
import { useEffect, useState } from 'react';
import FileUploader from '../Utilities/FileUploader';
import { isEmptyObject, isNullOrUndefined } from "../Utilities/GeneralHelpers";
import { Modules } from '../Interfaces/Modules';
import { comparisonModule, constantModule, copyModule, moveModule, operationModule, shiftModule } from './TuringModuleDefinitions';

const TuringMachine = () => {

    // Values for upload
    const [hasUploaded, setHasUploaded] = useState<boolean>(false);
    const [textFile, setUploadedTextFile] = useState<string>("");
    
    // Values for the left table
    const [moduleToDisplayValues, setModuleToDisplayValues] = useState<string>("");

    // Values for the right table
    const [tapeIndexValue, setTapeIndexValue] = useState<string>("");
    const [outputValue, setOutputValue] = useState<string>("");

    // Values for the Turing Modules
    const [omegaValue, setOmegaValue] = useState<string>('');
    const [moduleValues, setModuleValues] = useState<Modules>({});

    // On upload of a text file for parsing
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
            setModuleToDisplayValues(linesInText.slice(1).join("\n"));

            // Reset right table
            setTapeIndexValue('');
            setOutputValue('');

            // Patterns for syntax checking per line
            const oneParameterPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\s*\]\s*(const|shl|shr|copy)\s*-\s*(\d+)\s*$/;
            const twoParameterPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\s*\]\s*(move)\s*-\s*(\d+)\s*-\s*(\d+)\s*$/;
            const comparisonParameterPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\s*\]\s*(ife|ifne|ifg|ifge|ifl|ifle|goto)\s*\(\s*(\d+)\s*\)\s*$/;
            const operationPattern: RegExp= /^\s*([a-zA-Z0-9_]+)\s*\]\s*(add|mult|monus|div|swap|halt)\s*$/;

            setOmegaValue(linesInText[0]);

            // Parse each line 
            var modulesToBeCreated: Modules= {};
            var tempModulesValues: string[] = linesInText.slice(1);
            var passed: boolean = true;
            var lineNumber: number = 2;
            
            tempModulesValues.every(module => {

                if (oneParameterPattern.test(module)) {

                    let parsedModule = module.match(oneParameterPattern);
                    let parsedCommand: string = parsedModule![2].trim();
                    let tempType: string = ''
                    
                    if (parsedCommand === 'shl' || parsedCommand === 'shr') {
                        tempType = 'shift';
                    } else if (parsedCommand === 'const') {
                        tempType = 'constant'
                    } else if (parsedCommand === 'copy') {
                        tempType = 'copy'
                    }

                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedCommand,
                        type: tempType,
                        firstParameter: +parsedModule![3].trim()
                    };


                 } else if (twoParameterPattern.test(module)) {

                    let parsedModule = module.match(twoParameterPattern);
                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedModule![2].trim(),
                        type: 'move',
                        firstParameter: +parsedModule![3].trim(),
                        secondParameter: +parsedModule![4].trim(),
                    }

                } else if (comparisonParameterPattern.test(module)) {

                    let parsedModule = module.match(comparisonParameterPattern);         
                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedModule![2].trim(),
                        type: 'comparison',
                        firstParameter: +parsedModule![3].trim()
                    };

                } else if (operationPattern.test(module)) {

                    let parsedModule = module.match(operationPattern);
                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedModule![2].trim(),
                        type: 'operation'
                    };
                
                } else {
                    alert(`Incorrect syntax for line ${lineNumber}.`);
                    setModuleValues({});
                    passed = false;
                    return false;
                }

                lineNumber++;
                return true;
            });

            if (!passed) { 
                return; 
            }

            setModuleValues(modulesToBeCreated);
        }

        setHasUploaded(true);
        parseTextFile(textFile);

    }, [textFile])

    const textFileCallback = (textFileUploaded: string) => {
        setUploadedTextFile(textFileUploaded);
    }

    const executeProgram = (event: any) => {

        event.preventDefault();

        if (!hasUploaded) {
            alert('No file uploaded.');
            return;
        } else if (isEmptyObject(moduleValues)) {
            alert('The uploaded text file was not successfully parsed.')
            return;
        }

        // Setup initial configuration before execution
        var omegaIndex: number = 0;
        var omegaInput: string = omegaValue;
        var modulesKeys: string[] = Object.keys(moduleValues);
        var currentState: string = modulesKeys[2];
        var currentCommand: string = '';

        while (currentCommand !== 'halt') {

            var currentModule = moduleValues[currentState];
            var currentType: string = currentModule.type;
            currentCommand = currentModule.command;

            if (currentCommand === 'goto') {
                currentState = String(currentModule.firstParameter);
            } else if (currentCommand !== 'halt') {

                if (currentType === 'shift') {

                    omegaIndex = shiftModule(omegaInput, omegaIndex, currentCommand, currentModule.firstParameter!);

                } else if (currentType === 'constant') {

                    let result: [string, number] = constantModule(omegaInput, omegaIndex, currentModule.firstParameter!);
                    omegaInput = result[0];
                    omegaIndex = result[1];
                    console.log('test')
                    console.log(result);
                    break;

                } else if (currentType === 'copy') {

                    let result: [string, number] = copyModule(omegaInput, omegaIndex, currentModule.firstParameter!);
                    omegaInput = result[0];
                    omegaIndex = result[1];
                    
                } else if (currentType === 'move') {

                    let result: [string, number] = moveModule(omegaInput, omegaIndex, currentModule.firstParameter!, currentModule.secondParameter!);
                    omegaInput = result[0];
                    omegaIndex = result[1];
                    
                } else if (currentType === 'comparison') {
                    
                    let result: [string, number] = comparisonModule(omegaInput, omegaIndex, currentCommand);
                    omegaInput = result[0];

                } else if (currentType === 'operation') {

                    omegaInput = operationModule(omegaInput, omegaIndex, currentCommand);

                } 

            }

        }

        setTapeIndexValue(String(omegaIndex));
        setOutputValue(omegaInput);

    }

    return ( 
        <div className="TuringMachine">

            <div className="tm-modules">

                <table className="tm-modules-table">
                    <thead>
                        <tr className="title">
                            <td>
                                Modules Definition
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='omega-tr'>
                            <td>
                                <div className="omega-string">
                                    <label id="omegaLabel">ω</label>
                                    <input readOnly id="omegaInput" type="text" value = {omegaValue} onChange={(e) => setOmegaValue(e.target.value)}/>
                                </div>
                            </td>
                        </tr>

                        <tr className='modules-tr'>
                            <td id="modules-description">
                                <div className="modules-description-cell">{moduleToDisplayValues}</div>
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
                        <tr>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

                <div className="tm-logs-output">

                    <div className="tm-logs-output-tapehead">
                        <label id="tapeLabel"> Tape Head </label>
                        <label>:</label>
                        <input readOnly id="tapeInput" type="text" value = {tapeIndexValue} onChange={(e) => setTapeIndexValue(e.target.value)}/>
                    </div>
                    <div className="tm-logs-output-result">
                        <label id="outputLabel"> Output String </label>
                        <label>:</label>
                        <input readOnly  id="outputInput" type="text" value = {outputValue} onChange={(e) => setOutputValue(e.target.value)}/>
                    </div>

                </div>

            </div>

        </div>
     );
}
 
export default TuringMachine;