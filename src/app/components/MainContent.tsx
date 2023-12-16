"use client"
import ContentBtns from "./ContentBtns";
import HandleFileUpload from "./HandleFileUpload";


const MainContent: React.FC = () => {
  

  return (
    <div className="main-content">
     <HandleFileUpload />
      <ContentBtns />
    </div> 
  );
};

export default MainContent;
