import { useState } from 'react';
import {
  MenuIcon,
  ChevronDown,
  ChevronUp,
  HomeIcon,
  BookingsIcon,
  PropertyIcon,
  PaymentsIcon,
  PromotionsIcon,
  CalendarIcon,
  CalendarViewIcon,
  RoomsIcon,
  PhoneIcon,
  EmailIcon,
} from './Icons';

export type Page = 'calendar' | 'ratePlans';

const navItems = [
  { label: 'Home', icon: HomeIcon },
  { label: 'Bookings', icon: BookingsIcon },
  { label: 'Property info', icon: PropertyIcon, expandable: true },
  { label: 'Payments', icon: PaymentsIcon },
  { label: 'Promotions', icon: PromotionsIcon },
];

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [ratesOpen, setRatesOpen] = useState(true);

  return (
    <aside className="bg-surface-grey flex flex-col w-[188px] min-h-screen pb-6 pt-4 px-3">
      {/* Menu toggle */}
      <div className="border-b border-border-medium flex gap-2 items-center justify-center py-3">
        <MenuIcon />
        <span className="flex-1 text-sm text-text-mid">Menu</span>
        <ChevronDown className="text-text-mid" />
      </div>

      {/* Hotel selector */}
      <div className="bg-white border border-border-medium flex gap-2 items-center justify-center p-3 rounded-xl mt-4">
        <div className="flex-1 flex flex-col">
          <span className="text-sm text-text-mid">Silvotel hotel</span>
          <span className="text-xs text-text-low">Indore</span>
        </div>
        <ChevronDown className="text-text-mid" />
      </div>

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex gap-2 items-center px-1.5 py-2 rounded-lg w-full text-left hover:bg-bg-light-accent/30 transition-colors"
          >
            <span className="text-text-low">
              <item.icon />
            </span>
            <span className="flex-1 text-sm text-text-low">{item.label}</span>
            {item.expandable && <ChevronDown className="text-text-low" />}
          </button>
        ))}

        {/* Rates and Inventory section */}
        <div className="flex flex-col">
          <button
            onClick={() => setRatesOpen(!ratesOpen)}
            className="flex gap-2 items-center px-1.5 py-2 rounded-lg w-full text-left"
          >
            <span className="text-blue-400">
              <CalendarIcon />
            </span>
            <span className="flex-1 text-sm text-blue-400">Rates and inventory</span>
            {ratesOpen ? (
              <ChevronUp />
            ) : (
              <ChevronDown className="text-blue-400" />
            )}
          </button>

          {ratesOpen && (
            <>
              <button
                onClick={() => onNavigate('calendar')}
                className={`flex gap-2 items-center px-1.5 py-2 rounded-lg w-full text-left transition-colors ${
                  activePage === 'calendar'
                    ? 'bg-bg-light-accent'
                    : 'hover:bg-bg-light-accent/30'
                }`}
              >
                <span className={activePage === 'calendar' ? 'text-blue-400' : 'text-text-low'}>
                  <CalendarViewIcon />
                </span>
                <span className={`flex-1 text-sm ${activePage === 'calendar' ? 'text-blue-400' : 'text-text-low'}`}>
                  Calendar view
                </span>
              </button>
              <button
                onClick={() => onNavigate('ratePlans')}
                className={`flex gap-2 items-center px-1.5 py-2 rounded-lg w-full text-left transition-colors ${
                  activePage === 'ratePlans'
                    ? 'bg-bg-light-accent'
                    : 'hover:bg-bg-light-accent/30'
                }`}
              >
                <span className={activePage === 'ratePlans' ? 'text-blue-400' : 'text-text-low'}>
                  <RoomsIcon />
                </span>
                <span className={`flex-1 text-sm ${activePage === 'ratePlans' ? 'text-blue-400' : 'text-text-low'}`}>
                  Rooms and Rate plans
                </span>
              </button>
            </>
          )}
        </div>
      </nav>

      {/* BD Support */}
      <div className="flex flex-col gap-2 pt-4 px-3 mt-auto">
        <span className="text-[10px] uppercase tracking-[1px] text-text-low">BD Support</span>
        <span className="text-sm text-text-high">Rahul Verma</span>
        <div className="flex gap-1 items-center">
          <PhoneIcon />
          <span className="text-xs text-text-low">92812912129</span>
        </div>
        <div className="flex gap-1 items-center">
          <EmailIcon />
          <span className="text-xs text-text-low">rahul@scapia.cards</span>
        </div>
      </div>
    </aside>
  );
}
