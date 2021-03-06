import './TuringMachine.scss'
import { useEffect, useState } from 'react';
import FileUploader from '../Utilities/FileUploader';
import { isEmptyObject, isNullOrUndefined } from "../Utilities/GeneralHelpers";
import { Modules } from '../Interfaces/Modules';
import { comparisonModule, constantModule, copyModule, moveModule, operationModule, shiftModule } from './TuringModuleDefinitions';
import { addCharacterToTheEnd, trimTrailingChars } from '../Utilities/StringHelpers';
import { TuringLogging } from '../Interfaces/TuringLogging';

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

    //Values for logging
    const [executionLogList, setExecutionLogList] = useState<TuringLogging[]>([])

    // On upload of a text file for parsing
    useEffect(() => {

        // Skip on mount or invalid file entry
        if (isNullOrUndefined(textFile)){
            setHasUploaded(false);
            return;
        } else if (textFile === 'empty') {
            return;
        }

        const parseTextFile = (textFileToParse: string) => {

            var linesInText: string[] = textFileToParse.split("\n");
            
            if (linesInText.length === 0) {
                alert("Text file has no modules.");
                return;
            }

            // Reset right table
            setTapeIndexValue('');
            setOutputValue('');
            setExecutionLogList([]);

            // Patterns for syntax checking per line
            const oneParameterPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\s*\]\s*(const|shl|shr|copy)\s*-\s*(\d+)\s*$/;
            const twoParameterPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\s*\]\s*(move)\s*-\s*(\d+)\s*-\s*(\d+)\s*$/;
            const comparisonParameterPattern: RegExp = /^\s*([a-zA-Z0-9_]+)\s*\]\s*(ife|ifne|ifg|ifge|ifl|ifle|goto)\s*\(\s*(\d+)\s*\)\s*$/;
            const operationPattern: RegExp= /^\s*([a-zA-Z0-9_]+)\s*\]\s*(add|mult|monus|div|swap|halt)\s*$/;

            // Parse each line 
            var modulesToBeCreated: Modules= {};
            var tempModulesValues: string[] = linesInText.slice(1);
            var passed: boolean = true;
            var lineNumber: number = 2;
            
            tempModulesValues.every(module => {

                let trimmedModule: string = module.replace(/\r?\n|\r/g, '');

                if (oneParameterPattern.test(trimmedModule)) {
                    
                    let parsedModule = trimmedModule.match(oneParameterPattern);
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
                        firstParameter: parsedModule![3].trim()
                    };


                 } else if (twoParameterPattern.test(trimmedModule)) {

                    let parsedModule = trimmedModule.match(twoParameterPattern);
                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedModule![2].trim(),
                        type: 'move',
                        firstParameter: parsedModule![3].trim(),
                        secondParameter: parsedModule![4].trim(),
                    }

                } else if (comparisonParameterPattern.test(trimmedModule)) {

                    let parsedModule = trimmedModule.match(comparisonParameterPattern);         
                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedModule![2].trim(),
                        type: 'comparison',
                        firstParameter: parsedModule![3].trim()
                    };

                } else if (operationPattern.test(trimmedModule)) {

                    let parsedModule = trimmedModule.match(operationPattern);
                    modulesToBeCreated[parsedModule![1].trim()] = {
                        command: parsedModule![2].trim(),
                        type: 'operation'
                    };
                
                } else {
                    alert(`Incorrect syntax for line ${lineNumber}.`);
                    passed = false;
                    return false;
                }

                lineNumber++;
                return true;
            });

            if (!passed) { 
                setModuleToDisplayValues("");
                setOmegaValue("");
                setHasUploaded(false);
                setModuleValues({});
                setExecutionLogList([]);
                return; 
            }

            // Display text to left table
            setModuleToDisplayValues(linesInText.slice(1).join("\n"));
            setOmegaValue(linesInText[0]);

            setHasUploaded(true);
            setModuleValues(modulesToBeCreated);
        }

        parseTextFile(textFile);

    }, [textFile])

    const textFileCallback = (textFileUploaded: string) => {
        setUploadedTextFile(textFileUploaded);
        // Set to empty to clear the variable for file uploaded
        setUploadedTextFile('empty');
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
        var moduleIndex: number = 0;
        var currentLogId: number = 0;
        var currentCommand: string = '';
        var omegaInput: string = omegaValue;
        var modulesKeys: string[] = Object.keys(moduleValues);
        var tempLogList: TuringLogging[] = [];

        while (currentCommand !== 'halt') {

            let currentState: string = modulesKeys[moduleIndex];
            let currentModule = moduleValues[currentState];
            let currentType: string = currentModule.type;
            let willJump: boolean = false;
            currentCommand = currentModule.command;

            if (currentCommand === 'goto') {
                moduleIndex = modulesKeys.indexOf(currentModule.firstParameter!)
                willJump = true;
            } else if (currentCommand !== 'halt') {

                if (currentType === 'shift') {

                    [omegaInput, omegaIndex] = shiftModule(omegaInput, omegaIndex, currentCommand, +currentModule.firstParameter!, moduleIndex);

                } else if (currentType === 'constant') {

                    [omegaInput, omegaIndex] = constantModule(omegaInput, omegaIndex, +currentModule.firstParameter!, moduleIndex);

                } else if (currentType === 'copy') {

                    [omegaInput, omegaIndex] = copyModule(omegaInput, omegaIndex, +currentModule.firstParameter!, moduleIndex);
                    
                } else if (currentType === 'move') {

                    [omegaInput, omegaIndex] = moveModule(omegaInput, omegaIndex, +currentModule.firstParameter!, +currentModule.secondParameter!, moduleIndex);

                } else if (currentType === 'comparison') {
                    
                    let result: [string, number, number] = comparisonModule(omegaInput, omegaIndex, currentCommand, moduleIndex);
                    omegaInput = result[0];
                    omegaIndex = result[1];

                    if (result[2] === 1) {
                        moduleIndex = modulesKeys.indexOf(currentModule.firstParameter!)
                        willJump = true;
                    }

                } else if (currentType === 'operation') {

                    [omegaInput, omegaIndex] = operationModule(omegaInput, omegaIndex, currentCommand, moduleIndex);

                } 

            }
            
            // console.log(`Current ID: ${currentLogId + 1}`);
            // console.log(`Current State: ${currentState}`);
            // console.log(`Current Command: ${currentCommand}`)
            // console.log(`Current Tape Head: ${omegaIndex}`)
            // console.log(`Current Omega: ${omegaInput}`)
            // console.log(`=================================`)

            let omegaForDisplay: string = trimTrailingChars(omegaInput, "#");
            omegaForDisplay = addCharacterToTheEnd(omegaForDisplay, "#");

            let executionLogItem: TuringLogging = {
                id: currentLogId,
                command: `${currentState}] ${currentCommand}`,
                tapeHead: omegaIndex,
                omega: omegaForDisplay
            };
            tempLogList.push(executionLogItem);
            currentLogId++;

            if (!willJump) {
                moduleIndex++;
            }

        }

        setExecutionLogList(tempLogList);
        setTapeIndexValue(String(omegaIndex));
        omegaInput = trimTrailingChars(omegaInput, "#");
        omegaInput = addCharacterToTheEnd(omegaInput, "#");
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
                                    <label id="omegaLabel">??</label>
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
                            <th className="title" colSpan={3}>Execution Log</th>
                        </tr>
                        <tr className="tm-logs-headers">
                            <td> 
                                <div className="command">
                                </div>
                            </td>
                            <td>
                                <div className="tape-head">
                                ??
                                </div>
                            </td>
                            <td>
                                <div className="omega">
                                ??
                                </div>
                            </td>
                        </tr>
                    </thead>
                    <tbody className="tm-logs-tbody">

                        {executionLogList.map((log) => (

                            <tr key={log.id}>
                                <td style={{width: "4.1rem"}}>
                                    {log.command}
                                </td>
                                <td style={{textAlign: "center"}}>
                                    {log.tapeHead}
                                </td>
                                <td>
                                    <input readOnly className="tm-logs-item" type="text" value = {log.omega}/>
                                </td>
                            </tr>

                        ))}
                    </tbody>
                </table>

                <div className="tm-logs-output">

                    <div className="tm-logs-output-tapehead">
                        <label id="tapeLabel"> ?? </label>
                        <label>:</label>
                        <input readOnly id="tapeInput" type="text" value = {tapeIndexValue} onChange={(e) => setTapeIndexValue(e.target.value)}/>
                    </div>
                    <div className="tm-logs-output-result">
                        <label id="outputLabel"> ?? </label>
                        <label>:</label>
                        <input readOnly  id="outputInput" type="text" value = {outputValue} onChange={(e) => setOutputValue(e.target.value)}/>
                    </div>

                </div>

            </div>

        </div>
     );
}
 
export default TuringMachine;