"use client";

import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, X } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

export default function SortableMediaItem({ id, img, hideImage, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners} // whole card draggable
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`
        relative border rounded-lg overflow-hidden bg-gray-100 
        aspect-square w-full h-full cursor-grab active:cursor-grabbing
        ${hideImage ? "opacity-0" : "opacity-100"}
      `}
    >
      {/* IMAGE */}
      <img
        src={img.url}
        className="object-cover w-full h-full pointer-events-none"
        draggable={false}
      />

      {/* DRAG HANDLE */}
      <div
        className="absolute top-1 left-1 bg-white rounded p-1 shadow cursor-grab active:cursor-grabbing z-50"
      >
        <GripVertical className="h-3 w-3 text-gray-600" />
      </div>

      {/* REMOVE BUTTON — MUST NOT DRAG */}
      <button
        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow z-50"
        
        // prevents drag from starting
        onPointerDown={(e) => {
          e.stopPropagation();
        }}

        // ensures the click fires successfully
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          alert("Remove: " + id);
          onRemove?.(id);
        }}
      >
        <X className="h-3 w-3 text-gray-700" />
      </button>
    </div>
  );
}
