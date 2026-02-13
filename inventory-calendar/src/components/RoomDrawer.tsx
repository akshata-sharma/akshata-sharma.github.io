import { useState, useRef, useEffect, useCallback } from 'react';
import { type RoomTemplate } from './RoomsContext';

interface RoomDrawerProps {
  room: RoomTemplate | null;
  onClose: () => void;
  onSave: (data: { name: string; roomCount: number; maxGuests: number }) => void;
}

function CloseIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#8c9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 10L22 22" />
      <path d="M22 10L10 22" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.333 2A1.886 1.886 0 0 1 14 4.667L5.333 13.333 2 14l.667-3.333L11.333 2Z" />
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
  type?: 'text' | 'number';
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm leading-5 text-text-low">{label}</span>
      {editing ? (
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-base leading-6 text-text-high bg-white border border-blue-400 rounded-lg px-3 py-1.5 outline-none"
        />
      ) : (
        <span className="text-base leading-6 text-text-high">{value}</span>
      )}
    </div>
  );
}

export default function RoomDrawer({ room, onClose, onSave }: RoomDrawerProps) {
  const isNew = room === null;
  const [editing, setEditing] = useState(isNew);
  const [name, setName] = useState(room?.name ?? '');
  const [roomCount, setRoomCount] = useState(room?.roomCount ?? 1);
  const [maxGuests, setMaxGuests] = useState(room?.maxGuests ?? 2);

  useEffect(() => {
    setName(room?.name ?? '');
    setRoomCount(room?.roomCount ?? 1);
    setMaxGuests(room?.maxGuests ?? 2);
    setEditing(room === null);
  }, [room]);

  const handleSave = useCallback(() => {
    onSave({ name: name.trim() || 'New Room', roomCount, maxGuests });
    setEditing(false);
  }, [name, roomCount, maxGuests, onSave]);

  const handleCancel = useCallback(() => {
    if (isNew) {
      onClose();
    } else {
      setName(room.name);
      setRoomCount(room.roomCount);
      setMaxGuests(room.maxGuests);
      setEditing(false);
    }
  }, [isNew, room, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 transition-opacity" onClick={onClose} />

      <div className="w-[498px] bg-surface-white h-full flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-8 pb-0">
          <h2 className="text-[28px] font-semibold text-text-high leading-9">
            {isNew ? 'Add new room' : 'Room details'}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-grey-200 rounded-lg transition-colors -mt-1 -mr-1"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-auto px-8 pt-6 pb-4">
          <div className="flex flex-col gap-6">
            <EditableField
              label="Room name"
              value={name}
              editing={editing}
              onChange={setName}
            />
            <EditableField
              label="Number of rooms"
              value={roomCount}
              editing={editing}
              onChange={(v) => setRoomCount(Number(v) || 0)}
              type="number"
            />
            <EditableField
              label="Max guests"
              value={maxGuests}
              editing={editing}
              onChange={(v) => setMaxGuests(Number(v) || 0)}
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
                  {isNew ? 'Create' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 flex items-center justify-center gap-2 h-[44px] bg-grey-200 text-text-mid text-sm rounded-xl hover:bg-border-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 flex items-center justify-center gap-2 h-[44px] bg-grey-200 text-text-mid text-sm rounded-xl hover:bg-border-medium transition-colors"
              >
                <EditIcon />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-6 pt-0">
          <button
            onClick={editing ? handleSave : onClose}
            className="w-full h-[52px] bg-[#e34700] text-white text-base rounded-[10px] hover:bg-[#cc3f00] transition-colors"
          >
            {editing ? (isNew ? 'Create room' : 'Save changes') : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
