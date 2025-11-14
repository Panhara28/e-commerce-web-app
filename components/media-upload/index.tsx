"use client";

import { useRef, useState, useEffect } from "react";
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

import { Funnel, SortAsc, LayoutGrid } from "lucide-react";
import MediaGallery from "./media-gallery";

export function MediaUpload({ value = [], onChange }: any) {
  const [openDialog, setOpenDialog] = useState(false);

  // --- IMPORTANT: use parent's initial value ---
  const [files, setFiles] = useState<any[]>(value);

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggerFileUpload = () => fileInputRef.current?.click();

  /* -------------------------------------------------------------------------- */
  /*                      SYNC FILES TO PARENT VARIANTS PAGE                    */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (onChange) onChange(files);
  }, [files]);

  useEffect(() => {
    setFiles(value || []);
  }, [value]);

  /* -------------------------------------------------------------------------- */
  /*                             UPLOAD LOCAL FILES                             */
  /* -------------------------------------------------------------------------- */
  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const previews = Array.from(fileList).map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
      isUploading: true,
    }));

    setFiles((prev) => [...prev, ...previews]);

    const form = new FormData();
    form.append("folder", "tsport_products");
    previews.forEach((p) => form.append("files", p.file));

    const res = await fetch("/api/multiple-upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    if (!res.ok) return console.error("upload failed", data);

    // Normalize uploaded data
    const uploaded = data.uploads.map((u: any) => ({
      ...u,
      id: u.slug,
    }));

    // Replace preview with saved media
    setFiles((prev) => {
      const keep = prev.filter((f) => !f.isUploading);
      return [...keep, ...uploaded];
    });

    await fetchMedia();

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* -------------------------------------------------------------------------- */
  /*                        FETCH EXISTING MEDIA FOR MODAL                      */
  /* -------------------------------------------------------------------------- */
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/media/list");
      const data = await res.json();
      setMediaList(data.media || []);
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                REMOVE FROM UI                               */
  /* -------------------------------------------------------------------------- */
  const handleDelete = (identifier: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== identifier));
  };

  /* -------------------------------------------------------------------------- */
  /*                                  REORDER                                   */
  /* -------------------------------------------------------------------------- */
  const handleReorder = (newOrder: any[]) => {
    setFiles(newOrder);
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Empty state */}
      {files.length === 0 && (
        <div className="border border-dashed border-black rounded-lg p-8 hover:bg-gray-100 cursor-pointer">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="text-xs"
                onClick={triggerFileUpload}
              >
                Upload new
              </Button>

              <Button
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setOpenDialog(true);
                  fetchMedia();
                }}
              >
                Select existing
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Accepts images, videos, or 3D models
            </p>
          </div>
        </div>
      )}

      {/* Gallery */}
      {files.length > 0 && (
        <div className="mt-4">
          <MediaGallery
            files={files}
            onReorder={handleReorder}
            onDelete={handleDelete}
            onOpenModal={() => {
              setOpenDialog(true);
              fetchMedia();
            }}
          />
        </div>
      )}

      {/* MODAL SELECTOR */}
      <Dialog
        open={openDialog}
        onOpenChange={(v) => {
          setOpenDialog(v);
          if (v) fetchMedia();
        }}
      >
        <DialogContent className=" w-[55vw] max-w-[55vw] !sm:max-w-[55vw] !max-w-[55vw] max-h-[85vh] overflow-hidden /* <— IMPORTANT: no scroll here */ mt-[1vh] mb-[1vh] rounded-xl p-0 ">
          <div className="flex flex-col max-h-[85vh] overflow-hidden">
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

            {/* Upload inside modal */}
            <div className="px-6 pb-4">
              <div className="border border-dashed rounded-lg py-6 flex flex-col items-center">
                <Button variant="outline" size="sm" onClick={triggerFileUpload}>
                  Add media
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Drag and drop images
                </p>
              </div>
            </div>

            {/* Scrollable list */}
            <div className="px-6 pb-6 overflow-y-auto max-h-[45vh] no-scrollbar">
              {loading ? (
                <p className="text-center py-10 text-gray-500">Loading...</p>
              ) : (
                <div className="grid grid-cols-6 gap-5 mt-5">
                  {mediaList.map((item) => {
                    const selected = files.some((f) => f.id === item.slug);

                    return (
                      <div
                        key={item.slug}
                        className={`relative border rounded-lg p-2 cursor-pointer transition ${
                          selected
                            ? "ring-primary ring-2"
                            : "hover:ring-2 hover:ring-primary"
                        }`}
                        onClick={() => {
                          if (selected) {
                            setFiles((prev) =>
                              prev.filter((f) => f.id !== item.slug)
                            );
                          } else {
                            setFiles((prev) => [
                              ...prev,
                              { ...item, id: item.slug },
                            ]);
                          }
                        }}
                      >
                        <Checkbox
                          checked={selected}
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFiles((prev) => [
                                ...prev,
                                { ...item, id: item.slug },
                              ]);
                            } else {
                              setFiles((prev) =>
                                prev.filter((f) => f.id !== item.slug)
                              );
                            }
                          }}
                        />

                        <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={item.url}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="text-xs text-center mt-2 text-muted-foreground truncate">
                          {item.filename}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <DialogFooter className="px-6 pb-6">
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpenDialog(false)}>Done</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
