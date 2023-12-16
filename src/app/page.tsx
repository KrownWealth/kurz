"use client"
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import Header from './components/Header'
import { useState } from 'react';

export default function Home() {
  const [history, setHistory] = useState<string[]>([]);

  return (
    <main>
       <Header />
       <div className="flex p-4">
       <Sidebar history={history} />
        <MainContent setHistory={setHistory} />
      <RightSidebar />
       </div>
    
    </main>
  )
}
