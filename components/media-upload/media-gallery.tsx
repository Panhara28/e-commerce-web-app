"use client";

import { useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import SortableMediaItem from "./sortable-item";
import { Plus } from "lucide-react";

export default function MediaGallery({ files, onOpenModal, onReorder, onDelete }: any) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const MAX_VISIBLE = 16;
  const extraCount = files.length - MAX_VISIBLE;

  const visibleSmallImages = showAll ? files.slice(1) : files.slice(1, MAX_VISIBLE);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    setOverId(event.over?.id || null);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = files.findIndex((i: any) => i.id === active.id);
      const newIndex = files.findIndex((i: any) => i.id === over.id);

      const updated = arrayMove(files, oldIndex, newIndex);
      onReorder(updated);
    }
  };

  // helper
  const getType = (id: string) => (files[0].id === id ? "big" : "small");

  const getPreviewText = (itemId: string) => {
    if (!activeId || !overId) return null;
    if (itemId !== overId) return null;

    const from = getType(activeId);
    const to = getType(overId);

    return `${from} → ${to}`;
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={files} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-10 gap-4 w-full">

          {/* BIG IMAGE */}
          <div className="col-span-2 row-span-2 relative">
            <SortableMediaItem
              id={files[0].id}
              img={files[0]}
              onRemove={onDelete}
              hideImage={overId === files[0].id}
            />
          </div>

          {/* SMALL IMAGES (with limit) */}
          {visibleSmallImages.map((img: any) => (
            <div key={img.id} className="relative">
              <SortableMediaItem id={img.id} img={img} small onRemove={onDelete} />

              {getPreviewText(img.id) && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-white text-sm font-bold rounded-lg"></div>
              )}
            </div>
          ))}

          {/* +X MORE CARD */}
          {!showAll && extraCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="
                aspect-square rounded-lg 
                flex items-center justify-center 
                bg-gray-200 bg-opacity-70 
                backdrop-blur-sm 
                border 
                text-gray-700 font-semibold 
                hover:bg-gray-300
              "
            >
              +{extraCount}
            </button>
          )}

          {/* ADD BUTTON */}
          <button
            onClick={onOpenModal}
            className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-gray-100"
          >
            <Plus className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}
