import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronRightSmall, ChevronLeft, ChevronRight, CalendarNavIcon } from './Icons';
import RatePlanDrawer, { type RatePlanDetails } from './RatePlanDrawer';
import DatePicker, { getMonday } from './DatePicker';
import { useRooms } from './RoomsContext';

interface RoomInventory {
  available: number;
  sold: number;
}

interface CalendarRatePlan {
  name: string;
  prices: number[];
  details: RatePlanDetails;
}

interface CalendarRoom {
  name: string;
  inventory: RoomInventory[];
  ratePlans: CalendarRatePlan[];
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDayHeader(date: Date) {
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateInventory(weekStart: Date, roomIndex: number): RoomInventory[] {
  const result: RoomInventory[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + d);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + roomIndex * 7919;
    result.push({
      available: Math.floor(seededRand(seed) * 130),
      sold: Math.floor(seededRand(seed + 1) * 100),
    });
  }
  return result;
}

function generatePrices(weekStart: Date, roomIndex: number, planIndex: number, basePrice: number): number[] {
  const result: number[] = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + d);
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate() + roomIndex * 3571 + planIndex * 1237;
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const variance = Math.floor(seededRand(seed) * 2000) - 500;
    result.push(basePrice + variance + (isWeekend ? 1000 : 0));
  }
  return result;
}

function formatPrice(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

function EditableCell({
  value,
  onChange,
  displayFormat = 'number',
}: {
  value: number;
  onChange: (v: number) => void;
  displayFormat?: 'number' | 'price';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = useCallback(() => {
    setEditing(false);
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onChange(parsed);
    } else {
      setDraft(String(value));
    }
  }, [draft, onChange, value]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className="w-full bg-transparent text-center outline-none border border-blue-400 rounded px-1 py-0.5 text-inherit"
      />
    );
  }

  const display = displayFormat === 'price' ? formatPrice(value) : String(value);

  return (
    <span
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className="cursor-pointer hover:bg-blue-400/5 rounded px-1 py-0.5 transition-colors"
    >
      {display}
    </span>
  );
}

export default function InventoryCalendar() {
  const { roomTemplates, updatePlanDetails, deletePlan } = useRooms();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(today));
  const [localOverrides, setLocalOverrides] = useState<Record<string, CalendarRoom>>({});
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [drawerTarget, setDrawerTarget] = useState<{ roomIdx: number; planIdx: number } | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Build calendar rooms from context + generate inventory/prices
  const rooms: CalendarRoom[] = useMemo(() => {
    const weekKey = weekStart.toISOString();
    return roomTemplates.map((tmpl, roomIdx) => {
      const overrideKey = `${weekKey}-${roomIdx}`;
      if (localOverrides[overrideKey]) return localOverrides[overrideKey];
      return {
        name: tmpl.name,
        inventory: generateInventory(weekStart, roomIdx),
        ratePlans: tmpl.plans.map((p, planIdx) => ({
          name: p.name,
          prices: generatePrices(weekStart, roomIdx, planIdx, p.basePrice),
          details: p.details,
        })),
      };
    });
  }, [roomTemplates, weekStart, localOverrides]);

  // Clear overrides when week changes
  useEffect(() => {
    setLocalOverrides({});
  }, [weekStart]);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        dayName: DAY_NAMES[i],
        label: formatDayHeader(d),
        isToday: isSameDay(d, today),
      };
    });
  }, [weekStart, today]);

  const goToPrevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleDateSelect = (date: Date) => {
    setWeekStart(getMonday(date));
  };

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const setRoomOverride = (roomIdx: number, room: CalendarRoom) => {
    const weekKey = weekStart.toISOString();
    const overrideKey = `${weekKey}-${roomIdx}`;
    setLocalOverrides((prev) => ({ ...prev, [overrideKey]: room }));
  };

  const updateInventory = (roomIdx: number, dayIdx: number, field: 'available' | 'sold', value: number) => {
    const room = { ...rooms[roomIdx] };
    const inv = [...room.inventory];
    inv[dayIdx] = { ...inv[dayIdx], [field]: value };
    room.inventory = inv;
    setRoomOverride(roomIdx, room);
  };

  const updateRatePrice = (roomIdx: number, planIdx: number, dayIdx: number, value: number) => {
    const room = { ...rooms[roomIdx] };
    const plans = [...room.ratePlans];
    const plan = { ...plans[planIdx] };
    const prices = [...plan.prices];
    prices[dayIdx] = value;
    plan.prices = prices;
    plans[planIdx] = plan;
    room.ratePlans = plans;
    setRoomOverride(roomIdx, room);
  };

  const handleDrawerUpdate = useCallback(
    (updated: RatePlanDetails) => {
      if (!drawerTarget) return;
      updatePlanDetails(drawerTarget.roomIdx, drawerTarget.planIdx, updated);
    },
    [drawerTarget, updatePlanDetails],
  );

  const handleDrawerDelete = useCallback(() => {
    if (!drawerTarget) return;
    deletePlan(drawerTarget.roomIdx, drawerTarget.planIdx);
    setDrawerTarget(null);
  }, [drawerTarget, deletePlan]);

  const openDrawerPlan =
    drawerTarget !== null
      ? rooms[drawerTarget.roomIdx]?.ratePlans[drawerTarget.planIdx]
      : null;

  return (
    <div className="flex-1 p-6 pt-8 overflow-auto">
      {/* Title bar */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold text-text-high leading-9">
          Inventory calendar
        </h1>
        <div ref={navRef} className="relative">
          <div className="bg-grey-200 flex gap-3 items-center justify-center px-4 py-2.5 rounded-xl">
            <button onClick={goToPrevWeek} className="text-text-low hover:text-text-high transition-colors">
              <ChevronLeft />
            </button>
            <button onClick={() => setShowDatePicker((v) => !v)} className="hover:opacity-70 transition-opacity">
              <CalendarNavIcon />
            </button>
            <button onClick={goToNextWeek} className="text-text-low hover:text-text-high transition-colors">
              <ChevronRight />
            </button>
          </div>
          {showDatePicker && (
            <DatePicker
              selectedWeekStart={weekStart}
              onSelectDate={handleDateSelect}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex gap-4">
        {/* Room names column */}
        <div className="flex flex-col gap-4 w-[182px] shrink-0">
          <div className="h-[68px] flex items-center">
            <span className="text-base text-text-low">All rooms</span>
          </div>
          {rooms.map((room, i) => {
            const isExpanded = expandedRows.has(i);
            return (
              <div
                key={i}
                className="bg-bg-light-grey flex flex-col justify-center px-4 rounded-xl cursor-pointer select-none transition-all"
                style={{ minHeight: isExpanded ? `${74 + room.ratePlans.length * 44}px` : '72px' }}
                onClick={() => toggleRow(i)}
              >
                <div className="flex items-center gap-1 h-[74px]">
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-sm text-text-high">{room.name}</span>
                    {isExpanded && <span className="text-xs text-text-low">Rate plans</span>}
                  </div>
                  {isExpanded ? <ChevronUp className="text-text-low" /> : <ChevronRightSmall className="text-text-low" />}
                </div>
                {isExpanded && (
                  <div className="relative pl-6">
                    <div
                      className="absolute left-0 top-0 w-px bg-border-medium"
                      style={{ height: `${room.ratePlans.length * 44 - 10}px` }}
                    />
                    {room.ratePlans.map((plan, pIdx) => (
                      <div key={pIdx} className="flex items-center h-[44px] relative">
                        <div className="absolute left-[-24px] top-1/2 w-[20px] h-px bg-border-medium" />
                        <span
                          className={`text-sm underline cursor-pointer transition-colors ${
                            plan.details.active ? 'text-text-high hover:text-blue-400' : 'text-text-low line-through'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrawerTarget({ roomIdx: i, planIdx: pIdx });
                          }}
                        >
                          {plan.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Data grid */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-bg-light-grey flex items-center rounded-xl py-3 relative">
            {days.map((day, i) => (
              <div
                key={i}
                className={`flex-1 flex flex-col gap-1 items-center justify-center text-center relative z-10 ${
                  day.isToday ? 'text-blue-400' : 'text-text-low'
                }`}
              >
                {day.isToday && <div className="absolute inset-y-[-5px] -inset-x-2 bg-bg-light-accent rounded-xl -z-10" />}
                <span className="text-sm leading-5">{day.dayName}</span>
                <span className="text-base leading-[22px]">{day.label}</span>
              </div>
            ))}
          </div>

          {rooms.map((room, rowIdx) => {
            const isExpanded = expandedRows.has(rowIdx);
            return (
              <div key={rowIdx} className="flex flex-col gap-0">
                <div
                  className="flex items-center border border-border-medium rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => toggleRow(rowIdx)}
                >
                  {room.inventory.map((inv, colIdx) => (
                    <div
                      key={colIdx}
                      className="flex-1 flex flex-col gap-0.5 items-center p-3 bg-surface-white border-r border-border-medium last:border-r-0 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xl text-text-high leading-7">
                        <EditableCell value={inv.available} onChange={(v) => updateInventory(rowIdx, colIdx, 'available', v)} />
                      </span>
                      <span className="text-sm text-text-low leading-5">
                        <EditableCell value={inv.sold} onChange={(v) => updateInventory(rowIdx, colIdx, 'sold', v)} /> sold
                      </span>
                    </div>
                  ))}
                </div>
                {isExpanded &&
                  room.ratePlans.map((plan, planIdx) => (
                    <div
                      key={planIdx}
                      className={`flex items-center pr-px mt-[-1px] ${!plan.details.active ? 'opacity-40' : ''}`}
                    >
                      {plan.prices.map((price, dayIdx) => (
                        <div
                          key={dayIdx}
                          className="flex-1 flex items-center justify-center p-3 bg-bg-light-grey border border-border-medium mr-[-1px] text-center text-sm text-text-high"
                        >
                          <EditableCell value={price} onChange={(v) => updateRatePrice(rowIdx, planIdx, dayIdx, v)} displayFormat="price" />
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>

      {openDrawerPlan && drawerTarget && (
        <RatePlanDrawer
          plan={openDrawerPlan.details}
          onClose={() => setDrawerTarget(null)}
          onUpdate={handleDrawerUpdate}
          onDelete={handleDrawerDelete}
        />
      )}
    </div>
  );
}
