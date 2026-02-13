import { useState } from 'react';
import Header from './components/Header';
import Sidebar, { type Page } from './components/Sidebar';
import InventoryCalendar from './components/InventoryCalendar';
import RoomsAndRatePlansPage from './components/RoomsAndRatePlansPage';
import { RoomsProvider } from './components/RoomsContext';

function App() {
  const [activePage, setActivePage] = useState<Page>('calendar');

  return (
    <RoomsProvider>
      <div className="flex flex-col h-screen bg-surface-white font-lexend">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activePage={activePage} onNavigate={setActivePage} />
          {activePage === 'calendar' ? <InventoryCalendar /> : <RoomsAndRatePlansPage />}
        </div>
      </div>
    </RoomsProvider>
  );
}

export default App;
