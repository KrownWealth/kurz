import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";

interface SearchVideoProps {
  onClose: () => void;
  videoUrl: string;
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
}

const SearchVideo: React.FC<SearchVideoProps> = ({ onClose, videoUrl, setVideoUrl }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);

      // Simulate loading for 2 seconds (replace this with actual video loading logic)
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };

    if (videoUrl) {
      loadVideo();
    }
  }, [videoUrl]);

  return (
    <div className="search-video-container">
      <div className="search-video-content border">
        <input
          type="text"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="Enter video URL"
          style={{ width: "100%", paddingLeft: "4px"}}
        />
        
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default SearchVideo;
