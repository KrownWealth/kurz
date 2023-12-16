import SummaryBtn from "./buttons/SummaryBtn"
import RaiseHandBtn from "./buttons/RaiseHandBtn"
import TestKnowBtn from "./buttons/TestKnowBtn"
import GenerateBtn from "./buttons/GenerateBtn"
import InviteBtn from "./buttons/InviteBtn"

const ContentBtns = () => {
  return(
    <div className="flex pt-16 text-center justify-center items-center space-x-4">
        <SummaryBtn />
        <RaiseHandBtn />
       <TestKnowBtn />
       <GenerateBtn />
        <InviteBtn />
      </div>
  )
}
export default ContentBtns