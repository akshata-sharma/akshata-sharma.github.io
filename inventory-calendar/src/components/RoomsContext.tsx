import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type RatePlanDetails } from './RatePlanDrawer';

export interface PlanTemplate {
  name: string;
  mealType: string;
  basePrice: number;
  details: RatePlanDetails;
}

export interface RoomTemplate {
  name: string;
  plans: PlanTemplate[];
}

function makeDetails(name: string, mealType: string, basePrice: number): RatePlanDetails {
  return {
    name,
    mealPlanType: mealType,
    cancellationPolicy: 'Free cancellation up to 72 hours of check in',
    inclusions: 'Welcome drink, complimentary breakfast',
    baseRate: basePrice,
    extraChildRate: 3322,
    extraChildMealRate: 3322,
    extraAdultMealRate: 3322,
    minLengthOfStay: 4,
    active: true,
  };
}

function makePlan(name: string, mealType: string, basePrice: number): PlanTemplate {
  return { name, mealType, basePrice, details: makeDetails(name, mealType, basePrice) };
}

const INITIAL_ROOMS: RoomTemplate[] = [
  { name: 'Single Room', plans: [makePlan('EP', 'Room only', 4999), makePlan('MAP', 'FREE breakfast and lunch', 3322)] },
  { name: 'Double room', plans: [makePlan('EP', 'Room only', 5499), makePlan('MAP', 'FREE breakfast and lunch', 6999)] },
  { name: 'Double room', plans: [makePlan('EP', 'Room only', 5499), makePlan('MAP', 'FREE breakfast and lunch', 6999)] },
  { name: 'Family room', plans: [makePlan('EP', 'Room only', 7999), makePlan('MAP', 'FREE breakfast and lunch', 9999)] },
  { name: 'Queen room', plans: [makePlan('EP', 'Room only', 8999), makePlan('MAP', 'FREE breakfast and lunch', 10999)] },
  { name: 'Master Suite', plans: [makePlan('EP', 'Room only', 14999), makePlan('MAP', 'FREE breakfast and lunch', 18999)] },
];

interface RoomsContextValue {
  roomTemplates: RoomTemplate[];
  updatePlanDetails: (roomIdx: number, planIdx: number, updated: RatePlanDetails) => void;
  deletePlan: (roomIdx: number, planIdx: number) => void;
}

const RoomsContext = createContext<RoomsContextValue | null>(null);

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [roomTemplates, setRoomTemplates] = useState<RoomTemplate[]>(INITIAL_ROOMS);

  const updatePlanDetails = useCallback(
    (roomIdx: number, planIdx: number, updated: RatePlanDetails) => {
      setRoomTemplates((prev) => {
        const next = [...prev];
        const room = { ...next[roomIdx] };
        const plans = [...room.plans];
        plans[planIdx] = {
          ...plans[planIdx],
          name: updated.name,
          mealType: updated.mealPlanType,
          basePrice: updated.baseRate,
          details: updated,
        };
        room.plans = plans;
        next[roomIdx] = room;
        return next;
      });
    },
    [],
  );

  const deletePlan = useCallback(
    (roomIdx: number, planIdx: number) => {
      setRoomTemplates((prev) => {
        const next = [...prev];
        const room = { ...next[roomIdx] };
        room.plans = room.plans.filter((_, i) => i !== planIdx);
        next[roomIdx] = room;
        return next;
      });
    },
    [],
  );

  return (
    <RoomsContext.Provider value={{ roomTemplates, updatePlanDetails, deletePlan }}>
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms must be inside RoomsProvider');
  return ctx;
}
