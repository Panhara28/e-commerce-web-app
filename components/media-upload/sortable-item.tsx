"use client";

import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, X } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";

export default function SortableMediaItem({ id, img, onRemove }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className="
        relative border rounded-lg overflow-hidden bg-gray-100 
        aspect-square w-full h-full cursor-grab active:cursor-grabbing
      "
    >
      <img src={img.url} className="object-cover w-full h-full" />

      <div className="absolute top-1 left-1 bg-white rounded p-1 shadow z-50 cursor-grab">
        <GripVertical className="h-3 w-3 text-gray-600" />
      </div>

      <button
        className="absolute top-1 right-1 bg-white rounded-full p-1 shadow z-50"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
      >
        <X className="h-3 w-3 text-gray-700" />
      </button>
    </div>
  );
}
