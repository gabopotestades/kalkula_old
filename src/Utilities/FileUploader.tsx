import React, { useRef } from 'react';

const FileUploader = () => {

    const handleFileInput = () => {
        
    }

    return ( 
        <div className="file-uploader">
            <input type="file" onChange={handleFileInput}/>
        </div>
    )
}
 
export default FileUploader;