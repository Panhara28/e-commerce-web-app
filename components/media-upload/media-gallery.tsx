"use client";

import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import SortableMediaItem from "./sortable-item";
import { Plus } from "lucide-react";

export default function MediaGallery({ files, onOpenModal, onReorder }: any) {
  if (!files || files.length === 0) return null;

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = files.findIndex((i: any) => i.id === active.id);
      const newIndex = files.findIndex((i: any) => i.id === over.id);

      const newOrder = arrayMove(files, oldIndex, newIndex);
      onReorder(newOrder);
    }
  };

  return (
    <div className="grid grid-cols-8 gap-3 w-full">

      {/* --- BIG SQUARE THUMBNAIL --- */}
      <div className="col-span-2 row-span-2 rounded-lg border overflow-hidden">
        <div className="aspect-square bg-gray-100 w-full h-full">
          <img
            src={files[0].url}
            className="object-cover w-full h-full"
            alt="thumbnail"
          />
        </div>
      </div>

      {/* --- Small square images (sortable) --- */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={files} strategy={rectSortingStrategy}>
          {files.slice(1).map((img: any) => (
            <SortableMediaItem key={img.id} id={img.id} img={img} small />
          ))}
        </SortableContext>
      </DndContext>

      {/* --- Add button same size as small images --- */}
      <button
        onClick={onOpenModal}
        className="
          aspect-square 
          rounded-lg border-2 border-dashed 
          flex items-center justify-center 
          hover:bg-gray-100
        "
      >
        <Plus className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
}
