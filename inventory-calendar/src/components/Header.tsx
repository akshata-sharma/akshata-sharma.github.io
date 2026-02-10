import { HelpIcon, UserIcon } from './Icons';

export default function Header() {
  return (
    <header className="bg-surface-white border-b border-border-medium flex items-center justify-between px-6 py-3">
      <div className="text-xl font-semibold tracking-tight">
        <span className="text-blue-400 italic">scapia</span>{' '}
        <span className="text-text-high">stays</span>
      </div>
      <div className="flex gap-2 items-center">
        <button className="bg-grey-200 rounded-full p-2 hover:bg-border-medium transition-colors">
          <HelpIcon />
        </button>
        <button className="bg-grey-200 rounded-full p-2 hover:bg-border-medium transition-colors">
          <UserIcon />
        </button>
      </div>
    </header>
  );
}
