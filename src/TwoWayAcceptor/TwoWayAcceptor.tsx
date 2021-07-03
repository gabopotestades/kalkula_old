import { useState } from "react";
import FileUploader from "../Utilities/FileUploader";

const TwoWayAcceptor = () => {

    const [textFile, setUploadedTextFile] = useState("");

    const textFileCallback = (textFileUploaded: any) => {
        setUploadedTextFile(textFileUploaded);
    }

    return ( 
        <div className="TwoWayAcceptor">
            <form>

                <FileUploader parentCallback = { textFileCallback } />
                <h1>{textFile}</h1>

            </form>
        </div>
     );
}
 
export default TwoWayAcceptor;