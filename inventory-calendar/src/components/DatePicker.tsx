import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from './Icons';

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInWeek(date: Date, weekStart: Date): boolean {
  const start = new Date(weekStart);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return date >= start && date <= end;
}

interface DatePickerProps {
  selectedWeekStart: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
}

export default function DatePicker({ selectedWeekStart, onSelectDate, onClose }: DatePickerProps) {
  const [viewYear, setViewYear] = useState(selectedWeekStart.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedWeekStart.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startDow = firstDayOfMonth.getDay(); // 0=Sun
  const mondayOffset = startDow === 0 ? -6 : 1 - startDow;
  const gridStart = new Date(viewYear, viewMonth, 1 + mondayOffset);

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    // Stop if we've gone past the month
    if (cursor.getMonth() !== viewMonth && w >= 3) break;
  }

  const handleSelect = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const goToToday = () => {
    onSelectDate(today);
    onClose();
  };

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-full mt-2 bg-surface-white border border-border-medium rounded-2xl shadow-xl z-50 p-5 w-[320px] animate-fade-in"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-grey-200 transition-colors text-text-low"
        >
          <ChevronLeft />
        </button>
        <span className="text-base font-medium text-text-high">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-grey-200 transition-colors text-text-low"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-xs text-text-low text-center py-1.5 font-medium"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7">
        {weeks.flat().map((date, idx) => {
          const isCurrentMonth = date.getMonth() === viewMonth;
          const isToday = isSameDay(date, today);
          const inSelectedWeek = isInWeek(date, selectedWeekStart);

          return (
            <button
              key={idx}
              onClick={() => handleSelect(date)}
              className={`
                h-[36px] text-sm rounded-lg transition-colors relative
                ${!isCurrentMonth ? 'text-text-low/40' : ''}
                ${isCurrentMonth && !inSelectedWeek && !isToday ? 'text-text-high hover:bg-grey-200' : ''}
                ${inSelectedWeek && isCurrentMonth ? 'bg-bg-light-accent text-blue-400 font-medium' : ''}
                ${isToday && !inSelectedWeek ? 'bg-blue-400 text-white font-medium' : ''}
                ${isToday && inSelectedWeek ? 'bg-blue-400 text-white font-medium' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Today button */}
      <button
        onClick={goToToday}
        className="mt-3 w-full py-2 text-sm text-blue-400 font-medium rounded-xl hover:bg-bg-light-accent transition-colors"
      >
        Today
      </button>
    </div>
  );
}

export { getMonday };
