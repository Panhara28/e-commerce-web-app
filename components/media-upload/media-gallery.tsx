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

export default function MediaGallery({
  files,
  onOpenModal,
  onReorder,
  onDelete,
}: any) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const MAX_VISIBLE = 16;
  const extraCount = files.length - MAX_VISIBLE;

  const visibleSmallImages = showAll
    ? files.slice(1)
    : files.slice(1, MAX_VISIBLE);

  const handleDragStart = (e: any) => setActiveId(e.active.id);
  const handleDragOver = (e: any) => setOverId(e.over?.id || null);

  const handleDragEnd = (e: any) => {
    const { active, over } = e;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = files.findIndex((i: any) => i.id === active.id);
    const newIndex = files.findIndex((i: any) => i.id === over.id);

    onReorder(arrayMove(files, oldIndex, newIndex));
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
            />
          </div>

          {/* SMALL IMAGES */}
          {visibleSmallImages.map((img) => (
            <SortableMediaItem
              key={img.id}
              id={img.id}
              img={img}
              small
              onRemove={onDelete}
            />
          ))}

          {/* SHOW +X */}
          {!showAll && extraCount > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="aspect-square rounded-lg bg-gray-200 bg-opacity-70 backdrop-blur-sm border flex items-center justify-center text-gray-700 font-semibold"
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
