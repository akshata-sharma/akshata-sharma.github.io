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
  roomCount: number;
  maxGuests: number;
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
  {
    name: 'Deluxe Room',
    roomCount: 2,
    maxGuests: 3,
    plans: [
      makePlan('EP', 'Room only', 4999),
      makePlan('CP', 'Continental breakfast', 5999),
      makePlan('MAP', 'Breakfast and dinner', 7999),
      makePlan('Half board', 'Breakfast and one meal', 8999),
      makePlan('Full board', 'All meals included', 10999),
    ],
  },
  {
    name: 'Superior Suite',
    roomCount: 2,
    maxGuests: 3,
    plans: [
      makePlan('EP', 'Room only', 6999),
      makePlan('CP', 'Continental breakfast', 7999),
      makePlan('MAP', 'Breakfast and dinner', 9999),
      makePlan('MAP', 'Breakfast and dinner', 10999),
      makePlan('MAP', 'Breakfast and dinner', 11999),
    ],
  },
  {
    name: 'Family Suite',
    roomCount: 2,
    maxGuests: 4,
    plans: [
      makePlan('EP', 'Room only', 7999),
      makePlan('CP', 'Continental breakfast', 8999),
      makePlan('MAP', 'Breakfast and dinner', 10999),
      makePlan('MAP', 'Breakfast and dinner', 11999),
      makePlan('MAP', 'Breakfast and dinner', 12999),
    ],
  },
  {
    name: 'Executive Room',
    roomCount: 2,
    maxGuests: 3,
    plans: [
      makePlan('EP', 'Room only', 8999),
      makePlan('CP', 'Continental breakfast', 9999),
      makePlan('MAP', 'Breakfast and dinner', 11999),
      makePlan('MAP', 'Breakfast and dinner', 12999),
      makePlan('MAP', 'Breakfast and dinner', 13999),
    ],
  },
  {
    name: 'Honeymoon Suite',
    roomCount: 2,
    maxGuests: 3,
    plans: [
      makePlan('EP', 'Room only', 14999),
      makePlan('CP', 'Continental breakfast', 15999),
      makePlan('MAP', 'Breakfast and dinner', 18999),
      makePlan('MAP', 'Breakfast and dinner', 19999),
      makePlan('MAP', 'Breakfast and dinner', 20999),
    ],
  },
];

interface RoomsContextValue {
  roomTemplates: RoomTemplate[];
  updatePlanDetails: (roomIdx: number, planIdx: number, updated: RatePlanDetails) => void;
  deletePlan: (roomIdx: number, planIdx: number) => void;
  addRoom: (room: RoomTemplate) => void;
  deleteRoom: (roomIdx: number) => void;
  addPlan: (roomIdx: number, plan: PlanTemplate) => void;
  updateRoom: (roomIdx: number, updated: Partial<Pick<RoomTemplate, 'name' | 'roomCount' | 'maxGuests'>>) => void;
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

  const addRoom = useCallback((room: RoomTemplate) => {
    setRoomTemplates((prev) => [...prev, room]);
  }, []);

  const deleteRoom = useCallback((roomIdx: number) => {
    setRoomTemplates((prev) => prev.filter((_, i) => i !== roomIdx));
  }, []);

  const addPlan = useCallback((roomIdx: number, plan: PlanTemplate) => {
    setRoomTemplates((prev) => {
      const next = [...prev];
      const room = { ...next[roomIdx] };
      room.plans = [...room.plans, plan];
      next[roomIdx] = room;
      return next;
    });
  }, []);

  const updateRoom = useCallback(
    (roomIdx: number, updated: Partial<Pick<RoomTemplate, 'name' | 'roomCount' | 'maxGuests'>>) => {
      setRoomTemplates((prev) => {
        const next = [...prev];
        next[roomIdx] = { ...next[roomIdx], ...updated };
        return next;
      });
    },
    [],
  );

  return (
    <RoomsContext.Provider value={{ roomTemplates, updatePlanDetails, deletePlan, addRoom, deleteRoom, addPlan, updateRoom }}>
      {children}
    </RoomsContext.Provider>
  );
}

export function useRooms() {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms must be inside RoomsProvider');
  return ctx;
}
