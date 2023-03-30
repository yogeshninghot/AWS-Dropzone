
import { useState,useCallback } from 'react'
import "../component/dropzone.css"
import {FaUpload} from "react-icons/fa"
import {useDropzone} from 'react-dropzone'
import AWS from "aws-sdk"




 AWS.config.update({
     accessKeyID:process.env.REACT_APP_AWS_ACCESS_KEY_ID,
     secretKeyAccess:process.env.REACT_APP_AWS_SECRET_ACCESS_KEY_ID,
     region:process.env.REACT_APP_AWS_REGION,


 })

 const s3 = new AWS.S3()  // create new exm s3
 const bucketName = process.env.REACT_APP_S3_BUCKET

export const Dropdown = () => {
  // state hooks
    const [progress,setProgess]=useState(false);
    const [uploading,setUploading]=useState(false);
    const [uploaded,setUploaded]=useState(false);
    const [fileKey,setFileKey]=useState(false);
    
//  onDrop function
   const onDrop = useCallback(async(acceptedFiles) => {
          // aceepet file in arry
         const file = acceptedFiles[0];
         if(!file.type.startsWith("video/mp4")){
          alert("Please upload MP4 format file only")
           
          return
         } 
        //  set params of files
          const params = {
            Bucket : bucketName,
            Key :`${Date.now()}--${file.name}`,
            Body: file,
            ContentType:file.type
          }
         setUploading(true)
         
        
      //  upload to s3 bucket
         s3.upload(params).on("httpUploadProgress",(event)=>{
            console.log(event)
            const progress = Math.round((event.loaded*100)/event.total)
            setProgess(progress)
         })
        //  err handle
         .send((err,data)=>{
          if(err){
             console.log(err)
             alert("File uplaoded Failed")
             setUploading(false)
             
             return
            }
             //  last
           setUploaded(true)
           setFileKey(params.Key)
           setUploading(false)
           
         })
       
    }, [])
    // dropzone hook
    const {getRootProps, getInputProps} = useDropzone({onDrop})

     const reset = ()=>{
      setUploaded(false)
      setProgess(0)
      setFileKey("")
      
     }

     return (
    
   
    <div className='container'>
    <div className="dropzone"{...getRootProps()}>
        <input {...getInputProps()} accept="video/mp4" />
        {uploaded ? (
          <div>
            <p>Video Uploaded Successfully</p>
            <video src={`https://${bucketName}.s3.amazonaws.com/${fileKey}`} controls width="320" height="240" />
            <button onClick={reset} className="btn-reset">Upload Another video</button>
          </div>
        ) : (<div>
          
           <p>Drag and drop an mp4 file here, or click to browse.</p>
           <button  className='btn' {...getInputProps} accept="video/mp4"><FaUpload className='icon'/>click to Uplad</button>
        </div>
          
        )}
      </div>
      {uploading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}>{progress}%</div>
        </div>
      )}
      

     
    </div>
    
  )
}

export default Dropdown;