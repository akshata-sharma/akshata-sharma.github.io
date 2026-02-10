import { useState, useCallback } from 'react';
import { useRooms } from './RoomsContext';
import { ChevronDown, ChevronUp } from './Icons';
import RatePlanDrawer, { type RatePlanDetails } from './RatePlanDrawer';

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        active
          ? 'bg-green-50 text-green-700'
          : 'bg-red-50 text-red-600'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          active ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function RatePlansPage() {
  const { roomTemplates, updatePlanDetails, deletePlan } = useRooms();
  const [expandedRooms, setExpandedRooms] = useState<Set<number>>(
    () => new Set(roomTemplates.map((_, i) => i)),
  );
  const [drawerTarget, setDrawerTarget] = useState<{
    roomIdx: number;
    planIdx: number;
  } | null>(null);

  const toggleRoom = (idx: number) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
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

  const openPlan =
    drawerTarget !== null
      ? roomTemplates[drawerTarget.roomIdx]?.plans[drawerTarget.planIdx]
      : null;

  return (
    <div className="flex-1 p-6 pt-8 overflow-auto">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-text-high leading-9">
          Rate plans
        </h1>
        <p className="text-sm text-text-low mt-1">
          Manage rate plans across all room types
        </p>
      </div>

      {/* Room sections */}
      <div className="flex flex-col gap-6">
        {roomTemplates.map((room, roomIdx) => {
          const isExpanded = expandedRooms.has(roomIdx);
          return (
            <div
              key={roomIdx}
              className="border border-border-medium rounded-2xl overflow-hidden"
            >
              {/* Room header */}
              <button
                onClick={() => toggleRoom(roomIdx)}
                className="w-full flex items-center justify-between px-6 py-4 bg-bg-light-grey hover:bg-border-medium/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-medium text-text-high">
                    {room.name}
                  </h2>
                  <span className="text-xs text-text-low bg-white px-2 py-0.5 rounded-full border border-border-medium">
                    {room.plans.length} plan{room.plans.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-text-low" />
                ) : (
                  <ChevronDown className="text-text-low" />
                )}
              </button>

              {/* Rate plans table */}
              {isExpanded && (
                <div>
                  {/* Table header */}
                  <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.8fr] gap-4 px-6 py-3 border-b border-border-medium bg-surface-white">
                    <span className="text-xs font-medium text-text-low uppercase tracking-wider">
                      Plan name
                    </span>
                    <span className="text-xs font-medium text-text-low uppercase tracking-wider">
                      Meal plan
                    </span>
                    <span className="text-xs font-medium text-text-low uppercase tracking-wider">
                      Base rate
                    </span>
                    <span className="text-xs font-medium text-text-low uppercase tracking-wider">
                      Min stay
                    </span>
                    <span className="text-xs font-medium text-text-low uppercase tracking-wider">
                      Status
                    </span>
                  </div>

                  {/* Plan rows */}
                  {room.plans.length === 0 ? (
                    <div className="px-6 py-8 text-center text-sm text-text-low">
                      No rate plans configured for this room.
                    </div>
                  ) : (
                    room.plans.map((plan, planIdx) => (
                      <div
                        key={planIdx}
                        className={`grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.8fr] gap-4 px-6 py-4 border-b border-border-medium last:border-b-0 bg-surface-white hover:bg-grey-200/50 transition-colors cursor-pointer ${
                          !plan.details.active ? 'opacity-60' : ''
                        }`}
                        onClick={() =>
                          setDrawerTarget({ roomIdx, planIdx })
                        }
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-text-high">
                            {plan.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-text-mid">
                            {plan.details.mealPlanType}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-text-high font-medium">
                            {formatCurrency(plan.details.baseRate)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-text-mid">
                            {plan.details.minLengthOfStay} days
                          </span>
                        </div>
                        <div className="flex items-center">
                          <StatusBadge active={plan.details.active} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drawer */}
      {openPlan && drawerTarget && (
        <RatePlanDrawer
          plan={openPlan.details}
          onClose={() => setDrawerTarget(null)}
          onUpdate={handleDrawerUpdate}
          onDelete={handleDrawerDelete}
        />
      )}
    </div>
  );
}
