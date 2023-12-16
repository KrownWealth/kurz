"use client"
import React, { useState } from "react";
import useUpload from "../hooks/useUpload";
import ReactPlayer from "react-player";
import { Document, Page, pdfjs } from "react-pdf";

import SearchVideo from "./SearchVideos";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;


const HandleFileUpload : React.FC = () => {
  const { 
    uploadedFile,
    fileType,
    showSearchVideo,
    videoUrl,
    history,
    setVideoUrl,
    updateHistory,
    updateVideoUrlHistory,
    handleCloseSearch,
    handleVideoUrlButtonClick,
    getRootProps,
    getInputProps, 
  } = useUpload();

  return(
    <>
     <div className="flex text-center justify-center items-center space-x-8 pb-12">
        <div {...getRootProps()} className="cursor-pointer">
        <input
          {...getInputProps()}
          onChange={(e) => updateHistory(e.target.files?.[0]?.name || "")}
        />
          <button className="active">Upload File</button>
        </div>
        <div>
           <button onClick={handleVideoUrlButtonClick}>Video URL</button>
        </div>
      </div>
    <div>
    {showSearchVideo && (
          <SearchVideo
            onClose={handleCloseSearch}
            videoUrl={videoUrl}
            setVideoUrl={(url) => {
              setVideoUrl(url);
              updateVideoUrlHistory(url);
            }}
          />
        )}

    </div>
      <div className="border border-dashed h-80 overflow-hidden">
        {fileType === "video" && uploadedFile && (
          <ReactPlayer url={URL.createObjectURL(uploadedFile)} controls width="100%" height="100%" />
        )}
        {fileType === "pdf" && uploadedFile && (
          <Document file={URL.createObjectURL(uploadedFile)}>
            <Page pageNumber={1} width={400} />
          </Document>
        )}
        {uploadedFile && !fileType && <p>Unsupported file type</p>}
        {videoUrl && <ReactPlayer url={videoUrl} controls width="100%" height="100%" />}
      </div>
    </>
  )
}
export default HandleFileUpload