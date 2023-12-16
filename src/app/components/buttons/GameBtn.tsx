import {   PiGameControllerThin } from "react-icons/pi"

const GameBtn: React.FC = () => {
  return(
    <button className="flex items-center">
      <span  className="mr-2"><PiGameControllerThin /></span>
      <p className="text-[14px]">Game</p></button>
      
  )
}
export default GameBtn;