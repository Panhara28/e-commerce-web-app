"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { Plus } from "lucide-react";
import SortableMediaItem from "./sortable-item";

/* --------------------------------------------- */
/* TYPES                                          */
/* --------------------------------------------- */

export type MediaFile = {
  id: string;
  url: string;
  name?: string;
  size?: number;
  type?: string;
};

type MediaGalleryProps = {
  files: MediaFile[];
  onOpenModal: () => void;
  onReorder: (updated: MediaFile[]) => void;
  onDelete: (id: string) => void;
};

/* --------------------------------------------- */
/* MAIN COMPONENT                                 */
/* --------------------------------------------- */

export default function MediaGallery({
  files,
  onOpenModal,
  onReorder,
  onDelete,
}: MediaGalleryProps) {
  const [, setActiveId] = useState<string | null>(null);
  const [, setOverId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const MAX_VISIBLE = 16;
  const extraCount = files.length - MAX_VISIBLE;

  const visibleSmallImages = showAll
    ? files.slice(1)
    : files.slice(1, MAX_VISIBLE);

  /* --------------------------------------------- */
  /* DRAG EVENTS (FULLY TYPED)                     */
  /* --------------------------------------------- */

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const handleDragOver = (e: DragOverEvent) => {
    setOverId(e.over ? String(e.over.id) : null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    setOverId(null);

    if (!over || active.id === over.id) return;

    const oldIndex = files.findIndex((i) => i.id === active.id);
    const newIndex = files.findIndex((i) => i.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(files, oldIndex, newIndex);
    onReorder(reordered);
  };

  /* --------------------------------------------- */
  /* RENDER                                         */
  /* --------------------------------------------- */

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={files.map((f) => f.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-10 gap-4 w-full">
          {/* BIG IMAGE */}
          {files.length > 0 && (
            <div key="big-image" className="col-span-2 row-span-2 relative">
              <SortableMediaItem
                key={files[0].id}
                id={files[0].id}
                img={files[0]}
                onRemove={onDelete}
              />
            </div>
          )}

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

          {/* SHOW +X BUTTON */}
          {!showAll && extraCount > 0 && (
            <button
              key="show-more"
              onClick={() => setShowAll(true)}
              className="aspect-square rounded-lg bg-gray-200 bg-opacity-70 backdrop-blur-sm border flex items-center justify-center text-gray-700 font-semibold"
            >
              +{extraCount}
            </button>
          )}

          {/* ADD BUTTON */}
          <button
            key="add-btn"
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
