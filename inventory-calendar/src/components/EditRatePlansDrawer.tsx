import { type RoomTemplate } from './RoomsContext';
import { PlusIcon } from './Icons';

interface EditRatePlansDrawerProps {
  room: RoomTemplate;
  onClose: () => void;
  onSelectPlan: (planIdx: number) => void;
  onAddPlan: () => void;
}

function CloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8c9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10L22 22" />
      <path d="M22 10L10 22" />
    </svg>
  );
}

export default function EditRatePlansDrawer({
  room,
  onClose,
  onSelectPlan,
  onAddPlan,
}: EditRatePlansDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 transition-opacity" onClick={onClose} />

      <div className="w-[498px] bg-surface-white h-full flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <div>
            <h2 className="text-[28px] font-semibold text-text-high leading-9">
              Edit rate plans
            </h2>
            <p className="text-sm text-text-low mt-1">{room.name}</p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-grey-200 rounded-lg transition-colors -mt-1 -mr-1"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Plan list */}
        <div className="flex-1 overflow-auto px-8 pt-6 pb-4">
          <div className="flex flex-col gap-2">
            {room.plans.map((plan, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPlan(idx)}
                className="flex items-center justify-between p-4 rounded-xl border border-border-medium hover:bg-grey-200 transition-colors text-left"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-text-high">
                    {plan.name}
                  </span>
                  <span className="text-xs text-text-low">{plan.mealType}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-text-mid">
                    {`\u20B9${plan.basePrice.toLocaleString('en-IN')}`}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      plan.details.active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {plan.details.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Add rate plan button */}
          <button
            onClick={onAddPlan}
            className="flex items-center gap-2 mt-4 px-4 py-3 w-full rounded-xl border border-dashed border-border-medium text-sm text-text-mid hover:bg-grey-200 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add rate plan
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full h-[52px] bg-[#e34700] text-white text-base rounded-[10px] hover:bg-[#cc3f00] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
