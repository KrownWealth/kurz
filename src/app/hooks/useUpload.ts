import { useState, useCallback } from "react";
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

interface UseUploadProps {
  uploadedFile: File | null;
  fileType: string | null;
  showSearchVideo: boolean;
  videoUrl: string;
  history: string[];
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
  updateHistory: (fileName: string) => void;
  updateVideoUrlHistory: (videoUrl: string) => void;
  handleCloseSearch: () => void;
  handleVideoUrlButtonClick: () => void;
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: (props?: DropzoneInputProps) => DropzoneInputProps;
  
}

const useUpload = (): UseUploadProps => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [showSearchVideo, setShowSearchVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const handleCloseSearch = () => {
    setShowSearchVideo(false);
  };

  const handleVideoUrlButtonClick = () => {
    setShowSearchVideo(true);
  };

  const updateHistory = (fileName: string) => {
    const truncatedName = fileName.length > 15 ? fileName.substring(0, 15) + "..." : fileName;
    setHistory([...history, truncatedName]);
  };

  const updateVideoUrlHistory = (videoUrl: string) => {
    setHistory([...history, `Video URL: ${videoUrl}`]);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploadedFile(file);

    if (file.type.includes("video")) {
      setFileType("video");
    } else if (file.type.includes("pdf")) {
      setFileType("pdf");
    } else {
      setFileType(null);
    }
    const truncatedName = file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name;
    setHistory([...history, truncatedName]);
  }, [history]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: ["video/*", "application/pdf"] });

  return {
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
  };
};

export default useUpload;
