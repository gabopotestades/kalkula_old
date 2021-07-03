import { useState } from "react";
import './TwoWayAcceptor.scss'
import FileUploader from "../Utilities/FileUploader";

const TwoWayAcceptor = () => {

    const [textFile, setUploadedTextFile] = useState("");

    const textFileCallback = (textFileUploaded: any) => {
        setUploadedTextFile(textFileUploaded);
    }

    return ( 
        <div className="TwoWayAcceptor">

            <div className="twaLegend">

                <div className="legendText">
                    
                    
                    <label>
                        <b className="symbol">X</b>&#8194;= input string
                    </label>

                    <label>
                        <b className="symbol">M</b>&#8194;= (Q, S, P, I, F)
                    </label>
                    
                    <label>
                        <b className="symbol">Q</b>&#8194;= set of internal states
                    </label>
                    
                    <label>
                        <b className="symbol">S</b>&#8194;= input alphabet
                    </label>
                    
                    <label>
                        <b className="symbol">P</b>&#8194;= a program
                    </label>
                    
                    <label>
                        <b className="symbol">I</b>&#8194;= initial states
                    </label>
                    
                    <label>
                        <b className="symbol">F</b>&#8194;= final states
                    </label>

                </div>

                <FileUploader parentCallback = { textFileCallback } />
            </div>

            <div className="twaTuple">

                <label>
                    X
                    <input type="text" name="txtInputString"/>
                </label>

                <label>
                    Q
                    <input type="text" name="txtInternalStates"/>
                </label>

                <label>
                    S
                    <input type="text" name="txtInputAlphabet"/>
                </label>

                <label>
                    I
                    <input type="text" name="txtInitialStates"/>
                </label>

                <label>
                    F
                    <input type="text" name="txtFinalStates"/>
                </label>

                <label>
                    P
                    <textarea></textarea>
                </label>

            </div>
        </div>
     );
}
 
export default TwoWayAcceptor;