import { useRef } from 'react';
import { isNullOrUndefined } from './GeneralHelpers';

const FileUploader = ({ parentCallback }: any) => {

    const fileInput = useRef<HTMLInputElement>(null);

    const handleClick = (event: any) => {
        event.preventDefault();
        fileInput.current?.click();
    };

    const handleChange = (event: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0]);
        fileReader.onloadend = () => {
            if (!isNullOrUndefined(fileReader.result))
                parentCallback(fileReader.result);
        }
    };

    return ( 
        <div className="file-uploader">
            <input type="file" ref={fileInput} onChange={handleChange} style={{display: "none"}} accept=".txt"/>
            <button onClick={handleClick} className="default-btn">Upload</button>
        </div>
    )
}
 
export default FileUploader;