import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';

export default function Home() {

  return (
    <main className="flex">
      <Sidebar />
      <MainContent />
      <RightSidebar />
    </main>
  )
}
