import { useState, useEffect } from "react";
import './TwoWayAcceptor.scss'
import FileUploader from "../Utilities/FileUploader";
import { isNullOrUndefined } from "../Utilities/GeneralHelpers";

const TwoWayAcceptor = () => {

    const [hasUploaded, setHasUploaded] = useState<boolean>(false);
    const [textFile, setUploadedTextFile] = useState<string>("");

    useEffect(() => {

        // Skip on mount or invalid file entry
        if (isNullOrUndefined(textFile)){
            setHasUploaded(false);
            return;
        }
        
        setHasUploaded(true);
        parseTextFile(textFile);

    }, [textFile])

    const textFileCallback = (textFileUploaded: string) => {
        setUploadedTextFile(textFileUploaded);
    }

    const parseTextFile = (textFileToParse: string) => {
        var linesInText: string[] = textFileToParse.split("\n");

        if (linesInText.length < 7) {
            setUploadedTextFile("");
            alert("Incorrect number of lines in text file.");
            return;
        }

        

    }

    const executeProgram = (event: any) => {
        event.preventDefault();

        if (!hasUploaded) {
            alert('No file uploaded.');
            return;
        }

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
                            <td className="description" id="x-description"></td>
                        </tr>
                        <tr>
                            <td className="symbol">Q</td>
                            <td className="description" id="q-description"></td>
                        </tr>
                        <tr>
                            <td className="symbol">S</td>
                            <td className="description" id="s-descripton"></td>
                        </tr>
                        <tr>
                            <td className="symbol">I</td>
                            <td className="description" id="i-descripton"></td>
                        </tr>
                        <tr>
                            <td className="symbol">F</td>
                            <td className="description" id="f-descripton"></td>
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
                            <td id="p-description"></td>
                        </tr>
                    </tbody>
                </table>


                <div className="result-panel">
                    <label className="result-label">Result: </label>
                    <label className="result-value">ACCEPTED</label>
                </div>

            </div>
        </div>
     );
}
 
export default TwoWayAcceptor;