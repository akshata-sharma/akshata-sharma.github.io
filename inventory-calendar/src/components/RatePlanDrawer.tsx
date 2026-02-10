import { useState, useRef, useEffect, useCallback } from 'react';

export interface RatePlanDetails {
  name: string;
  mealPlanType: string;
  cancellationPolicy: string;
  inclusions: string;
  baseRate: number;
  extraChildRate: number;
  extraChildMealRate: number;
  extraAdultMealRate: number;
  minLengthOfStay: number;
  active: boolean;
}

interface RatePlanDrawerProps {
  plan: RatePlanDetails;
  onClose: () => void;
  onUpdate: (updated: RatePlanDetails) => void;
  onDelete: () => void;
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667L5.333 13.333 2 14l.667-3.333L11.333 2Z" />
    </svg>
  );
}

function DeactivateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <path d="M6 6V10" />
      <path d="M10 6V10" />
    </svg>
  );
}

function ActivateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6,3 13,8 6,13" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12" />
      <path d="M5.333 4V2.667A.667.667 0 0 1 6 2h4a.667.667 0 0 1 .667.667V4" />
      <path d="M12.667 4v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8c9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10L22 22" />
      <path d="M22 10L10 22" />
    </svg>
  );
}

function EditableField({
  label,
  value,
  editing,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string | number;
  editing: boolean;
  onChange: (v: string) => void;
  type?: 'text' | 'number' | 'currency';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayValue =
    type === 'currency'
      ? `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
      : String(value);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm leading-5 text-text-low">{label}</span>
      {editing ? (
        <input
          ref={inputRef}
          type={type === 'currency' || type === 'number' ? 'number' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-base leading-6 text-text-high bg-white border border-blue-400 rounded-lg px-3 py-1.5 outline-none"
        />
      ) : (
        <span className="text-base leading-6 text-text-high">
          {type === 'number' ? `${value} days` : displayValue}
        </span>
      )}
    </div>
  );
}

export default function RatePlanDrawer({
  plan,
  onClose,
  onUpdate,
  onDelete,
}: RatePlanDrawerProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RatePlanDetails>({ ...plan });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync draft when plan changes
  useEffect(() => {
    setDraft({ ...plan });
    setEditing(false);
    setConfirmDelete(false);
  }, [plan]);

  const handleSave = useCallback(() => {
    onUpdate(draft);
    setEditing(false);
  }, [draft, onUpdate]);

  const handleCancel = useCallback(() => {
    setDraft({ ...plan });
    setEditing(false);
  }, [plan]);

  const handleToggleActive = useCallback(() => {
    const updated = { ...plan, active: !plan.active };
    onUpdate(updated);
  }, [plan, onUpdate]);

  const handleDelete = useCallback(() => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
    }
  }, [confirmDelete, onDelete]);

  const setField = (field: keyof RatePlanDetails, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [field]:
        field === 'baseRate' ||
        field === 'extraChildRate' ||
        field === 'extraChildMealRate' ||
        field === 'extraAdultMealRate' ||
        field === 'minLengthOfStay'
          ? Number(value) || 0
          : value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="flex-1 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="w-[498px] bg-surface-white h-full flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <h2 className="text-[28px] font-semibold text-text-high leading-9">
            Rate plan details
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-grey-200 rounded-lg transition-colors -mt-1 -mr-1"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Inactive badge */}
        {!plan.active && (
          <div className="mx-8 mt-4 px-3 py-1.5 bg-red-50 text-red-600 text-sm rounded-lg w-fit">
            Deactivated
          </div>
        )}

        {/* Fields */}
        <div className="flex-1 overflow-auto px-8 pt-6 pb-4">
          <div className="flex flex-col gap-6">
            <EditableField
              label="Plan name"
              value={editing ? draft.name : plan.name}
              editing={editing}
              onChange={(v) => setField('name', v)}
            />
            <EditableField
              label="Meal plan type"
              value={editing ? draft.mealPlanType : plan.mealPlanType}
              editing={editing}
              onChange={(v) => setField('mealPlanType', v)}
            />
            <EditableField
              label="Cancellation policy"
              value={
                editing
                  ? draft.cancellationPolicy
                  : plan.cancellationPolicy
              }
              editing={editing}
              onChange={(v) => setField('cancellationPolicy', v)}
            />
            <EditableField
              label="Inclusions"
              value={editing ? draft.inclusions : plan.inclusions}
              editing={editing}
              onChange={(v) => setField('inclusions', v)}
            />
            <EditableField
              label="Base rate"
              value={editing ? draft.baseRate : plan.baseRate}
              editing={editing}
              onChange={(v) => setField('baseRate', v)}
              type="currency"
            />
            <EditableField
              label="Extra child rate"
              value={editing ? draft.extraChildRate : plan.extraChildRate}
              editing={editing}
              onChange={(v) => setField('extraChildRate', v)}
              type="currency"
            />
            <EditableField
              label="Extra child meal rate"
              value={
                editing
                  ? draft.extraChildMealRate
                  : plan.extraChildMealRate
              }
              editing={editing}
              onChange={(v) => setField('extraChildMealRate', v)}
              type="currency"
            />
            <EditableField
              label="Extra adult meal rate"
              value={
                editing
                  ? draft.extraAdultMealRate
                  : plan.extraAdultMealRate
              }
              editing={editing}
              onChange={(v) => setField('extraAdultMealRate', v)}
              type="currency"
            />
            <EditableField
              label="Minimum length of stay"
              value={
                editing ? draft.minLengthOfStay : plan.minLengthOfStay
              }
              editing={editing}
              onChange={(v) => setField('minLengthOfStay', v)}
              type="number"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-8">
            {editing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] bg-blue-400 text-white text-sm rounded-xl hover:bg-blue-500 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] bg-grey-200 text-text-mid text-sm rounded-xl hover:bg-border-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] bg-grey-200 text-text-mid text-sm rounded-xl hover:bg-border-medium transition-colors"
                >
                  <EditIcon />
                  Edit
                </button>
                <button
                  onClick={handleToggleActive}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] bg-grey-200 text-text-mid text-sm rounded-xl hover:bg-border-medium transition-colors"
                >
                  {plan.active ? <DeactivateIcon /> : <ActivateIcon />}
                  {plan.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={handleDelete}
                  className={`flex-1 flex items-center justify-center gap-2 h-[44px] text-sm rounded-xl transition-colors ${
                    confirmDelete
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-grey-200 text-text-mid hover:bg-border-medium'
                  }`}
                >
                  <DeleteIcon />
                  {confirmDelete ? 'Confirm?' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-6 pt-0">
          <button
            onClick={editing ? handleSave : onClose}
            className="w-full h-[52px] bg-[#e34700] text-white text-base rounded-[10px] hover:bg-[#cc3f00] transition-colors"
          >
            {editing ? 'Save changes' : 'Understood'}
          </button>
        </div>
      </div>
    </div>
  );
}
