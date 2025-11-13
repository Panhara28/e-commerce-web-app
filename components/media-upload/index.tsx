"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { Funnel, SortAsc, LayoutGrid, Plus } from "lucide-react";
import MediaGallery from "./media-gallery";

export function MediaUpload() {
  const [openDialog, setOpenDialog] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileUpload = () => fileInputRef.current?.click();

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const newFiles = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleReorder = (newOrder: any[]) => {
    setFiles(newOrder);
  };

  const handleDelete = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Upload buttons */}
      <div className="border border-dashed border-black rounded-lg p-8 hover:bg-gray-100 cursor-pointer">
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-3">
            <Button variant="outline" className="text-xs" onClick={triggerFileUpload}>
              Upload new
            </Button>

            <Button
              variant="outline"
              className="text-xs"
              onClick={() => setOpenDialog(true)}
            >
              Select existing
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Accepts images, videos, or 3D models
          </p>
        </div>
      </div>

      {/* ----MEDIA GALLERY (Shopify style) ---- */}
      {files.length > 0 && (
        <div className="mt-4">
          <MediaGallery
            files={files}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onOpenModal={() => setOpenDialog(true)}
          />
        </div>
      )}

      {/* ------------------ EXISTING FILES MODAL ------------------ */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent
          className="
            w-[70vw]
            max-w-[70vw]
            max-h-[85vh]
            mt-[2vh] mb-[2vh]
            overflow-y-auto
            rounded-xl p-0
          "
        >
          <DialogHeader className="px-6 pt-6 pb-3">
            <DialogTitle>Select file</DialogTitle>
          </DialogHeader>

          <div className="px-6 flex items-center gap-3 pb-4">
            <Input placeholder="Search files" className="flex-1" />
            <Button variant="outline" size="sm">
              <Funnel className="h-4 w-4 mr-1" /> Filters
            </Button>
            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-1" /> Sort
            </Button>
            <Button variant="outline" size="sm">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          <div className="px-6 pb-4">
            <div className="border border-dashed rounded-lg py-6 flex flex-col items-center">
              <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                Add media
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Drag and drop images, videos, 3D models, and files
              </p>
            </div>
          </div>

          {/* Fake grid */}
          <div className="px-6 grid grid-cols-6 gap-5 mt-5 pb-6">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="relative border rounded-lg p-2 cursor-pointer hover:ring-2 hover:ring-primary transition"
                onClick={() => {
                  setFiles((prev) => [
                    ...prev,
                    { id: crypto.randomUUID(), url: `/placeholder-${i}.png` },
                  ]);
                }}
              >
                <Checkbox className="absolute top-2 left-2" />
                <div className="aspect-square bg-gray-100 rounded-md"></div>
                <div className="text-xs text-center mt-2 text-muted-foreground">
                  p-{i + 1}.png
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setOpenDialog(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
