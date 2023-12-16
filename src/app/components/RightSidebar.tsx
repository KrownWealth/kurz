
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineFileDownload } from "react-icons/md";
import SummaryBtn from "./buttons/SummaryBtn"
import TutorExpBtn from "./buttons/TutorExpBtn";
import QuizBtn from "./buttons/QuizBtn";
import GameBtn from "./buttons/GameBtn";

const RightSidebar: React.FC = () => {
  return (
    <div className="right-side">
    <div className="flex space-x-4 border-b p-4">
   <SummaryBtn />
   <TutorExpBtn />
   <QuizBtn />
   <GameBtn />
    </div>
<div className="flex justify-between p-4 border-b">
<div><h2 className="font-bold">Chat</h2></div>
<div className="flex space-x-4">
<MdOutlineFileDownload />
<RiDeleteBinLine  />
  
</div>

</div>
    </div>
  );
};

export default RightSidebar;