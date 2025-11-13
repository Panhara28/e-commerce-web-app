"use client";

import { useState } from "react";
import { Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { MediaUpload } from ".";

type MediaItem = {
  id: string;
  url: string;
};

export default function MediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [openModal, setOpenModal] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleAddMedia = (files: FileList) => {
    const newMedia = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
    }));

    setMedia((prev) => [...prev, ...newMedia]);
  };

  const handleRemove = (id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMedia((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* ------------------------------------- */}
      {/* BIG THUMBNAIL */}
      {/* ------------------------------------- */}
      {media.length > 0 ? (
        <div className="w-full h-64 border rounded-lg overflow-hidden">
          <img
            src={media[0].url}
            alt="Thumbnail"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-64 border border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground">
          <p>No media yet</p>
        </div>
      )}

      {/* ------------------------------------- */}
      {/* HORIZONTAL SCROLL LIST */}
      {/* ------------------------------------- */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={media} strategy={verticalListSortingStrategy}>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {media.map((item) => (
              <SortableImage
                key={item.id}
                id={item.id}
                url={item.url}
                onRemove={() => handleRemove(item.id)}
              />
            ))}

            {/* ADD BUTTON */}
            <button
              className="w-24 h-24 border border-dashed rounded-lg flex items-center justify-center hover:bg-gray-100"
              onClick={() => setOpenModal(true)}
            >
              <Plus className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </SortableContext>
      </DndContext>

      {/* OPEN MODAL */}
      <MediaUpload
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSelectFiles={handleAddMedia}
      />
    </div>
  );
}

/* ------------------------------------- */
/* SORTABLE SMALL IMAGE ITEM */
/* ------------------------------------- */
function SortableImage({
  id,
  url,
  onRemove,
}: {
  id: string;
  url: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative w-24 h-24 rounded-lg overflow-hidden border shrink-0"
    >
      <img src={url} className="w-full h-full object-cover" />

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-1 right-1 bg-white/70 rounded-full p-1"
      >
        <X size={14} />
      </button>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-1 left-1 bg-white/70 rounded p-1 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </div>
    </div>
  );
}
