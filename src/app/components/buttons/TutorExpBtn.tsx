
import { TiUserOutline } from "react-icons/ti";

const TutorExpBtn : React.FC = () =>{
  return(
    <button className="flex items-center">
      <span  className="mr-2"><TiUserOutline /></span>
      <p className="text-[14px]">  Tutor Explanation</p>
      </button>
        
  )
}
export default TutorExpBtn;