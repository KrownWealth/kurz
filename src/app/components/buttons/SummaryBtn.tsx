import { FaBookOpen } from "react-icons/fa";

const SummaryBtn = () => {
  return(
    <button className="flex items-center active">
    <span className="mr-2"><FaBookOpen /></span>
    <p className="text-[14px]">Summary</p>
  </button>
       
  )
}
export default SummaryBtn;