"use client";

import { useState, useTransition } from "react";
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateField, deleteField, reorderFields } from "../actions";
import { AdminCard, AdminButton } from "@/components/admin/admin-ui";

type Field = {
  id: string;
  label: string;
  field_key: string;
  field_type: string;
  options: string[] | null;
  required: boolean;
  sort_order: number;
};

function SortableFieldCard({ field }: { field: Field }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const updateFieldWithId = updateField.bind(null, field.id);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "opacity-50" : ""}
    >
      <AdminCard className="p-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            {/* Drag handle — only this element listens for drag gestures, so
                the text inputs and buttons below remain normally clickable. */}
            <button
              type="button"
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              className="mt-2 shrink-0 cursor-grab touch-none text-charcoal/30 transition hover:text-charcoal/60 active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>

            <form action={updateFieldWithId} className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="label"
                  defaultValue={field.label}
                  className="flex-1 border border-ink/20 px-2.5 py-1.5 text-sm outline-none focus:border-brass"
                />
                <span className="rounded bg-ink/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-charcoal/50">
                  {field.field_type}
                </span>
              </div>

              {field.field_type === "select" && (
                <input
                  type="text"
                  name="options"
                  defaultValue={(field.options ?? []).join(", ")}
                  placeholder="Option 1, Option 2, Option 3"
                  className="w-full border border-ink/20 px-2.5 py-1.5 text-xs outline-none focus:border-brass"
                />
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-charcoal/60">
                  <input type="checkbox" name="required" defaultChecked={field.required} />
                  Required
                </label>
                <AdminButton variant="secondary" type="submit" className="px-3 py-1.5 text-xs">
                  Save
                </AdminButton>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-end border-t border-ink/10 pt-3">
            <form action={deleteField.bind(null, field.id)}>
              <AdminButton variant="danger">
                <Trash2 size={14} />
              </AdminButton>
            </form>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

export default function SortableFieldList({ initialFields }: { initialFields: Field[] }) {
  const [fields, setFields] = useState(initialFields);
  const [, startTransition] = useTransition();

  // PointerSensor covers mouse; TouchSensor with a small delay lets normal
  // scrolling still work on touch devices while still allowing drag once
  // the admin holds the handle briefly.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(fields, oldIndex, newIndex);

    // Update local state immediately for a responsive drag, then persist
    // to the database as a separate side effect — not inside the setState
    // updater itself, which must stay a pure calculation.
    setFields(reordered);
    startTransition(() => {
      reorderFields(reordered.map((f) => f.id));
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {fields.map((field) => (
            <SortableFieldCard key={field.id} field={field} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}