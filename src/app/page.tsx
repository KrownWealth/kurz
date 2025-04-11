import { SummaryView } from "../../views"
import { Header } from "../components/shared"


export default function HomePage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Header />
      <SummaryView />

    </div>
  )
}
