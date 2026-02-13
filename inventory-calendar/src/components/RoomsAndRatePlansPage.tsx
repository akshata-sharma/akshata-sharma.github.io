import { useState, useEffect, useRef, useCallback } from 'react';
import { useRooms, type PlanTemplate } from './RoomsContext';
import {
  ChevronRightSmall,
  ChevronDown,
  PlusIcon,
  MoreVerticalIcon,
  EditPencilIcon,
  TrashIcon,
} from './Icons';
import RatePlanDrawer, { type RatePlanDetails } from './RatePlanDrawer';
import RoomDrawer from './RoomDrawer';
import EditRatePlansDrawer from './EditRatePlansDrawer';

const ROOM_COLORS = [
  'from-amber-700 to-amber-900',
  'from-stone-600 to-stone-800',
  'from-slate-500 to-slate-700',
  'from-zinc-600 to-zinc-800',
  'from-amber-800 to-yellow-950',
];

type DrawerState =
  | { type: 'closed' }
  | { type: 'viewPlan'; roomIdx: number; planIdx: number }
  | { type: 'addPlan'; roomIdx: number }
  | { type: 'viewRoom'; roomIdx: number }
  | { type: 'addRoom' }
  | { type: 'editPlans'; roomIdx: number };

const EMPTY_PLAN: RatePlanDetails = {
  name: '',
  mealPlanType: '',
  cancellationPolicy: 'Free cancellation up to 72 hours of check in',
  inclusions: '',
  baseRate: 0,
  extraChildRate: 0,
  extraChildMealRate: 0,
  extraAdultMealRate: 0,
  minLengthOfStay: 1,
  active: true,
};

export default function RoomsAndRatePlansPage() {
  const { roomTemplates, updatePlanDetails, deletePlan, addRoom, deleteRoom, addPlan, updateRoom } = useRooms();
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [drawer, setDrawer] = useState<DrawerState>({ type: 'closed' });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    if (menuOpen !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpen]);

  const closeDrawer = useCallback(() => setDrawer({ type: 'closed' }), []);

  const handlePlanUpdate = useCallback(
    (updated: RatePlanDetails) => {
      if (drawer.type === 'viewPlan') {
        updatePlanDetails(drawer.roomIdx, drawer.planIdx, updated);
      }
    },
    [drawer, updatePlanDetails],
  );

  const handlePlanDelete = useCallback(() => {
    if (drawer.type === 'viewPlan') {
      deletePlan(drawer.roomIdx, drawer.planIdx);
      setDrawer({ type: 'closed' });
    }
  }, [drawer, deletePlan]);

  const handleNewPlanCreate = useCallback(
    (updated: RatePlanDetails) => {
      if (drawer.type === 'addPlan') {
        const plan: PlanTemplate = {
          name: updated.name || 'New Plan',
          mealType: updated.mealPlanType,
          basePrice: updated.baseRate,
          details: updated,
        };
        addPlan(drawer.roomIdx, plan);
        setDrawer({ type: 'closed' });
      }
    },
    [drawer, addPlan],
  );

  const handleRoomSave = useCallback(
    (data: { name: string; roomCount: number; maxGuests: number }) => {
      if (drawer.type === 'addRoom') {
        addRoom({
          name: data.name,
          roomCount: data.roomCount,
          maxGuests: data.maxGuests,
          plans: [],
        });
        setDrawer({ type: 'closed' });
      } else if (drawer.type === 'viewRoom') {
        updateRoom(drawer.roomIdx, data);
        setDrawer({ type: 'closed' });
      }
    },
    [drawer, addRoom, updateRoom],
  );

  const handleDeleteRoom = useCallback(
    (idx: number) => {
      if (deleteConfirm === idx) {
        deleteRoom(idx);
        setDeleteConfirm(null);
        setMenuOpen(null);
      } else {
        setDeleteConfirm(idx);
      }
    },
    [deleteConfirm, deleteRoom],
  );

  const displayedRooms = roomTemplates.slice(0, pageSize);
  const totalRooms = 240;

  return (
    <div className="flex-1 p-6 pt-8 overflow-auto">
      {/* Title row */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[28px] font-semibold text-text-high leading-9">
          Rooms and Rate Plans
        </h1>
        <button
          onClick={() => setDrawer({ type: 'addRoom' })}
          className="flex items-center gap-2 px-8 py-3 bg-blue-400 text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="w-5 h-5" />
          Add Room
        </button>
      </div>

      {/* Table */}
      <div className="border border-border-medium rounded-2xl overflow-hidden bg-surface-white">
        {/* Table header */}
        <div className="grid grid-cols-[1.4fr_0.9fr_2.4fr_1.3fr] gap-4 px-6 py-3.5 border-b border-border-medium">
          <span className="text-sm text-text-low">Room name</span>
          <span className="text-sm text-text-low">Room details</span>
          <span className="text-sm text-text-low">Rate plans</span>
          <span className="text-sm text-text-low text-center">Actions</span>
        </div>

        {/* Table rows */}
        {displayedRooms.map((room, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[1.4fr_0.9fr_2.4fr_1.3fr] gap-4 px-6 py-5 border-b border-border-medium last:border-b-0 items-center"
          >
            {/* Room name with thumbnail */}
            <div className="flex items-center gap-3">
              <div
                className={`w-[48px] h-[48px] rounded-lg bg-gradient-to-br ${ROOM_COLORS[idx % ROOM_COLORS.length]} flex-shrink-0`}
              />
              <span className="text-sm font-medium text-text-high">
                {room.name}
              </span>
            </div>

            {/* Room details */}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-text-high">
                {room.roomCount} rooms
              </span>
              <span className="text-xs text-text-low">
                {room.maxGuests} guests allowed
              </span>
              <button
                onClick={() => setDrawer({ type: 'viewRoom', roomIdx: idx })}
                className="text-sm text-blue-400 mt-1 text-left hover:underline w-fit"
              >
                View details
              </button>
            </div>

            {/* Rate plan chips */}
            <div className="flex flex-wrap gap-2">
              {room.plans.map((plan, pIdx) => (
                <button
                  key={pIdx}
                  onClick={() => setDrawer({ type: 'viewPlan', roomIdx: idx, planIdx: pIdx })}
                  className="flex items-center gap-0.5 px-3 py-1.5 rounded-full border border-border-medium text-sm text-text-mid hover:bg-grey-200 transition-colors"
                >
                  {plan.name}
                  <ChevronRightSmall className="w-4 h-4 text-text-low" />
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDrawer({ type: 'addPlan', roomIdx: idx })}
                className="flex items-center gap-1.5 px-4 py-2 border border-border-medium rounded-lg text-sm text-text-mid hover:bg-grey-200 transition-colors whitespace-nowrap"
              >
                <PlusIcon className="w-4 h-4" />
                Add rate plan
              </button>
              <div
                className="relative"
                ref={menuOpen === idx ? menuRef : undefined}
              >
                <button
                  onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                  className="p-2 rounded-lg hover:bg-grey-200 transition-colors text-text-low"
                >
                  <MoreVerticalIcon />
                </button>
                {menuOpen === idx && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-border-medium rounded-xl shadow-lg py-2 z-10 animate-fade-in min-w-[180px]">
                    <button
                      onClick={() => {
                        setMenuOpen(null);
                        setDrawer({ type: 'editPlans', roomIdx: idx });
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-mid hover:bg-grey-200 transition-colors"
                    >
                      <EditPencilIcon className="w-5 h-5 text-text-low" />
                      Edit rate plans
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(idx)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                        deleteConfirm === idx
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-text-mid hover:bg-grey-200'
                      }`}
                    >
                      <TrashIcon className={`w-5 h-5 ${deleteConfirm === idx ? 'text-red-600' : 'text-text-low'}`} />
                      {deleteConfirm === idx ? 'Confirm delete?' : 'Delete room'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 mt-4 text-sm text-text-low">
        <span>Showing</span>
        <div className="relative">
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="appearance-none border border-border-medium rounded-lg pl-3 pr-7 py-1 text-sm text-text-mid bg-white cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-low pointer-events-none" />
        </div>
        <span>of {totalRooms}</span>
      </div>

      {/* Drawers */}
      {drawer.type === 'viewPlan' && roomTemplates[drawer.roomIdx]?.plans[drawer.planIdx] && (
        <RatePlanDrawer
          plan={roomTemplates[drawer.roomIdx].plans[drawer.planIdx].details}
          onClose={closeDrawer}
          onUpdate={handlePlanUpdate}
          onDelete={handlePlanDelete}
        />
      )}

      {drawer.type === 'addPlan' && (
        <RatePlanDrawer
          plan={EMPTY_PLAN}
          onClose={closeDrawer}
          onUpdate={handleNewPlanCreate}
          onDelete={closeDrawer}
          isNew
        />
      )}

      {drawer.type === 'viewRoom' && roomTemplates[drawer.roomIdx] && (
        <RoomDrawer
          room={roomTemplates[drawer.roomIdx]}
          onClose={closeDrawer}
          onSave={handleRoomSave}
        />
      )}

      {drawer.type === 'addRoom' && (
        <RoomDrawer
          room={null}
          onClose={closeDrawer}
          onSave={handleRoomSave}
        />
      )}

      {drawer.type === 'editPlans' && roomTemplates[drawer.roomIdx] && (
        <EditRatePlansDrawer
          room={roomTemplates[drawer.roomIdx]}
          onClose={closeDrawer}
          onSelectPlan={(planIdx) =>
            setDrawer({ type: 'viewPlan', roomIdx: drawer.roomIdx, planIdx })
          }
          onAddPlan={() =>
            setDrawer({ type: 'addPlan', roomIdx: drawer.roomIdx })
          }
        />
      )}
    </div>
  );
}
