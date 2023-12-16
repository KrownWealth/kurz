import { MdRocketLaunch } from "react-icons/md";

const Header: React.FC  = () =>{
  return(
    <div className="flex justify-between p-4 px-6 border-b ">
      <div className="">Logo</div>
      <div className="flex space-x-4">
        <span className="text-xl"><MdRocketLaunch />
       </span>
       <p>Hello...</p>
        </div>
    </div>
  )
}
export default Header;